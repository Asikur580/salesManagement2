<?php

namespace App\Repositories\Interfaces;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CategoryRepositoryInterface
{
    /**
     * Paginated, searchable list of categories (with parent relation).
     *
     * @param array<string, mixed> $filters
     */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * All root-level (no parent) categories, ordered.
     */
    public function rootCategories(): Collection;

    /**
     * Flat list of all categories suitable for dropdowns.
     */
    public function allForSelect(): Collection;

    /**
     * Find by primary key (throws ModelNotFoundException).
     */
    public function findById(int $id): Category;

    /**
     * Find by slug.
     */
    public function findBySlug(string $slug): ?Category;

    /**
     * Create a new category.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data): Category;

    /**
     * Update an existing category.
     *
     * @param array<string, mixed> $data
     */
    public function update(Category $category, array $data): Category;

    /**
     * Delete a category (cascades to children via FK).
     */
    public function delete(Category $category): bool;

    /**
     * All active categories, ordered, with optional parent eager-load.
     */
    public function allActive(bool $withParent = false): Collection;
}
