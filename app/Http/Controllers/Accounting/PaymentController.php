<?php
namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\RestockOrder;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with(['payable', 'creator'])->latest()->paginate(20);
        return Inertia::render('Accounting/Payments/Index', ['payments' => $payments]);
    }

    public function customerDues()
    {
        $orders = Order::whereIn('payment_status', ['pending', 'partially_paid'])
                       ->orderBy('id', 'desc')->paginate(20);
        return Inertia::render('Accounting/Payments/CustomerDues', ['orders' => $orders]);
    }

    public function supplierDues()
    {
        $restockOrders = RestockOrder::whereIn('payment_status', ['pending', 'partially_paid'])
                                     ->with('supplier')
                                     ->orderBy('id', 'desc')->paginate(20);
        return Inertia::render('Accounting/Payments/SupplierDues', ['restockOrders' => $restockOrders]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payable_type' => 'required|string|in:App\Models\Order,App\Models\RestockOrder',
            'payable_id' => 'required|integer',
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,mobile_banking,card',
            'type' => 'required|in:in,out',
            'note' => 'nullable|string'
        ]);

        $amount = $validated['amount'];
        $modelClass = $validated['payable_type'];
        $payable = $modelClass::findOrFail($validated['payable_id']);

        DB::beginTransaction();
        try {
            $payment = new Payment($validated);
            $payment->created_by = auth()->id();
            $payment->save();

            $payable->paid_amount += $amount;
            
            if ($payable->paid_amount >= $payable->total_amount) {
                $payable->payment_status = 'paid';
            } else {
                $payable->payment_status = 'partially_paid';
            }
            
            $payable->save();
            DB::commit();

            return back()->with('success', 'Payment recorded successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error recording payment.');
        }
    }
}
