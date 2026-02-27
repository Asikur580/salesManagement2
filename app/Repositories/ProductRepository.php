<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductRepository implements ProductRepositoryInterface
{
    public function __construct(protected Product $model)
    {
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with([
            'category',
            'brand',
            'unit',
            'primaryImage',
            'variants.primaryImage',
            'variants.attributeValues.attribute'
        ]);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
                    ->orWhereHas('variants', function ($vq) use ($search) {
                        $vq->where('sku', 'like', "%{$search}%")
                            ->orWhere('barcode', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }

        if (!empty($filters['product_type'])) {
            $query->where('product_type', $filters['product_type']);
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    public function findById(int $id): Product
    {
        return $this->model->with([
            'category',
            'brand',
            'unit',
            'images',
            'variants.images',
            'variants.attributeValues.attribute'
        ])->findOrFail($id);
    }

    public function findByBarcodeOrSku(string $code)
    {
        // Check simple product first
        $product = $this->model->where('barcode', $code)->orWhere('sku', $code)->first();
        if ($product && $product->product_type === 'simple') {
            return $product;
        }

        // Check variant
        return ProductVariant::with(['product', 'attributeValues.attribute'])
            ->where('barcode', $code)
            ->orWhere('sku', $code)
            ->first();
    }

    public function allForSelect(): Collection
    {
        return $this->model->select('id', 'name', 'product_type')->orderBy('name')->get();
    }

    public function create(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $data = $this->resolveSlug($data);

            // Create main product
            $product = $this->model->create($data);

            // Handle product images
            $this->syncProductImages($product, $data['images'] ?? []);

            // Handle variants if product type is variant
            if ($product->product_type === 'variant' && !empty($data['variants'])) {
                foreach ($data['variants'] as $variantData) {
                    $variant = $product->variants()->create($variantData);

                    // Sync attributes
                    if (!empty($variantData['attribute_values'])) {
                        $variant->attributeValues()->sync($variantData['attribute_values']);
                    }

                    // Handle variant images
                    if (!empty($variantData['images'])) {
                        $this->syncVariantImages($variant, $variantData['images']);
                    }
                }
            }

            return $product->load(['variants.attributeValues', 'images', 'variants.images']);
        });
    }

    public function update(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $data = $this->resolveSlug($data, $product);

            $product->update($data);

            // Handle product images: if new ones provided, add them (or replace logic depending on UI)
            // Assuming $data['images'] are new files, and 'existing_images' are kept
            if (isset($data['images'])) {
                $this->syncProductImages($product, $data['images'], append: true);
            }
            if (isset($data['delete_images'])) {
                $this->deleteProductImages($data['delete_images']);
            }

            if ($product->product_type === 'variant' && isset($data['variants'])) {
                // To keep it simple, we match by ID if exists, otherwise create new
                $existingVariantIds = $product->variants()->pluck('id')->toArray();
                $keptVariantIds = [];

                foreach ($data['variants'] as $variantData) {
                    if (!empty($variantData['id']) && in_array($variantData['id'], $existingVariantIds)) {
                        // Update
                        $variant = $product->variants()->find($variantData['id']);
                        $variant->update($variantData);
                        $keptVariantIds[] = $variant->id;
                    } else {
                        // Create
                        $variant = $product->variants()->create($variantData);
                        $keptVariantIds[] = $variant->id;
                    }

                    if (isset($variantData['attribute_values'])) {
                        $variant->attributeValues()->sync($variantData['attribute_values']);
                    }

                    // Variant images
                    if (!empty($variantData['images'])) {
                        $this->syncVariantImages($variant, $variantData['images'], append: true);
                    }
                    if (!empty($variantData['delete_images'])) {
                        $this->deleteVariantImages($variantData['delete_images']);
                    }
                }

                // Delete variants that were removed
                $variantsToDelete = array_diff($existingVariantIds, $keptVariantIds);
                if (!empty($variantsToDelete)) {
                    $product->variants()->whereIn('id', $variantsToDelete)->each(function ($v) {
                        $this->deleteVariantImages($v->images->pluck('id')->toArray());
                        $v->delete();
                    });
                }
            }

            return $product->refresh()->load(['variants.attributeValues', 'images', 'variants.images']);
        });
    }

    public function delete(Product $product): bool
    {
        return DB::transaction(function () use ($product) {
            // Delete product images physically
            $this->deleteProductImages($product->images->pluck('id')->toArray());

            // Delete variant images physically
            foreach ($product->variants as $variant) {
                $this->deleteVariantImages($variant->images->pluck('id')->toArray());
            }

            return (bool) $product->delete();
        });
    }

    // --- Helpers

    private function resolveSlug(array $data, ?Product $product = null): array
    {
        if (empty($data['slug'])) {
            $base = Str::slug($data['name'] ?? ($product?->name ?? ''));
            $slug = $base;
            $i = 1;

            while (
                Product::where('slug', $slug)
                    ->when($product, fn($q) => $q->where('id', '!=', $product->id))
                    ->exists()
            ) {
                $slug = "{$base}-{$i}";
                $i++;
            }

            $data['slug'] = $slug;
        }

        return $data;
    }

    private function syncProductImages(Product $product, array $images, bool $append = false)
    {
        if (!$append) {
            // Alternatively, drop old images if it's a hard replace
        }

        foreach ($images as $index => $file) {
            if ($file instanceof UploadedFile) {
                $path = $file->store('products', 'public');
                $product->images()->create([
                    'image_path' => '/storage/' . $path,
                    'is_primary' => $index === 0 && !$product->images()->where('is_primary', true)->exists(),
                    'sort_order' => $index,
                ]);
            }
        }
    }

    private function deleteProductImages(array $imageIds)
    {
        $images = \App\Models\ProductImage::whereIn('id', $imageIds)->get();
        /** @var \App\Models\ProductImage $img */
        foreach ($images as $img) {
            $relative = ltrim(str_replace('/storage/', '', $img->image_path), '/');
            Storage::disk('public')->delete($relative);
            $img->delete();
        }
    }

    private function syncVariantImages(ProductVariant $variant, array $images, bool $append = false)
    {
        foreach ($images as $index => $file) {
            if ($file instanceof UploadedFile) {
                $path = $file->store('variants', 'public');
                $variant->images()->create([
                    'image_path' => '/storage/' . $path,
                    'is_primary' => $index === 0 && !$variant->images()->where('is_primary', true)->exists(),
                    'sort_order' => $index,
                ]);
            }
        }
    }

    private function deleteVariantImages(array $imageIds)
    {
        $images = \App\Models\VariantImage::whereIn('id', $imageIds)->get();
        /** @var \App\Models\VariantImage $img */
        foreach ($images as $img) {
            $relative = ltrim(str_replace('/storage/', '', $img->image_path), '/');
            Storage::disk('public')->delete($relative);
            $img->delete();
        }
    }
}
