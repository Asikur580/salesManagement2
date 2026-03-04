<?php

namespace App\Repositories;

use App\Models\Wishlist;
use App\Models\Product;
use App\Repositories\Interfaces\WishlistRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class WishlistRepository implements WishlistRepositoryInterface
{
    public function getUserWishlist()
    {
        return Wishlist::with(['product.category', 'product.primaryImage', 'product.variants.primaryImage'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->each(function ($item) {
                if ($item->product) {
                    $item->product->is_wishlisted = true;
                }
            });
    }

    public function toggleWishlist(int $productId)
    {
        $userId = Auth::id();

        $wishlistItem = Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($wishlistItem) {
            $wishlistItem->delete();
            return ['status' => 'removed', 'message' => 'Removed from wishlist'];
        } else {
            Wishlist::create([
                'user_id' => $userId,
                'product_id' => $productId,
            ]);
            return ['status' => 'added', 'message' => 'Added to wishlist'];
        }
    }

    public function removeFromWishlist(int $id)
    {
        $wishlistItem = Wishlist::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $wishlistItem->delete();

        return ['status' => 'removed', 'message' => 'Product removed from wishlist'];
    }

    public function getWishlistCount()
    {
        if (!Auth::check()) {
            return 0;
        }
        return Wishlist::where('user_id', Auth::id())->count();
    }
}
