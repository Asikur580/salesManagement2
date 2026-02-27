<?php

namespace App\Repositories\Interfaces;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Collection;

interface UnitRepositoryInterface
{
    public function all(): Collection;

    public function paginate(int $perPage = 15);

    public function findById(int $id): Unit;

    public function create(array $data): Unit;

    public function update(Unit $unit, array $data): Unit;

    public function delete(Unit $unit): bool;
}
