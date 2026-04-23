<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ServiceType;
use App\Models\User;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;
use Illuminate\Support\Str;

class ServiceInvoiceController extends Controller
{
    public function index()
    {
        $services = Order::where('type', 'service')
            ->with(['user', 'technician', 'creator'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Service/Index', [
            'services' => $services
        ]);
    }

    public function create()
    {
        return Inertia::render('Service/Create', [
            'customers' => User::role('customer')->select('id', 'name', 'phone')->get(),
            'technicians' => User::role(['admin', 'super-admin', 'sales'])->select('id', 'name')->get(), // Or specific technician role if exists
            'products' => Product::where('is_active', true)
                ->with(['images', 'variants.attributeValues.attribute'])
                ->get(),
            'categories' => Category::select('id', 'name')->get(),
            'serviceTypes' => ServiceType::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, StockService $stockService)
    {
        $request->validate([
            'customer_id' => 'required_without:customer_phone|nullable|exists:users,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'required_without:customer_id|nullable|string|max:20',
            'technician_id' => 'required|exists:users,id',
            'service_type' => 'required|string|max:255',
            'service_charge' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,credit,bank_transfer,card,mobile_banking',
            'tax_percentage' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'note' => 'nullable|string',
            'parts' => 'nullable|array',
            'parts.*.product_id' => 'required|exists:products,id',
            'parts.*.variant_id' => 'nullable|exists:product_variants,id',
            'parts.*.quantity' => 'required|integer|min:1',
            'parts.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $subtotalParts = 0;
            $itemsData = [];

            if ($request->parts) {
                foreach ($request->parts as $item) {
                    $product = Product::findOrFail($item['product_id']);
                    $variantName = null;
                    if (!empty($item['variant_id'])) {
                        $variant = ProductVariant::with('attributeValues')->find($item['variant_id']);
                        if ($variant) {
                            $variantName = $variant->attributeValues->pluck('value')->implode(' - ');
                        }
                    }

                    $actualPrice = isset($variant) && $variant ? $variant->price : $product->base_price;
                    $totalPrice = $item['quantity'] * $actualPrice;
                    $subtotalParts += $totalPrice;

                    $itemsData[] = [
                        'product_id' => $item['product_id'],
                        'variant_id' => $item['variant_id'] ?? null,
                        'product_name' => $product->name,
                        'variant_name' => $variantName,
                        'unit_price' => $actualPrice,
                        'cost_price' => $product->cost_price ?? 0,
                        'quantity' => $item['quantity'],
                        'total_price' => $totalPrice,
                        'item_type' => 'service_part',
                        'price_type' => 'flat',
                        'bonus_quantity' => 0,
                    ];
                }
            }

            $subtotal = $subtotalParts + $request->service_charge;
            $discountAmount = $request->discount ?? 0; // Assuming fixed for service for simplicity
            $totalBeforeTax = $subtotal - $discountAmount;
            $taxAmount = ($totalBeforeTax * ($request->tax_percentage ?? 0)) / 100;
            $totalAmount = $totalBeforeTax + $taxAmount;

            $lastOrder = Order::latest()->first();
            $orderNumber = 'SRV-' . str_pad(($lastOrder ? $lastOrder->id : 0) + 1, 6, '0', STR_PAD_LEFT);

            // Handle Customer (Select existing or Create new)
            if ($request->customer_id) {
                $customer = User::findOrFail($request->customer_id);
            } else {
                // Check if user exists by phone
                $customer = User::where('phone', $request->customer_phone)->first();
                if (!$customer) {
                    $customer = User::create([
                        'name' => $request->customer_name ?? $request->customer_phone,
                        'phone' => $request->customer_phone,
                        'email' => null,
                        'password' => null,
                    ]);
                    $customer->assignRole('customer');
                }
            }

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_phone' => $customer->phone ?? 'N/A',
                'customer_email' => $customer->email,
                'shipping_address' => 'Service Center',
                'type' => 'service',
                'service_type' => $request->service_type,
                'technician_id' => $request->technician_id,
                'order_date' => now(),
                'payment_method' => $request->payment_method,
                'subtotal' => $subtotal,
                'discount' => $discountAmount,
                'discount_type' => 'fixed',
                'discount_amount' => $discountAmount,
                'tax_percentage' => $request->tax_percentage ?? 0,
                'tax_amount' => $taxAmount,
                'service_charge' => $request->service_charge,
                'total_amount' => $totalAmount,
                'status' => 'delivered',
                'notes' => $request->note,
                'source' => 'pos',
                'created_by' => Auth::id(),
                'approved_by' => Auth::id(),
            ]);

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);
            }

            // Deduct stock for parts
            if (count($itemsData) > 0) {
                $stockService->recordSale($order);
            }

            DB::commit();

            return redirect()->route('services.index')->with('success', 'Service Invoice created successfully.');
        } catch (Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to create service invoice: ' . $th->getMessage());
        }
    }

    public function downloadInvoice(Order $order)
    {
        if ($order->type !== 'service') {
            abort(404);
        }

        $order->load(['user', 'technician', 'items']);
        
        // Using same pattern as OrderController if they use a PDF library like DomPDF
        // For now, mirroring the likely structure
        return view('invoices.service-invoice', compact('order'));
    }
}
