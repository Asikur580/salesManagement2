import { useState } from "react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { router, Link, Head } from "@inertiajs/react";
import {
    ChevronLeft,
    Package,
    Calendar,
    CreditCard,
    MapPin,
    Phone,
    Mail,
    User,
    CheckCircle2,
    Clock,
    Truck,
    AlertCircle,
    Info,
    Edit3,
} from "lucide-react";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
    id: number;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: any;
    variant: any;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    shipping_address: string;
    billing_address: string | null;
    total_amount: number;
    discount_amount: number;
    shipping_amount: number;
    tax_amount: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    source: string;
    notes: string | null;
    created_at: string;
    cancel_reason: string | null;
    cancelled_by: number | null;
    canceller: any | null;
    items: OrderItem[];
    user: any;
    creator: any;
}

interface OrdersShowProps {
    order: Order;
}

export default function Show({ order }: OrdersShowProps) {
    const { toast } = useToast();
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const handleStatusChange = (
        field: "order_status" | "payment_status",
        value: string,
    ) => {
        setUpdatingStatus(true);
        router.patch(
            `/orders/${order.id}/status`,
            { [field]: value },
            {
                onSuccess: () => {
                    toast({
                        title: "Success",
                        description: "Status updated successfully",
                    });
                },
                onFinish: () => setUpdatingStatus(false),
            },
        );
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
            <Badge
                variant="outline"
                className={`${variants[status] || ""} px-3 py-1 text-sm font-medium`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getPaymentBadge = (status: string) => {
        const variants: any = {
            pending: "bg-muted/80 text-foreground border-border",
            paid: "bg-green-100 text-green-800 border-green-200",
            failed: "bg-red-100 text-red-800 border-red-200",
            partially_paid: "bg-orange-100 text-orange-800 border-orange-200",
        };
        return (
            <Badge
                variant="outline"
                className={`${variants[status] || ""} px-3 py-1 text-sm font-medium`}
            >
                {status.replace("_", " ").toUpperCase()}
            </Badge>
        );
    };

    const subtotal = order.items.reduce(
        (acc, item) => acc + Number(item.total_price),
        0,
    );

    return (
        <DashboardLayout>
            <Head title={`Order #${order.order_number}`} />
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Link
                            href="/orders"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back to Orders
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Order #{order.order_number}
                            </h1>
                            <Badge
                                variant="outline"
                                className="bg-muted/80 text-muted-foreground border-border px-2 py-0 text-xs font-semibold uppercase"
                            >
                                {order.source}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Placed on{" "}
                            {format(
                                new Date(order.created_at),
                                "MMMM dd, yyyy 'at' hh:mm a",
                            )}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                Order Status
                            </span>
                            <Select
                                disabled={updatingStatus}
                                value={order.order_status}
                                onValueChange={(val) =>
                                    handleStatusChange("order_status", val)
                                }
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
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
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                Payment Status
                            </span>
                            <Select
                                disabled={updatingStatus}
                                value={order.payment_status}
                                onValueChange={(val) =>
                                    handleStatusChange("payment_status", val)
                                }
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="failed">
                                        Failed
                                    </SelectItem>
                                    <SelectItem value="partially_paid">
                                        Partially Paid
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {order.order_status === "cancelled" && order.cancel_reason && (
                    <Card className="border-red-200 bg-red-50 shadow-sm overflow-hidden">
                        <div className="flex">
                            <div className="bg-red-500 w-1.5 shrink-0" />
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-red-900 text-sm uppercase flex items-center gap-2">
                                        Cancellation Reason
                                        {order.canceller && (
                                            <span className="text-[10px] font-medium text-red-500 lowercase normal-case">
                                                (Cancelled by:{" "}
                                                {order.canceller.name})
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-red-700 text-sm mt-1 font-medium leading-relaxed">
                                        "{order.cancel_reason}"
                                    </p>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Items and Totals */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-border shadow-sm">
                            <CardHeader className="border-b bg-muted/50 py-4">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    Order Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-4 flex gap-4"
                                        >
                                            <div className="h-16 w-16 rounded-lg bg-muted border flex items-center justify-center overflow-hidden shrink-0">
                                                {item.product?.primary_image ? (
                                                    <img
                                                        src={
                                                            item.product
                                                                .primary_image
                                                                .image_path
                                                        }
                                                        alt={item.product_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-foreground truncate">
                                                    {item.product_name}
                                                </h4>
                                                {item.variant_name && (
                                                    <p className="text-xs text-muted-foreground font-medium">
                                                        {item.variant_name}
                                                    </p>
                                                )}
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    ৳
                                                    {Number(
                                                        item.unit_price,
                                                    ).toFixed(2)}{" "}
                                                    × {item.quantity}
                                                </div>
                                            </div>
                                            <div className="text-right font-bold text-foreground">
                                                ৳
                                                {Number(
                                                    item.total_price,
                                                ).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-muted/30">
                                    <div className="space-y-3 max-w-sm ml-auto">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Subtotal
                                            </span>
                                            <span className="font-medium">
                                                ৳{Number(subtotal).toFixed(2)}
                                            </span>
                                        </div>
                                        {Number(order.tax_amount) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Tax
                                                </span>
                                                <span className="font-medium">
                                                    ৳
                                                    {Number(
                                                        order.tax_amount,
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        {Number(order.shipping_amount) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Shipping
                                                </span>
                                                <span className="font-medium text-green-600">
                                                    + ৳
                                                    {Number(
                                                        order.shipping_amount,
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        {Number(order.discount_amount) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Discount
                                                </span>
                                                <span className="font-medium text-red-600">
                                                    - ৳
                                                    {Number(
                                                        order.discount_amount,
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        <Separator className="my-2" />
                                        <div className="flex justify-between text-lg">
                                            <span className="font-black italic uppercase">
                                                Total
                                            </span>
                                            <span className="font-black text-primary text-xl">
                                                ৳
                                                {Number(
                                                    order.total_amount,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {order.notes && (
                            <Card className="border-border shadow-sm">
                                <CardHeader className="py-4 border-b">
                                    <CardTitle className="text-md font-bold flex items-center gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        Customer Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 italic text-muted-foreground text-sm">
                                    "{order.notes}"
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Customer and Payment Details */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <Card className="border-border shadow-sm">
                            <CardHeader className="py-4 border-b">
                                <CardTitle className="text-md font-bold flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Customer Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted/80 flex items-center justify-center font-bold text-muted-foreground border">
                                        {order.customer_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground">
                                            {order.customer_name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            ID: #{order.user_id || "Guest"}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {order.customer_phone}
                                    </div>
                                    {order.customer_email && (
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            {order.customer_email}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping and Billing */}
                        <Card className="border-border shadow-sm">
                            <CardHeader className="py-4 border-b">
                                <CardTitle className="text-md font-bold flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    Address Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                                        Shipping Address
                                    </h4>
                                    <p className="text-sm text-card-foreground leading-relaxed font-medium">
                                        {order.shipping_address}
                                    </p>
                                </div>
                                {order.billing_address && (
                                    <div>
                                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                                            Billing Address
                                        </h4>
                                        <p className="text-sm text-card-foreground leading-relaxed font-medium">
                                            {order.billing_address}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Details */}
                        <Card className="border-border shadow-sm">
                            <CardHeader className="py-4 border-b">
                                <CardTitle className="text-md font-bold flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    Payment Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">
                                        Method
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="bg-muted uppercase font-bold text-[10px]"
                                    >
                                        {order.payment_method.replace("_", " ")}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">
                                        Status
                                    </span>
                                    {getPaymentBadge(order.payment_status)}
                                </div>
                                <div className="pt-2 border-t mt-2">
                                    <p className="text-[10px] text-muted-foreground flex items-start gap-2 italic">
                                        <Info className="h-3 w-3 mt-0.5" />
                                        This order was{" "}
                                        {order.payment_status === "paid"
                                            ? "fully paid"
                                            : "not fully paid"}{" "}
                                        using {order.payment_method}.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
