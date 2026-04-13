<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Brand\StoreBrandRequest;
use App\Http\Requests\Brand\UpdateBrandRequest;
use App\Repositories\Interfaces\BrandRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class BrandController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:brand.view', only: ['index']),
            new Middleware('permission:brand.create', only: ['store']),
            new Middleware('permission:brand.edit', only: ['update']),
            new Middleware('permission:brand.delete', only: ['destroy']),
        ];
    }
    public function __construct(protected BrandRepositoryInterface $brands)
    {
    }

    /*
    |--------------------------------------------------------------------------
    | index – list with search & pagination
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $filters = $request->only(['search', 'is_active']);
        $paginated = $this->brands->paginate($filters, $perPage);

        $brands = [
            'data' => collect($paginated->items())->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'slug' => $item->slug,
                'logo' => $item->logo,
                'description' => $item->description,
                'is_active' => $item->is_active,
                'order' => $item->order,
            ]),
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
        ];

        return Inertia::render('Brands', [
            'initialBrands' => $brands,
            'filters' => $request->only(['search', 'per_page', 'is_active']),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | store – create a new brand
    |--------------------------------------------------------------------------
    */
    public function store(StoreBrandRequest $request)
    {
        $data = $request->validated();

        // Attach the uploaded file object so the repository can handle it
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo');
        }

        $this->brands->create($data);

        return redirect()->back()->with('success', 'Brand created successfully.');
    }

    /*
    |--------------------------------------------------------------------------
    | update – update an existing brand
    |--------------------------------------------------------------------------
    */
    public function update(UpdateBrandRequest $request, int $id)
    {
        $brand = $this->brands->findById($id);
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo');
        }

        $this->brands->update($brand, $data);

        return redirect()->back()->with('success', 'Brand updated successfully.');
    }

    /*
    |--------------------------------------------------------------------------
    | destroy – delete a brand
    |--------------------------------------------------------------------------
    */
    public function destroy(int $id)
    {
        $brand = $this->brands->findById($id);

        if ($brand->products()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete brand with assigned products.');
        }

        $this->brands->delete($brand);

        return redirect()->back()->with('success', 'Brand deleted successfully.');
    }
}
