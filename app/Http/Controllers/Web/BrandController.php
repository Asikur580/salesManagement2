<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $query = Brand::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('slug', 'like', "%{$request->search}%");
        }

        $perPage = $request->input('per_page', 10);
        $paginated = $query->latest()->paginate($perPage)->withQueryString();

        $brands = [
            'data' => collect($paginated->items())->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'slug' => $item->slug,
                    'image' => $item->image,
                ];
            }),
            'links' => $paginated->linkCollection()->toArray(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'from' => $paginated->firstItem(),
                'last_page' => $paginated->lastPage(),
                'path' => $paginated->path(),
                'per_page' => $paginated->perPage(),
                'to' => $paginated->lastItem(),
                'total' => $paginated->total(),
            ]
        ];

        return Inertia::render('Brands', [
            'initialBrands' => $brands,
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
            'slug' => 'nullable|string|max:255|unique:brands,slug',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $data = $request->only('name', 'slug');

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('brands', 'public');
            $data['image'] = '/storage/' . $path;
        }

        Brand::create($data);

        return redirect()->back()->with('success', 'Brand created successfully.');
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:brands,name,' . $id,
            'slug' => 'nullable|string|max:255|unique:brands,slug,' . $id,
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $data = $request->only('name', 'slug');

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($brand->image) {
                $oldPath = str_replace('/storage/', '', $brand->image);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('brands', 'public');
            $data['image'] = '/storage/' . $path;
        }

        $brand->update($data);

        return redirect()->back()->with('success', 'Brand updated successfully.');
    }

    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);

        if ($brand->image) {
            $oldPath = str_replace('/storage/', '', $brand->image);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
        }

        $brand->delete();

        return redirect()->back()->with('success', 'Brand deleted successfully.');
    }
}
