<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DesignationSyncSeeder extends Seeder
{
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        DB::table('designations')->truncate();

        $designations = [
            [1, 'Sr. Manager'],
            [2, 'Area Manager'],
            [4, 'Marketing Executive'],
            [5, 'Sr. Marketing Executive'],
            [16, 'Sr. Area Manager'],
            [17, 'Territory Exceutive'],
            [18, 'Sr. Territory Executive'],
            [19, 'Territory Manager'],
            [20, 'Sr. Territory Manager'],
            [22, 'admin'],
            [23, 'Radiant Agrovet'],
            [24, 'R S M'],
        ];

        foreach ($designations as $ds) {
            DB::table('designations')->insert([
                'id' => $ds[0],
                'company_id' => 1,
                'name' => $ds[1],
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::enableForeignKeyConstraints();
        $this->command->info('Designations synced successfully!');
    }
}
