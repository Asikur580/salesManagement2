# Inventory Management System - Task Breakdown

This document breaks down the Inventory Management implementation into small, manageable tasks.

## Phase 1: Foundation (Database & Models)
- [x] **M1: Supplier Infrastructure**
    - [x] Create migration for `suppliers` table.
    - [x] Create `Supplier` model.
- [x] **M2: Stock Transaction Ledger**
    - [x] Create migration for `stock_transactions` table.
    - [x] Create `StockTransaction` model.
- [x] **M3: Restock Order System**
    - [x] Create migration for `restock_orders` table.
    - [x] Create `RestockOrder` model.
- [x] **M4: Product Schema Updates**
    - [x] Add `low_stock_threshold` to `products` table via migration.
    - [x] Update `Product` model with `low_stock_threshold` field and `transactions` relationship.

## Phase 2: Core Logic (Stock Service)
- [x] **S1: Centralized Stock Service**
    - [x] Create `App\Services\StockService.php`.
    - [x] Implement `adjustStock` logic (updates `stock` column AND creates `StockTransaction`).
- [x] **S2: Controller Refactoring**
    - [x] Refactor `PosController@store` to use `StockService`.
    - [x] Refactor `CheckoutController@store` to use `StockService`.

## Phase 3: Admin Management UI
- [x] **U1: Supplier Management**
    - [x] Create `SupplierController`.
    - [x] Create Inertia Page for Supplier List & CRUD.
- [x] **U2: Stock History & Ledger**
    - [x] Create `InventoryController`.
    - [x] Build Stock History Page with filters (Product, Type, Date).
- [x] **U3: Manual Adjustments**
    - [x] Build UI form for manual stock "In/Out" with reason logging.

## Phase 4: Restock Module
- [x] **R1: Restock Workflow**
    - [x] Build UI to create Restock Orders for specific Suppliers.
    - [x] Implement Status Update logic (Pending -> Received).
    - [x] Automatically trigger `StockService` upon receiving items.

## Phase 5: Alerts & Dashboard
- [x] **A1: Low Stock Notifications**
    - [x] Update Dashboard metrics to use dynamic thresholds.
    - [x] Integrate with Topbar/Header notification system.
- [x] **A2: Dashboard Widget**
    - [x] Create a "Critical Stock Alert" widget for the central dashboard.
    - [x] Link alerts directly to the Restock form.
