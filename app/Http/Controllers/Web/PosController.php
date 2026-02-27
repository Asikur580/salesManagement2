<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        // Load customers for selection
        $customers = Customer::select('id', 'name', 'phone')->get();

        // Load categories for filtering
        $categories = Category::select('id', 'name')->get();

        // Load all products with eager loaded variants, images, etc.
        // In a very large database, you would paginate this and use a search endpoint,
        // but for a typical SME POS, loading a few hundred products to the client is fast and enables offline search.
        $products = Product::where('is_active', true)
            ->with([
                'category',
                'brand',
                'unit',
                'images',
                'variants.images',
                'variants.attributeValues.attribute'
            ])
            ->get();

        return Inertia::render('Pos/Index', [
            'customers' => $customers,
            'categories' => $categories,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'payment_method' => 'required|in:cash,credit,bank_transfer,card,mobile_banking',
            'discount' => 'nullable|numeric|min:0',
            'discount_type' => 'in:percentage,fixed',
            'note' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $subtotal = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $totalPrice = $item['quantity'] * $item['unit_price'];
                $subtotal += $totalPrice;

                $itemsData[] = [
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['variant_id'] ?? null,
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'total_price' => $totalPrice,
                    // Default values for standard pos
                    'price_type' => 'flat',
                    'bonus_quantity' => 0,
                ];
            }

            $discountValue = $request->discount ?? 0;
            $discountAmount = $request->discount_type === 'percentage'
                ? ($subtotal * $discountValue) / 100
                : $discountValue;

            $totalAmount = $subtotal - $discountAmount;

            $lastOrder = Order::latest()->first();
            $orderNumber = 'POS-' . str_pad(($lastOrder ? $lastOrder->id : 0) + 1, 6, '0', STR_PAD_LEFT);

            $order = Order::create([
                'order_number' => $orderNumber,
                'type' => 'sales',
                'customer_id' => $request->customer_id,
                'order_date' => now(),
                'payment_method' => $request->payment_method,
                'subtotal' => $subtotal,
                'discount' => $discountValue,
                'discount_type' => $request->discount_type ?? 'percentage',
                'discount_amount' => $discountAmount,
                'service_charge' => 0,
                'total_amount' => $totalAmount,
                // POS transactions are immediately delivered
                'status' => 'delivered',
                'note' => $request->note,
                'created_by' => auth()->id(),
                'approved_by' => auth()->id(), // Auto-approved by the POS operator
            ]);

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);

                // --- Stock Deduction Logic ---
                // For a robust system, this should ideally call the existing StockRepository or StockService
                // But we will decrement directly here for the immediate POS execution requirement.

                if (isset($itemData['product_variant_id'])) {
                    // Variant product
                    \App\Models\ProductVariant::where('id', $itemData['product_variant_id'])
                        ->decrement('stock', $itemData['quantity']);

                    // Also decrement the parent product total stock wrapper
                    \App\Models\Product::where('id', $itemData['product_id'])
                        ->decrement('stock', $itemData['quantity']);
                } else {
                    // Simple product
                    \App\Models\Product::where('id', $itemData['product_id'])
                        ->decrement('stock', $itemData['quantity']);
                }
            }

            DB::commit();

            return redirect()->back()->with('success', 'POS Transaction completed successfully.');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to complete transaction: ' . $th->getMessage());
        }
    }
}
