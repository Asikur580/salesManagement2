<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\HRM\AttendanceController;
use App\Http\Controllers\HRM\EmployeeController;
use App\Http\Controllers\HRM\LeaveController;
use App\Http\Controllers\HRM\PayrollController;
use App\Http\Controllers\Web\AccountController;
use App\Http\Controllers\Web\AttributeController;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\BrandController;
use App\Http\Controllers\Web\CategoryController;
use App\Http\Controllers\Web\CheckoutController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\InventoryController;
use App\Http\Controllers\Web\NotificationController;
use App\Http\Controllers\Web\OrderController;
use App\Http\Controllers\Web\PermissionController;
use App\Http\Controllers\Web\PosController;
use App\Http\Controllers\Web\ProductController;
use App\Http\Controllers\Web\ReportController;
use App\Http\Controllers\Web\RestockOrderController;
use App\Http\Controllers\Web\RoleController;
use App\Http\Controllers\Web\ShopController;
use App\Http\Controllers\Web\SupplierController;
use App\Http\Controllers\Web\UnitController;
use App\Http\Controllers\Web\UserController;
use App\Http\Controllers\Web\UserPermissionController;
use App\Http\Controllers\Web\ServiceInvoiceController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [ShopController::class, 'index'])->name('shop.index');
Route::get('/new-arrivals', [ShopController::class, 'newArrivals'])->name('shop.new-arrivals');
Route::get('/flash-sales', [ShopController::class, 'flashSales'])->name('shop.flash-sales');
Route::get('/shop/offers', [ShopController::class, 'flashSales'])->name('shop.offers');
Route::get('/all-brands', [ShopController::class, 'allBrands'])->name('shop.all-brands');
Route::get('/brand/{brand:slug}', [ShopController::class, 'brandProducts'])->name('shop.brand');
Route::get('/category/{category:slug}', [ShopController::class, 'categoryProducts'])->name('shop.category');
Route::get('/product/{product:slug}', [ShopController::class, 'show'])->name('shop.product.show');
Route::get('/search', [ShopController::class, 'search'])->name('shop.search');


Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/admin/login', [AuthController::class, 'showAdminLogin'])->name('admin.login');
    Route::post('/admin/login', [AuthController::class, 'adminLogin']);
});
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// OTP Authentication Routes
Route::post('/api/auth/send-otp', [AuthController::class, 'sendOTP'])->name('auth.send-otp');
Route::post('/api/auth/verify-otp', [AuthController::class, 'verifyOTP'])->name('auth.verify-otp');

