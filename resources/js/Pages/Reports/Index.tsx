import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Download, 
    FileText, 
    Table as TableIcon, 
    TrendingUp, 
    DollarSign, 
    ShoppingCart, 
    ArrowUpRight, 
    Globe, 
    Store,
    Calendar
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))"];

export default function ReportsIndex({ summary, source_report, top_products, profit_report, filters }: any) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get(route('reports.index'), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const handleExport = (type: 'pdf' | 'csv') => {
        const url = type === 'pdf' ? route('reports.export.pdf') : route('reports.export.csv');
        window.location.href = `${url}?start_date=${startDate}&end_date=${endDate}`;
    };

    return (
        <DashboardLayout>
            <Head title="Sales Reports & Analytics" />
            
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                        <p className="text-muted-foreground">Comprehensive overview of your business performance.</p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3 bg-card p-4 rounded-lg border shadow-sm">
                        <div className="grid gap-1.5">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input 
                                id="start_date" 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)} 
                                className="w-40"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input 
                                id="end_date" 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)} 
                                className="w-40"
                            />
                        </div>
                        <Button onClick={handleFilter}>Filter</Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">৳{summary.total_revenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">For selected period</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">৳{profit_report.total_profit.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Estimated margin</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_orders}</div>
                            <p className="text-xs text-muted-foreground">Orders processed</p>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-center">
                        <CardContent className="pt-6">
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => handleExport('pdf')}>
                                    <FileText className="h-4 w-4 mr-2" /> PDF
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => handleExport('csv')}>
                                    <TableIcon className="h-4 w-4 mr-2" /> CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Sales Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={summary.daily_sales}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                        />
                                        <YAxis />
                                        <Tooltip 
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                            formatter={(value) => [`৳${value.toLocaleString()}`, 'Revenue']}
                                        />
                                        <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Sales Source (Online vs Offline)</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-center h-[300px]">
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={source_report}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="total"
                                            nameKey="source"
                                        >
                                            {source_report.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `৳${value.toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {source_report.map((item: any, i: number) => (
                                    <div key={item.source} className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-sm font-medium capitalize">{item.source}</span>
                                        <span className="text-xs text-muted-foreground ml-auto">৳{item.total.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead className="text-right">Quantity Sold</TableHead>
                                    <TableHead className="text-right">Total Revenue</TableHead>
                                    <TableHead className="text-right">Average Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {top_products.map((product: any) => (
                                    <TableRow key={product.name}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="text-right">{product.total_quantity}</TableCell>
                                        <TableCell className="text-right">৳{parseFloat(product.total_revenue).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            ৳{(product.total_revenue / product.total_quantity).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {top_products.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                            No sales found for the selected period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
