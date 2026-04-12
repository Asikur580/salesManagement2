<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SecurityPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'role.view',
            'role.manage',
            'permission.view',
            'permission.manage',
            'user.manage',
            'user.view',
            'accounting.view',
            'product.view',
            'product.create',
            'product.edit',
            'product.delete',
            'brand.view',
            'brand.create',
            'brand.edit',
            'brand.delete',
            'category.view',
            'category.create',
            'category.edit',
            'category.delete',
            'pos.view',
            'pos.checkout',
            'order.view',
            'order.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Assign all to super-admin
        $superAdmin = Role::where('name', 'super-admin')->first();
        if ($superAdmin) {
            $superAdmin->syncPermissions(Permission::all());
        }

        // Assign view permissions to admin
        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->givePermissionTo([
                'role.view',
                'permission.view',
                'accounting.view',
                'user.view',
                'role.manage', // Admin usually manages roles too
            ]);
        }
        
        // Assign accounting.view to accountant
        $accountant = Role::where('name', 'accountant')->first();
        if ($accountant) {
            $accountant->givePermissionTo('accounting.view');
        }
    }
}
