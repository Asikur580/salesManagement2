# Accounting Module Implementation Tasks

## Phase 1: Database & Models (Expenses)
- [x] Create `ExpenseCategory` migration, model, and factory.
- [x] Create `Expense` migration, model, and factory.
- [x] Define relationships between `Expense` and `ExpenseCategory`.
- [x] Run migrations.

## Phase 2: Database & Models (Payments/Ledger)
- [x] Create `Payment` migration (polymorphic) for order/restock_order tracking.
- [x] Create `Payment` model and define `payable` relationship.
- [x] Update `orders` tables via migration to include `paid_amount` and ensure `payment_status` is ready.
- [x] Update `restock_orders` tables via migration to include `paid_amount` and `payment_status`.
- [x] Add `payments()` relationships to `Order` and `RestockOrder` models.
- [x] Add `due_amount` accessor logic to `Order` and `RestockOrder` models.

## Phase 3: Backend API & Controllers
- [x] Create `ExpenseCategoryController` and routes.
- [x] Create `ExpenseController` and routes.
- [x] Create `PaymentController` with logic to process partial/full payments and update parent total `paid_amount` and `payment_status`.
- [x] Create `ReportController` to calculate Profit & Loss, Daily Sales, and Monthly Summaries based on incoming/outgoing cashflow.

## Phase 4: Frontend UI (Expenses)
- [x] Add Accounting menu grouping in the main Sidebar (`DashboardLayout.tsx`).
- [x] Create `resources/js/Pages/Accounting/Expenses/Index.tsx` to list expenses and categories.
- [x] Create forms/modals for adding and editing `ExpenseCategories`.
- [x] Create forms/modals for adding and editing `Expenses`.

## Phase 5: Frontend UI (Due & Payments)
- [x] Create `resources/js/Pages/Accounting/Payments/CustomerDues.tsx` (Table of partially paid/unpaid orders).
- [x] Create `resources/js/Pages/Accounting/Payments/SupplierDues.tsx` (Table of unpaid/partially paid restock orders).
- [x] Create `resources/js/Pages/Accounting/Payments/PaymentHistory.tsx` (Ledger view of all payment transactions).
- [x] Implement "Add Payment" modal on the due tracking tables.

## Phase 6: Frontend UI (Reports)
- [x] Create `resources/js/Pages/Accounting/Reports/ProfitLoss.tsx` to show revenue, cost, and expenses.
- [x] Create `resources/js/Pages/Accounting/Reports/DailySales.tsx` for daily tracking.
- [x] Create `resources/js/Pages/Accounting/Reports/Cashbook.tsx` for the running balance ledger.

## Phase 7: Testing & Verification
- [ ] Submit an expense and verify it deducts from Profit & Loss.
- [ ] Add a partial payment to a Customer Order and verify `payment_status` changes to 'partially_paid'.
- [ ] Fully pay a Supplier Restock Order and verify status updates.
- [ ] Verify all calculations in reports are perfectly accurate.
