<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Supplier;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'variants.attributeValues.attribute']);

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
                'categoryId' => (int) $item->category_id,
                'brandId' => (int) $item->brand_id,
                'name' => $item->name,
                'packSize' => $item->pack_size,
                'purchasePrice' => (float) $item->purchase_price,
                'salePrice' => (float) $item->sale_price,
                'flatPrice' => (float) $item->flat_price,
                'quantity' => (int) $item->quantity,
                'expirationDate' => $item->expiration_date,
                'image' => $item->image,
                'variants' => $item->variants->map(function ($v) {
                    return [
                        'id' => $v->id,
                        'sku' => $v->sku,
                        'price' => (float) $v->price,
                        'stock' => (int) $v->stock,
                        'image' => $v->image,
                        'attributeValues' => $v->attributeValues->map(function ($av) {
                            return [
                                'id' => $av->id,
                                'attributeId' => $av->attribute_id,
                                'attributeName' => $av->attribute->name,
                                'value' => $av->value
                            ];
                        })
                    ];
                })
            ];
        });

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
            'attributes' => Attribute::with('values')->get(),
            'filters' => $request->only(['search', 'category_id', 'brand_id'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'name' => 'required|string|max:255',
            'pack_size' => 'nullable|string|max:255',
            'purchase_price' => 'nullable|numeric',
            'sale_price' => 'nullable|numeric',
            'flat_price' => 'nullable|numeric',
            'expiration_date' => 'nullable|date',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'variants' => 'nullable|array',
            'variants.*.sku' => 'nullable|string|max:255',
            'variants.*.price' => 'nullable|numeric',
            'variants.*.stock' => 'nullable|integer',
            'variants.*.attribute_values' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($validated) {
            $product = Product::create($validated);

            if (!empty($validated['variants'])) {
                foreach ($validated['variants'] as $variantData) {
                    $variant = $product->variants()->create([
                        'sku' => $variantData['sku'] ?? null,
                        'price' => $variantData['price'] ?? $product->sale_price,
                        'stock' => $variantData['stock'] ?? 0,
                        'image' => $variantData['image'] ?? null,
                    ]);

                    if (!empty($variantData['attribute_values'])) {
                        $variant->attributeValues()->sync($variantData['attribute_values']);
                    }
                }
            }

            return redirect()->back()->with('success', 'Product created successfully');
        });
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'name' => 'required|string|max:255',
            'pack_size' => 'nullable|string|max:255',
            'purchase_price' => 'nullable|numeric',
            'sale_price' => 'nullable|numeric',
            'flat_price' => 'nullable|numeric',
            'expiration_date' => 'nullable|date',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'variants' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($product, $validated) {
            $product->update($validated);

            if (isset($validated['variants'])) {
                // For simplicity, we'll replace variants or update them. 
                // A more complex implementation would match by ID.
                // For now, let's sync them by recreating if IDs are not provided.
                $product->variants()->each(function ($v) {
                    $v->attributeValues()->detach();
                    $v->delete();
                });

                foreach ($validated['variants'] as $variantData) {
                    $variant = $product->variants()->create([
                        'sku' => $variantData['sku'] ?? null,
                        'price' => $variantData['price'] ?? $product->sale_price,
                        'stock' => $variantData['stock'] ?? 0,
                        'image' => $variantData['image'] ?? null,
                    ]);

                    if (!empty($variantData['attribute_values'])) {
                        $variant->attributeValues()->sync($variantData['attribute_values']);
                    }
                }
            }

            return redirect()->back()->with('success', 'Product updated successfully');
        });
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted successfully');
    }
}
