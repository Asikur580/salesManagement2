<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\RestockOrder;
use App\Models\RestockOrderItem;
use App\Models\Supplier;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;

class RestockOrderController extends Controller
{
    public function __construct(protected StockService $stockService)
    {
    }

    public function index(Request $request)
    {
        $query = RestockOrder::with('supplier', 'creator')->latest();

        if ($request->filled('search')) {
            $query->where('order_number', 'like', "%{$request->search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate($request->input('per_page', 15));

        return Inertia::render('Inventory/Restock/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Inventory/Restock/Create', [
            'suppliers' => Supplier::where('is_active', true)->get(),
            'products' => Product::with('variants.attributeValues')->get()->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'variants' => $product->variants->map(function ($variant) {
                        return [
                            'id' => $variant->id,
                            'name' => $variant->attributeValues->pluck('value')->implode(' - '),
                        ];
                    }),
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.cost_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $orderNumber = 'PO-' . strtoupper(uniqid());

            $restockOrder = RestockOrder::create([
                'order_number' => $orderNumber,
                'supplier_id' => $request->supplier_id,
                'status' => 'pending',
                'notes' => $request->notes,
                'created_by' => Auth::id(),
                'total_amount' => collect($request->items)->sum(fn($i) => $i['quantity'] * $i['cost_price']),
            ]);

            foreach ($request->items as $item) {
                $restockOrder->items()->create([
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity'],
                    'cost_price' => $item['cost_price'],
                    'total_price' => $item['quantity'] * $item['cost_price'],
                ]);
            }

            DB::commit();
            return redirect()->route('restock-orders.index')->with('success', 'Restock order created successfully.');
        } catch (Throwable $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create restock order: ' . $e->getMessage());
        }
    }

    public function show(RestockOrder $restockOrder)
    {
        $restockOrder->load(['supplier', 'creator', 'items.product', 'items.variant']);
        return Inertia::render('Inventory/Restock/Show', [
            'order' => $restockOrder,
        ]);
    }

    public function receive(RestockOrder $restockOrder)
    {
        if ($restockOrder->status !== 'pending') {
            return back()->with('error', 'Only pending orders can be received.');
        }

        DB::beginTransaction();
        try {
            $restockOrder->update([
                'status' => 'received',
                'received_at' => now(),
            ]);

            $this->stockService->recordRestock($restockOrder);

            DB::commit();
            return back()->with('success', 'Order received and stock updated successfully.');
        } catch (Throwable $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to receive order: ' . $e->getMessage());
        }
    }

    public function destroy(RestockOrder $restockOrder)
    {
        if ($restockOrder->status === 'received') {
            return back()->with('error', 'Received orders cannot be deleted.');
        }

        $restockOrder->delete();
        return redirect()->route('restock-orders.index')->with('success', 'Order cancelled and deleted.');
    }
}
