<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = File::get(base_path('docs/products.json'));
        $productsData = json_decode($json, true);

        foreach ($productsData as $data) {
            // Find or create Category
            $category = Category::firstOrCreate(['name' => $data['category']]);

            // Handle subCategory if provided
            $finalCategoryId = $category->id;
            if (isset($data['subCategory'])) {
                $subCategory = Category::firstOrCreate(['name' => $data['subCategory']]);
                
                // If it's a new subcategory or doesn't have a parent, set it
                if (!$subCategory->parent_id) {
                    $subCategory->update(['parent_id' => $category->id]);
                }
                $finalCategoryId = $subCategory->id;
            }

            // Find or create Brand
            $brand = Brand::firstOrCreate(['name' => $data['brand']]);

            // Find or create Unit
            $unit = Unit::firstOrCreate(['name' => $data['unit']]);

            // Create Product
            $product = Product::updateOrCreate(
                ['sku' => $data['sku']],
                [
                    'category_id' => $finalCategoryId,
                    'brand_id' => $brand->id,
                    'unit_id' => $unit->id,
                    'name' => $data['name'],
                    'slug' => Str::slug($data['name']),
                    'description' => $data['description'],
                    'product_type' => $data['product_type'] ?? 'simple',
                    'base_price' => $data['base_price'],
                    'cost_price' => $data['cost_price'] ?? 0,
                    'barcode' => $data['barcode'] ?? null,
                    'stock' => $data['stock'] ?? 0,
                    'is_active' => $data['is_active'] ?? true,
                ]
            );

            // Seed Images
            if (isset($data['images']) && is_array($data['images'])) {
                foreach ($data['images'] as $imgData) {
                    ProductImage::updateOrCreate(
                        [
                            'product_id' => $product->id,
                            'image_path' => $imgData['url']
                        ],
                        [
                            'is_primary' => $imgData['is_primary'] ?? false,
                            'sort_order' => $imgData['sort_order'] ?? 0,
                        ]
                    );
                }
            }

            // Seed Variants
            if (isset($data['variants']) && is_array($data['variants'])) {
                foreach ($data['variants'] as $variantData) {
                    $variant = ProductVariant::updateOrCreate(
                        ['sku' => $variantData['sku']],
                        [
                            'product_id' => $product->id,
                            'barcode' => $variantData['barcode'] ?? null,
                            'price' => $variantData['price'] ?? $product->base_price,
                            'cost_price' => $variantData['cost_price'] ?? $product->cost_price,
                            'stock' => $variantData['stock'] ?? 0,
                            'is_active' => $variantData['is_active'] ?? true,
                        ]
                    );

                    // Attach Attributes
                    if (isset($variantData['attributes']) && is_array($variantData['attributes'])) {
                        $attributeValueIds = [];
                        foreach ($variantData['attributes'] as $attrName => $attrValue) {
                            $attribute = Attribute::firstOrCreate(['name' => $attrName]);
                            $value = AttributeValue::firstOrCreate([
                                'attribute_id' => $attribute->id,
                                'value' => $attrValue
                            ]);
                            $attributeValueIds[] = $value->id;
                        }
                        $variant->attributeValues()->sync($attributeValueIds);
                    }
                }
            }
        }
    }
}
