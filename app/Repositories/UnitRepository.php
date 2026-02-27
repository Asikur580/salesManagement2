<?php

namespace App\Repositories;

use App\Models\Unit;
use App\Repositories\Interfaces\UnitRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class UnitRepository implements UnitRepositoryInterface
{
    public function __construct(protected Unit $model)
    {
    }

    public function all(): Collection
    {
        return $this->model->orderBy('name')->get();
    }

    public function paginate(int $perPage = 15)
    {
        return $this->model->orderBy('name')->paginate($perPage);
    }

    public function findById(int $id): Unit
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data): Unit
    {
        return $this->model->create($data);
    }

    public function update(Unit $unit, array $data): Unit
    {
        $unit->update($data);
        return $unit;
    }

    public function delete(Unit $unit): bool
    {
        return (bool) $unit->delete();
    }
}
