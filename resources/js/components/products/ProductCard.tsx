import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, PackagePlus, PackageMinus, History, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface Product {
    id: number;
    categoryId: number;
    brandId: number;
    name: string;
    packSize: string;
    purchasePrice: number;
    salePrice: number;
    flatPrice: number;
    quantity: number;
    expirationDate: Date | null;
    image: string;
}

interface ProductCardProps {
    product: Product;
    categoryName: string;
    brandName: string;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
    onStockIn: (id: number) => void;
    onStockOut: (id: number) => void;
    onHistory: (id: number) => void;
    lowStockThreshold: number;
}

export const ProductCard = ({
    product,
    categoryName,
    brandName,
    isSelected,
    onToggleSelect,
    onEdit,
    onDelete,
    onStockIn,
    onStockOut,
    onHistory,
    lowStockThreshold,
}: ProductCardProps) => {
    const { user } = useAuth();
    const isLowStock = product.quantity <= lowStockThreshold;
    const isExpiringSoon = product.expirationDate &&
        product.expirationDate.getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000;

    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Header with Checkbox and Image */}
                    <div className="flex items-start gap-3">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleSelect(product.id)}
                            className="mt-1"
                        />
                        {product.image && (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-16 w-16 rounded-md object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{categoryName}</Badge>
                                <Badge variant="outline" className="text-xs">{brandName}</Badge>
                                {product.packSize && (
                                    <Badge variant="secondary" className="text-xs">{product.packSize}</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                            <p className="text-muted-foreground text-xs">Purchase</p>
                            <p className="font-semibold">৳{product.purchasePrice}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Sale</p>
                            <p className="font-semibold">৳{product.salePrice}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Flat</p>
                            <p className="font-semibold">৳{product.flatPrice}</p>
                        </div>
                    </div>

                    {/* Quantity and Expiry */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Quantity</p>
                            <Badge variant={isLowStock ? "destructive" : "default"}>
                                {product.quantity} units
                            </Badge>
                        </div>
                        {product.expirationDate && (
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Expiry</p>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span className={`text-xs font-medium ${isExpiringSoon ? 'text-destructive' : ''}`}>
                                        {format(product.expirationDate, "MMM dd, yyyy")}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onStockIn(product.id)}
                            className="w-full"
                        >
                            <PackagePlus className="h-4 w-4 mr-1" />
                            Stock In
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onStockOut(product.id)}
                            className="w-full"
                        >
                            <PackageMinus className="h-4 w-4 mr-1" />
                            Stock Out
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {user?.permissions?.includes('product.update') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(product)}
                            className="w-full"
                        >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onHistory(product.id)}
                            className="w-full"
                        >
                            <History className="h-4 w-4 mr-1" />
                            History
                        </Button>
                        {user?.permissions?.includes('product.delete') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(product.id)}
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
