<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Attribute;
use App\Models\Brand;
use App\Models\Category;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Repositories\Interfaces\UnitRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ProductController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:product.view', only: ['index', 'show', 'barcodeSearch']),
            new Middleware('permission:product.create', only: ['create', 'store']),
            new Middleware('permission:product.edit', only: ['edit', 'update']),
            new Middleware('permission:product.delete', only: ['destroy']),
        ];
    }
    public function __construct(
        protected ProductRepositoryInterface $productRepository,
        protected UnitRepositoryInterface $unitRepository
    ) {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'category_id', 'brand_id', 'product_type']);
        $perPage = $request->input('per_page', 15);

        $products = $this->productRepository->paginate($filters, $perPage);

        // Required for filters
        $categories = Category::with('parent')->get()->map(function ($c) {
            $name = $c->name;
            if ($c->parent) {
                $name = $c->parent->name . ' > ' . $name;
                if ($c->parent->parent) {
                    $name = $c->parent->parent->name . ' > ' . $name;
                }
            }
            return ['id' => $c->id, 'name' => $name];
        });

        $brands = Brand::select('id', 'name')->get();
        $units = $this->unitRepository->all();

        return Inertia::render('Products', [
            'products' => $products,
            'filters' => $filters,
            'categories' => $categories,
            'brands' => $brands,
            'units' => $units,
        ]);
    }

    public function show($id)
    {
        $product = $this->productRepository->findById($id);

        // Eager load everything needed for the view if the repository didn't ALREADY load it all deeply
        // The repository findById usually loads category, brand, unit, variants.attributes, images.
        // Let's make sure it's fully loaded for the view:
        $product->loadMissing([
            'category',
            'brand',
            'unit',
            'images',
            'variants.images',
            'variants.attributeValues.attribute'
        ]);

        return Inertia::render('ShowProduct', [
            'product' => $product,
        ]);
    }

    public function create()
    {
        $categories = Category::with('parent')->get()->map(function ($c) {
            $name = $c->name;
            if ($c->parent)
                $name = $c->parent->name . ' > ' . $name;
            return ['id' => $c->id, 'name' => $name];
        });

        return Inertia::render('CreateProduct', [
            'categories' => $categories,
            'brands' => Brand::select('id', 'name')->get(),
            'units' => $this->unitRepository->all(),
            'attributes' => Attribute::with('values')->get(),
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $this->productRepository->create($request->validated());
        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    public function edit($id)
    {
        $product = $this->productRepository->findById($id);

        $categories = Category::with('parent')->get()->map(function ($c) {
            $name = $c->name;
            if ($c->parent)
                $name = $c->parent->name . ' > ' . $name;
            return ['id' => $c->id, 'name' => $name];
        });

        return Inertia::render('EditProduct', [
            'product' => $product,
            'categories' => $categories,
            'brands' => Brand::select('id', 'name')->get(),
            'units' => $this->unitRepository->all(),
            'attributes' => Attribute::with('values')->get(),
        ]);
    }

    public function update(UpdateProductRequest $request, $id)
    {
        $product = $this->productRepository->findById($id);
        $this->productRepository->update($product, $request->validated());
        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy($id)
    {
        $product = $this->productRepository->findById($id);

        if ($product->orderItems()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete product with existing sales history. Please deactivate it instead.');
        }

        if ($product->restockOrderItems()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete product with existing restock history.');
        }

        $this->productRepository->delete($product);
        return redirect()->back()->with('success', 'Product deleted successfully.');
    }

    public function barcodeSearch($barcode)
    {
        $productOrVariant = $this->productRepository->findByBarcodeOrSku($barcode);

        if (!$productOrVariant) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($productOrVariant);
    }
}
