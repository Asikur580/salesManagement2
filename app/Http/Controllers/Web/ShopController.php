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
}
