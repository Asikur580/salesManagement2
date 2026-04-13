import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
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
} from "lucide-react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { router } from "@inertiajs/react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface OrderItem {
    id: number;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: string;
    total_price: string;
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
    subtotal: string;
    total_amount: string;
    payment_method: string;
    payment_status: string;
    order_status: string;
    status: string;
    order_date: string;
    created_at: string;
    cancel_reason: string | null;
    cancelled_by: number | null;
    canceller: any | null;
    items: OrderItem[];
}

interface Props {
    order: Order;
}

export default function OrderDetails({ order }: Props) {
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "delivered":
            case "completed":
                return "bg-green-100 text-green-700 border-green-200";
            case "shipped":
                return "bg-purple-100 text-purple-700 border-purple-200";
            case "processing":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "pending":
                return "bg-orange-100 text-orange-700 border-orange-200";
            case "cancelled":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-muted/80 text-card-foreground border-border";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case "delivered":
            case "completed":
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case "shipped":
                return <Truck className="h-5 w-5 text-purple-600" />;
            case "processing":
                return <Package className="h-5 w-5 text-blue-600" />;
            case "pending":
                return <Clock className="h-5 w-5 text-orange-600" />;
            case "cancelled":
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Package className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const { toast } = useToast();

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const handleCancelOrder = () => {
        setCancelModalOpen(true);
    };

    const submitCancellation = () => {
        if (!cancelReason.trim()) {
            return;
        }

        router.post(
            route("account.orders.cancel", order.id),
            {
                reason: cancelReason,
            },
            {
                onSuccess: () => {
                    setCancelModalOpen(false);
                    setCancelReason("");
                },
                onError: (errors) => {},
            },
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <ShopLayout>
            <Head title={`Order ${order.order_number} | CarMart`} />

            <div className="bg-muted/50 py-12 px-4 md:px-8 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Link
                                href={route("account.index")}
                                className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-4 uppercase tracking-widest"
                            >
                                <ChevronLeft className="h-4 w-4" /> Back to
                                Orders
                            </Link>
                            <h1 className="text-4xl font-black italic uppercase italic">
                                Order{" "}
                                <span className="text-primary">Details</span>
                            </h1>
                            <p className="text-muted-foreground font-medium mt-1">
                                Summary of Order #{order.order_number}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {order.status.toLowerCase() === "pending" && (
                                <Button
                                    onClick={handleCancelOrder}
                                    variant="outline"
                                    className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-black text-[10px] uppercase tracking-widest h-9 px-6 transition-all shadow-sm"
                                >
                                    Cancel Order
                                </Button>
                            )}
                            <span
                                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border flex items-center gap-2 ${getStatusColor(order.status)}`}
                            >
                                {getStatusIcon(order.status)}
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {order.status.toLowerCase() === "cancelled" &&
                        order.cancel_reason && (
                            <div className="mb-8 bg-red-50 border border-red-100 rounded-[2rem] p-6 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-red-900 text-sm uppercase italic mb-1">
                                        Cancellation Reason
                                        {order.canceller && (
                                            <span className="text-[10px] font-bold text-red-500 normal-case ml-2 italic">
                                                (Cancelled by:{" "}
                                                {order.canceller.name})
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-red-700 text-sm font-medium leading-relaxed">
                                        "{order.cancel_reason}"
                                    </p>
                                </div>
                            </div>
                        )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Order Info */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Items Card */}
                            <div className="bg-card rounded-[2.5rem] shadow-sm border border-border p-8 overflow-hidden">
                                <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    Order Items
                                </h2>

                                <div className="space-y-6">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 md:gap-6 items-center"
                                        >
                                            <Link
                                                href={route("shop.product.show", item.product?.slug)}
                                                className="w-20 h-20 bg-muted rounded-2xl overflow-hidden border border-border shrink-0 hover:border-primary transition-colors"
                                            >
                                                <img
                                                    src={
                                                        item.product?.primary_image?.image_path
                                                            ? (item.product.primary_image.image_path.startsWith("http") || item.product.primary_image.image_path.startsWith("/storage/"))
                                                                ? item.product.primary_image.image_path
                                                                : `/storage/${item.product.primary_image.image_path}`
                                                            : `https://placehold.co/200x200?text=${item.product_name[0]}`
                                                    }
                                                    alt={item.product_name}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            </Link>
                                            <div className="flex-1">
                                                <Link
                                                    href={route("shop.product.show", item.product?.slug)}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    <h4 className="font-black text-foreground leading-tight mb-1">
                                                        {item.product_name}
                                                    </h4>
                                                </Link>
                                                {item.variant_name && (
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                        {item.variant_name}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2">
                                                    <p className="text-xs font-bold text-muted-foreground italic">
                                                        ৳
                                                        {parseFloat(
                                                            item.unit_price,
                                                        ).toLocaleString()}{" "}
                                                        × {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-foreground">
                                                    ৳
                                                    {parseFloat(
                                                        item.total_price,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-8" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="text-foreground">
                                            ৳
                                            {parseFloat(
                                                order.subtotal,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                                        <span>Delivery Fee</span>
                                        <span className="text-green-600">
                                            FREE
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-lg font-black italic uppercase">
                                            Total
                                        </span>
                                        <span className="text-2xl font-black text-primary">
                                            ৳
                                            {parseFloat(
                                                order.total_amount,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-card rounded-[2rem] shadow-sm border border-border p-8">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Shipping
                                        Address
                                    </h3>
                                    <p className="text-sm font-bold text-card-foreground leading-relaxed italic">
                                        {order.customer_name}
                                        <br />
                                        {order.shipping_address}
                                        <br />
                                        {order.customer_phone}
                                    </p>
                                </div>
                                <div className="bg-card rounded-[2rem] shadow-sm border border-border p-8">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />{" "}
                                        Payment Info
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                                Method
                                            </p>
                                            <p className="text-sm font-bold text-card-foreground uppercase italic">
                                                {order.payment_method === "cod"
                                                    ? "Cash on Delivery"
                                                    : "Online Payment"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                                Status
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={`rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest ${
                                                    order.payment_status ===
                                                    "paid"
                                                        ? "bg-green-50 text-green-700 border-green-100"
                                                        : "bg-orange-50 text-orange-700 border-orange-100"
                                                }`}
                                            >
                                                {order.payment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-card rounded-[2.5rem] shadow-sm border border-border p-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 italic">
                                    Order Timeline
                                </h3>
                                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted/80">
                                    <div className="relative pl-10">
                                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500 border-4 border-white shadow-sm" />
                                        <p className="text-xs font-black uppercase tracking-tight text-foreground italic">
                                            Order Placed
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                            {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                    <div className="relative pl-10">
                                        <div
                                            className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                                                [
                                                    "processing",
                                                    "shipped",
                                                    "delivered",
                                                    "completed",
                                                ].includes(
                                                    order.status.toLowerCase(),
                                                )
                                                    ? "bg-green-500"
                                                    : order.status.toLowerCase() ===
                                                        "cancelled"
                                                      ? "bg-gray-200"
                                                      : "bg-gray-200"
                                            }`}
                                        />
                                        <p className="text-xs font-black uppercase tracking-tight text-foreground italic">
                                            Processing
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                            {[
                                                "processing",
                                                "shipped",
                                                "delivered",
                                                "completed",
                                            ].includes(
                                                order.status.toLowerCase(),
                                            )
                                                ? "On Progress"
                                                : order.status.toLowerCase() ===
                                                    "cancelled"
                                                  ? "Cancelled"
                                                  : "Waiting"}
                                        </p>
                                    </div>
                                    <div className="relative pl-10">
                                        <div
                                            className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                                                [
                                                    "shipped",
                                                    "delivered",
                                                    "completed",
                                                ].includes(
                                                    order.status.toLowerCase(),
                                                )
                                                    ? "bg-green-500"
                                                    : "bg-gray-200"
                                            }`}
                                        />
                                        <p className="text-xs font-black uppercase tracking-tight text-foreground italic">
                                            Shipped
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                            {[
                                                "shipped",
                                                "delivered",
                                                "completed",
                                            ].includes(
                                                order.status.toLowerCase(),
                                            )
                                                ? "Out for Delivery"
                                                : "Waiting"}
                                        </p>
                                    </div>
                                    <div className="relative pl-10">
                                        <div
                                            className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                                                [
                                                    "delivered",
                                                    "completed",
                                                ].includes(
                                                    order.status.toLowerCase(),
                                                )
                                                    ? "bg-green-500"
                                                    : order.status.toLowerCase() ===
                                                        "cancelled"
                                                      ? "bg-red-500"
                                                      : "bg-gray-200"
                                            }`}
                                        />
                                        <p className="text-xs font-black uppercase tracking-tight text-foreground italic">
                                            {order.status.toLowerCase() ===
                                            "cancelled"
                                                ? "Cancelled"
                                                : "Delivered"}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                            {order.status.toLowerCase() ===
                                            "cancelled"
                                                ? "Order Cancelled"
                                                : [
                                                        "delivered",
                                                        "completed",
                                                    ].includes(
                                                        order.status.toLowerCase(),
                                                    )
                                                  ? "Handed to Customer"
                                                  : "Waiting"}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => {
                                        window.location.href = route(
                                            "account.orders.invoice",
                                            order.id,
                                        );
                                    }}
                                    className="w-full mt-10 bg-black hover:bg-primary text-white py-6 rounded-2xl font-black transition-all group overflow-hidden relative"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        DOWNLOAD INVOICE{" "}
                                        <Package className="h-4 w-4" />
                                    </span>
                                </Button>
                            </div>

                            <div className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-100">
                                <h4 className="font-black text-foreground text-sm uppercase italic mb-2">
                                    Need Help?
                                </h4>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6">
                                    If you have any questions regarding your
                                    order, please contact our support team.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-card-foreground">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-black">
                                            +880 1XXX-XXXXXX
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-card-foreground">
                                        <Mail className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-black">
                                            support@carmart.com
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic uppercase">
                            Cancel <span className="text-primary">Order</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label
                            htmlFor="reason"
                            className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block"
                        >
                            Reason for Cancellation
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Please tell us why you want to cancel..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="h-32 rounded-2xl border-border focus:border-primary focus:ring-[#FF4E00]/10 transition-all font-medium text-sm"
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setCancelModalOpen(false)}
                            className="font-bold text-xs uppercase tracking-widest rounded-xl h-12"
                        >
                            Wait, Keep it
                        </Button>
                        <Button
                            onClick={submitCancellation}
                            className="bg-black hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl h-12 transition-all px-8"
                        >
                            Cancel Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ShopLayout>
    );
}
