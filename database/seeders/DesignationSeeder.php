<?php

namespace Database\Seeders;

use App\Models\Designation;
use Illuminate\Database\Seeder;

class DesignationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $designations = [
            ['name' => 'Admin', 'description' => 'System Administrator', 'status' => 'active'],
            ['name' => 'R S M', 'description' => 'Regional Sales Manager', 'status' => 'active'],
            ['name' => 'Manager', 'description' => 'General Manager', 'status' => 'active'],
            ['name' => 'Officer', 'description' => 'Field Officer', 'status' => 'active'],
            ['name' => 'Sr. Manager', 'description' => 'Senior Manager', 'status' => 'active'],
            ['name' => 'Area Manager', 'description' => 'Area Sales Manager', 'status' => 'active'],
            ['name' => 'Marketing Executive', 'description' => 'Marketing Specialist', 'status' => 'active'],
            ['name' => 'Territory Manager', 'description' => 'Territory Lead', 'status' => 'active'],
            ['name' => 'Sr. RSM', 'description' => 'Senior Regional Sales Manager', 'status' => 'active'],
            ['name' => 'Deputy Manager', 'description' => 'Assistant Manager', 'status' => 'active'],
        ];

        foreach ($designations as $designation) {
            Designation::updateOrCreate(
                ['name' => $designation['name']],
                $designation
            );
        }

        $this->command->info('10 designations successfully seeded.');
    }
}
