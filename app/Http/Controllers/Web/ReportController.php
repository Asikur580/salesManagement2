<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        return Inertia::render('Reports/Index', [
            'summary' => $this->getSalesSummary($start, $end),
            'source_report' => $this->getSourceReport($start, $end),
            'top_products' => $this->getTopSellingProducts($start, $end),
            'profit_report' => $this->getProfitReport($start, $end),
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    private function getSalesSummary($start, $end)
    {
        $totalRevenue = Order::whereBetween('order_date', [$start, $end])
            ->sum('total_amount');

        $totalOrders = Order::whereBetween('order_date', [$start, $end])->count();

        $dailySales = Order::whereBetween('order_date', [$start, $end])
            ->select(DB::raw('DATE(order_date) as date'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'total_revenue' => (float) $totalRevenue,
            'total_orders' => $totalOrders,
            'daily_sales' => $dailySales,
        ];
    }

    private function getSourceReport($start, $end)
    {
        return Order::whereBetween('order_date', [$start, $end])
            ->select('source', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('source')
            ->get();
    }

    private function getTopSellingProducts($start, $end, $limit = 10)
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereBetween('orders.order_date', [$start, $end])
            ->select(
                'products.name',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_quantity')
            ->limit($limit)
            ->get();
    }

    private function getProfitReport($start, $end)
    {
        $profit = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereBetween('orders.order_date', [$start, $end])
            ->select(DB::raw('SUM(order_items.total_price - (order_items.quantity * products.cost_price)) as total_profit'))
            ->first()->total_profit ?? 0;

        return [
            'total_profit' => (float) $profit,
        ];
    }

    public function exportPdf(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $data = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'summary' => $this->getSalesSummary($start, $end),
            'source_report' => $this->getSourceReport($start, $end),
            'top_products' => $this->getTopSellingProducts($start, $end, 20),
            'profit' => $this->getProfitReport($start, $end)['total_profit'],
        ];

        $pdf = Pdf::loadView('pdf.report', $data);
        return $pdf->download("sales_report_{$startDate}_to_{$endDate}.pdf");
    }

    public function exportCsv(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $orders = Order::whereBetween('order_date', [$start, $end])
            ->with(['user'])
            ->orderBy('order_date', 'desc')
            ->get();

        $callback = function() use ($orders) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Order Number', 'Date', 'Customer', 'Source', 'Amount', 'Status', 'Payment']);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->order_date,
                    $order->user->name ?? $order->customer_name,
                    strtoupper($order->source),
                    $order->total_amount,
                    $order->order_status,
                    $order->payment_status,
                ]);
            }

            fclose($file);
        };

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=sales_report_{$startDate}_to_{$endDate}.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        return response()->stream($callback, 200, $headers);
    }
}
