<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExpenseCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Office Rent',
                'description' => 'Monthly rental expenses for the office space.',
            ],
            [
                'name' => 'Utility Bills',
                'description' => 'Electricity, water, gas, and other utility bills.',
            ],
            [
                'name' => 'Internet & Communications',
                'description' => 'Monthly bills for internet, broadband, and phone services.',
            ],
            [
                'name' => 'Office Supplies',
                'description' => 'Stationery, paper, printer ink, and other daily supplies.',
            ],
            [
                'name' => 'Travel & Transportation',
                'description' => 'Bus, Uber, train fares, and fuel for business travels.',
            ],
            [
                'name' => 'Logistics & Courier',
                'description' => 'Packaging materials and outward shipping / delivery costs.',
            ],
            [
                'name' => 'Advertising & Marketing',
                'description' => 'Facebook/Google ads, banners, and promotional expenses.',
            ],
            [
                'name' => 'Tea & Entertainment',
                'description' => 'Staff refreshments, tea/coffee, snacks, and client meetings.',
            ],
            [
                'name' => 'Maintenance & Repairs',
                'description' => 'Computer repairs, AC servicing, and general fixes.',
            ],
            [
                'name' => 'Miscellaneous',
                'description' => 'Any other undefined or random daily expenses.',
            ]
        ];

        $now = Carbon::now();

        $data = array_map(function ($cat) use ($now) {
            return [
                'name' => $cat['name'],
                'description' => $cat['description'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }, $categories);

        DB::table('expense_categories')->insert($data);
    }
}
