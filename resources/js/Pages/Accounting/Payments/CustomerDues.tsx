import { useState } from "react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "@inertiajs/react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDues({ orders }: { orders: any }) {
    const { toast } = useToast();
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        payable_type: "App\\Models\\Order",
        payable_id: "",
        amount: "",
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: "cash",
        type: "in",
        note: ""
    });

    const openPaymentModal = (order: any) => {
        setSelectedOrder(order);
        setData("payable_id", order.id.toString());
        setData("amount", (Number(order.total_amount) - Number(order.paid_amount)).toString());
        setIsPaymentOpen(true);
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        post("/accounting/payments", {
            onSuccess: () => {
                setIsPaymentOpen(false);
                reset();
            }
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Customer Dues</h1>
                        <p className="text-sm text-muted-foreground">Orders with pending or partial payments.</p>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order No.</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Paid</TableHead>
                                    <TableHead className="text-destructive font-bold">Due Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders?.data && orders.data.length > 0 ? (
                                    orders.data.map((order: any) => {
                                        const due = Number(order.total_amount) - Number(order.paid_amount);
                                        return (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.order_number}</TableCell>
                                                <TableCell>{order.customer_name}<br/><span className="text-xs text-muted-foreground">{order.customer_phone}</span></TableCell>
                                                <TableCell>Tk. {Number(order.total_amount).toLocaleString()}</TableCell>
                                                <TableCell className="text-green-600">Tk. {Number(order.paid_amount).toLocaleString()}</TableCell>
                                                <TableCell className="text-destructive font-bold">Tk. {due.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={order.payment_status === 'pending' ? 'destructive' : 'secondary'}>
                                                        {order.payment_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" onClick={() => openPaymentModal(order)}>Receive Payment</Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No pending dues.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Receive Payment - {selectedOrder?.order_number}</DialogTitle></DialogHeader>
                        <form onSubmit={submitPayment} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Amount (Tk)</Label>
                                    <Input type="number" step="0.01" value={data.amount} onChange={e => setData("amount", e.target.value)} />
                                    {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <Input type="date" value={data.payment_date} onChange={e => setData("payment_date", e.target.value)} />
                                    {errors.payment_date && <p className="text-sm text-destructive">{errors.payment_date}</p>}
                                </div>
                            </div>
                            
                            <div>
                                <Label>Method</Label>
                                <Select value={data.payment_method} onValueChange={v => setData("payment_method", v)}>
                                    <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <Button type="submit" className="w-full" disabled={processing}>Confirm Payment</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
