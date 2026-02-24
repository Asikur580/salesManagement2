<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = ExpenseCategory::all();
        $admins = User::role(['admin', 'super-admin'])->pluck('id')->toArray();

        if ($categories->isEmpty()) {
            return;
        }

        for ($i = 0; $i < 20; $i++) {
            $category = $categories->random();
            Expense::create([
                'expense_category_id' => $category->id,
                'amount' => rand(500, 5000),
                'date' => now()->subDays(rand(0, 30)),
                'description' => 'Test expense for ' . $category->name,
                'created_by' => !empty($admins) ? $admins[array_rand($admins)] : null,
            ]);
        }
    }
}
