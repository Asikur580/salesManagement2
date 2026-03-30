<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = File::get(base_path('docs/categories.json'));
        $categories = json_decode($json, true);

        foreach ($categories as $categoryData) {
            $parent = Category::updateOrCreate(
                ['name' => $categoryData['name']],
                ['image' => $categoryData['image'] ?? null]
            );

            if (isset($categoryData['subCategories']) && is_array($categoryData['subCategories'])) {
                foreach ($categoryData['subCategories'] as $subCategoryData) {
                    Category::updateOrCreate(
                        ['name' => $subCategoryData['name'], 'parent_id' => $parent->id],
                        ['image' => $subCategoryData['image'] ?? null]
                    );
                }
            }
        }
    }
}
