<?php

namespace Database\Seeders;

use App\Models\ServiceType;
use Illuminate\Database\Seeder;

class ServiceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'General Maintenance', 'charge' => 500],
            ['name' => 'Engine Repair', 'charge' => 2000],
            ['name' => 'Electrical Repair', 'charge' => 1500],
            ['name' => 'Software Installation', 'charge' => 800],
            ['name' => 'Hardware Replacement', 'charge' => 1200],
            ['name' => 'Printer Service', 'charge' => 600],
            ['name' => 'Network Setup', 'charge' => 2500],
            ['name' => 'CCTV Installation', 'charge' => 3500],
            ['name' => 'AC Service', 'charge' => 1000],
            ['name' => 'Cleaning Service', 'charge' => 300],
            ['name' => 'Data Recovery', 'charge' => 3000],
            ['name' => 'Virus Removal', 'charge' => 500],
            ['name' => 'UPS / IPS Service', 'charge' => 800],
            ['name' => 'Laptop Screen Replacement', 'charge' => 2500],
            ['name' => 'Other', 'charge' => 0],
        ];

        foreach ($types as $type) {
            ServiceType::firstOrCreate(
                ['name' => $type['name']],
                ['charge' => $type['charge']]
            );
        }
    }
}
