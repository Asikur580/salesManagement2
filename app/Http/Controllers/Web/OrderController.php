<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items', 'canceller']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        $orders = $query->latest()->paginate($request->input('per_page', 15))->withQueryString();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'payment_status', 'source']),
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['items.product', 'items.variant', 'user', 'creator', 'canceller']);

        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'order_status' => 'nullable|string|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'nullable|string|in:pending,paid,failed,partially_paid',
        ]);

        $order->update(array_filter($validated));

        return back()->with('success', 'Order status updated successfully.');
    }

    public function downloadInvoice(Order $order)
    {
        $order->load(['items.product', 'items.variant', 'user']);

        $pdf = Pdf::loadView('invoices.order-invoice', compact('order'));

        return $pdf->download('invoice-' . $order->order_number . '.pdf');
    }
}
