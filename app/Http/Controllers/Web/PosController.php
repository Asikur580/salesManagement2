<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;
use App\Services\StockService;
use Illuminate\Support\Str;

class PosController extends Controller
{
    public function index()
    {

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
            'customers' => User::role('customer')->select('id', 'name', 'phone')->get(),
            'categories' => $categories,
            'products' => $products,
        ]);
    }

    public function store(Request $request, StockService $stockService)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:users,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'payment_method' => 'required|in:cash,credit,bank_transfer,card,mobile_banking',
            'discount' => 'nullable|numeric|min:0',
            'discount_type' => 'in:percentage,fixed',
            'tax_percentage' => 'nullable|numeric|min:0',
            'note' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        if (empty($request->customer_id) && empty($request->customer_phone)) {
            return redirect()->back()->with('error', 'Customer selection or Phone number is required.');
        }

        DB::beginTransaction();

        try {
            $subtotal = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $variantName = null;
                if (!empty($item['variant_id'])) {
                    $variant = ProductVariant::with('attributeValues')->find($item['variant_id']);
                    if ($variant) {
                        $variantName = $variant->attributeValues->pluck('value')->implode(' - ');
                    }
                }

                $totalPrice = $item['quantity'] * $item['unit_price'];
                $subtotal += $totalPrice;

                $itemsData[] = [
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'] ?? null,
                    'product_name' => $product->name,
                    'variant_name' => $variantName,
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

            $totalBeforeTax = $subtotal - $discountAmount;
            $taxValue = $request->tax_percentage ?? 0;
            $taxAmount = ($totalBeforeTax * $taxValue) / 100;

            $totalAmount = $totalBeforeTax + $taxAmount;

            $lastOrder = Order::latest()->first();
            $orderNumber = 'POS-' . str_pad(($lastOrder ? $lastOrder->id : 0) + 1, 6, '0', STR_PAD_LEFT);

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
                        'email' => null, // Email is optional for POS customers
                        'password' => null, // Password is null for instant accounts
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
                'shipping_address' => 'POS Transaction', // Placeholder for POS
                'type' => 'sales',
                'order_date' => now(),
                'payment_method' => $request->payment_method,
                'subtotal' => $subtotal,
                'discount' => $discountValue,
                'discount_type' => $request->discount_type ?? 'percentage',
                'discount_amount' => $discountAmount,
                'tax_percentage' => $taxValue,
                'tax_amount' => $taxAmount,
                'service_charge' => 0,
                'total_amount' => $totalAmount,
                // POS transactions are immediately delivered
                'status' => 'delivered',
                'notes' => $request->note,
                'source' => 'pos',
                'created_by' => Auth::id(),
                'approved_by' => Auth::id(), // Auto-approved by the POS operator
            ]);

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);
            }

            // --- Centralized Stock Deduction Logic ---
            $stockService->recordSale($order);

            DB::commit();

            return redirect()->back()->with('success', 'POS Transaction completed successfully.');
        } catch (Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to complete transaction: ' . $th->getMessage());
        }
    }
}
