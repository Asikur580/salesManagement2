<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $view = $request->query('view', 'officer');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $data = $this->getReportData($view, $startDate, $endDate);

        return Inertia::render('SalesReports', [
            'initialData' => $data,
            'filters' => [
                'view' => $view,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    protected function getReportData($view, $startDate, $endDate)
    {
        switch ($view) {
            case 'customer':
                return $this->getCustomerSalesReport($startDate, $endDate);
            case 'product':
                return $this->getProductSalesReport($startDate, $endDate);
            case 'category':
                return $this->getCategorySalesReport($startDate, $endDate);
            case 'payment-method':
                return $this->getPaymentMethodReport($startDate, $endDate);
            case 'officer':
                return $this->getOfficerSalesReport($startDate, $endDate);
            case 'manager':
                return $this->getManagerSalesReport($startDate, $endDate);
            case 'rsm':
                return $this->getRsmSalesReport($startDate, $endDate);
            case 'others':
            case 'other':
                return $this->getOtherEmployeesSalesReport($startDate, $endDate);
            default:
                return $this->getOfficerSalesReport($startDate, $endDate);
        }
    }

    protected function applyDateFilters($query, $startDate, $endDate, $table = 'orders')
    {
        if ($startDate) {
            $query->whereDate("$table.order_date", '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate("$table.order_date", '<=', $endDate);
        }
        return $query;
    }

    protected function getCustomerSalesReport($startDate, $endDate)
    {
        $qtySubquery = DB::table('order_items')
            ->select('order_id', DB::raw('SUM(quantity) as order_qty'))
            ->groupBy('order_id');

        $query = Order::query()
            ->join('customers', 'orders.customer_id', '=', 'customers.id')
            ->leftJoinSub($qtySubquery, 'order_quantities', function ($join) {
                $join->on('orders.id', '=', 'order_quantities.order_id');
            })
            ->select(
                'customers.id',
                'customers.name',
                DB::raw('COUNT(orders.id) as total_orders'),
                DB::raw('SUM(orders.total_amount) as total_spent'),
                DB::raw('COALESCE(SUM(order_quantities.order_qty), 0) as total_quantity')
            )
            ->groupBy('customers.id', 'customers.name');

        $this->applyDateFilters($query, $startDate, $endDate);

        return $query->orderByDesc('total_spent')->get();
    }

    protected function getProductSalesReport($startDate, $endDate)
    {
        $query = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                DB::raw('COUNT(DISTINCT orders.id) as total_orders'),
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_spent')
            )
            ->groupBy('products.id', 'products.name');

        $this->applyDateFilters($query, $startDate, $endDate);

        return $query->orderByDesc('total_spent')->get();
    }

    protected function getCategorySalesReport($startDate, $endDate)
    {
        $query = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select(
                'categories.id',
                'categories.name',
                DB::raw('COUNT(DISTINCT orders.id) as total_orders'),
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_spent')
            )
            ->groupBy('categories.id', 'categories.name');

        $this->applyDateFilters($query, $startDate, $endDate);

        return $query->orderByDesc('total_spent')->get();
    }

    protected function getOfficerSalesReport($startDate, $endDate)
    {
        $query = DB::table('orders')
            ->join('employee_details', 'orders.employee_id', '=', 'employee_details.id')
            ->join('users', 'employee_details.user_id', '=', 'users.id')
            ->join('roles', 'employee_details.role_id', '=', 'roles.id')
            ->where('roles.name', 'officer')
            ->select(
                'employee_details.id',
                'users.name',
                DB::raw('COUNT(orders.id) as total_orders'),
                DB::raw('SUM(orders.total_amount) as total_spent'),
                DB::raw("(SELECT COALESCE(SUM(quantity), 0) FROM order_items JOIN orders as o ON order_items.order_id = o.id WHERE o.employee_id = employee_details.id" .
                    ($startDate ? " AND o.order_date >= '$startDate'" : "") .
                    ($endDate ? " AND o.order_date <= '$endDate'" : "") . ") as total_quantity")
            )
            ->groupBy('employee_details.id', 'users.name');

        $this->applyDateFilters($query, $startDate, $endDate);

        return $query->orderByDesc('total_spent')->get();
    }

    protected function getManagerSalesReport($startDate, $endDate)
    {
        // Managers manage Officers. We aggregate orders for the manager and all their subordinate officers.
        $query = DB::table('employee_details as managers')
            ->join('users as manager_users', 'managers.user_id', '=', 'manager_users.id')
            ->join('roles as manager_roles', 'managers.role_id', '=', 'manager_roles.id')
            ->where('manager_roles.name', 'manager')
            ->select(
                'managers.id',
                'manager_users.name',
                DB::raw("(SELECT COALESCE(COUNT(id), 0) FROM orders WHERE (employee_id = managers.id OR employee_id IN (SELECT id FROM employee_details WHERE parent_id = managers.id))" .
                    ($startDate ? " AND order_date >= '$startDate'" : "") .
                    ($endDate ? " AND order_date <= '$endDate'" : "") . ") as total_orders"),
                DB::raw("(SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE (employee_id = managers.id OR employee_id IN (SELECT id FROM employee_details WHERE parent_id = managers.id))" .
                    ($startDate ? " AND order_date >= '$startDate'" : "") .
                    ($endDate ? " AND order_date <= '$endDate'" : "") . ") as total_spent"),
                DB::raw("(SELECT COALESCE(SUM(order_items.quantity), 0) FROM order_items JOIN orders ON order_items.order_id = orders.id WHERE (orders.employee_id = managers.id OR orders.employee_id IN (SELECT id FROM employee_details WHERE parent_id = managers.id))" .
                    ($startDate ? " AND orders.order_date >= '$startDate'" : "") .
                    ($endDate ? " AND orders.order_date <= '$endDate'" : "") . ") as total_quantity")
            )
            ->groupBy('managers.id', 'manager_users.name');

        return $query->orderByDesc('total_spent')->get();
    }

    protected function getRsmSalesReport($startDate, $endDate)
    {
        // RSMs manage Managers who manage Officers. We aggregate orders for the RSM, their managers, and all their subordinate officers.
        $query = DB::table('employee_details as rsms')
            ->join('users as rsm_users', 'rsms.user_id', '=', 'rsm_users.id')
            ->join('roles as rsm_roles', 'rsms.role_id', '=', 'rsm_roles.id')
            ->where('rsm_roles.name', 'rsm')
            ->select(
                'rsms.id',
                'rsm_users.name',
                DB::raw("(SELECT COALESCE(COUNT(id), 0) FROM orders WHERE (employee_id = rsms.id OR employee_id IN (SELECT id FROM employee_details WHERE parent_id = rsms.id OR parent_id IN (SELECT id FROM employee_details WHERE parent_id = rsms.id)))" .
                    ($startDate ? " AND order_date >= '$startDate'" : "") .
                    ($endDate ? " AND order_date <= '$endDate'" : "") . ") as total_orders"),
                DB::raw("(SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE (employee_id = rsms.id OR employee_id IN (SELECT id FROM employee_details WHERE parent_id = rsms.id OR parent_id IN (SELECT id FROM employee_details WHERE parent_id = rsms.id)))" .
                    ($startDate ? " AND order_date >= '$startDate'" : "") .
                    ($endDate ? " AND order_date <= '$endDate'" : "") . ") as total_spent"),
                DB::raw("(SELECT COALESCE(SUM(order_items.quantity), 0) FROM order_items JOIN orders ON order_items.order_id = orders.id WHERE (orders.employee_id = rsms.id OR orders.employee_id IN (SELECT id FROM employee_details WHERE parent_id = rsms.id OR parent_id IN (SELECT id FROM employee_details WHERE parent_id = rsms.id)))" .
                    ($startDate ? " AND orders.order_date >= '$startDate'" : "") .
                    ($endDate ? " AND orders.order_date <= '$endDate'" : "") . ") as total_quantity")
            )
            ->groupBy('rsms.id', 'rsm_users.name');

        return $query->orderByDesc('total_spent')->get();
    }

    protected function getOtherEmployeesSalesReport($startDate, $endDate)
    {
        $query = DB::table('orders')
            ->join('employee_details', 'orders.employee_id', '=', 'employee_details.id')
            ->join('users', 'employee_details.user_id', '=', 'users.id')
            ->join('roles', 'employee_details.role_id', '=', 'roles.id')
            ->whereNotIn('roles.name', ['officer', 'manager', 'rsm'])
            ->select(
                'employee_details.id',
                'users.name',
                DB::raw('COUNT(orders.id) as total_orders'),
                DB::raw('SUM(orders.total_amount) as total_spent'),
                DB::raw('SUM((SELECT SUM(quantity) FROM order_items WHERE order_id = orders.id)) as total_quantity')
            )
            ->groupBy('employee_details.id', 'users.name');

        $this->applyDateFilters($query, $startDate, $endDate);

        return $query->orderByDesc('total_spent')->get();
    }

    protected function getPaymentMethodReport($startDate, $endDate)
    {
        $qtySubquery = DB::table('order_items')
            ->select('order_id', DB::raw('SUM(quantity) as order_qty'))
            ->groupBy('order_id');

        $query = Order::query()
            ->leftJoinSub($qtySubquery, 'order_quantities', function ($join) {
                $join->on('orders.id', '=', 'order_quantities.order_id');
            })
            ->select(
                'payment_method as name',
                DB::raw('COUNT(orders.id) as total_orders'),
                DB::raw('SUM(orders.total_amount) as total_spent'),
                DB::raw('COALESCE(SUM(order_quantities.order_qty), 0) as total_quantity')
            )
            ->groupBy('payment_method');

        $this->applyDateFilters($query, $startDate, $endDate);

        return $query->orderByDesc('total_spent')->get();
    }
}
