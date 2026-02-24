<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand']);

        if ($request->search) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->category_id && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->brand_id && $request->brand_id !== 'all') {
            $query->where('brand_id', $request->brand_id);
        }

        $products = $query->latest()->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'categoryId' => (int)$item->category_id,
                'brandId' => (int)$item->brand_id,
                'name' => $item->name,
                'packSize' => $item->pack_size,
                'purchasePrice' => (float)$item->purchase_price,
                'salePrice' => (float)$item->sale_price,
                'flatPrice' => (float)$item->flat_price,
                'quantity' => (int)$item->quantity,
                'expirationDate' => $item->expiration_date,
                'image' => $item->image
            ];
        });

        $categories = Category::all()->map(function ($c) {
            return ['id' => $c->id, 'name' => $c->name];
        });

        $brands = Brand::all()->map(function ($b) {
            return ['id' => $b->id, 'name' => $b->name];
        });

        $suppliers = Supplier::all()->map(function ($s) {
            return ['id' => $s->id, 'company_name' => $s->company_name];
        });

        return Inertia::render('Products', [
            'initialProducts' => $products,
            'initialCategories' => $categories,
            'initialBrands' => $brands,
            'initialSuppliers' => $suppliers,
            'filters' => $request->only(['search', 'category_id', 'brand_id'])
        ]);
    }
}
