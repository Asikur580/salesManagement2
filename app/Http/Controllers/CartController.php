<?php

namespace App\Http\Controllers;

use App\Models\Cart;
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
            $hasItems = Cart::where('user_id', auth()->id())->exists();
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

        // Verify requested inventory exists
        $product = Product::with(['images', 'category'])->findOrFail($productId);
        $variant = $variantId ? ProductVariant::with(['images', 'attributeValues'])->findOrFail($variantId) : null;
        $availableStock = $variant ? $variant->stock : $product->stock;

        if (auth()->check()) {
            $cartItem = Cart::where('user_id', auth()->id())
                ->where('product_id', $productId)
                ->where('variant_id', $variantId)
                ->first();

            $currentQuantity = $cartItem ? $cartItem->quantity : 0;
            if (($currentQuantity + $quantity) > $availableStock) {
                return back()->with('error', "Only {$availableStock} items available in stock.");
            }

            if ($cartItem) {
                $cartItem->increment('quantity', $quantity);
            } else {
                Cart::create([
                    'user_id' => auth()->id(),
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'quantity' => $quantity,
                ]);
            }
        } else {
            $cartItemId = $variantId ? "v_{$variantId}" : "p_{$productId}";
            $cart = session()->get('cart', []);
            $currentQuantity = isset($cart[$cartItemId]) ? $cart[$cartItemId]['quantity'] : 0;

            if (($currentQuantity + $quantity) > $availableStock) {
                return back()->with('error', "Only {$availableStock} items available in stock.");
            }

            $price = $variant ? $variant->price : $product->base_price;

            // Handle image
            $imagePath = null;
            if ($variant && $variant->images->count() > 0) {
                $imagePath = $variant->images[0]->image_path;
            } else {
                $primaryImage = $product->images->where('is_primary', true)->first();
                $imagePath = $primaryImage ? $primaryImage->image_path : ($product->images->first() ? $product->images->first()->image_path : null);
            }

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
            $cartItem = Cart::where('user_id', auth()->id())->where('id', $id)->first();
            if ($cartItem) {
                $product = Product::find($cartItem->product_id);
                $variant = $cartItem->variant_id ? ProductVariant::find($cartItem->variant_id) : null;
                $availableStock = $variant ? $variant->stock : ($product ? $product->stock : 0);

                if ($request->quantity > $availableStock) {
                    return back()->with('error', "Only {$availableStock} items available in stock.");
                }

                $cartItem->update(['quantity' => $request->quantity]);
                return back()->with('success', 'Cart updated!');
            }
        } else {
            $cart = session()->get('cart', []);
            if (isset($cart[$id])) {
                $cartItemData = $cart[$id];
                $product = Product::find($cartItemData['product_id']);
                $variant = $cartItemData['variant_id'] ? ProductVariant::find($cartItemData['variant_id']) : null;
                $availableStock = $variant ? $variant->stock : ($product ? $product->stock : 0);

                if ($request->quantity > $availableStock) {
                    return back()->with('error', "Only {$availableStock} items available in stock.");
                }

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
            $cartItem = Cart::where('user_id', auth()->id())->where('id', $id)->first();
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
            Cart::where('user_id', auth()->id())->delete();
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
