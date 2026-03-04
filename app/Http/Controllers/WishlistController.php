<?php

namespace App\Http\Controllers;

use App\Repositories\Interfaces\WishlistRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistController extends Controller
{
    protected $wishlistRepository;

    public function __construct(WishlistRepositoryInterface $wishlistRepository)
    {
        $this->wishlistRepository = $wishlistRepository;
    }

    public function index()
    {
        $wishlistItems = $this->wishlistRepository->getUserWishlist();

        return Inertia::render('Account/Wishlist', [
            'wishlistItems' => $wishlistItems
        ]);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $result = $this->wishlistRepository->toggleWishlist($request->product_id);

        return back()->with('success', $result['message']);
    }

    public function destroy($id)
    {
        $result = $this->wishlistRepository->removeFromWishlist($id);

        return back()->with('success', $result['message']);
    }
}
