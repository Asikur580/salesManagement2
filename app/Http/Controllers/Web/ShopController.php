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
            ->take(4)
            ->get()
            ->each->setAppends(['price', 'old_price']);

        $newArrivals = (clone $baseQuery)
            ->latest()
            ->take(8)
            ->get()
            ->each->setAppends(['price', 'old_price']);

        $youMayLike = (clone $baseQuery)
            ->inRandomOrder()
            ->take(12)
            ->get()
            ->each->setAppends(['price', 'old_price']);

        $categories = Category::with('children.children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        $brands = Brand::take(10)->get();


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

        $products->each->setAppends(['price', 'old_price']);

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

    public function categoryProducts(Category $category, Request $request)
    {
        $query = Product::with(['category', 'brand', 'primaryImage', 'variants.primaryImage'])
            ->where('category_id', $category->id);

        // Filter by Price
        if ($request->has('min_price')) {
            $query->where('sale_price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('sale_price', '<=', $request->max_price);
        }

        // Filter by Brand
        if ($request->has('brands')) {
            $brandIds = explode(',', $request->brands);
            $query->whereIn('brand_id', $brandIds);
        }

        // Sorting
        $sort = $request->get('sort', 'default');
        if ($sort === 'price_low') {
            $query->orderBy('sale_price', 'asc');
        } elseif ($sort === 'price_high') {
            $query->orderBy('sale_price', 'desc');
        } elseif ($sort === 'newest') {
            $query->latest();
        }

        $products = $query->paginate(24)->withQueryString();
        $products->each->setAppends(['price', 'old_price']);

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

        $relatedProducts = Product::with(['category', 'brand', 'primaryImage', 'variants.primaryImage'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get()
            ->each->setAppends(['price', 'old_price']);


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
            $query->where('sale_price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('sale_price', '<=', $request->max_price);
        }

        // Filter by Brand
        if ($request->has('brands')) {
            $brandIds = explode(',', $request->brands);
            $query->whereIn('brand_id', $brandIds);
        }

        // Sorting
        $sort = $request->get('sort', 'default');
        if ($sort === 'price_low') {
            $query->orderBy('sale_price', 'asc');
        } elseif ($sort === 'price_high') {
            $query->orderBy('sale_price', 'desc');
        } elseif ($sort === 'newest') {
            $query->latest();
        }

        $products = $query->paginate(24)->withQueryString();
        $products->each->setAppends(['price', 'old_price']);

        return Inertia::render('SearchPage', [
            'products' => $products,
            'searchTerm' => $request->get('q', ''),
            'categories' => Category::all(),
            'brands' => Brand::all(),
            'filters' => $request->only(['min_price', 'max_price', 'brands', 'sort', 'category']),
        ]);
    }
}
