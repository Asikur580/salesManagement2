<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\EmployeeDetail;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get Officer Employee Details by their employee_id set in EmployeeSeeder
        $officers = EmployeeDetail::whereIn('employee_id', ['EMP007', 'EMP008', 'EMP009', 'EMP010'])
            ->pluck('id', 'employee_id')
            ->toArray();

        if (empty($officers)) {
            $this->command->error('No officers found. Please run EmployeeSeeder first.');
            return;
        }

        $customers = [
            ['name' => 'City Hardware Store', 'employee_id' => 'EMP007'],
            ['name' => 'Elite Motors', 'employee_id' => 'EMP007'],
            ['name' => 'Green Valley Agro', 'employee_id' => 'EMP007'],
            ['name' => 'Modern Furnishing', 'employee_id' => 'EMP008'],
            ['name' => 'Oceanic Exports', 'employee_id' => 'EMP008'],
            ['name' => 'Prime Solutions', 'employee_id' => 'EMP009'],
            ['name' => 'Quality Textiles', 'employee_id' => 'EMP009'],
            ['name' => 'Royal Plaza Hotel', 'employee_id' => 'EMP009'],
            ['name' => 'Skyline Construction', 'employee_id' => 'EMP010'],
            ['name' => 'Tech World', 'employee_id' => 'EMP010'],
        ];

        foreach ($customers as $index => $c) {
            Customer::updateOrCreate(
                ['email' => 'customer' . ($index + 1) . '@example.com'],
                [
                    'name' => $c['name'],
                    'proprietor_name' => 'Proprietor ' . ($index + 1),
                    'phone' => '01711' . str_pad($index, 6, '0', STR_PAD_LEFT),
                    'address_street' => 'Street ' . ($index + 1),
                    'address_city' => 'Dhaka',
                    'employee_id' => $officers[$c['employee_id']],
                    'status' => 'active',
                ]
            );
        }

        $this->command->info('10 customers successfully seeded and assigned to officers.');
    }
}
