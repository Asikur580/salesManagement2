import { forwardRef } from "react";
import { Order } from "./OrderFormDialog";
import { format } from "date-fns";

interface OrderInvoiceProps {
  order: Order;
  companyName?: string;
  companyAddress?: string;
}

export const OrderInvoice = forwardRef<HTMLDivElement, OrderInvoiceProps>(
  ({ order, companyName = "RADIANT AGROVET", companyAddress = "House # 37, Road # 01, Dhaka Uddyan, Mohammadpur, Dhaka-1207" }, ref) => {
    return (
      <div ref={ref} className="bg-white text-black p-8 min-w-[700px]" style={{ fontFamily: "Arial, sans-serif" }}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
            {companyName}
          </h1>
          <p className="text-sm text-gray-600">{companyAddress}</p>
          <h2 className="text-xl font-bold mt-4 border-b-2 border-black pb-1 inline-block">INVOICE</h2>
        </div>

        {/* Customer & Invoice Info */}
        <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
          <div className="space-y-1">
            <p><span className="font-bold">Customer Name:</span> {order.customerName}</p>
            <p><span className="font-bold">Employee Name:</span> {order.employeeName}</p>
            <p><span className="font-bold">Payment Method:</span> {order.paymentMethod.replace("_", " ")}</p>
          </div>
          <div className="space-y-1 text-right">
            <p><span className="font-bold">Invoice Id:</span> {order.id}</p>
            <p><span className="font-bold">Date of Invoice:</span> {format(new Date(order.date), "yyyy-MM-dd")}</p>
            <p><span className="font-bold">Status:</span> {order.status}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse text-sm mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-2 py-2 text-center">SI No</th>
              <th className="border border-gray-400 px-2 py-2 text-center">Product Name</th>
              <th className="border border-gray-400 px-2 py-2 text-center">Pack Size</th>
              <th className="border border-gray-400 px-2 py-2 text-center">TP/Flat</th>
              <th className="border border-gray-400 px-2 py-2 text-center">Qty</th>
              <th className="border border-gray-400 px-2 py-2 text-center">Bonus Qty</th>
              <th className="border border-gray-400 px-2 py-2 text-center">Net Qty</th>
              <th className="border border-gray-400 px-2 py-2 text-center">Net Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-gray-400 px-2 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-400 px-2 py-2 text-center">{item.productName}</td>
                <td className="border border-gray-400 px-2 py-2 text-center">{item.packSize}</td>
                <td className="border border-gray-400 px-2 py-2 text-center">
                  {item.price.toFixed(0)}/-({item.priceType})
                </td>
                <td className="border border-gray-400 px-2 py-2 text-center">{item.quantity}</td>
                <td className="border border-gray-400 px-2 py-2 text-center">{item.bonusQuantity}</td>
                <td className="border border-gray-400 px-2 py-2 text-center">{item.quantity + item.bonusQuantity}</td>
                <td className="border border-gray-400 px-2 py-2 text-center">{item.total.toFixed(2)}/-</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="text-sm space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-bold">Total</span>
              <span>: {order.subtotal.toFixed(2)}/-</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-bold">
                Discount - {order.discountType === "percentage" ? `${order.discount}%` : `৳${order.discount}`}
              </span>
              <span>: {order.discountAmount.toFixed(2)}/-</span>
            </div>
            <div className="flex justify-between gap-8 font-bold border-t border-gray-400 pt-1">
              <span>Net Payable Amount</span>
              <span>: {order.total.toFixed(2)}/-</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OrderInvoice.displayName = "OrderInvoice";
