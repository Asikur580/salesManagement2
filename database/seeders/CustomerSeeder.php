<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'Walk-in Customer',
                'email' => 'walkin@example.com',
                'phone' => '01700000000',
            ],
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '01800000000',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'phone' => '01900000000',
            ],
        ];

        foreach ($customers as $customerData) {
            $user = User::firstOrCreate(
                ['email' => $customerData['email']],
                [
                    'name' => $customerData['name'],
                    'phone' => $customerData['phone'],
                    'password' => Hash::make('password'),
                ]
            );

            if (!$user->hasRole('customer')) {
                $user->assignRole('customer');
            }
        }
    }
}
