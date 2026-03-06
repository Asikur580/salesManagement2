import { useState, useEffect } from "react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { router, Link } from "@inertiajs/react";
import { Search, Eye, X, ClipboardList, Filter } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    total_amount: number;
    order_status: string;
    payment_status: string;
    source: string;
    created_at: string;
}

interface OrdersIndexProps {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
        payment_status?: string;
        source?: string;
    };
}

export default function Index({ orders, filters }: OrdersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "all");
    const [paymentFilter, setPaymentFilter] = useState(
        filters.payment_status || "all",
    );
    const [sourceFilter, setSourceFilter] = useState(filters.source || "all");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params: any = {};
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== "all") params.status = statusFilter;
            if (paymentFilter !== "all") params.payment_status = paymentFilter;
            if (sourceFilter !== "all") params.source = sourceFilter;

            router.get("/orders", params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, paymentFilter, sourceFilter]);

    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPaymentFilter("all");
        setSourceFilter("all");
        router.get("/orders");
    };

    const getStatusBadge = (status: string) => {
        const variants: any = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            processing: "bg-blue-100 text-blue-800 border-blue-200",
            shipped: "bg-purple-100 text-purple-800 border-purple-200",
            delivered: "bg-green-100 text-green-800 border-green-200",
            cancelled: "bg-red-100 text-red-800 border-red-200",
        };
        return (
            <Badge variant="outline" className={variants[status] || ""}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getPaymentBadge = (status: string) => {
        const variants: any = {
            pending: "bg-gray-100 text-gray-800 border-gray-200",
            paid: "bg-green-100 text-green-800 border-green-200",
            failed: "bg-red-100 text-red-800 border-red-200",
            partially_paid: "bg-orange-100 text-orange-800 border-orange-200",
        };
        return (
            <Badge variant="outline" className={variants[status] || ""}>
                {status.replace("_", " ").toUpperCase()}
            </Badge>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Orders
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage customer orders, track fulfillment, and
                            update statuses.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3 border-b">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search by order #, customer name or phone..."
                                    className="pl-9 w-full"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="processing">
                                            Processing
                                        </SelectItem>
                                        <SelectItem value="shipped">
                                            Shipped
                                        </SelectItem>
                                        <SelectItem value="delivered">
                                            Delivered
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={paymentFilter}
                                    onValueChange={setPaymentFilter}
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Payment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Payment
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="paid">
                                            Paid
                                        </SelectItem>
                                        <SelectItem value="failed">
                                            Failed
                                        </SelectItem>
                                        <SelectItem value="partially_paid">
                                            Partially Paid
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={sourceFilter}
                                    onValueChange={setSourceFilter}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Sources
                                        </SelectItem>
                                        <SelectItem value="online">
                                            Online
                                        </SelectItem>
                                        <SelectItem value="pos">POS</SelectItem>
                                    </SelectContent>
                                </Select>

                                {(searchTerm ||
                                    statusFilter !== "all" ||
                                    paymentFilter !== "all" ||
                                    sourceFilter !== "all") && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="text-gray-500"
                                    >
                                        <X className="h-4 w-4 mr-1" /> Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="rounded-md border-0 overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="font-semibold">
                                            Order #
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Date
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Customer
                                        </TableHead>
                                        <TableHead className="font-semibold text-right">
                                            Total
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Status
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Payment
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Source
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="h-32 text-center text-gray-500"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <ClipboardList className="h-8 w-8 text-gray-400 mb-2" />
                                                    <p>No orders found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.data.map((order) => (
                                            <TableRow
                                                key={order.id}
                                                className="hover:bg-gray-50/50"
                                            >
                                                <TableCell className="font-medium text-blue-600">
                                                    <Link
                                                        href={`/orders/${order.id}`}
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {format(
                                                        new Date(
                                                            order.created_at,
                                                        ),
                                                        "MMM dd, yyyy",
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.customer_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {order.customer_phone}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    ৳
                                                    {Number(
                                                        order.total_amount,
                                                    ).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(
                                                        order.order_status,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getPaymentBadge(
                                                        order.payment_status,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-gray-100 text-gray-600 capitalize"
                                                    >
                                                        {order.source}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        href={`/orders/${order.id}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {orders.last_page > 1 && (
                            <div className="p-4 border-t flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {orders.data.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">
                                        {orders.total}
                                    </span>{" "}
                                    orders
                                </p>
                                <div className="flex gap-1">
                                    {orders.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || "#"}
                                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                                                !link.url
                                                    ? "cursor-not-allowed opacity-50 bg-gray-50 text-gray-400"
                                                    : link.active
                                                      ? "bg-primary text-primary-foreground border-primary"
                                                      : "bg-white text-gray-700 hover:bg-gray-50"
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                            onClick={(e) =>
                                                !link.url && e.preventDefault()
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
