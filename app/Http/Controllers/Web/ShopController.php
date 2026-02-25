<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'brand'])
            ->where('quantity', '>', 0)
            ->latest()
            ->take(12)
            ->get();

        $categories = Category::all();
        $brands = Brand::take(10)->get();

        return Inertia::render('Index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function newArrivals()
    {
        $products = Product::with(['category', 'brand'])
            ->where('quantity', '>', 0)
            ->latest()
            ->paginate(24);

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
        $query = Product::with(['category', 'brand'])
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
}
