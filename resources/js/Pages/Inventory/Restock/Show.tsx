import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
    Truck, 
    Calendar, 
    User, 
    FileText, 
    PackageCheck, 
    ArrowLeft, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Order {
    id: number;
    order_number: string;
    status: "pending" | "received" | "cancelled";
    notes: string | null;
    total_amount: number;
    received_at: string | null;
    created_at: string;
    supplier: { name: string; email: string; phone: string };
    creator: { name: string } | null;
    items: Array<{
        id: number;
        quantity: number;
        cost_price: number;
        total_price: number;
        product: { name: string };
        variant: { attribute_values?: any[] } | null;
    }>;
}

interface ShowProps {
    order: Order;
}

export default function RestockShow({ order }: ShowProps) {
    const { toast } = useToast();

    const handleReceive = () => {
        router.post(`/restock-orders/${order.id}/receive`, {}, {
            onSuccess: () => toast({ title: "Success", description: "Stock updated successfully" }),
        });
    };

    const handleDelete = () => {
        router.delete(`/restock-orders/${order.id}`, {
            onSuccess: () => toast({ title: "Success", description: "Order deleted" }),
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending": return <Badge className="bg-orange-500 hover:bg-orange-600"><Clock className="h-3 w-3 mr-1" /> Pending Receipt</Badge>;
            case "received": return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Fully Received</Badge>;
            case "cancelled": return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/restock-orders">
                            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {order.order_number} {getStatusBadge(order.status)}
                            </h1>
                            <p className="text-sm text-muted-foreground">Procurement Details & Items Ledger</p>
                        </div>
                    </div>

                    {order.status === 'pending' && (
                        <div className="flex gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Cancel Order</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This will delete the restock request. This cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Back</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Order</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        <PackageCheck className="h-4 w-4 mr-2" /> Mark as Received
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Receipt of Goods</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Have all items arrived? Marking as received will **immediately increase stock levels** in the inventory system for all items in this order.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleReceive} className="bg-green-600 hover:bg-green-700">Confirm & Update Stock</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ordered Items</CardTitle>
                                <CardDescription>Products requested from the supplier</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Unit cost</TableHead>
                                            <TableHead className="text-right">Total Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-medium">{item.product.name}</div>
                                                    {item.variant && <div className="text-[10px] text-muted-foreground uppercase">Variant: {item.id}</div>}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                                                <TableCell className="text-right font-mono text-xs">Tk. {Number(item.cost_price).toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-mono text-xs">Tk. {Number(item.total_price).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter className="bg-muted/10 flex justify-between items-center py-6">
                                <span className="font-semibold">Grand Total</span>
                                <span className="text-2xl font-bold text-primary">Tk. {Number(order.total_amount).toLocaleString()}</span>
                            </CardFooter>
                        </Card>

                        {order.notes && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Meta Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground text-[10px] uppercase">Supplier</Label>
                                    <div className="flex items-center gap-2 font-medium">
                                        <Truck className="h-4 w-4 text-primary" /> {order.supplier.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground pl-6">{order.supplier.phone}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground text-[10px] uppercase">Status</Label>
                                    <div className="flex items-center gap-2 py-1">
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground text-[10px] uppercase">Requested Date</Label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" /> {format(new Date(order.created_at), "PPP p")}
                                    </div>
                                </div>
                                {order.received_at && (
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-[10px] uppercase text-green-600 border-green-200">Received Date</Label>
                                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                            <PackageCheck className="h-4 w-4" /> {format(new Date(order.received_at), "PPP p")}
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground text-[10px] uppercase">Created By</Label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground" /> {order.creator?.name || "System"}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
