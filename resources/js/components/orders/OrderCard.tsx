import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Check, Pencil, Trash2, Calendar, DollarSign, User, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { Order } from "@/components/orders/OrderFormDialog";
import { useAuth } from "@/hooks/useAuth";

interface OrderCardProps {
    order: Order;
    onView: (order: Order) => void;
    onInvoice: (order: Order) => void;
    onApprove: (order: Order) => void;
    onEdit: (order: Order) => void;
    onDelete: (order: Order) => void;
    getStatusBadgeVariant: (status: Order["status"]) => "default" | "secondary" | "outline" | "destructive";
}

export const OrderCard = ({
    order,
    onView,
    onInvoice,
    onApprove,
    onEdit,
    onDelete,
    getStatusBadgeVariant,
}: OrderCardProps) => {
    const { user } = useAuth();
    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Header with Order ID and Status */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-lg">{order.id}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(order.date), "MMM dd, yyyy")}
                                </span>
                            </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                        </Badge>
                    </div>

                    {/* Customer and Employee Info */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Customer</p>
                                <p className="text-sm font-medium">{order.customerName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Employee</p>
                                <p className="text-sm font-medium">{order.employeeName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <span className="text-sm text-muted-foreground">Total Amount</span>
                        </div>
                        <span className="text-lg font-bold">৳{order.total.toFixed(2)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(order)}
                            className="w-full"
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                        {user?.permissions?.includes('order.print') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onInvoice(order)}
                                className="w-full"
                            >
                                <FileText className="h-4 w-4 mr-1" />
                                Invoice
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {order.status === "pending" && user?.permissions?.includes('order.approve') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onApprove(order)}
                                className="w-full text-green-600 hover:text-green-600"
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                            </Button>
                        )}
                        {user?.permissions?.includes('order.update') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(order)}
                            className={order.status === "pending" ? "w-full" : "col-span-2 w-full"}
                        >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        )}
                        {user?.permissions?.includes('order.delete') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(order)}
                            className="w-full text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
