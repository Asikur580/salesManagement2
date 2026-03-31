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
        // Clear existing product data
        Product::query()->delete();
        ProductVariant::query()->delete();
        ProductImage::query()->delete();

        $json = File::get(base_path('docs/products.json'));
        $productsData = json_decode($json, true);

        foreach ($productsData as $data) {
            // Clean category name - remove trailing commas and whitespace
            $categoryName = rtrim(trim($data['category'] ?? ''), ',');

            if (empty($categoryName)) {
                continue; // Skip products without a category
            }

            // Find or create Category
            $category = Category::firstOrCreate(['name' => $categoryName]);

            // Handle subCategory if provided and not empty
            $finalCategoryId = $category->id;
            $subCategoryName = rtrim(trim($data['subCategory'] ?? ''), ',');

            if (!empty($subCategoryName)) {
                $subCategory = Category::firstOrCreate(['name' => $subCategoryName]);

                // If it's a new subcategory or doesn't have a parent, set it
                if (!$subCategory->parent_id) {
                    $subCategory->update(['parent_id' => $category->id]);
                }
                $finalCategoryId = $subCategory->id;
            }

            // Find or create Brand (handle "Unknown" as null brand or create it)
            $brandName = trim($data['brand'] ?? 'Unknown');
            $brand = Brand::firstOrCreate(['name' => $brandName]);

            // Find or create Unit
            $unitName = trim($data['unit'] ?? 'Piece');
            $unit = Unit::firstOrCreate(['name' => $unitName]);

            // Clean barcode - empty string to null
            $barcode = !empty($data['barcode']) ? trim($data['barcode']) : null;

            // Clean SKU
            $sku = trim($data['sku'] ?? '');
            if (empty($sku)) {
                continue; // Skip products without SKU
            }

            // Create Product
            $product = Product::updateOrCreate(
                ['sku' => $sku],
                [
                    'category_id' => $finalCategoryId,
                    'brand_id' => $brand->id,
                    'unit_id' => $unit->id,
                    'name' => trim($data['name']),
                    'slug' => Str::slug($data['name']),
                    'description' => $data['description'] ?? '',
                    'product_type' => $data['product_type'] ?? 'simple',
                    'base_price' => $data['base_price'] ?? 0,
                    'cost_price' => $data['cost_price'] ?? 0,
                    'barcode' => $barcode,
                    'stock' => $data['stock'] ?? 0,
                    'is_active' => $data['is_active'] ?? true,
                ]
            );

            // Seed Images
            if (isset($data['images']) && is_array($data['images'])) {
                foreach ($data['images'] as $index => $imgData) {
                    $imageUrl = trim($imgData['url'] ?? '');
                    if (empty($imageUrl)) {
                        continue;
                    }

                    ProductImage::updateOrCreate(
                        [
                            'product_id' => $product->id,
                            'image_path' => $imageUrl
                        ],
                        [
                            'is_primary' => $imgData['is_primary'] ?? false,
                            'sort_order' => $imgData['sort_order'] ?? $index + 1,
                        ]
                    );
                }
            }

            // Seed Variants (for variable products)
            if (isset($data['variants']) && is_array($data['variants'])) {
                foreach ($data['variants'] as $variantData) {
                    $variantSku = trim($variantData['sku'] ?? '');
                    if (empty($variantSku)) {
                        continue;
                    }

                    $variant = ProductVariant::updateOrCreate(
                        ['sku' => $variantSku],
                        [
                            'product_id' => $product->id,
                            'barcode' => !empty($variantData['barcode']) ? trim($variantData['barcode']) : null,
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
                            $attribute = Attribute::firstOrCreate(['name' => trim($attrName)]);
                            $value = AttributeValue::firstOrCreate([
                                'attribute_id' => $attribute->id,
                                'value' => trim($attrValue)
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
