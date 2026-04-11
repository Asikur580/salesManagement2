# Task 3.3: Sales & Service Invoice Module

This document lists the tasks for implementing the Sales & Service Invoice module, divided into 4 sequential phases.

---

## Phase 1: Foundation & Database
**Goal:** Prepare the database and models for tracking taxes, technicians, and service types.

- [ ] **Migration: Orders Table**
    - [ ] Add `tax_percentage` (decimal) for dynamic tax.
    - [ ] Add `service_type` (string) for service categorization.
    - [ ] Add `technician_id` (foreignId) to link with Employees/Users.
- [ ] **Migration: Order Items Table**
    - [ ] Add `item_type` (enum: 'product', 'service_part') to distinguish usage.
- [ ] **Model Updates**
    - [ ] Update `Order.php` model with `technician` relationship and fillable fields.

---

## Phase 2: Sales Invoice (POS) Enhancements
**Goal:** Add Tax support to the existing POS system.

- [ ] **POS UI (React/Inertia)**
    - [ ] Add Tax Percentage (%) input field in the checkout summary.
    - [ ] Implement real-time auto-calculation logic for Tax and Grand Total.
- [ ] **Backend (PosController)**
    - [ ] Update `store` method to validate `tax_percentage`.
    - [ ] Ensure `tax_amount` and `tax_percentage` are saved correctly in the `orders` table.

---

## Phase 3: Service Invoice Module (UI & Logic)
**Goal:** Create a dedicated workflow for Service Invoices.

- [ ] **Controller Design**
    - [ ] Create `ServiceInvoiceController.php` for handling service-specific logic.
- [ ] **Service POS UI**
    - [ ] Create `Service/Create.tsx` page with:
        - Customer search/selection.
        - Technician selection (from employee dropdown).
        - Service type selection.
        - Service charge input.
        - Parts addition (Inventory search).
        - Service notes.
- [ ] **Stock Integration**
    - [ ] Use `StockService` to deduct inventory for every "Part" used in a service.

---

## Phase 4: Printing & Final Verification
**Goal:** Generate printable invoices and perform final checks.

- [ ] **Blade Template**
    - [ ] Create `resources/views/invoices/service.blade.php` with a professional layout for services.
- [ ] **Action Integration**
    - [ ] Add a "Print Service Invoice" button in the Order Details/Lists view.
- [ ] **Manual Verification**
    - [ ] Test the entire flow: Create Service -> Deduct Stock -> Print Invoice.
