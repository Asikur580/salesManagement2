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
            'cart' => [
                'items' => array_values(session()->get('cart', [])),
                'count' => array_reduce(session()->get('cart', []), function ($carry, $item) {
                    return $carry + $item['quantity'];
                }, 0),
                'total' => array_reduce(session()->get('cart', []), function ($carry, $item) {
                    return $carry + ($item['price'] * $item['quantity']);
                }, 0),
            ],
            'wishlist_count' => app(\App\Repositories\Interfaces\WishlistRepositoryInterface::class)->getWishlistCount(),
        ];
    }
}
