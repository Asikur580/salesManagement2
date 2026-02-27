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
use App\Http\Controllers\Web\UnitController;
use App\Http\Controllers\Web\AttributeController;
use App\Http\Controllers\Web\RoleController;
use App\Http\Controllers\Web\PosController;
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
Route::get('/new-arrivals', [ShopController::class, 'newArrivals'])->name('shop.new-arrivals');
Route::get('/all-brands', [ShopController::class, 'allBrands'])->name('shop.all-brands');
Route::get('/category/{category:slug}', [ShopController::class, 'categoryProducts'])->name('shop.category');
Route::get('/product/{product:slug}', [ShopController::class, 'show'])->name('shop.product.show');
Route::get('/search', [ShopController::class, 'search'])->name('shop.search');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);

Route::get('/admin/login', [AuthController::class, 'showAdminLogin'])->name('admin.login');
Route::post('/admin/login', [AuthController::class, 'adminLogin']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/register', function () {
        return Inertia::render('Register');
    })->name('register');

    Route::resource('customers', CustomerController::class);
    // Product Management System
    Route::resource('products', ProductController::class);
    Route::get('/products/barcode/{barcode}', [ProductController::class, 'barcodeSearch'])->name('products.barcode.search');
    Route::resource('units', UnitController::class)->except(['create', 'show', 'edit']);
    Route::resource('attributes', AttributeController::class)->except(['create', 'show', 'edit']);


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

    Route::resource('categories', CategoryController::class);

    Route::resource('technicians', TechnicianController::class);
    Route::resource('services', ServiceController::class);

    Route::resource('orders', OrderController::class)->except(['show', 'create', 'edit']);
    Route::post('/orders/{id}/approve', [OrderController::class, 'approve']);

    // Point of Sale (POS)
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/checkout', [PosController::class, 'store'])->name('pos.store');

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
