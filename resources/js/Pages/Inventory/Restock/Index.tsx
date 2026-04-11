import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Eye,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Order {
    id: number;
    order_number: string;
    supplier: { name: string };
    status: "pending" | "received" | "cancelled";
    total_amount: number;
    received_at: string | null;
    created_at: string;
    creator: { name: string } | null;
}

interface IndexProps {
    orders: {
        data: Order[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
        per_page?: string | number;
    };
}

export default function RestockIndex({ orders, filters }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "all");

    useEffect(() => {
        const id = setTimeout(() => {
            if (searchTerm !== (filters.search || "") || statusFilter !== (filters.status || "all")) {
                router.get(
                    "/restock-orders",
                    { 
                        search: searchTerm, 
                        status: statusFilter === "all" ? "" : statusFilter,
                        per_page: filters.per_page 
                    },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(id);
    }, [searchTerm, statusFilter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending": return <Badge variant="outline" className="text-orange-500 border-orange-500 bg-orange-50"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
            case "received": return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Received</Badge>;
            case "cancelled": return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                            <Truck className="h-8 w-8 text-primary" /> Restock Orders
                        </h1>
                        <p className="text-muted-foreground">Manage and track product procurement from suppliers</p>
                    </div>
                    <Link href="/restock-orders/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Restock Order
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle>Procurement List</CardTitle>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Order #..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="received">Received</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order Info</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Received At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">No restock orders found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.data.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>
                                                    <div className="font-bold">{order.order_number}</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        Created: {format(new Date(order.created_at), "MMM d, yyyy")}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-sm">{order.supplier.name}</TableCell>
                                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                <TableCell className="text-right font-mono text-xs">
                                                    Tk. {Number(order.total_amount).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {order.received_at ? format(new Date(order.received_at), "MMM d, yyyy HH:mm") : "---"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/restock-orders/${order.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4 mr-2" /> View
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
