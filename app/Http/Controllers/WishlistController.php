<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function index()
    {
        $wishlistItems = Wishlist::with(['product.category', 'product.primaryImage', 'product.variants.primaryImage'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->each(function ($item) {
                if ($item->product) {
                    $item->product->is_wishlisted = true;
                }
            });

        return Inertia::render('Account/Wishlist', [
            'wishlistItems' => $wishlistItems
        ]);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = Auth::id();
        $productId = $request->product_id;

        $wishlistItem = Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($wishlistItem) {
            $wishlistItem->delete();
            return back()->with('success', 'Removed from wishlist');
        } else {
            Wishlist::create([
                'user_id' => $userId,
                'product_id' => $productId,
            ]);
            return back()->with('success', 'Added to wishlist');
        }
    }

    public function destroy($id)
    {
        $wishlistItem = Wishlist::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $wishlistItem->delete();

        return back()->with('success', 'Product removed from wishlist');
    }
}
