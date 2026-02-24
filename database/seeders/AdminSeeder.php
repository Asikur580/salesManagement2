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
        // Check if super-admin role exists
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);

        $now = Carbon::now();

        // Check if admin user already exists
        $existingAdmin = User::where('email', 'superadmin@example.com')->first();

        if (!$existingAdmin) {
            // Create super admin user
            $admin = User::create([
                'name' => 'Super Admin',
                'email' => 'superadmin@example.com',
                'password' => Hash::make('admin123'),
                'created_at' => $now,
                'updated_at' => $now
            ]);

            // Assign super-admin role
            $admin->assignRole($superAdminRole);
        } else {
            // Update existing admin to super-admin role
            $existingAdmin->syncRoles([$superAdminRole]);
        }
    }
}
