<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ShopDataSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        // Clear existing shop data if needed or just add more
        // Product::truncate(); 

        $categories = [
            ['name' => 'Summer Essential', 'image' => 'https://images.unsplash.com/photo-1507041957456-9c397ce39c97?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Winter Essential', 'image' => 'https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Car Interior', 'image' => 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Car Exterior', 'image' => 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Electronics & Gadgets', 'image' => 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Car Care', 'image' => 'https://images.unsplash.com/photo-1619642751034-765dfdf7358e?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Perfume & Showpiece', 'image' => 'https://images.unsplash.com/photo-1599256629751-4d7a1641a27e?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Key Accessories', 'image' => 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Performance', 'image' => 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'LED & Lighting', 'image' => 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Modifications', 'image' => 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Covers', 'image' => 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Interior Accessories', 'image' => 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Exterior Accessories', 'image' => 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Car Electronics', 'image' => 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Oils & Lubricants', 'image' => 'https://images.unsplash.com/photo-1611942001555-6b5894170685?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Car Care & Cleaning', 'image' => 'https://images.unsplash.com/photo-1619642751034-765dfdf7358e?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Lighting', 'image' => 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Engine Parts', 'image' => 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400&h=400'],
            ['name' => 'Security Systems', 'image' => 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400&h=400'],
        ];

        foreach ($categories as $cat) {
            \App\Models\Category::updateOrCreate(
                ['name' => $cat['name']],
                [
                    'slug' => \Illuminate\Support\Str::slug($cat['name']),
                    'image' => $cat['image']
                ]
            );
        }

        $brands = [
            'Castrol',
            'Michelin',
            'Bosch',
            'Brembo',
            'Mobil1',
            'Shell',
            'Nakamichi',
            'Bullsone',
            'Pioneer',
            'JBL',
            'SOFT99',
            'Flamingo',
            'Toyota',
            'Honda',
            'Hyundai',
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(['name' => $brand]);
        }

        $allCategories = Category::all();
        $allBrands = Brand::all();

        $dummyProducts = [
            [
                'name' => 'Stay Safe with Nakamichi NC-501 360 Degree Car Camera',
                'description' => 'Premium 360 degree parking assistance system.',
                'price' => 13500,
                'category' => 'Car Electronics',
                'brand' => 'Nakamichi',
                'image' => 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=600&h=600'
            ],
            [
                'name' => 'Castrol EDGE 5W-30 Full Synthetic Motor Oil',
                'description' => 'Maximum performance and protection for your engine.',
                'price' => 4500,
                'category' => 'Oils & Lubricants',
                'brand' => 'Castrol',
                'image' => 'https://images.unsplash.com/photo-1614702058414-68565e1d4d5a?auto=format&fit=crop&q=80&w=600&h=600'
            ],
            [
                'name' => 'Universal Car Trunk Mat – Waterproof All-Weather',
                'description' => 'Protect your car trunk from dirt and spills.',
                'price' => 1190,
                'category' => 'Interior Accessories',
                'brand' => 'Hyundai',
                'image' => 'https://images.unsplash.com/photo-1599256629751-4d7a1641a27e?auto=format&fit=crop&q=80&w=600&h=600'
            ],
            [
                'name' => 'Flamingo Premium Coating Film F052 – High Gloss',
                'description' => 'Provides a long-lasting protective layer for car paint.',
                'price' => 1650,
                'category' => 'Car Care & Cleaning',
                'brand' => 'Flamingo',
                'image' => 'https://images.unsplash.com/photo-1619642751034-765dfdf7358e?auto=format&fit=crop&q=80&w=600&h=600'
            ],
            [
                'name' => 'Bullsone Multi Cleaner - Pro Quality',
                'description' => 'Effective cleaning for all car surfaces.',
                'price' => 850,
                'category' => 'Car Care & Cleaning',
                'brand' => 'Bullsone',
                'image' => 'https://images.unsplash.com/photo-1599256629751-4d7a1641a27e?auto=format&fit=crop&q=80&w=600&h=600'
            ],
            [
                'name' => 'JBL Stage 161CFS Car Speaker System',
                'description' => 'High-fidelity audio for your vehicle.',
                'price' => 11500,
                'category' => 'Car Electronics',
                'brand' => 'JBL',
                'image' => 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600&h=600'
            ],
            [
                'name' => 'Soft99 Glaco Windshield Cleaning 750ml',
                'description' => 'Ensure clear vision during rainy days.',
                'price' => 1250,
                'category' => 'Car Care & Cleaning',
                'brand' => 'SOFT99',
                'image' => 'https://images.unsplash.com/photo-1599256629751-4d7a1641a27e?auto=format&fit=crop&q=80&w=600&h=600'
            ],
            [
                'name' => 'Bosch ICON Wiper Blades - 22" Pair',
                'description' => 'Clearer vision and longer life.',
                'price' => 2200,
                'category' => 'Exterior Accessories',
                'brand' => 'Bosch',
                'image' => 'https://images.unsplash.com/photo-1621359953476-ebcc4b0be84b?auto=format&fit=crop&q=80&w=600&h=600'
            ],
            [
                'name' => 'Pioneer TS-G1620F 2-Way Coaxial Speakers',
                'description' => 'Powerful sound with deep bass.',
                'price' => 7500,
                'category' => 'Car Electronics',
                'brand' => 'Pioneer',
                'image' => 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600&h=600'
            ],
            [
                'name' => 'Armor All Protectant 500ml',
                'description' => 'Fights aging, fading and cracking.',
                'price' => 650,
                'category' => 'Car Care & Cleaning',
                'brand' => 'Bullsone',
                'image' => 'https://images.unsplash.com/photo-1621359953476-ebcc4b0be84b?auto=format&fit=crop&q=80&w=600&h=600'
            ],
        ];

        foreach ($dummyProducts as $p) {
            $cat = $allCategories->where('name', $p['category'])->first();
            $brand = $allBrands->where('name', $p['brand'])->first();

            Product::create([
                'name' => $p['name'],
                'category_id' => $cat->id,
                'brand_id' => $brand->id,
                'purchase_price' => $p['price'] * 0.7,
                'sale_price' => $p['price'],
                'flat_price' => $p['price'],
                'quantity' => rand(10, 100),
                'image' => $p['image'],
                'pack_size' => 'Standard',
                'expiration_date' => now()->addYears(3),
            ]);
        }

        Schema::enableForeignKeyConstraints();
    }
}
