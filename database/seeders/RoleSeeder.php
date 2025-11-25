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
        // Roles
        $admin = Role::create(['name' => 'admin']);
        $rsm   = Role::create(['name' => 'rsm']);
        $manager = Role::create(['name' => 'manager']);
        $officer = Role::create(['name' => 'officer']);

        // // Permissions (example)
        // Permission::create(['name' => 'customer.manage']);
        // Permission::create(['name' => 'employee.manage']);
        // Permission::create(['name' => 'order.create']);
        // Permission::create(['name' => 'order.approve']);
        // Permission::create(['name' => 'order.view']);
        // Permission::create(['name' => 'sales.view']);

        // // Assign permissions
        // $admin->givePermissionTo(Permission::all());
        // $rsm->givePermissionTo(['sales.view']);
        // $manager->givePermissionTo(['order.approve', 'sales.view']);
        // $officer->givePermissionTo(['order.create', 'customer.manage']);
    }
}

