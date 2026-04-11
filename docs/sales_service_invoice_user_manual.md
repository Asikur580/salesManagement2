# Sales & Service Invoice Module - User Manual

This manual provides instructions for using the **Sales & Service Invoice Module** in the SalesHub system. This module includes enhancements to the Point of Sale (POS) and a dedicated Service Management system.

---

## 1. Sales POS (Point of Sale)

The POS system now supports dynamic tax calculations.

### 1.1 Applying Tax to a Sale
1. Navigate to **POS** from the sidebar.
2. Add products to the cart as usual.
3. In the totals section (bottom right), you will see a **Tax (%)** input field.
4. Enter the tax percentage (e.g., `5` for 5%).
5. The system will automatically calculate the **Tax Amount** based on the subtotal after any discounts.
6. The **Total Payable** will update in real-time.

---

## 2. Service Invoice Module

This module is designed for automotive repairs, maintenance, and other service-based transactions.

### 2.1 Viewing Service Invoices
1. Navigate to **Service Invoices** from the sidebar.
2. Here you can see a list of all service bookings.
3. Each row shows the Invoice Number, Customer, Service Type, Technician assigned, Total Amount, and Date.
4. Use the **Search** field to find specific invoices by number or customer name.

### 2.2 Creating a New Service Invoice
1. From the Service Invoices list, click **New Service Invoice**.
2. **Customer & Technician**: Select the customer from the dropdown. Assign a technician (Staff) to the job.
3. **Service Details**: Enter the **Service Type** (e.g., "Engine Oil Change") and the **Service Charge** (labor cost).
4. **Adding Parts (Optional)**: 
   - Use the search bar on the left to find parts/products used during the service.
   - Click a part to add it to the "Used Parts" list.
   - Adjust quantities using the `+` and `-` buttons.
   - **Important**: Adding parts to a service invoice will automatically deduct them from your inventory stock once the invoice is saved.
5. **Tax & Discount**: You can apply a **Tax (%)** and a **Fixed Discount** to the total service bill.
6. **Finalizing**: Click **Create Invoice** to save the transaction and update inventory.

---

## 3. Printing Invoices

The system generates professional, computer-generated invoices for services.

### 3.1 Downloading/Printing
1. In the **Service Invoices** list, find the invoice you want to print.
2. Click the **Print (Printer Icon)** button under the "Action" column.
3. A professional PDF-style view will open in a new tab, which you can save or print for your customer.
4. The invoice includes:
   - Business branding and contact info.
   - Customer details.
   - Service details and assigned technician.
   - Detailed breakdown of Parts used vs. Service labor charges.
   - Total summary (Subtotal, Tax, Discount, Grand Total).

---

## 4. Inventory Tracking

The Service Module is fully integrated with your inventory:
- Any product added to a service invoice as a "Part Used" is treated as a sale.
- Stock levels for these products are automatically decremented to ensure accurate inventory data.
- Service transactions are logged and handled by the centralized **StockService**.
