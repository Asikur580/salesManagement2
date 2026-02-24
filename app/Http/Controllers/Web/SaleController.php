<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['customer', 'employee.user', 'items.product'])
            ->whereIn('status', ['approved', 'delivered']);

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('employee.user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $sales = $query->latest()->get()->map(function ($order) {
            return [
                'id' => $order->order_number,
                'internalId' => $order->id,
                'customerId' => $order->customer_id,
                'customerName' => $order->customer ? $order->customer->name : 'Unknown',
                'employeeName' => $order->employee && $order->employee->user ? $order->employee->user->name : 'Unknown',
                'date' => $order->order_date,
                'paymentMethod' => $order->payment_method,
                'discount' => (float) $order->discount,
                'discountType' => $order->discount_type,
                'subtotal' => (float) $order->subtotal,
                'discountAmount' => (float) $order->discount_amount,
                'total' => (float) $order->total_amount,
                'status' => $order->status,
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => "item-{$item->id}",
                        'dbId' => $item->id,
                        'productId' => $item->product_id,
                        'productName' => $item->product ? $item->product->name : 'Unknown',
                        'packSize' => $item->product ? $item->product->pack_size : '',
                        'priceType' => $item->price_type,
                        'price' => (float) $item->unit_price,
                        'quantity' => (int) $item->quantity,
                        'bonusQuantity' => (int) $item->bonus_quantity,
                        'total' => (float) $item->total_price,
                    ];
                }),
            ];
        });

        return Inertia::render('Sales', [
            'initialSales' => $sales,
            'filters' => $request->only(['search'])
        ]);
    }
}
