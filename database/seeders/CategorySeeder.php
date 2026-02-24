<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Insecticides'],
            ['name' => 'Herbicides'],
            ['name' => 'Fungicides'],
            ['name' => 'Fertilizers'],
            ['name' => 'Seeds'],
            ['name' => 'Plant Growth Regulators'],
            ['name' => 'Animal Feed'],
            ['name' => 'Micro-nutrients'],
            ['name' => 'Pesticides'],
            ['name' => 'Bio-pesticides'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }

        $this->command->info('10 categories successfully seeded.');
    }
}
