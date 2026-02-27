<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Repositories\Interfaces\UnitRepositoryInterface;
use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateUnitRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UnitController extends Controller implements HasMiddleware
{
    public function __construct(protected UnitRepositoryInterface $unitRepository)
    {
    }

    public static function middleware(): array
    {
        return [
            new Middleware('permission:unit.view', only: ['index']),
            new Middleware('permission:unit.create', only: ['store']),
            new Middleware('permission:unit.edit', only: ['update']),
            new Middleware('permission:unit.delete', only: ['destroy']),
        ];
    }

    public function index()
    {
        $units = $this->unitRepository->all();
        return Inertia::render('Units', [
            'units' => $units
        ]);
    }

    public function store(StoreUnitRequest $request)
    {
        $this->unitRepository->create($request->validated());
        return redirect()->back()->with('success', 'Unit created successfully.');
    }

    public function update(UpdateUnitRequest $request, $id)
    {
        $unit = $this->unitRepository->findById($id);
        $this->unitRepository->update($unit, $request->validated());
        return redirect()->back()->with('success', 'Unit updated successfully.');
    }

    public function destroy($id)
    {
        $unit = $this->unitRepository->findById($id);
        $this->unitRepository->delete($unit);
        return redirect()->back()->with('success', 'Unit deleted successfully.');
    }
}
