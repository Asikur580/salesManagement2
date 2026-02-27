<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Covered by controller middleware
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:attributes,name',
            'values' => 'nullable|array',
            'values.*.value' => 'required|string|max:255',
        ];
    }
}
