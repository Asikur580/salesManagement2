<?php

namespace App\Repositories\Interfaces;

use App\Models\Brand;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BrandRepositoryInterface
{
    /**
     * Get a paginated, searchable list of brands.
     *
     * @param  array<string, mixed>  $filters   e.g. ['search' => '...']
     * @param  int                   $perPage
     */
    public function paginate(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    /**
     * Find a brand by its primary key.
     */
    public function findById(int $id): Brand;

    /**
     * Find a brand by its slug.
     */
    public function findBySlug(string $slug): ?Brand;

    /**
     * Create a new brand.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Brand;

    /**
     * Update an existing brand.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Brand $brand, array $data): Brand;

    /**
     * Delete a brand.
     */
    public function delete(Brand $brand): bool;

    /**
     * Get all active brands (for dropdowns, shop listings, etc.).
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, Brand>
     */
    public function allActive();
}
