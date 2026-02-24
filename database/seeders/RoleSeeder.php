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

            // Employee Management
            'employee.view',
            'employee.create',
            'employee.update',
            'employee.delete',

            // Customer Management
            'customer.view',
            'customer.create',
            'customer.update',
            'customer.delete',

            // Supplier Management
            'supplier.view',
            'supplier.create',
            'supplier.update',
            'supplier.delete',

            // Product Management
            'product.view',
            'product.create',
            'product.update',
            'product.delete',

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

            // Stock Management
            'stock.view',
            'stock.in',
            'stock.out',
            'stock.history',

            // Order Management
            'order.view',
            'order.create',
            'order.update',
            'order.delete',
            'order.approve',
            // Designation Management
            'designation.view',
            'designation.create',
            'designation.update',
            'designation.delete',

            // Designation Management
            'sale.view',
            'sale.print',

            // Reports
            'report.sales',
            'report.customer',
            'report.inventory',

            // Expense Category Management
            'expense_category.view',
            'expense_category.create',
            'expense_category.update',
            'expense_category.delete',

            // Expense Management
            'expense.view',
            'expense.create',
            'expense.update',
            'expense.delete',
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
        $sales = Role::firstOrCreate(['name' => 'sales']);
        $accountant = Role::firstOrCreate(['name' => 'accountant']);

        // Assign permissions to Admin (all except role/permission management)
        $admin->syncPermissions([
            'user.view',
            'user.create',
            'user.update',
            'employee.view',
            'employee.create',
            'employee.update',
            'employee.delete',
            'customer.view',
            'customer.create',
            'customer.update',
            'customer.delete',
            'supplier.view',
            'supplier.create',
            'supplier.update',
            'supplier.delete',
            'product.view',
            'product.create',
            'product.update',
            'product.delete',
            'category.view',
            'category.create',
            'category.update',
            'category.delete',
            'brand.view',
            'brand.create',
            'brand.update',
            'brand.delete',
            'stock.view',
            'stock.in',
            'stock.out',
            'stock.history',
            'order.view',
            'order.create',
            'order.update',
            'order.approve',
            'designation.view',
            'designation.create',
            'designation.update',
            'sale.view',
            'sale.print',
            'report.sales',
            'report.customer',
            'report.inventory',
            'expense_category.view',
            'expense_category.create',
            'expense_category.update',
            'expense_category.delete',
            'expense.view',
            'expense.create',
            'expense.update',
            'expense.delete',
        ]);              
        

        // Assign permissions to Sales
        $sales->syncPermissions([
            'customer.view',
            'customer.create',
            'customer.update',
            'product.view',
            'order.view',
            'order.create',
            'order.update',
            'sale.view',
            'sale.print',
            'stock.view',
        ]);

        // Assign permissions to Accountant
        $accountant->syncPermissions([
            'expense_category.view',
            'expense_category.create',
            'expense_category.update',
            'expense_category.delete',
            'expense.view',
            'expense.create',
            'expense.update',
            'expense.delete',
            'report.sales',
            'report.customer',
            'report.inventory',
            'sale.view',
            'order.view',
        ]);
    }
}
