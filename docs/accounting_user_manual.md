# Accounting Module - User Manual

Welcome to the Accounting Module! This guide will walk you through how to use the newly implemented features for managing your finances, tracking dues, and viewing reports.

## 1. Expense Management

### 1.1 Expense Categories
Before recording an expense, you must define its category.
- **Navigation:** Go to `Sidebar > Accounting > Expense Categories`.
- **How to Add:** Click on the **"+ Add Category"** button at the top right.
- **Fields:**
  - `Name`: e.g., "Electricity Bill", "Office Supplies", "Rent".
  - `Description`: Optional details about this category.

### 1.2 Recording Expenses
Log your day-to-day business costs here.
- **Navigation:** Go to `Sidebar > Accounting > Expenses`.
- **How to Add:** Click on the **"+ Record Expense"** button.
- **Fields:**
  - `Category`: Select from the dropdown (created in step 1.1).
  - `Amount (Tk)`: The total amount spent.
  - `Date`: When the expense occurred.
  - `Reference No.`: Any receipt or invoice number (optional).
  - `Note`: Additional details (optional).

## 2. Dues & Payments

### 2.1 Customer Dues
Track pending and partially paid customer sales orders.
- **Navigation:** Go to `Sidebar > Accounting > Customer Dues`.
- **How it Works:** The table automatically lists orders where the `Paid` amount is less than the `Total Amount`.
- **Receiving Payment:**
  1. Click **"Receive Payment"** next to the specific order.
  2. Enter the amount being paid.
  3. Select the `Method` (Cash, Bank Transfer, Mobile Banking, Card).
  4. Submit. The system will automatically update the total paid amount and switch the status from `pending` to `partially_paid` or `paid`.

### 2.2 Supplier Dues
Track unpaid or partially paid purchases (restock orders) from your suppliers.
- **Navigation:** Go to `Sidebar > Accounting > Supplier Dues`.
- **How it Works:** The table acts identically to Customer Dues but applies to inventory purchases.
- **Making Payment:**
  1. Click **"Make Payment"** next to the supplier's order.
  2. Enter the amount you are paying to the supplier.
  3. Select the payment method and confirm.

### 2.3 Payment Ledger
View the complete history of all money entering and leaving your system.
- **Navigation:** Go to `Sidebar > Accounting > Payment Ledger`.
- **How it Works:** This table logs all incoming (+ Sales) and outgoing (- Payments/Purchases) transactions in real-time. It includes dates, reference IDs, and the exact payment methods used.

## 3. Financial Reports

*Note: The reports pull live data from your system's sales and expense ledgers.*

- **Cashbook (`Accounting > Cashbook`):** A running chronological balance of total cash flow.
- **Profit & Loss (`Accounting > Profit & Loss`):** Displays your total revenues versus your total expenses and stock costs to calculate your ultimate Net Profit.
- **Daily Sales (`Accounting > Daily Sales`):** Monitor day-over-day performance to track business growth.

---
*Tip: Ensure that your user account has the appropriate permissions assigned to view the Accounting Module if you cannot see certain options in the sidebar.*