Route::middleware('auth')->group(function () {
    // Shared routes (Profile, Settings, Notifications)
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications', [NotificationController::class, 'destroyAll'])->name('notifications.destroy-all');

    Route::get('/profile', function () {
        return Inertia::render('Profile');
    });

    Route::get('/settings', function () {
        return Inertia::render('Settings');
    });

    // My Account Routes
    Route::get('/my-account', [AccountController::class, 'index'])->name('account.index');
    Route::patch('/my-account/profile', [AccountController::class, 'updateProfile'])->name('account.profile.update');
    Route::put('/my-account/password', [AccountController::class, 'updatePassword'])->name('account.password.update');
    Route::get('/my-account/orders/{order}', [AccountController::class, 'showOrder'])->name('account.orders.show');
    Route::get('/my-account/orders/{order}/invoice', [AccountController::class, 'downloadInvoice'])->name('account.orders.invoice');
    Route::post('/my-account/orders/{order}/cancel', [AccountController::class, 'cancelOrder'])->name('account.orders.cancel');
    Route::post('/my-account/addresses', [AccountController::class, 'storeAddress'])->name('account.addresses.store');
    Route::patch('/my-account/addresses/{address}', [AccountController::class, 'updateAddress'])->name('account.addresses.update');
    Route::delete('/my-account/addresses/{address}', [AccountController::class, 'deleteAddress'])->name('account.addresses.delete');

    // Cart Routes
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{id}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');
    Route::get('/checkout', [CartController::class, 'checkout'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.process');

    // Wishlist Routes
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');

    // Admin/Staff only routes
    Route::middleware('role:super-admin|admin|sales|accountant')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/register', function () {
            return Inertia::render('Register');
        })->name('register');

        // Product Management System
        Route::resource('products', ProductController::class);
        Route::get('/products/barcode/{barcode}', [ProductController::class, 'barcodeSearch'])->name('products.barcode.search');
        Route::resource('units', UnitController::class)->except(['create', 'show', 'edit']);
        Route::resource('attributes', AttributeController::class)->except(['create', 'show', 'edit']);

        Route::resource('brands', BrandController::class);

        Route::resource('categories', CategoryController::class);

        // Point of Sale (POS)
        Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
        Route::post('/pos/checkout', [PosController::class, 'store'])->name('pos.store');

        // Service Invoice Module
        Route::get('/services', [ServiceInvoiceController::class, 'index'])->name('services.index');
        Route::get('/services/create', [ServiceInvoiceController::class, 'create'])->name('services.create');
        Route::post('/services', [ServiceInvoiceController::class, 'store'])->name('services.store');
        Route::get('/services/{order}/invoice', [ServiceInvoiceController::class, 'downloadInvoice'])->name('services.invoice');

        // Order Management
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::get('/orders/{order}/invoice', [OrderController::class, 'downloadInvoice'])->name('orders.invoice');
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');

        // Inventory & Supplier Management
        Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index')->middleware('permission:supplier.view');
        Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store')->middleware('permission:supplier.create');
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update')->middleware('permission:supplier.update');
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy')->middleware('permission:supplier.delete');

        Route::get('/inventory/history', [InventoryController::class, 'history'])->name('inventory.history')->middleware('permission:inventory.view_history');
        Route::get('/inventory/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust')->middleware('permission:inventory.adjust');
        Route::post('/inventory/adjust', [InventoryController::class, 'updateStock'])->name('inventory.update-stock')->middleware('permission:inventory.adjust');

        // Restock Orders
        Route::get('/restock-orders', [RestockOrderController::class, 'index'])->name('restock-orders.index')->middleware('permission:restock.view');
        Route::get('/restock-orders/create', [RestockOrderController::class, 'create'])->name('restock-orders.create')->middleware('permission:restock.create');
        Route::post('/restock-orders', [RestockOrderController::class, 'store'])->name('restock-orders.store')->middleware('permission:restock.create');
        Route::get('/restock-orders/{restock_order}', [RestockOrderController::class, 'show'])->name('restock-orders.show')->middleware('permission:restock.view');
        Route::delete('/restock-orders/{restock_order}', [RestockOrderController::class, 'destroy'])->name('restock-orders.destroy')->middleware('permission:restock.delete');
        Route::post('/restock-orders/{restock_order}/receive', [RestockOrderController::class, 'receive'])->name('restock-orders.receive')->middleware('permission:restock.receive');

        Route::resource('roles', RoleController::class);
        Route::post('/roles/{id}/sync-permissions', [RoleController::class, 'syncPermissions']);

        Route::resource('permissions', PermissionController::class);
        Route::post('/users/{id}/sync-permissions', [UserPermissionController::class, 'syncPermissions']);

        Route::get('/users', [UserController::class, 'index'])
            ->name('users.index')
            ->middleware('permission:user.view');

        // HRM Routes
        Route::prefix('hrm')->name('hrm.')->group(function () {
            // Employees
            Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index')->middleware('permission:hrm.employee.view');
            Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store')->middleware('permission:hrm.employee.manage');
            Route::put('/employees/{id}', [EmployeeController::class, 'update'])->name('employees.update')->middleware('permission:hrm.employee.manage');
            Route::patch('/employees/{id}/toggle-status', [EmployeeController::class, 'toggleStatus'])->name('employees.toggle-status')->middleware('permission:hrm.employee.manage');

            // Attendance
            Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index')->middleware('permission:hrm.attendance.view');
            Route::post('/attendance', [AttendanceController::class, 'store'])->name('attendance.store')->middleware('permission:hrm.attendance.manage');

            // Leaves
            Route::get('/leaves', [LeaveController::class, 'index'])->name('leaves.index')->middleware('permission:hrm.leave.view');
            Route::post('/leaves', [LeaveController::class, 'store'])->name('leaves.store')->middleware('permission:hrm.leave.view'); // Basic users can create
            Route::patch('/leaves/{id}/status', [LeaveController::class, 'updateStatus'])->name('leaves.status')->middleware('permission:hrm.leave.manage');

            // Payroll
            Route::get('/payroll', [PayrollController::class, 'index'])->name('payroll.index')->middleware('permission:hrm.payroll.view');
            Route::post('/payroll/generate', [PayrollController::class, 'generate'])->name('payroll.generate')->middleware('permission:hrm.payroll.manage');
            Route::patch('/payroll/{id}/status', [PayrollController::class, 'updateStatus'])->name('payroll.status')->middleware('permission:hrm.payroll.manage');
        });

        // Reports Routes
        Route::prefix('reports')->name('reports.')->middleware('permission:report.view')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            Route::get('/export/pdf', [ReportController::class, 'exportPdf'])->name('export.pdf')->middleware('permission:report.export');
            Route::get('/export/csv', [ReportController::class, 'exportCsv'])->name('export.csv')->middleware('permission:report.export');
        });

    });

});
