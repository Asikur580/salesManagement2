<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CategoryBrandSyncSeeder extends Seeder
{
    public function run()
    {
        Schema::disableForeignKeyConstraints();

        DB::table('categories')->truncate();
        DB::table('brands')->truncate();

        $categories = [
            [2, 'Aqua', '2025-02-13 02:46:00', '2025-02-13 02:46:00'],
            [3, 'Cattle', '2025-02-13 02:46:20', '2025-02-13 02:46:20'],
            [4, 'Poultry', '2025-02-13 02:46:40', '2025-02-13 02:46:40'],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->insert([
                'id' => $cat[0],
                'name' => $cat[1],
                'created_at' => $cat[2],
                'updated_at' => $cat[3],
            ]);
        }

        $brands = [
            [2, 'Star vet Remedies', '2025-02-13 04:59:15', '2025-05-29 06:16:03'],
            [3, 'Addti Vet (India)', '2025-02-13 05:00:00', '2025-02-13 05:00:00'],
            [6, 'Accuiel Pharma', '2025-05-29 05:30:34', '2025-05-29 05:30:34'],
            [8, 'Ina Agro Biotech', '2025-05-29 06:10:37', '2025-05-29 06:10:37'],
            [9, 'Linkage Interational Pvt.Ltd', '2025-05-29 06:11:14', '2025-05-29 06:12:34'],
            [10, 'Optics Pharma Ltd.', '2025-05-29 06:13:28', '2025-05-29 06:13:28'],
            [11, 'Abyaad Agrocare', '2025-05-29 06:14:10', '2025-05-29 06:14:10'],
            [12, 'S.M Fish Agrovet Ltd.', '2025-05-29 06:14:47', '2025-05-29 06:14:47'],
            [13, 'Curex Agro Pharma Ltd.', '2025-05-29 06:15:21', '2025-05-29 06:15:21'],
            [14, 'Radiant Agrovet', '2025-10-01 21:52:11', '2025-10-01 21:52:11'],
        ];

        foreach ($brands as $brand) {
            DB::table('brands')->insert([
                'id' => $brand[0],
                'name' => $brand[1],
                'created_at' => $brand[2],
                'updated_at' => $brand[3],
            ]);
        }

        Schema::enableForeignKeyConstraints();
        $this->command->info('Categories and Brands synced successfully!');
    }
}
