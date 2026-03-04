<?php

// database/seeders/RoleSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create all permissions
        $permissions = [
            // User Management
            'user.view',
            'user.create',
            'user.update',
            'user.delete',

            // Role Management
            'role.view',
            'role.create',
            'role.update',
            'role.delete',

            // Permission Management
            'permission.view',
            'permission.create',
            'permission.update',
            'permission.delete',  

            // Product Management
            'product.view',
            'product.create',
            'product.update',
            'product.delete',

            // Unit Management
            'unit.view',
            'unit.create',
            'unit.update',
            'unit.delete',

            // Category Management
            'category.view',
            'category.create',
            'category.update',
            'category.delete',

            // Brand Management
            'brand.view',
            'brand.create',
            'brand.update',
            'brand.delete',                  
        ];

        // Create all permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Super Admin Role
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $superAdmin->syncPermissions(Permission::all());

        // Create other roles
        $admin = Role::firstOrCreate(['name' => 'admin']);        

        // Assign permissions to Admin (all except role/permission management)
        $admin->syncPermissions([
            'user.view',
            'user.create',
            'user.update',          
            'product.view',
            'product.create',
            'product.update',
            'product.delete',
            'unit.view',
            'unit.create',
            'unit.update',
            'unit.delete',
            'category.view',
            'category.create',
            'category.update',
            'category.delete',
            'brand.view',
            'brand.create',
            'brand.update',
            'brand.delete',            
        ]);       
        
    }
}
