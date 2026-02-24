<?php

namespace App\Http\Controllers\Web;

use Throwable;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Http\Controllers\Controller;
use App\Notifications\OrderCreatedNotification;
use App\Notifications\OrderApprovedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display orders page with server-side data.
     */
    public function index(Request $request)
    {
        /** @var User|null $user */
        $user = auth()->user();
        $query = Order::with(['customer', 'employee.user', 'technician', 'items.product']);

        // Apply hierarchical filtering for non-admin users
        if ($user && !$user->hasAnyRole(['admin', 'super-admin'])) {
            $employeeDetail = $user->employeeDetail;
            if ($employeeDetail) {
                $subordinateIds = $employeeDetail->getAllSubordinateIds();
                $query->whereIn('employee_id', $subordinateIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn($q2) => $q2->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('employee.user', fn($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('order_date', 'desc')->get();

        // Map to frontend format
        $mappedOrders = $orders->map(fn(\App\Models\Order $o) => $this->mapOrder($o));

        // Include supplementary info
        $customers = \App\Models\Customer::with('employee.user')->get()->map(fn($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'employeeId' => $c->employee_id,
            'employeeName' => $c->employee?->user?->name ?? '',
        ]);

        $products = \App\Models\Product::all()->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'packSize' => $p->pack_size ?? '',
            'salePrice' => (float) $p->sale_price,
            'flatPrice' => (float) $p->flat_price,
            'quantity' => $p->quantity,
        ]);
        $employees = \App\Models\EmployeeDetail::with('user')->get();
        $technicians = \App\Models\Technician::where('status', 'active')->get();
        $allServices = \App\Models\Service::all();

        return Inertia::render('Orders', [
            'initialOrders' => $mappedOrders,
            'customers' => $customers,
            'products' => $products,
            'employees' => $employees,
            'technicians' => $technicians,
            'services' => $allServices,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Map Order model to frontend format.
     */
    private function mapOrder(Order $o): array
    {
        return [
            'id' => $o->order_number,
            'internalId' => $o->id,
            'type' => $o->type,
            'customerId' => $o->customer_id,
            'customerName' => $o->customer?->name ?? '',
            'employeeId' => $o->employee_id,
            'employeeName' => $o->employee?->user?->name ?? '',
            'technicianId' => $o->technician_id,
            'technicianName' => $o->technician?->name ?? '',
            'date' => $o->order_date,
            'paymentMethod' => $o->payment_method,
            'status' => $o->status,
            'subtotal' => (float) $o->subtotal,
            'discount' => (float) $o->discount,
            'discountType' => $o->discount_type,
            'discountAmount' => (float) $o->discount_amount,
            'serviceCharge' => (float) $o->service_charge,
            'total' => (float) $o->total_amount,
            'note' => $o->note,
            'serviceNotes' => $o->service_notes,
            'items' => $o->items->map(fn($item) => [
                'id' => (string) $item->id,
                'dbId' => $item->id,
                'productId' => $item->product_id,
                'productName' => $item->product?->name ?? $item->custom_item_name,
                'customItemName' => $item->custom_item_name,
                'packSize' => $item->product?->pack_size ?? '',
                'quantity' => $item->quantity,
                'bonusQuantity' => $item->bonus_quantity ?? 0,
                'price' => (float) $item->unit_price,
                'priceType' => $item->price_type,
                'total' => (float) $item->total_price,
            ])->toArray(),
        ];
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:sales,service',
            'customer_id' => 'required|exists:customers,id',
            'employee_id' => 'nullable|exists:employee_details,id',
            'technician_id' => 'nullable|exists:technicians,id',
            'order_date' => 'required|date',
            'payment_method' => 'in:cash,credit,bank_transfer,cheque',
            'discount' => 'nullable|numeric|min:0',
            'discount_type' => 'in:percentage,fixed',
            'service_charge' => 'nullable|numeric|min:0',
            'note' => 'nullable|string',
            'service_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.custom_item_name' => 'nullable|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.price_type' => 'in:tp,flat',
            'items.*.bonus_quantity' => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();

        try {
            $subtotal = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                // Ensure either product_id or custom_item_name is present
                if (empty($item['product_id']) && empty($item['custom_item_name'])) {
                    throw new \Exception("Each item must have a product or a custom name.");
                }

                $totalPrice = $item['quantity'] * $item['unit_price'];
                $subtotal += $totalPrice;
                $itemsData[] = [
                    'product_id' => $item['product_id'] ?? null,
                    'custom_item_name' => $item['custom_item_name'] ?? null,
                    'price_type' => $item['price_type'] ?? 'tp',
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'bonus_quantity' => $item['bonus_quantity'] ?? 0,
                    'total_price' => $totalPrice,
                ];
            }

            $discountValue = $request->discount ?? 0;
            $discountAmount = $request->discount_type === 'percentage'
                ? ($subtotal * $discountValue) / 100
                : $discountValue;

            $serviceCharge = $request->service_charge ?? 0;
            $totalAmount = ($subtotal + $serviceCharge) - $discountAmount;

            $lastOrder = Order::latest()->first();
            $orderNumber = 'ORD-' . str_pad(($lastOrder ? $lastOrder->id : 0) + 1, 6, '0', STR_PAD_LEFT);

            $order = Order::create([
                'order_number' => $orderNumber,
                'type' => $request->type,
                'customer_id' => $request->customer_id,
                'employee_id' => $request->employee_id,
                'technician_id' => $request->technician_id,
                'order_date' => $request->order_date,
                'payment_method' => $request->payment_method ?? 'cash',
                'subtotal' => $subtotal,
                'discount' => $discountValue,
                'discount_type' => $request->discount_type ?? 'percentage',
                'discount_amount' => $discountAmount,
                'service_charge' => $serviceCharge,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'note' => $request->note,
                'service_notes' => $request->service_notes,
                'created_by' => auth()->id(),
            ]);

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);
            }

            DB::commit();

            // Notifications
            try {
                $order->load(['employee', 'customer']);
                $employee = $order->employee;
                if ($employee && $employee->parent_id) {
                    $parentEmployee = $employee->parent;
                    if ($parentEmployee && $parentEmployee->user) {
                        $parentEmployee->user->notify(new OrderCreatedNotification($order));
                    }
                } else {
                    $admins = User::role(['admin', 'super-admin'])->get();
                    Notification::send($admins, new OrderCreatedNotification($order));
                }
            } catch (Throwable $notifError) {
                Log::error('Order creation notification failed: ' . $notifError->getMessage());
            }

            return redirect()->back()->with('success', 'Order created successfully.');
        } catch (Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to create order: ' . $th->getMessage());
        }
    }

    /**
     * Update an existing order.
     */
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'type' => 'required|in:sales,service',
            'customer_id' => 'required|exists:customers,id',
            'employee_id' => 'nullable|exists:employee_details,id',
            'technician_id' => 'nullable|exists:technicians,id',
            'order_date' => 'required|date',
            'payment_method' => 'in:cash,credit,bank_transfer,cheque',
            'discount' => 'nullable|numeric|min:0',
            'discount_type' => 'in:percentage,fixed',
            'service_charge' => 'nullable|numeric|min:0',
            'note' => 'nullable|string',
            'service_notes' => 'nullable|string',
            'status' => 'in:pending,approved,delivered,cancelled',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:order_items,id',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.custom_item_name' => 'nullable|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.price_type' => 'in:tp,flat',
            'items.*.bonus_quantity' => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();

        try {
            $order->type = $request->type;
            $order->customer_id = $request->customer_id;
            $order->employee_id = $request->employee_id;
            $order->technician_id = $request->technician_id;
            $order->order_date = $request->order_date;
            $order->payment_method = $request->payment_method ?? 'cash';
            $order->discount = $request->discount ?? 0;
            $order->discount_type = $request->discount_type ?? 'percentage';
            $order->service_charge = $request->service_charge ?? 0;
            $order->status = $request->status ?? $order->status;
            $order->note = $request->note;
            $order->service_notes = $request->service_notes;

            $requestItemIds = collect($request->items)->pluck('id')->filter()->toArray();
            OrderItem::where('order_id', $order->id)->whereNotIn('id', $requestItemIds)->delete();

            $subtotal = 0;
            foreach ($request->items as $item) {
                if (empty($item['product_id']) && empty($item['custom_item_name'])) {
                    throw new \Exception("Each item must have a product or a custom name.");
                }

                $totalPrice = $item['quantity'] * $item['unit_price'];
                $subtotal += $totalPrice;
                $itemData = [
                    'product_id' => $item['product_id'] ?? null,
                    'custom_item_name' => $item['custom_item_name'] ?? null,
                    'price_type' => $item['price_type'] ?? 'tp',
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'bonus_quantity' => $item['bonus_quantity'] ?? 0,
                    'total_price' => $totalPrice,
                ];

                if (!empty($item['id'])) {
                    OrderItem::where('id', $item['id'])->where('order_id', $order->id)->update($itemData);
                } else {
                    $order->items()->create($itemData);
                }
            }

            $discountValue = $order->discount;
            $discountAmount = $order->discount_type === 'percentage'
                ? ($subtotal * $discountValue) / 100
                : $discountValue;

            $order->subtotal = $subtotal;
            $order->discount_amount = $discountAmount;
            $order->total_amount = ($subtotal + $order->service_charge) - $discountAmount;
            $order->save();

            DB::commit();

            return redirect()->back()->with('success', 'Order updated successfully.');
        } catch (Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update order: ' . $th->getMessage());
        }
    }

    /**
     * Delete an order.
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);

        try {
            $order->delete();
            return redirect()->back()->with('success', 'Order deleted successfully.');
        } catch (Throwable $th) {
            return redirect()->back()->with('error', 'Failed to delete order: ' . $th->getMessage());
        }
    }

    /**
     * Approve an order.
     */
    public function approve($id)
    {
        $order = Order::findOrFail($id);

        if (in_array($order->status, ['approved', 'delivered', 'cancelled'])) {
            return redirect()->back()->with('error', "Order cannot be approved. Current status: {$order->status}");
        }

        try {
            $order->status = 'approved';
            $order->approved_by = auth()->id();
            $order->save();

            try {
                $order->load('employee.user');
                if ($order->employee && $order->employee->user) {
                    $order->employee->user->notify(new OrderApprovedNotification($order));
                }
            } catch (Throwable $notifError) {
                Log::error('Order approval notification failed: ' . $notifError->getMessage());
            }

            return redirect()->back()->with('success', 'Order approved successfully.');
        } catch (Throwable $th) {
            return redirect()->back()->with('error', 'Failed to approve order: ' . $th->getMessage());
        }
    }
}
