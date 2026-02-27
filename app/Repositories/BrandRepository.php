<?php

namespace App\Repositories;

use App\Models\Brand;
use App\Repositories\Interfaces\BrandRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BrandRepository implements BrandRepositoryInterface
{
    public function __construct(protected Brand $model)
    {
    }

    /*
    |--------------------------------------------------------------------------
    | Read operations
    |--------------------------------------------------------------------------
    */

    public function paginate(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->orderBy('order')->orderBy('name')->paginate($perPage)->withQueryString();
    }

    public function findById(int $id): Brand
    {
        return $this->model->findOrFail($id);
    }

    public function findBySlug(string $slug): ?Brand
    {
        return $this->model->where('slug', $slug)->first();
    }

    public function allActive()
    {
        return $this->model->where('is_active', true)->orderBy('order')->orderBy('name')->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Write operations
    |--------------------------------------------------------------------------
    */

    public function create(array $data): Brand
    {
        $data = $this->resolveSlug($data);
        $data = $this->handleLogoUpload($data);

        return $this->model->create($data);
    }

    public function update(Brand $brand, array $data): Brand
    {
        $data = $this->resolveSlug($data, $brand);
        $data = $this->handleLogoUpload($data, $brand);

        $brand->update($data);

        return $brand->refresh();
    }

    public function delete(Brand $brand): bool
    {
        if ($brand->logo) {
            $this->deleteLogo($brand->logo);
        }

        return (bool) $brand->delete();
    }

    /*
    |--------------------------------------------------------------------------
    | Private helpers
    |--------------------------------------------------------------------------
    */

    private function resolveSlug(array $data, ?Brand $brand = null): array
    {
        if (empty($data['slug'])) {
            $base = Str::slug($data['name'] ?? ($brand?->name ?? ''));
            $slug = $base;
            $i = 1;

            while (
                Brand::where('slug', $slug)
                    ->when($brand, fn($q) => $q->where('id', '!=', $brand->id))
                    ->exists()
            ) {
                $slug = "{$base}-{$i}";
                $i++;
            }

            $data['slug'] = $slug;
        }

        return $data;
    }

    private function handleLogoUpload(array $data, ?Brand $brand = null): array
    {
        if (isset($data['logo']) && $data['logo'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old logo
            if ($brand?->logo) {
                $this->deleteLogo($brand->logo);
            }

            $path = $data['logo']->store('brands', 'public');
            $data['logo'] = '/storage/' . $path;
        }

        return $data;
    }

    private function deleteLogo(string $logoPath): void
    {
        $relative = ltrim(str_replace('/storage/', '', $logoPath), '/');
        Storage::disk('public')->delete($relative);
    }
}
