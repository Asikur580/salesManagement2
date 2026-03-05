<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Notifications\OrderCreatedNotification;
use Illuminate\Support\Facades\Notification;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'phone' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'payment_method' => 'required|string',
        ]);

        $user = Auth::user();
        $cartItems = [];

        if ($user) {
            $dbCart = Cart::with(['product', 'variant.attributeValues'])->where('user_id', $user->id)->get();
            foreach ($dbCart as $item) {
                $variantName = null;
                if ($item->variant && $item->variant->attributeValues) {
                    $variantName = $item->variant->attributeValues->pluck('value')->implode(' - ');
                }

                $cartItems[] = [
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'price' => $item->variant ? $item->variant->price : $item->product->base_price,
                    'name' => $item->product->name,
                    'variant_name' => $variantName,
                ];
            }
        } else {
            $sessionCart = session()->get('cart', []);
            $cartItems = array_values($sessionCart);
        }

        if (empty($cartItems)) {
            return back()->with('error', 'Your cart is empty.');
        }

        DB::beginTransaction();
        try {
            $subtotal = 0;
            foreach ($cartItems as $item) {
                $subtotal += $item['price'] * $item['quantity'];
            }

            $total = $subtotal;

            $postalCode = $request->postal_code ?? '';
            $email = $request->email ?? null;

            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'customer_name' => $request->first_name . ' ' . $request->last_name,
                'customer_phone' => $request->phone,
                'customer_email' => $email,
                'shipping_address' => $request->address . ', ' . $request->city . ($postalCode ? ' - ' . $postalCode : ''),
                'subtotal' => $subtotal,
                'total_amount' => $total,
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'status' => 'pending',
                'source' => 'online',
                'type' => 'sales',
                'order_date' => now(),
            ]);

            foreach ($cartItems as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'product_variant_id' => $item['variant_id'],
                    'product_name' => $item['name'] ?? 'Product',
                    'variant_name' => $item['variant_name'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total_price' => $item['price'] * $item['quantity'],
                ]);

                // Stock deduction
                if ($item['variant_id']) {
                    ProductVariant::where('id', $item['variant_id'])->decrement('stock', $item['quantity']);
                    Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
                } else {
                    Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
                }
            }

            // Clear Cart
            if ($user) {
                Cart::where('user_id', $user->id)->delete();
            } else {
                session()->forget('cart');
            }

            DB::commit();

            // Notify admin
            $admins = \App\Models\User::role(['super-admin', 'admin'])->get();
            Notification::send($admins, new OrderCreatedNotification($order));

            return redirect()->route('shop.index')->with('success', 'Order placed successfully! Order #' . $order->order_number);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to place order: ' . $e->getMessage());
        }
    }
}
