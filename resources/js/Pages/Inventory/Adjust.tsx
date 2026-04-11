import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings2, Package, Layers, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Product {
    id: number;
    name: string;
    stock: number;
    variants: Array<{
        id: number;
        name: string;
        stock: number;
    }>;
}

interface AdjustProps {
    products: Product[];
}

export default function StockAdjustment({ products }: AdjustProps) {
    const { toast } = useToast();
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: "",
        variant_id: "",
        quantity: 1,
        type: "in" as "in" | "out" | "adjustment",
        reason: "",
    });

    const selectedProduct = useMemo(() => {
        return products.find(p => p.id.toString() === selectedProductId);
    }, [selectedProductId, products]);

    const handleProductChange = (val: string) => {
        setSelectedProductId(val);
        setData("product_id", val);
        setData("variant_id", ""); // Reset variant on product change
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/inventory/adjust", {
            onSuccess: () => {
                reset();
                setSelectedProductId("");
                toast({ title: "Success", description: "Stock adjusted successfully" });
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                        <Settings2 className="h-8 w-8 text-primary" /> Stock Adjustment
                    </h1>
                    <p className="text-muted-foreground">Manually add or remove stock for products and variants</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Adjustment Form</CardTitle>
                        <CardDescription>All adjustments will be logged in the transaction history.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Product Selection */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Package className="h-4 w-4" /> Select Product *</Label>
                                <Select value={selectedProductId} onValueChange={handleProductChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Search and select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.product_id && <p className="text-xs text-destructive">{errors.product_id}</p>}
                            </div>

                            {/* Variant Selection (If exists) */}
                            {selectedProduct && selectedProduct.variants.length > 0 && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="flex items-center gap-2"><Layers className="h-4 w-4" /> Select Variant *</Label>
                                    <Select value={data.variant_id} onValueChange={val => setData("variant_id", val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose variant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedProduct.variants.map(v => (
                                                <SelectItem key={v.id} value={v.id.toString()}>{v.name} (Stock: {v.stock})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.variant_id && <p className="text-xs text-destructive">{errors.variant_id}</p>}
                                </div>
                            )}

                            {/* Adjustment Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Adjustment Type *</Label>
                                    <Select value={data.type} onValueChange={(val: any) => setData("type", val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="in">Stock In (Addition)</SelectItem>
                                            <SelectItem value="out">Stock Out (Deduction)</SelectItem>
                                            <SelectItem value="adjustment">General Adjustment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity *</Label>
                                    <Input 
                                        type="number" 
                                        min={1} 
                                        value={data.quantity} 
                                        onChange={e => setData("quantity", parseInt(e.target.value) || 0)} 
                                    />
                                    {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Reason for Adjustment *</Label>
                                <Textarea 
                                    placeholder="e.g., Damaged item, Inventory count correction, etc." 
                                    value={data.reason}
                                    onChange={e => setData("reason", e.target.value)}
                                />
                                {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
                            </div>

                            {data.type === 'out' && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Warning</AlertTitle>
                                    <AlertDescription>
                                        You are about to reduce stock levels. Please ensure this is correct.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="pt-4">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    Apply Adjustment
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
