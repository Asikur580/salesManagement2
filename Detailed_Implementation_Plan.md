# Detailed Implementation Plan: SRS Compliance

This document provides a technical roadmap for achieving 100% compliance with the Software Requirements Specification (SRS).

## Phase 1: Service Invoices & POS Enhancements

**Goal:** Implement service-based billing and flexible POS entry.

### 1.1 Database Schema (Migrations)

```php
// Create Services Table
Schema::create('services', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->decimal('default_charge', 15, 2);
    $table->text('description')->nullable();
    $table->timestamps();
});

// Create Technicians Table
Schema::create('technicians', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('phone')->nullable();
    $table->string('specialization')->nullable();
    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->timestamps();
});

// Create Service Invoices Table
Schema::create('service_invoices', function (Blueprint $table) {
    $table->id();
    $table->string('invoice_number')->unique();
    $table->foreignId('customer_id')->constrained();
    $table->foreignId('technician_id')->constrained();
    $table->foreignId('service_id')->constrained();
    $table->decimal('service_charge', 15, 2);
    $table->decimal('parts_total', 15, 2)->default(0);
    $table->decimal('total_amount', 15, 2);
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

### 1.2 Frontend Components

- `resources/js/Pages/Services.tsx`: Management UI for services and technicians.
- `resources/js/components/services/ServiceInvoiceDialog.tsx`: Modal for creating service-specific invoices.
- `resources/js/components/orders/OrderFormDialog.tsx`: Update `OrderItemRow` to allow "Manual/Custom" product input as per SRS 3.5.

---

## Phase 2: HRM & Accounting Enhancements

**Goal:** Implement attendance tracking, salary management, and ledger reports.

### 2.1 Database Schema (Migrations)

```php
// Create Attendances Table
Schema::create('attendances', function (Blueprint $table) {
    $table->id();
    $table->foreignId('employee_id')->constrained('employee_details');
    $table->date('date');
    $table->time('clock_in')->nullable();
    $table->time('clock_out')->nullable();
    $table->enum('status', ['present', 'absent', 'leave'])->default('present');
    $table->timestamps();
});

// Create Salaries Table
Schema::create('salaries', function (Blueprint $table) {
    $table->id();
    $table->foreignId('employee_id')->constrained('employee_details');
    $table->string('month'); // e.g., "January"
    $table->year('year');
    $table->decimal('basic_salary', 15, 2);
    $table->decimal('bonus', 15, 2)->default(0);
    $table->decimal('deductions', 15, 2)->default(0);
    $table->decimal('net_payable', 15, 2);
    $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid');
    $table->timestamps();
});
```

### 2.2 Reports (Accounting)

- `App\Http\Controllers\Web\ReportController.php`: Add `getCashbookReport()` and `getLedgerReport()`.
- Implement `Maatwebsite\Excel` for `.xlsx` exports in all report views (SRS 3.9).

---

## Phase 3: Ecommerce Public Frontend

**Goal:** Provide a customer-facing interface for online sales.

### 3.1 Public Routing

```php
// routes/web.php (Unauthenticated)
Route::get('/', [PublicController::class, 'home'])->name('public.home');
Route::get('/shop', [PublicController::class, 'shop'])->name('public.shop');
Route::get('/product/{slug}', [PublicController::class, 'productDetails']);
Route::get('/cart', [PublicController::class, 'cart']);
Route::post('/checkout', [PublicController::class, 'checkout'])->middleware('auth');
```

### 3.2 Key Components

- `resources/js/Pages/Ecommerce/Home.tsx`: Hero section, featured parts, categories.
- `resources/js/Pages/Ecommerce/Shop.tsx`: Search/Filter sidebar, product grid.
- `resources/js/components/ecommerce/CartDrawer.tsx`: Sliding cart view.
- `resources/js/Pages/Ecommerce/Checkout.tsx`: Shipping address input and payment selection (bKash/COD).

---

## Technical Stack

- **Backend:** Laravel 11.x
- **Frontend:** React + Inertia.js + Lucide Icons + Shadcn UI
- **Database:** MySQL
- **Excel/PDF:** `maatwebsite/excel` & `barryvdh/laravel-dompdf`

---

> [!IMPORTANT]
> This plan assumes the `employee_details` table is the source of truth for all HRM operations.
