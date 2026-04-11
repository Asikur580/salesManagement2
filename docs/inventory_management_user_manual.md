# 📦 Inventory Management System - User Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Dashboard Low Stock Alerts](#dashboard-low-stock-alerts)
3. [Stock History](#stock-history)
4. [Manual Stock Adjustment](#manual-stock-adjustment)
5. [Supplier Management](#supplier-management)
6. [Restock Orders](#restock-orders)
7. [Permissions](#permissions)
8. [FAQ](#faq)

---

## System Overview

The Inventory Management System automatically tracks your product stock. It operates using 5 main modules:

| Module | Function |
|---|---|
| **Dashboard Alerts** | Displays items with low stock directly on the dashboard |
| **Stock History** | Complete record of every stock change |
| **Manual Adjustment** | Manually increase/decrease stock |
| **Supplier Management** | Store and manage supplier information |
| **Restock Orders** | Order products from suppliers and update stock |

### How does stock change?

Stock changes in 3 ways:

1. **Sales (POS/Online)** → Stock decreases automatically
2. **Restock Order Receive** → Stock increases automatically
3. **Manual Adjustment** → You manually increase/decrease (requires a reason)

> **Important:** Every change is logged in the Stock History. Records show who, when, and how much was changed.

---

## Dashboard Low Stock Alerts

### How it works

When you log into the dashboard, you will see two Alert Cards:

1. **🔴 Out of Stock Items** — Products with a stock of 0
2. **🟠 Low Stock Alerts** — Products with stock currently below their assigned threshold

### Setting the Low Stock Threshold

A separate threshold can be set for each product:

1. Go to the **Products** page.
2. **Edit** any product.
3. In the **Pricing & Inventory** section, enter a number in the **Low Stock Alert** field (e.g., `10`).
4. Click **Save**.

> **Example:** If the Low Stock Alert for the "Samsung Galaxy A54" is set to `10`, the dashboard will display an alert whenever its stock drops to 10 or below.

### Quick Action

There is a **"Restock Now"** button next to each alert. Clicking it takes you directly to the Restock Order creation page.

---

## Stock History

### How to view it

**Sidebar → Inventory → Stock History**

### Displayed Information

| Column | Description |
|---|---|
| **Product** | The product whose stock has changed |
| **Type** | `In` (Increase), `Out` (Decrease), `Adjustment` (Correction) |
| **Quantity** | The amount of change |
| **Balance After** | Current stock after the change |
| **Reason** | The reason for the change |
| **User** | Who made the change |
| **Date** | When it happened |

### Filtering

- **Search**: Find by product name
- **Type Filter**: View only `In`, `Out`, or `Adjustment`

---

## Manual Stock Adjustment

### When to use it

- If products are damaged (damaged goods)
- If there is a mismatch during physical counting (physical count mismatch)
- If free samples are given out
- To correct stock for any other reason

### How to do it

**Sidebar → Inventory → Manual Adjustment**

#### Step 1: Select Product
- Select the product from the dropdown
- If there are variants (size/color), select the variant as well.

#### Step 2: Select Type
| Type | Function |
|---|---|
| **Stock In** | Increases stock |
| **Stock Out** | Decreases stock |
| **Adjustment** | Correction (usually increases) |

#### Step 3: Quantity and Reason
- **Quantity**: How much you want to change
- **Reason**: Why you are making the change (Mandatory)

#### Step 4: Submit
- Click the **"Adjust Stock"** button.
- If successful, you will be redirected to the Stock History page.

> **⚠️ Warning:** There is no Undo for Manual Adjustment. If you make a mistake, you must create a reverse Adjustment to correct it.

---

## Supplier Management

### How to access

**Sidebar → Inventory → Suppliers**

### Adding a New Supplier

1. Click the **"Add Supplier"** button.
2. Fill out the form:

| Field | Description | Mandatory? |
|---|---|---|
| **Name** | Supplier's Name | ✅ Yes |
| **Email** | Email Address | ❌ No |
| **Phone** | Phone Number | ✅ Yes |
| **Address** | Address | ❌ No |
| **Is Active** | Whether the supplier is active | ✅ Yes |

3. Click **"Save"**.

### Edit / Delete Supplier

- **Edit**: Click the Edit icon next to the supplier.
- **Delete**: Click the Delete icon (a confirmation will appear).

> **Note:** Only Active suppliers will appear in the dropdown when creating a Restock Order.

---

## Restock Orders

### How to access

**Sidebar → Inventory → Restock Orders**

### What is a Restock Order?

A Restock Order is a formal record of purchasing goods from a supplier. It acts like a Purchase Order (PO).

### Order Status

| Status | Meaning | Stock Impact |
|---|---|---|
| 🟠 **Pending** | Order created, goods haven't arrived yet | ❌ No change |
| 🟢 **Received** | Goods have arrived, stock updated | ✅ Stock increases |
| 🔴 **Cancelled** | Order has been cancelled | ❌ No change |

---

### Creating a New Restock Order

1. Click the **"Create Restock Order"** button.

#### Step 1: Select Supplier
- Select the supplier from the **"Order Config"** panel on the right.

#### Step 2: Add Products
For each item:
- **Product**: Select the product from the dropdown.
- **Variant**: If there are variants, select one.
- **Quantity**: How many pieces to order.
- **Cost Price**: Cost per piece.

> Click the **"+ Add Item"** button to add more products.

#### Step 3: Notes (Optional)
- Add any relevant comments regarding the order.

#### Step 4: Save
- Click **"Save Draft Order"**.
- The order will be created with a **Pending** status.
- Stock will **not** change at this time.

---

### Receiving Goods (Mark as Received)

> **This is the most critical step — this is when stock automatically increases.**

1. Click **"View"** on the Pending order from the **Restock Orders** list.
2. Review the details of the order.
3. If everything is correct, click the **"Mark as Received"** (green button).
4. A Confirmation Dialog will appear — click **"Confirm & Update Stock"**.

#### What happens next?
- ✅ The order status changes to **Received**.
- ✅ The `received_at` date and time are saved.
- ✅ The stock for each product in the order **increases automatically**.
- ✅ A separate log is created in the Stock History for each item.

> **⚠️ Warning:** The Received action cannot be Undone. If there's an error, you must correct it using a Manual Adjustment.

---

### Cancelling an Order

1. Go to the **"View"** page of a Pending order.
2. Click the **"Cancel Order"** (red button).
3. On the confirmation dialog, click **"Delete Order"**.

> **Note:** Only **Pending** orders can be cancelled. **Received** orders cannot be cancelled.

---

## Permissions

### Required Permissions

You can manage these from your Roles & Permissions system:

| Permission | Action it Allows |
|---|---|
| `supplier.view` | View supplier list |
| `supplier.create` | Add new supplier |
| `supplier.update` | Edit supplier info |
| `supplier.delete` | Delete supplier |
| `inventory.view_history` | View Stock History |
| `inventory.adjust` | Perform Manual Stock Adjustments |
| `restock.view` | View Restock Orders |
| `restock.create` | Create new Restock Order |
| `restock.receive` | Receive Orders (updates stock) |
| `restock.delete` | Cancel/Delete Restock Orders |

### Which Role has which Permission?

| Role | Permissions |
|---|---|
| **Super Admin** | All permissions |
| **Admin** | All inventory permissions |
| **Sales** | No inventory permissions (only POS & Order) |
| **Accountant** | No inventory permissions (only view Orders) |

> **To assign a Permission to a new Role:** Go to Roles & Permissions → Edit Role → Select the necessary permissions from the checkboxes.

---

## FAQ

### ❓ Does stock decrease automatically when selling from POS?
**Yes.** Stock automatically decreases with every sale from the POS or Online Shop, and a log is created in the Stock History.

### ❓ Does creating a Restock Order increase the stock?
**No.** Just creating the order does not change stock. Stock will only increase when you click **"Mark as Received"** after getting the products in hand.

### ❓ Can I partially receive an order?
**No.** Currently, the system uses "Receive All". If you need to partially receive, create a new Restock Order with only the products that have arrived.

### ❓ What if I marked it as Received by mistake?
Use Manual Adjustment. Go to **Inventory → Manual Adjustment**, select the product, choose **Stock Out**, enter the quantity, and write "Wrong restock receive correction" as the reason.

### ❓ Why isn't the Low Stock Alert working?
Make sure that a number is set in the **Low Stock Alert** field for the product. If it is `0` or empty, the alert will not be displayed.

### ❓ Why isn't a new supplier showing in the dropdown?
Check if the supplier is **Active**. Only Active suppliers are displayed in the Restock Order form.

---

## Support

Please contact the system administrator if you face any issues.

---

*Last Updated: April 11, 2026*
