<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supplier\StoreSupplierRequest;
use App\Http\Requests\Supplier\UpdateSupplierRequest;
use App\Repositories\Interfaces\SupplierRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function __construct(protected SupplierRepositoryInterface $suppliers)
    {
    }

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $filters = $request->only(['search', 'is_active']);
        $paginated = $this->suppliers->paginate($filters, $perPage);

        return Inertia::render('Suppliers/Index', [
            'initialSuppliers' => [
                'data' => $paginated->items(),
                'links' => $paginated->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'from' => $paginated->firstItem(),
                    'last_page' => $paginated->lastPage(),
                    'path' => $paginated->path(),
                    'per_page' => $paginated->perPage(),
                    'to' => $paginated->lastItem(),
                    'total' => $paginated->total(),
                ],
            ],
            'filters' => $request->only(['search', 'per_page', 'is_active']),
        ]);
    }

    public function store(StoreSupplierRequest $request)
    {
        $this->suppliers->create($request->validated());

        return redirect()->back()->with('success', 'Supplier created successfully.');
    }

    public function update(UpdateSupplierRequest $request, int $id)
    {
        $this->suppliers->update($id, $request->validated());

        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(int $id)
    {
        $this->suppliers->delete($id);

        return redirect()->back()->with('success', 'Supplier deleted successfully.');
    }
}
