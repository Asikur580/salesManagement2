<?php

namespace Database\Seeders;

use Carbon\Carbon;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Check if admin role exists
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        $now = Carbon::now();

        // Create admin user
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'phone' => '01700000000',
            'password' => Hash::make('admin123'),
            'designation_id' => 1,
            'parent_id' => null,
            'created_at' => $now,
            'updated_at' => $now
        ]);

        // Assign admin role
        $admin->assignRole($adminRole);
    }
}
