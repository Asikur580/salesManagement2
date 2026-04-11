import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, History as HistoryIcon, ArrowUpRight, ArrowDownLeft, Settings2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Transaction {
    id: number;
    product: { name: string };
    variant: { attribute_values?: any[] } | null;
    user: { name: string } | null;
    type: "in" | "out" | "adjustment" | "return";
    quantity: number;
    balance_after: number;
    reason: string | null;
    created_at: string;
}

interface IndexProps {
    transactions: {
        data: Transaction[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        type?: string;
        per_page?: string | number;
    };
}

export default function StockHistory({ transactions, filters }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [typeFilter, setTypeFilter] = useState(filters.type || "all");

    useEffect(() => {
        const id = setTimeout(() => {
            if (searchTerm !== (filters.search || "") || typeFilter !== (filters.type || "all")) {
                router.get(
                    "/inventory/history",
                    { 
                        search: searchTerm, 
                        type: typeFilter === "all" ? "" : typeFilter,
                        per_page: filters.per_page 
                    },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(id);
    }, [searchTerm, typeFilter]);

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "in": return <Badge className="bg-green-500 hover:bg-green-600"><ArrowUpRight className="h-3 w-3 mr-1" /> Stock In</Badge>;
            case "out": return <Badge variant="destructive"><ArrowDownLeft className="h-3 w-3 mr-1" /> Stock Out</Badge>;
            case "adjustment": return <Badge variant="outline" className="border-blue-500 text-blue-500"><Settings2 className="h-3 w-3 mr-1" /> Adjustment</Badge>;
            case "return": return <Badge className="bg-orange-500 hover:bg-orange-600">Return</Badge>;
            default: return <Badge>{type}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                        <HistoryIcon className="h-8 w-8 text-primary" /> Stock History
                    </h1>
                    <p className="text-muted-foreground">Complete ledger of all inventory movements</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle>Transaction Ledger</CardTitle>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search product..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="in">Stock In</SelectItem>
                                        <SelectItem value="out">Stock Out</SelectItem>
                                        <SelectItem value="adjustment">Adjustment</SelectItem>
                                        <SelectItem value="return">Return</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Product / Variant</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Balance After</TableHead>
                                        <TableHead>Reason / Reference</TableHead>
                                        <TableHead>By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">No transactions found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.data.map((tx) => (
                                            <TableRow key={tx.id}>
                                                <TableCell className="text-xs whitespace-nowrap">
                                                    {format(new Date(tx.created_at), "MMM d, yyyy HH:mm")}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{tx.product.name}</div>
                                                    {tx.variant && (
                                                        <div className="text-[10px] text-muted-foreground uppercase">
                                                            {/* Variant name logic depends on variant object structure */}
                                                            Variant ID: {tx.variant.id}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getTypeBadge(tx.type)}</TableCell>
                                                <TableCell className={`text-right font-bold ${tx.type === 'out' ? 'text-destructive' : 'text-green-600'}`}>
                                                    {tx.type === 'out' ? '-' : '+'}{tx.quantity}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs">{tx.balance_after}</TableCell>
                                                <TableCell className="max-w-[200px] truncate text-xs" title={tx.reason || ""}>
                                                    {tx.reason || "N/A"}
                                                </TableCell>
                                                <TableCell className="text-xs">{tx.user?.name || "System"}</TableCell>
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
