<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class AttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = File::get(base_path('docs/attributes.json'));
        $attributesData = json_decode($json, true);

        foreach ($attributesData as $data) {
            $attribute = Attribute::firstOrCreate(['name' => $data['name']]);

            foreach ($data['values'] as $value) {
                AttributeValue::firstOrCreate([
                    'attribute_id' => $attribute->id,
                    'value' => $value
                ]);
            }
        }
    }
}
