<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ShopController extends Controller
{

    public function index()
    {
        $baseQuery = Product::with(['category', 'brand', 'primaryImage', 'variants.primaryImage'])
            ->where('is_active', true);

        $flashSaleProducts = (clone $baseQuery)
            ->inRandomOrder()
            ->take(6)
            ->get();

        $flashSaleProducts->each(function ($p) {
            $p->setAppends(['price', 'old_price']);
            if (Auth::check()) {
                $p->is_wishlisted = $p->wishlists()->where('user_id', Auth::id())->exists();
            }
        });

        $newArrivals = (clone $baseQuery)
            ->latest()
            ->take(10)
            ->get();

        $newArrivals->each(function ($p) {
            $p->setAppends(['price', 'old_price']);
            if (Auth::check()) {
                $p->is_wishlisted = $p->wishlists()->where('user_id', Auth::id())->exists();
            }
        });

        $youMayLike = (clone $baseQuery)
            ->inRandomOrder()
            ->take(12)
            ->get();

        $youMayLike->each(function ($p) {
            $p->setAppends(['price', 'old_price']);
            if (Auth::check()) {
                $p->is_wishlisted = $p->wishlists()->where('user_id', Auth::id())->exists();
            }
        });

        $categories = Category::with('children.children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        $brands = Brand::take(20)->get();


        return Inertia::render('Index', [
            'flashSaleProducts' => $flashSaleProducts,
            'newArrivals' => $newArrivals,
            'youMayLike' => $youMayLike,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function newArrivals()
    {
        $products = Product::with(['category', 'brand', 'primaryImage', 'variants.primaryImage'])
            ->where('is_active', true)
            ->latest()
            ->paginate(24);

        $products->each(function ($p) {
            $p->setAppends(['price', 'old_price']);
            if (Auth::check()) {
                $p->is_wishlisted = $p->wishlists()->where('user_id', Auth::id())->exists();
            }
        });

        return Inertia::render('NewArrivalsPage', [
            'products' => $products,
        ]);
    }

    public function allBrands()
    {
        $brands = Brand::all();

        return Inertia::render('BrandsPage', [
            'brands' => $brands,
        ]);
    }

    public function brandProducts(Brand $brand, Request $request)
    {
        $query = Product::with(['category', 'brand', 'primaryImage', 'variants.primaryImage'])
            ->where('brand_id', $brand->id)
            ->where('is_active', true);

        // Filter by Price
        if ($request->has('min_price')) {
            $query->where('base_price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('base_price', '<=', $request->max_price);
        }

        // Sorting
        $sort = $request->get('sort', 'default');
        if ($sort === 'price_low') {
            $query->orderBy('base_price', 'asc');
        } elseif ($sort === 'price_high') {
            $query->orderBy('base_price', 'desc');
        } elseif ($sort === 'newest') {
            $query->latest();
        }

        $products = $query->paginate(24)->withQueryString();

        $products->each(function ($p) {
            $p->setAppends(['price', 'old_price']);
            if (Auth::check()) {
                $p->is_wishlisted = $p->wishlists()->where('user_id', Auth::id())->exists();
            }
        });

        return Inertia::render('Shop/BrandProductsPage', [
            'brand' => $brand,
            'products' => $products,
            'filters' => $request->only(['min_price', 'max_price', 'sort']),
        ]);
    }

    public function flashSales()
    {
        $products = Product::with(['category', 'brand', 'primaryImage', 'variants.primaryImage'])
            ->where('is_active', true)
            ->inRandomOrder()
            ->paginate(24);

        $products->each(function ($p) {
            $p->setAppends(['price', 'old_price']);
            if (Auth::check()) {
                $p->is_wishlisted = $p->wishlists()->where('user_id', Auth::id())->exists();
            }
        });

        return Inertia::render('Shop/FlashSalePage', [
            'products' => $products,
        ]);
    }

    public function categoryProducts(Category $category, Request $request)
    {

        $query = Product::with(['category', 'brand', 'primaryImage', 'variants.primaryImage'])
            ->where('category_id', $category->id);

        // Filter by Price
        if ($request->has('min_price')) {
            $query->where('base_price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('base_price', '<=', $request->max_price);
        }

        // Filter by Brand
        if ($request->has('brands')) {
            $brandIds = explode(',', $request->brands);
            $query->whereIn('brand_id', $brandIds);
        }

        // Sorting
        $sort = $request->get('sort', 'default');
        if ($sort === 'price_low') {
            $query->orderBy('base_price', 'asc');
        } elseif ($sort === 'price_high') {
            $query->orderBy('base_price', 'desc');
        } elseif ($sort === 'newest') {
            $query->latest();
        }

        $products = $query->paginate(24)->withQueryString();

        $products->each(function ($p) {
            $p->setAppends(['price', 'old_price']);
            if (Auth::check()) {
                $p->is_wishlisted = $p->wishlists()->where('user_id', Auth::id())->exists();
            }
        });

        $brands = Brand::whereHas('products', function ($q) use ($category) {
            $q->where('category_id', $category->id);
        })->get();

        return Inertia::render('CategoryPage', [
            'category' => $category,
            'products' => $products,
            'brands' => $brands,
            'filters' => $request->only(['min_price', 'max_price', 'brands', 'sort']),
        ]);
    }

    public function show(Product $product)
    {
        $product->load(['category', 'brand', 'variants.attributeValues.attribute', 'variants.primaryImage', 'images', 'primaryImage']);
        $product->setAppends(['price', 'old_price']);

        if (Auth::check()) {
            $product->is_wishlisted = $product->wishlists()->where('user_id', Auth::id())->exists();
        }

        $relatedProducts = Product::with(['category', 'brand', 'primaryImage', 'variants.primaryImage'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->take(6)
            ->get();

        // Fallback: if not enough related products, fill with products from same brand
        if ($relatedProducts->count() < 4 && $product->brand_id) {
            $existingIds = $relatedProducts->pluck('id')->push($product->id);
            $brandFallback = Product::with(['category', 'brand', 'primaryImage', 'variants.primaryImage'])
                ->where('brand_id', $product->brand_id)
                ->whereNotIn('id', $existingIds)
                ->where('is_active', true)
                ->take(6 - $relatedProducts->count())
                ->get();
            $relatedProducts = $relatedProducts->merge($brandFallback);
        }

        $relatedProducts->each(function ($p) {
            $p->setAppends(['price', 'old_price']);
            if (Auth::check()) {
                $p->is_wishlisted = $p->wishlists()->where('user_id', Auth::id())->exists();
            }
        });


        return Inertia::render('ProductDetails', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    public function search(Request $request)
    {
        $query = Product::with(['category', 'brand', 'primaryImage', 'variants.primaryImage']);

        // Search by keyword
        if ($request->has('q')) {
            $searchTerm = $request->q;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by Category
        if ($request->has('category')) {
            $category = Category::where('slug', $request->category)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Filter by Price
        if ($request->has('min_price')) {
            $query->where('base_price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('base_price', '<=', $request->max_price);
        }

        // Filter by Brand
        if ($request->has('brands')) {
            $brandIds = explode(',', $request->brands);
            $query->whereIn('brand_id', $brandIds);
        }

        // Sorting
        $sort = $request->get('sort', 'default');
        if ($sort === 'price_low') {
            $query->orderBy('base_price', 'asc');
        } elseif ($sort === 'price_high') {
            $query->orderBy('base_price', 'desc');
        } elseif ($sort === 'newest') {
            $query->latest();
        }

        $products = $query->paginate(24)->withQueryString();

        $products->each(function ($p) {
            $p->setAppends(['price', 'old_price']);
            if (Auth::check()) {
                $p->is_wishlisted = $p->wishlists()->where('user_id', Auth::id())->exists();
            }
        });

        return Inertia::render('SearchPage', [
            'products' => $products,
            'searchTerm' => $request->get('q', ''),
            'filterCategories' => Category::all(),
            'brands' => Brand::all(),
            'filters' => $request->only(['min_price', 'max_price', 'brands', 'sort', 'category']),
        ]);
    }
}
