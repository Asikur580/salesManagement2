import { useState, useEffect } from "react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { TodayOrderCard } from "@/components/dashboard/TodayOrderCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, CreditCard, ClipboardList, UserPlus, Package, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Target } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface DashboardData {
  stats: {
    revenue: { value: number; change_percentage: number; trend: string };
    orders: { value: number; change_percentage: number; trend: string };
    active_customers: { value: number; change_percentage: number; trend: string };
    today_stats: {
      orders: number;
      sales: string | number;
      new_customers: number;
      out_of_stock: number;
      low_stock: number;
    };
  };
  charts: {
    revenue_trend: Array<{ month: string; sales: number; profit: number }>;
    category_distribution: Array<{ name: string; value: string | number }>;
    customer_growth: Array<{ month: string; new: number; returning: number }>;
  };
  top_products: Array<{
    name: string;
    sales_count: string | number;
    revenue: string | number;
    trend: string;
    change: string;
  }>;
  recent_orders: Array<{
    id: string;
    customer_name: string;
    officer_name: string;
    amount: string | number;
    status: string;
    created_at: string;
  }>;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface DashboardProps {
  stats: any;
  charts: any;
  top_products: any;
  recent_orders: any;
  low_stock_products: any[];
  out_of_stock_products: any[];
}

const Dashboard = ({ 
  stats, 
  charts, 
  top_products, 
  recent_orders, 
  low_stock_products, 
  out_of_stock_products 
}: DashboardProps) => {
  // Pie chart expects numeric values
  const pieData = charts.category_distribution.map((item: any, index: number) => ({
    name: item.name,
    value: parseFloat(item.value.toString()),
    color: COLORS[index % COLORS.length]
  }));

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>

        {/* Primary Stats */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`৳${stats.revenue.value.toLocaleString()}`}
            change={`${stats.revenue.change_percentage >= 0 ? '+' : ''}${stats.revenue.change_percentage}% from last month`}
            changeType={stats.revenue.trend === "up" ? "positive" : "negative"}
            icon={DollarSign}
          />
          <StatCard
            title="Total Orders"
            value={stats.orders.value.toString()}
            change={`${stats.orders.change_percentage >= 0 ? '+' : ''}${stats.orders.change_percentage}% from last month`}
            changeType={stats.orders.trend === "up" ? "positive" : "negative"}
            icon={ShoppingCart}
          />
          <StatCard
            title="Active Customers"
            value={stats.active_customers.value.toString()}
            change={`${stats.active_customers.change_percentage >= 0 ? '+' : ''}${stats.active_customers.change_percentage}% from last month`}
            changeType={stats.active_customers.trend === "up" ? "positive" : "negative"}
            icon={Users}
          />
          <StatCard
            title="Avg. Order Value"
            value={`৳${(stats.revenue.value / (stats.orders.value || 1)).toFixed(2)}`}
            change="Average value per order"
            changeType="neutral"
            icon={CreditCard}
          />
        </div>

        {/* Today's Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Today's Overview</h2>
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-3">
            <TodayOrderCard
              title="Today's Orders"
              value={stats.today_stats.orders}
              icon={ClipboardList}
              href="/orders"
              color="primary"
            />
            <TodayOrderCard
              title="Today's Sales"
              value={`৳${parseFloat(stats.today_stats.sales.toString()).toLocaleString()}`}
              icon={DollarSign}
              href="/orders"
              color="success"
            />
            <TodayOrderCard
              title="New Customers"
              value={stats.today_stats.new_customers}
              icon={UserPlus}
              href="/users"
              color="primary"
            />
            <TodayOrderCard
              title="Out of Stock"
              value={stats.today_stats.out_of_stock}
              icon={Package}
              href="/products"
              color="destructive"
            />
            <TodayOrderCard
              title="Low Stock Alerts"
              value={stats.today_stats.low_stock}
              icon={AlertTriangle}
              href="/products"
              color="warning"
            />
          </div>
        </div>

        {/* Critical Inventory Alerts */}
        {(low_stock_products.length > 0 || out_of_stock_products.length > 0) && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <Package className="h-5 w-5" /> Out of Stock Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {out_of_stock_products.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No products currently out of stock.</p>
                  ) : (
                    out_of_stock_products.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm bg-background p-2 rounded border border-destructive/10">
                        <span className="font-medium">{p.name}</span>
                        <Link href={`/restock-orders/create?product_id=${p.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 uppercase font-bold">
                            Restock Now
                          </Button>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-warning/20 bg-warning/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" /> Low Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {low_stock_products.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">All inventory levels are healthy.</p>
                    ) : (
                      low_stock_products.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-sm bg-background p-2 rounded border border-orange-200">
                          <div>
                            <span className="font-medium">{p.name}</span>
                            <div className="text-[10px] text-muted-foreground">Threshold: {p.low_stock_alert}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-orange-600 font-mono">{p.stock} left</span>
                            <Link href={`/restock-orders/create?product_id=${p.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-orange-600 hover:bg-orange-100">
                                Restock
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
            </Card>
          </div>
        )}

        {/* Target Progress (Calculated as examples) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monthly Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue Target</span>
                  <span className="font-medium">৳{stats.revenue.value.toLocaleString()} / ৳50,000</span>
                </div>
                <Progress value={Math.min((stats.revenue.value / 50000) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">{Math.round((stats.revenue.value / 50000) * 100)}% achieved</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New Customers</span>
                  <span className="font-medium">{stats.today_stats.new_customers} / 100</span>
                </div>
                <Progress value={Math.min((stats.today_stats.new_customers / 100) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">{Math.round((stats.today_stats.new_customers / 100) * 100)}% achieved</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Orders Target</span>
                  <span className="font-medium">{stats.orders.value} / 400</span>
                </div>
                <Progress value={Math.min((stats.orders.value / 400) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">{Math.round((stats.orders.value / 400) * 100)}% achieved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row 1 */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Revenue & Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={charts.revenue_trend}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="hsl(var(--chart-2))"
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                    name="Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((item: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {pieData.map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Orders Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={charts.revenue_trend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Customer Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={charts.customer_growth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="new" name="New Customers" fill="hsl(var(--chart-3))" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="returning" name="Returning" fill="hsl(var(--primary))" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products & Recent Orders */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {top_products.map((product: any, index: number) => (
                  <div key={`${product.name}-${index}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sales_count} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">৳{parseFloat(product.revenue.toString()).toLocaleString()}</p>
                      <div className={`flex items-center justify-end text-xs ${product.trend === "up" ? "text-success" : "text-destructive"
                        }`}>
                        {product.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {product.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {recent_orders.map((order: any) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3 md:pb-4 last:border-0">
                    <div className="space-y-1">
                      <p className="font-medium text-sm md:text-base">{order.id}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <div className="flex items-center justify-between sm:text-right sm:flex-col sm:items-end gap-2">
                      <div className="space-y-1">
                        <p className="text-xs md:text-sm text-muted-foreground">{order.officer_name}</p>
                        <p className="font-medium text-sm md:text-base">৳{parseFloat(order.amount.toString()).toLocaleString()}</p>
                      </div>
                      <Badge
                        variant={
                          order.status === "approved" ? "default" :
                            order.status === "delivered" ? "secondary" :
                              "outline"
                        }
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
