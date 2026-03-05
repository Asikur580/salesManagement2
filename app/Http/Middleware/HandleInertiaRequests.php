<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone,
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                    'unread_count' => $request->user()->unreadNotifications()->count(),
                    'notifications' => $request->user()->notifications()->latest()->take(10)->get(),
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'message' => $request->session()->get('message'),
            ],
            'categories' => \App\Models\Category::with('children.children')
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->orderBy('order')
                ->get(),
            'cart' => (function () use ($request) {
                if ($request->user()) {
                    $dbItems = \App\Models\Cart::with(['product', 'variant'])
                        ->where('user_id', $request->user()->id)
                        ->get();

                    $items = $dbItems->map(function ($item) {
                        $product = $item->product;
                        $variant = $item->variant;

                        // Get image path logic similar to CartController
                        $imagePath = null;
                        if ($variant && $variant->primaryImage) {
                            $imagePath = $variant->primaryImage->image_path;
                        } else {
                            $primaryImage = $product->primaryImage ?: ($product->images->where('is_primary', true)->first() ?: $product->images->first());
                            $imagePath = $primaryImage ? $primaryImage->image_path : null;
                        }

                        // Helper for variant name
                        $variantName = null;
                        if ($variant && method_exists($variant, 'attributeValues')) {
                            $variantName = $variant->attributeValues->pluck('value')->implode(' - ');
                        }

                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'variant_id' => $item->variant_id,
                            'name' => $product->name,
                            'variant_name' => $variantName,
                            'price' => (float) ($variant ? $variant->price : $product->base_price),
                            'quantity' => $item->quantity,
                            'image' => $imagePath,
                            'slug' => $product->slug,
                        ];
                    })->toArray();

                    return [
                        'items' => $items,
                        'count' => array_reduce($items, fn($carry, $item) => $carry + $item['quantity'], 0),
                        'total' => array_reduce($items, fn($carry, $item) => $carry + ($item['price'] * $item['quantity']), 0),
                    ];
                }

                $sessionCart = session()->get('cart', []);
                return [
                    'items' => array_values($sessionCart),
                    'count' => array_reduce($sessionCart, fn($carry, $item) => $carry + $item['quantity'], 0),
                    'total' => array_reduce($sessionCart, fn($carry, $item) => $carry + ($item['price'] * $item['quantity']), 0),
                ];
            })(),
            'wishlist_count' => app(\App\Repositories\Interfaces\WishlistRepositoryInterface::class)->getWishlistCount(),
        ];
    }
}
