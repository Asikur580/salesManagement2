<?php

namespace App\Repositories\Interfaces;

interface SupplierRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 10);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
    public function findById(int $id);
    public function all();
}
