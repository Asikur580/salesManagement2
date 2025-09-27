<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DesignationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $designations = [
            ['name' => 'Admin', 'slug' => 'admin', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'RSM', 'slug' => 'rsm', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Manager', 'slug' => 'manager', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Officer', 'slug' => 'officer', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($designations as $designation) {
            DB::table('designations')->updateOrInsert(
                ['slug' => $designation['slug']],
                $designation
            );
        }
    }
}
