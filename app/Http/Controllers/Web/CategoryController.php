<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with('parent');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $categories = $query->latest()->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'slug' => $item->slug,
                'image' => $item->image,
                'parent_id' => $item->parent_id,
                'parent_name' => $item->parent?->name,
            ];
        });

        return Inertia::render('Categories', [
            'initialCategories' => $categories,
            'allCategories' => Category::select('id', 'name')->get(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $data = $request->only('name', 'slug', 'parent_id');

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('categories', 'public');
            $data['image'] = '/storage/' . $path;
        }

        Category::create($data);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $id,
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $id,
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $data = $request->only('name', 'slug', 'parent_id');

        if ($request->hasFile('image')) {
            if ($category->image) {
                $oldPath = str_replace('/storage/', '', $category->image);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('categories', 'public');
            $data['image'] = '/storage/' . $path;
        }

        $category->update($data);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->image) {
            $oldPath = str_replace('/storage/', '', $category->image);
            Storage::disk('public')->delete($oldPath);
        }

        $category->delete();

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
