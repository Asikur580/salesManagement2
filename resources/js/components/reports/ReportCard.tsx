import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Package, ShoppingCart } from "lucide-react";

interface ReportCardProps {
    index: number;
    name: string;
    totalSales: number;
    totalQuantity: number;
    orderCount: number;
}

export const ReportCard = ({
    index,
    name,
    totalSales,
    totalQuantity,
    orderCount,
}: ReportCardProps) => {
    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Rank and Name */}
                    <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {index}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{name}</h3>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Total Sales */}
                        <div className="text-center p-3 bg-primary/5 rounded-lg">
                            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
                            <p className="text-xs text-muted-foreground mb-1">Sales</p>
                            <p className="font-bold text-sm">
                                ৳{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        {/* Total Quantity */}
                        <div className="text-center p-3 bg-secondary/50 rounded-lg">
                            <Package className="h-4 w-4 mx-auto mb-1 text-secondary-foreground" />
                            <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                            <p className="font-bold text-sm">{totalQuantity.toLocaleString()}</p>
                        </div>

                        {/* Order Count */}
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <ShoppingCart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground mb-1">Orders</p>
                            <p className="font-bold text-sm">{orderCount}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
