<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Repositories\Interfaces\CategoryRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class CategoryController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:category.view', only: ['index']),
            new Middleware('permission:category.create', only: ['store']),
            new Middleware('permission:category.edit', only: ['update']),
            new Middleware('permission:category.delete', only: ['destroy']),
        ];
    }
    public function __construct(protected CategoryRepositoryInterface $categories)
    {
    }

    /*
    |--------------------------------------------------------------------------
    | index
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        $filters = $request->only(['search', 'is_active', 'parent_id']);
        $paginated = $this->categories->paginate($filters, $perPage);

        $categories = [
            'data' => collect($paginated->items())->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'slug' => $item->slug,
                'image' => $item->image,
                'icon' => $item->icon,
                'parent_id' => $item->parent_id,
                'parent_name' => $item->parent?->name,
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

        return Inertia::render('Categories', [
            'initialCategories' => $categories,
            'allCategories' => $this->categories->allForSelect(),
            'filters' => $request->only(['search', 'per_page', 'is_active', 'parent_id']),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | store
    |--------------------------------------------------------------------------
    */
    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        $this->categories->create($data);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    /*
    |--------------------------------------------------------------------------
    | update
    |--------------------------------------------------------------------------
    */
    public function update(UpdateCategoryRequest $request, int $id)
    {
        $category = $this->categories->findById($id);
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        $this->categories->update($category, $data);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    /*
    |--------------------------------------------------------------------------
    | destroy
    |--------------------------------------------------------------------------
    */
    public function destroy(int $id)
    {
        $category = $this->categories->findById($id);

        if ($category->products()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete category containing products.');
        }

        if ($category->children()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete category containing sub-categories.');
        }

        $this->categories->delete($category);

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
