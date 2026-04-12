import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DailySalesProps {
    sales: any[];
}

export default function DailySales({ sales = [] }: DailySalesProps) {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Daily Sales</h1>
                    <p className="text-sm text-muted-foreground">Monitor your gross daily sales performance.</p>
                </div>
                
                <Card>
                    <CardHeader><CardTitle>Sales Ledger (Last 30 Days)</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-center">Total Orders</TableHead>
                                    <TableHead className="text-right">Gross Sales</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.length > 0 ? (
                                    sales.map((record, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{record.date}</TableCell>
                                            <TableCell className="text-center">{record.total_orders}</TableCell>
                                            <TableCell className="text-right text-green-600 font-bold">
                                                Tk. {Number(record.total_sales).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            No sales data available.
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
