<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard', [
            'stats' => $this->getStatsData(),
            'charts' => $this->getChartsData(),
            'top_products' => $this->getTopProductsData(),
            'recent_orders' => $this->getRecentOrdersData(),
        ]);
    }

    private function getStatsData()
    {
        $now = Carbon::now();
        $thisMonth = [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
        $lastMonth = [$now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()];

        $currentRevenue = Order::whereBetween('order_date', $thisMonth)->sum('total_amount');
        $lastRevenue = Order::whereBetween('order_date', $lastMonth)->sum('total_amount');

        $currentOrders = Order::whereBetween('order_date', $thisMonth)->count();
        $lastOrders = Order::whereBetween('order_date', $lastMonth)->count();

        $currentCustomers = Customer::whereBetween('created_at', $thisMonth)->count();
        $lastCustomers = Customer::whereBetween('created_at', $lastMonth)->count();
        $totalCustomers = Customer::count();

        return [
            'revenue' => $this->formatStat($currentRevenue, $lastRevenue),
            'orders' => $this->formatStat($currentOrders, $lastOrders),
            'active_customers' => [
                'value' => $totalCustomers,
                'change_percentage' => $this->calculateChange($currentCustomers, $lastCustomers),
                'trend' => $currentCustomers >= $lastCustomers ? 'up' : 'down'
            ],
            'today_stats' => [
                'orders' => Order::whereDate('order_date', Carbon::today())->count(),
                'sales' => (float) Order::whereDate('order_date', Carbon::today())->sum('total_amount'),
                'new_customers' => Customer::whereDate('created_at', Carbon::today())->count(),
                'out_of_stock' => Product::where('stock', '<=', 0)->count(),
                'low_stock' => Product::where('stock', '>', 0)->where('stock', '<=', 5)->count(),
            ]
        ];
    }

    private function getChartsData()
    {
        $revenueTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $start = $monthDate->copy()->startOfMonth();
            $end = $monthDate->copy()->endOfMonth();

            $sales = Order::whereBetween('order_date', [$start, $end])->sum('total_amount');

            $profit = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->whereBetween('orders.order_date', [$start, $end])
                ->select(DB::raw('SUM(order_items.total_price - (order_items.quantity * products.purchase_price)) as profit'))
                ->first()->profit ?? 0;

            $revenueTrend[] = [
                'month' => $monthDate->format('M'),
                'sales' => (float) $sales,
                'profit' => (float) $profit
            ];
        }

        $categoryDistribution = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('SUM(order_items.quantity) as value'))
            ->groupBy('categories.name')
            ->orderByDesc('value')
            ->limit(5)
            ->get();

        $customerGrowth = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $start = $monthDate->copy()->startOfMonth();
            $end = $monthDate->copy()->endOfMonth();

            $new = Customer::whereBetween('created_at', [$start, $end])->count();

            $returningCount = DB::table('orders')
                ->whereBetween('order_date', [$start, $end])
                ->whereIn('customer_id', function ($query) use ($start) {
                    $query->select('customer_id')->from('orders')->where('order_date', '<', $start);
                })
                ->distinct('customer_id')
                ->count();

            $customerGrowth[] = [
                'month' => $monthDate->format('M'),
                'new' => $new,
                'returning' => $returningCount
            ];
        }

        return [
            'revenue_trend' => $revenueTrend,
            'category_distribution' => $categoryDistribution,
            'customer_growth' => $customerGrowth,
        ];
    }

    private function getTopProductsData()
    {
        return DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select(
                'products.name',
                DB::raw('SUM(order_items.quantity) as sales_count'),
                DB::raw('SUM(order_items.total_price) as revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('sales_count')
            ->limit(5)
            ->get()
            ->map(function ($product) {
                $product->trend = 'up';
                $product->change = '+0%';
                return $product;
            });
    }

    private function getRecentOrdersData()
    {
        return Order::with(['customer', 'employee.user'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->order_number,
                    'customer_name' => $order->customer->name ?? 'N/A',
                    'officer_name' => $order->employee->user->name ?? 'N/A',
                    'amount' => $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                ];
            });
    }

    private function formatStat($current, $last)
    {
        return [
            'value' => (float) $current,
            'change_percentage' => $this->calculateChange($current, $last),
            'trend' => $current >= $last ? 'up' : 'down'
        ];
    }

    private function calculateChange($current, $last)
    {
        if ($last == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $last) / $last) * 100, 1);
    }
}
