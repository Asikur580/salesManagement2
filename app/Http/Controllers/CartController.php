<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        return Inertia::render('Shop/Cart');
    }

    public function checkout()
    {
        $hasItems = false;
        if (auth()->check()) {
            $hasItems = \App\Models\Cart::where('user_id', auth()->id())->exists();
        } else {
            $hasItems = !empty(session()->get('cart', []));
        }

        if (!$hasItems) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        return Inertia::render('Shop/Checkout', [
            'addresses' => auth()->check() ? auth()->user()->addresses : []
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $productId = $request->product_id;
        $variantId = $request->variant_id;
        $quantity = $request->quantity;

        if (auth()->check()) {
            $cartItem = \App\Models\Cart::where('user_id', auth()->id())
                ->where('product_id', $productId)
                ->where('variant_id', $variantId)
                ->first();

            if ($cartItem) {
                $cartItem->increment('quantity', $quantity);
            } else {
                \App\Models\Cart::create([
                    'user_id' => auth()->id(),
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'quantity' => $quantity,
                ]);
            }
        } else {
            $product = Product::with(['images', 'category'])->findOrFail($productId);
            $variant = $variantId ? ProductVariant::with(['images', 'attributeValues'])->findOrFail($variantId) : null;

            $cartItemId = $variantId ? "v_{$variantId}" : "p_{$productId}";
            $price = $variant ? $variant->price : $product->base_price;

            // Handle image
            $imagePath = null;
            if ($variant && $variant->images->count() > 0) {
                $imagePath = $variant->images[0]->image_path;
            } else {
                $primaryImage = $product->images->where('is_primary', true)->first();
                $imagePath = $primaryImage ? $primaryImage->image_path : ($product->images->first() ? $product->images->first()->image_path : null);
            }

            $cart = session()->get('cart', []);

            if (isset($cart[$cartItemId])) {
                $cart[$cartItemId]['quantity'] += $quantity;
            } else {
                $cart[$cartItemId] = [
                    'id' => $cartItemId,
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'name' => $product->name,
                    'variant_name' => $variant ? $this->getVariantName($variant) : null,
                    'price' => (float) $price,
                    'quantity' => $quantity,
                    'image' => $imagePath,
                    'slug' => $product->slug,
                ];
            }

            session()->put('cart', $cart);
        }

        return back()->with('success', 'Product added to cart successfully!');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        if (auth()->check()) {
            $cartItem = \App\Models\Cart::where('user_id', auth()->id())->where('id', $id)->first();
            if ($cartItem) {
                $cartItem->update(['quantity' => $request->quantity]);
                return back()->with('success', 'Cart updated!');
            }
        } else {
            $cart = session()->get('cart', []);
            if (isset($cart[$id])) {
                $cart[$id]['quantity'] = $request->quantity;
                session()->put('cart', $cart);
                return back()->with('success', 'Cart updated!');
            }
        }

        return back()->with('error', 'Item not found in cart.');
    }

    public function destroy($id)
    {
        if (auth()->check()) {
            $cartItem = \App\Models\Cart::where('user_id', auth()->id())->where('id', $id)->first();
            if ($cartItem) {
                $cartItem->delete();
                return back()->with('success', 'Item removed from cart.');
            }
        } else {
            $cart = session()->get('cart', []);
            if (isset($cart[$id])) {
                unset($cart[$id]);
                session()->put('cart', $cart);
                return back()->with('success', 'Item removed from cart.');
            }
        }

        return back()->with('error', 'Item not found in cart.');
    }

    public function clear()
    {
        if (auth()->check()) {
            \App\Models\Cart::where('user_id', auth()->id())->delete();
        } else {
            session()->forget('cart');
        }
        return back()->with('success', 'Cart cleared successfully!');
    }

    private function getVariantName($variant)
    {
        // Adjust this based on your variant attribute structure
        // Assuming variant has attributeValues relationship
        if (method_exists($variant, 'attributeValues')) {
            return $variant->attributeValues->pluck('value')->implode(' - ');
        }
        return null;
    }
}
