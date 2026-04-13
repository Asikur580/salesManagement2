import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Save, ShoppingBag, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";

interface Supplier {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    variants: Array<{ id: number; name: string }>;
}

interface CreateProps {
    suppliers: Supplier[];
    products: Product[];
}

export default function RestockCreate({ suppliers, products }: CreateProps) {
    const { toast } = useToast();
    const { data, setData, post, processing, errors } = useForm({
        supplier_id: "",
        notes: "",
        items: [
            { id: Date.now(), product_id: "", variant_id: "", quantity: 1, cost_price: 0 }
        ],
    });

    const addItem = () => {
        setData("items", [
            ...data.items,
            { id: Date.now(), product_id: "", variant_id: "", quantity: 1, cost_price: 0 }
        ]);
    };

    const removeItem = (id: number) => {
        if (data.items.length === 1) return;
        setData("items", data.items.filter(i => i.id !== id));
    };

    const updateItem = (id: number, field: string, value: any) => {
        const newItems = data.items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'product_id') updated.variant_id = ""; // Reset variant on product change
                return updated;
            }
            return item;
        });
        setData("items", newItems);
    };

    const totalAmount = useMemo(() => {
        return data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.cost_price)), 0);
    }, [data.items]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/restock-orders", {
            onSuccess: () => {},
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/restock-orders">
                        <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">New Restock Order</h1>
                        <p className="text-sm text-muted-foreground">Draft a new procurement order for products</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Order Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Items & Quantities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[300px]">Product / Variant</TableHead>
                                                    <TableHead className="w-[100px]">Quantity</TableHead>
                                                    <TableHead className="w-[120px]">Cost Price</TableHead>
                                                    <TableHead className="w-[120px] text-right">Subtotal</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.items.map((item, index) => {
                                                    const selectedProduct = products.find(p => p.id.toString() === item.product_id);
                                                    return (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="space-y-2">
                                                                <Select value={item.product_id} onValueChange={val => updateItem(item.id, 'product_id', val)}>
                                                                    <SelectTrigger className="h-9">
                                                                        <SelectValue placeholder="Product" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {products.map(p => (
                                                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {selectedProduct && selectedProduct.variants.length > 0 && (
                                                                    <Select value={item.variant_id} onValueChange={val => updateItem(item.id, 'variant_id', val)}>
                                                                        <SelectTrigger className="h-8 text-xs bg-muted/30">
                                                                            <SelectValue placeholder="Select Variant" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {selectedProduct.variants.map(v => (
                                                                                <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input type="number" min={1} className="h-9" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input type="number" min={0} step="0.01" className="h-9" value={item.cost_price} onChange={e => updateItem(item.id, 'cost_price', e.target.value)} />
                                                            </TableCell>
                                                            <TableCell className="text-right text-sm">
                                                                Tk. {(Number(item.quantity) * Number(item.cost_price)).toLocaleString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-destructive h-8 w-8 p-0">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" /> Add Item
                                    </Button>
                                    {errors.items && <p className="text-xs text-destructive mt-2">{errors.items}</p>}
                                </CardContent>
                                <CardFooter className="bg-muted/10 border-t flex justify-between items-center py-4">
                                    <span className="text-muted-foreground">Total Summary</span>
                                    <div className="text-xl font-bold">Tk. {totalAmount.toLocaleString()}</div>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Sidebar Config */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Config</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Select Supplier *</Label>
                                        <Select value={data.supplier_id} onValueChange={val => setData("supplier_id", val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose supplier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {suppliers.map(s => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.supplier_id && <p className="text-xs text-destructive">{errors.supplier_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Order Notes</Label>
                                        <Textarea value={data.notes} onChange={e => setData("notes", e.target.value)} rows={3} placeholder="Optional procurement notes..." />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" /> Save Draft Order
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Alert className="bg-primary/5 border-primary/20">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                                <AlertTitle>Pro Tip</AlertTitle>
                                <AlertDescription>
                                    Inventory levels will only update once the order is marked as **Received**.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

// Minimal Alert proxy if not already in shadcn
function Alert({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${className}`}>{children}</div>
}
function AlertTitle({ children }: { children: React.ReactNode }) {
    return <h5 className="mb-1 font-medium leading-none tracking-tight">{children}</h5>
}
function AlertDescription({ children }: { children: React.ReactNode }) {
    return <div className="text-sm [&_p]:leading-relaxed">{children}</div>
}
