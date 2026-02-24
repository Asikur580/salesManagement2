<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            ['name' => 'ACI Limited'],
            ['name' => 'Syngenta'],
            ['name' => 'Bayer Crop Science'],
            ['name' => 'BASF'],
            ['name' => 'Corteva Agriscience'],
            ['name' => 'Adama'],
            ['name' => 'UPL Limited'],
            ['name' => 'Sumitomo Chemical'],
            ['name' => 'Nufarm'],
            ['name' => 'FMC Corporation'],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(
                ['name' => $brand['name']],
                $brand
            );
        }

        $this->command->info('10 brands successfully seeded.');
    }
}
