import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PaymentHistory({ payments }: { payments: any }) {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Payment Ledger</h1>
                        <p className="text-sm text-muted-foreground">History of all incoming and outgoing payments.</p>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments?.data && payments.data.length > 0 ? (
                                    payments.data.map((payment: any) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{payment.payment_date}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {payment.payable_type.split('\\').pop()}: #{payment.payable_id}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{payment.creator?.name || 'System via User'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={payment.type === 'in' ? 'default' : 'destructive'} className={payment.type === 'in' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                    {payment.type === 'in' ? 'Incoming (Sale)' : 'Outgoing (Payment)'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">{payment.payment_method.replace('_', ' ')}</TableCell>
                                            <TableCell className={`text-right font-bold ${payment.type === 'in' ? 'text-green-600' : 'text-destructive'}`}>
                                                {payment.type === 'in' ? '+' : '-'} Tk. {Number(payment.amount).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No payments found in ledger.</TableCell>
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
