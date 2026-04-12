import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfitLossProps {
    totalRevenue: number;
    totalExpenses: number;
    totalPurchases: number;
    netProfit: number;
}

export default function ProfitLoss({ totalRevenue = 0, totalExpenses = 0, totalPurchases = 0, netProfit = 0 }: ProfitLossProps) {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Profit & Loss Statement</h1>
                    <p className="text-sm text-muted-foreground">Financial summary of revenues against all expenses and costs.</p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-600">Total Revenue (Cash In)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Tk. {totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">From all sales transactions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-destructive">Total Costs & Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">Tk. {(totalExpenses + totalPurchases).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Expenses (Tk. {totalExpenses.toLocaleString()}) + Purchases (Tk. {totalPurchases.toLocaleString()})</p>
                        </CardContent>
                    </Card>
                    <Card className={netProfit >= 0 ? "bg-green-500/10" : "bg-destructive/10"}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
                                Tk. {netProfit.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {netProfit >= 0 ? "Your business is operating at a profit." : "Your business is currently at a loss."}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
