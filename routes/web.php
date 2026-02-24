<?php

use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\CustomerController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\EmployeeController;
use App\Http\Controllers\Web\BrandController;
use App\Http\Controllers\Web\CategoryController;
use App\Http\Controllers\Web\DesignationController;
use App\Http\Controllers\Web\SupplierController;
use App\Http\Controllers\Web\ProductController;
use App\Http\Controllers\Web\RoleController;
use App\Http\Controllers\Web\PermissionController;
use App\Http\Controllers\Web\ReportController;
use App\Http\Controllers\Web\OrderController;
use App\Http\Controllers\Web\SaleController;
use App\Http\Controllers\Web\UserPermissionController;
use App\Http\Controllers\Web\StockController;
use App\Http\Controllers\Web\ExpenseCategoryController;
use App\Http\Controllers\Web\ExpenseController;
use App\Http\Controllers\Web\UserController;
use App\Http\Controllers\Web\NotificationController;
use App\Http\Controllers\Web\TechnicianController;
use App\Http\Controllers\Web\ServiceController;
use App\Http\Controllers\Web\ShopController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [ShopController::class, 'index'])->name('shop.index');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/register', function () {
        return Inertia::render('Register');
    })->name('register');

    Route::resource('customers', CustomerController::class);
    Route::get('/products', [ProductController::class, 'index']);


    Route::resource('employees', EmployeeController::class);
    Route::post('/employees/{id}/assign-supervisor', [EmployeeController::class, 'assignSupervisor']);

    // Stock Management
    Route::post('/stocks/in', [StockController::class, 'stockIn']);
    Route::post('/stocks/out', [StockController::class, 'stockOut']);
    Route::get('/products/{id}/stock-history', [StockController::class, 'productHistory']);

    Route::get('/designations', [DesignationController::class, 'index']);
    Route::post('/designations', [DesignationController::class, 'store']);
    Route::put('/designations/{id}', [DesignationController::class, 'update']);
    Route::delete('/designations/{id}', [DesignationController::class, 'destroy']);

    Route::resource('suppliers', SupplierController::class);

    Route::resource('brands', BrandController::class);

    Route::get('/categories', [CategoryController::class, 'index']);

    Route::resource('technicians', TechnicianController::class);
    Route::resource('services', ServiceController::class);

    Route::get('/products', [ProductController::class, 'index']);

    Route::resource('orders', OrderController::class)->except(['show', 'create', 'edit']);
    Route::post('/orders/{id}/approve', [OrderController::class, 'approve']);

    Route::get('/sales', [SaleController::class, 'index']);

    // Sales Reports
    Route::get('/sales-reports', [ReportController::class, 'index'])->name('sales-reports.index');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications', [NotificationController::class, 'destroyAll'])->name('notifications.destroy-all');

    Route::resource('roles', RoleController::class);
    Route::post('/roles/{id}/sync-permissions', [RoleController::class, 'syncPermissions']);

    Route::resource('permissions', PermissionController::class);
    Route::post('/users/{id}/sync-permissions', [UserPermissionController::class, 'syncPermissions']);

    Route::get('/users', [UserController::class, 'index'])
        ->name('users.index')
        ->middleware('permission:user.view');

    Route::get('/profile', function () {
        return Inertia::render('Profile');
    });

    Route::get('/settings', function () {
        return Inertia::render('Settings');
    });



    Route::resource('expense-categories', ExpenseCategoryController::class)->except(['show', 'create', 'edit']);

    Route::resource('expenses', ExpenseController::class)->except(['show', 'create', 'edit']);
});
