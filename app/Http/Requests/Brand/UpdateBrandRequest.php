<?php

namespace App\Http\Requests\Brand;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('brand');

        return [
            'name' => ['required', 'string', 'max:255', "unique:brands,name,{$id}"],
            'slug' => ['nullable', 'string', 'max:255', "unique:brands,slug,{$id}"],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:2048'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The brand name is required.',
            'name.unique' => 'A brand with this name already exists.',
            'slug.unique' => 'A brand with this slug already exists.',
            'logo.image' => 'The logo must be a valid image file.',
            'logo.max' => 'The logo may not be larger than 2 MB.',
        ];
    }
}
