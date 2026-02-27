<?php

namespace App\Repositories;

use App\Models\Category;
use App\Repositories\Interfaces\CategoryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function __construct(protected Category $model)
    {
    }

    /*
    |--------------------------------------------------------------------------
    | Read
    |--------------------------------------------------------------------------
    */

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with('parent');

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

        if (!empty($filters['parent_id'])) {
            $query->where('parent_id', $filters['parent_id']);
        }

        return $query->orderBy('order')->orderBy('name')->paginate($perPage)->withQueryString();
    }

    public function rootCategories(): Collection
    {
        return $this->model->whereNull('parent_id')->with('children')->orderBy('order')->orderBy('name')->get();
    }

    public function allForSelect(): Collection
    {
        return $this->model->select('id', 'name', 'parent_id')->orderBy('name')->get();
    }

    public function findById(int $id): Category
    {
        return $this->model->findOrFail($id);
    }

    public function findBySlug(string $slug): ?Category
    {
        return $this->model->where('slug', $slug)->first();
    }

    public function allActive(bool $withParent = false): Collection
    {
        $query = $this->model->where('is_active', true)->orderBy('order')->orderBy('name');

        if ($withParent) {
            $query->with('parent');
        }

        return $query->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Write
    |--------------------------------------------------------------------------
    */

    public function create(array $data): Category
    {
        $data = $this->resolveSlug($data);
        $data = $this->handleImageUpload($data);

        return $this->model->create($data);
    }

    public function update(Category $category, array $data): Category
    {
        $data = $this->resolveSlug($data, $category);
        $data = $this->handleImageUpload($data, $category);

        $category->update($data);

        return $category->refresh();
    }

    public function delete(Category $category): bool
    {
        if ($category->image) {
            $this->deleteImage($category->image);
        }

        return (bool) $category->delete();
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function resolveSlug(array $data, ?Category $category = null): array
    {
        if (empty($data['slug'])) {
            $base = Str::slug($data['name'] ?? ($category?->name ?? ''));
            $slug = $base;
            $i = 1;

            while (
                Category::where('slug', $slug)
                    ->when($category, fn($q) => $q->where('id', '!=', $category->id))
                    ->exists()
            ) {
                $slug = "{$base}-{$i}";
                $i++;
            }

            $data['slug'] = $slug;
        }

        return $data;
    }

    private function handleImageUpload(array $data, ?Category $category = null): array
    {
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            if ($category?->image) {
                $this->deleteImage($category->image);
            }

            $path = $data['image']->store('categories', 'public');
            $data['image'] = '/storage/' . $path;
        }

        return $data;
    }

    private function deleteImage(string $imagePath): void
    {
        $relative = ltrim(str_replace('/storage/', '', $imagePath), '/');
        Storage::disk('public')->delete($relative);
    }
}
