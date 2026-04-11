<?php

namespace App\Repositories;

use App\Models\Supplier;
use App\Repositories\Interfaces\SupplierRepositoryInterface;

class SupplierRepository implements SupplierRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 10)
    {
        $query = Supplier::query();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%')
                ->orWhere('email', 'like', '%' . $filters['search'] . '%')
                ->orWhere('phone', 'like', '%' . $filters['search'] . '%');
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function create(array $data)
    {
        return Supplier::create($data);
    }

    public function update(int $id, array $data)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->update($data);
        return $supplier;
    }

    public function delete(int $id)
    {
        $supplier = Supplier::findOrFail($id);
        return $supplier->delete();
    }

    public function findById(int $id)
    {
        return Supplier::findOrFail($id);
    }

    public function all()
    {
        return Supplier::where('is_active', true)->get();
    }
}
