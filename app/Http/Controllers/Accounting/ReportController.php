<?php
namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Order;
use App\Models\Payment;
use App\Models\RestockOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function daily()
    {
        $sales = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_amount) as total_sales'),
            DB::raw('COUNT(id) as total_orders')
        )
        ->groupBy('date')
        ->orderBy('date', 'desc')
        ->limit(30)
        ->get();

        return Inertia::render('Accounting/Reports/DailySales', [
            'sales' => $sales
        ]);
    }

    public function profitLoss()
    {
        $totalRevenue = DB::table('payments')
            ->where('payable_type', 'App\\Models\\Order')
            ->where('type', 'in')
            ->sum('amount');
            
        $totalExpenses = DB::table('expenses')->sum('amount');
        
        $totalPurchases = DB::table('payments')
            ->where('payable_type', 'App\\Models\\RestockOrder')
            ->where('type', 'out')
            ->sum('amount');
            
        $netProfit = $totalRevenue - ($totalExpenses + $totalPurchases);

        return Inertia::render('Accounting/Reports/ProfitLoss', [
            'totalRevenue' => floatval($totalRevenue),
            'totalExpenses' => floatval($totalExpenses),
            'totalPurchases' => floatval($totalPurchases),
            'netProfit' => floatval($netProfit)
        ]);
    }
    
    public function cashbook()
    {
        $payments = DB::table('payments')
            ->select('payment_date as date', 'amount', 'type', 'payment_method as source_or_method', 'note as description')
            ->selectRaw("'Payment' as transaction_type");

        $expenses = DB::table('expenses')
            ->select('date', 'amount', DB::raw("'out' as type"), 'reference_no as source_or_method', 'note as description')
            ->selectRaw("'Expense' as transaction_type");

        $transactions = $payments->unionAll($expenses)
            ->orderBy('date', 'asc')
            ->get();

        $balance = 0;
        $ledger = [];
        
        foreach ($transactions as $t) {
            $amount = floatval($t->amount);
            if ($t->type === 'in') {
                $balance += $amount;
            } else {
                $balance -= $amount;
            }
            
            $t->balance = $balance;
            $ledger[] = $t;
        }

        $ledger = array_reverse($ledger);

        return Inertia::render('Accounting/Reports/Cashbook', [
            'ledger' => $ledger,
            'currentBalance' => $balance
        ]);
    }
}
