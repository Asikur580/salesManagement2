import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Cashbook({ ledger, currentBalance }: { ledger?: any[], currentBalance?: number }) {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Cashbook</h1>
                        <p className="text-sm text-muted-foreground">Running balance and cash ledger.</p>
                    </div>
                    
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4 flex items-center gap-4">
                            <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
                            <span className={`text-2xl font-bold ${(currentBalance ?? 0) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                                Tk. {Number(currentBalance || 0).toLocaleString()}
                            </span>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader><CardTitle>Cash Flow Ledger</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Transaction</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Cash In</TableHead>
                                    <TableHead className="text-right">Cash Out</TableHead>
                                    <TableHead className="text-right font-bold border-l">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ledger && ledger.length > 0 ? (
                                    ledger.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="whitespace-nowrap">{row.date}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{row.transaction_type}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.source_or_method || '-'} {row.description ? `(${row.description})` : ''}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={row.type === 'in' ? 'text-green-600 border-green-600' : 'text-destructive border-destructive'}>
                                                    {row.type === 'in' ? 'IN' : 'OUT'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">
                                                {row.type === 'in' ? `+ ${Number(row.amount).toLocaleString()}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right text-destructive font-medium">
                                                {row.type === 'out' ? `- ${Number(row.amount).toLocaleString()}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-bold border-l bg-muted/20">
                                                Tk. {Number(row.balance).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No transactions recorded yet.
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
