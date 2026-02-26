<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    public function index()
    {
        return response()->json(Attribute::with('values')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:attributes,name',
            'values' => 'nullable|array',
            'values.*' => 'string|max:255',
        ]);

        $attribute = Attribute::create(['name' => $request->name]);

        if (!empty($request->values)) {
            foreach ($request->values as $value) {
                $attribute->values()->create(['value' => $value]);
            }
        }

        return response()->json($attribute->load('values'), 201);
    }

    public function update(Request $request, $id)
    {
        $attribute = Attribute::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:attributes,name,' . $id,
            'values' => 'nullable|array',
            'values.*' => 'string|max:255',
        ]);

        $attribute->update(['name' => $request->name]);

        if (isset($request->values)) {
            // Simple sync: remove old values and add new ones
            // In a better implementation, we would keep existing values to avoid breaking variant links
            // But for now, let's keep it simple.
            $attribute->values()->delete();
            foreach ($request->values as $value) {
                $attribute->values()->create(['value' => $value]);
            }
        }

        return response()->json($attribute->load('values'));
    }

    public function destroy($id)
    {
        $attribute = Attribute::findOrFail($id);
        $attribute->delete();
        return response()->json(['message' => 'Attribute deleted successfully']);
    }

    public function addValue(Request $request, $attributeId)
    {
        $attribute = Attribute::findOrFail($attributeId);
        $request->validate(['value' => 'required|string|max:255']);
        $value = $attribute->values()->create(['value' => $request->value]);
        return response()->json($value, 201);
    }
}
