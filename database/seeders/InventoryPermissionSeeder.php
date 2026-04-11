<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class InventoryPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'supplier.view',
            'supplier.create',
            'supplier.update',
            'supplier.delete',
            'inventory.view_history',
            'inventory.adjust',
            'restock.view',
            'restock.create',
            'restock.receive',
            'restock.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Auto-assign to super-admin and admin roles if they exist
        $roles = Role::whereIn('name', ['super-admin', 'admin'])->get();
        foreach ($roles as $role) {
            $role->givePermissionTo($permissions);
        }
    }
}
