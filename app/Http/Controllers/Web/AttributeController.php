<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Http\Requests\StoreAttributeRequest;
use App\Http\Requests\UpdateAttributeRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

class AttributeController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            // Using placeholder generic product permissions or creating new ones based on the user's needs
            // In a real environment, you might define 'attribute.view' etc. For now, since they manipulate Product meta:
            new Middleware('permission:product.view', only: ['index']),
            new Middleware('permission:product.create', only: ['store']),
            new Middleware('permission:product.edit', only: ['update']),
            new Middleware('permission:product.delete', only: ['destroy']),
        ];
    }

    public function index()
    {
        $attributes = Attribute::with('values')->orderBy('name')->get();
        return Inertia::render('Attributes/Index', [
            'attributes' => $attributes
        ]);
    }

    public function store(StoreAttributeRequest $request)
    {
        DB::transaction(function () use ($request) {
            $attribute = Attribute::create(['name' => $request->name]);

            if (!empty($request->values)) {
                $values = array_map(function ($val) {
                    // $val is an array like ['value' => 'Small']
                    return ['value' => $val['value']];
                }, $request->values);

                $attribute->values()->createMany($values);
            }
        });

        return redirect()->back()->with('success', 'Attribute created successfully.');
    }

    public function update(UpdateAttributeRequest $request, $id)
    {
        $attribute = Attribute::findOrFail($id);

        DB::transaction(function () use ($request, $attribute) {
            $attribute->update(['name' => $request->name]);

            if (isset($request->values)) {
                $existingValueIds = collect($request->values)->pluck('id')->filter()->toArray();

                // Delete removed values
                $attribute->values()->whereNotIn('id', $existingValueIds)->delete();

                foreach ($request->values as $v) {
                    if (isset($v['id'])) {
                        // Update existing
                        $attribute->values()->where('id', $v['id'])->update(['value' => $v['value']]);
                    } else {
                        // Create new
                        $attribute->values()->create(['value' => $v['value']]);
                    }
                }
            } else {
                $attribute->values()->delete();
            }
        });

        return redirect()->back()->with('success', 'Attribute updated successfully.');
    }

    public function destroy($id)
    {
        $attribute = Attribute::findOrFail($id);

        if ($attribute->values()->whereHas('variants')->exists()) {
            return redirect()->back()->with('error', 'Cannot delete attribute whose values are assigned to product variants.');
        }

        $attribute->delete();
        return redirect()->back()->with('success', 'Attribute deleted successfully.');
    }
}

