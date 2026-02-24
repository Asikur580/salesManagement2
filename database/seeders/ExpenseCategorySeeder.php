<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ExpenseCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Office Rent', 'description' => 'Monthly office rent expenses'],
            ['name' => 'Transport', 'description' => 'Staff transportation and fuel costs'],
            ['name' => 'Electricity Bill', 'description' => 'Monthly office electricity expenses'],
            ['name' => 'Internet Bill', 'description' => 'Monthly office internet expenses'],
            ['name' => 'Office Maintenance', 'description' => 'Repairs and general maintenance'],
            ['name' => 'Stationery', 'description' => 'Office supplies and stationery'],
            ['name' => 'Other Expenses', 'description' => 'Miscellaneous expenses'],
        ];

        foreach ($categories as $category) {
            ExpenseCategory::updateOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description'], 'status' => 'active']
            );
        }
    }
}
