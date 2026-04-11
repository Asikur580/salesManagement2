import { useState, useMemo, useEffect, useRef } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Home,
    CreditCard,
    UserPlus,
    Box,
    X,
    LayoutDashboard,
    Clock,
    Zap,
    Briefcase,
    UserCog,
    Settings,
    FileText,
    Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Types
interface Customer {
    id: number;
    name: string;
    phone: string | null;
}

interface Category {
    id: number;
    name: string;
}

interface VariantAttribute {
    id: number;
    value: string;
    attribute: { name: string };
}

interface ProductVariant {
    id: number;
    price: number;
    stock: number;
    attribute_values: VariantAttribute[];
    images: { id: number; image_path: string }[];
}

interface Product {
    id: number;
    name: string;
    product_type: "simple" | "variant";
    barcode: string | null;
    sku: string | null;
    base_price: number | null;
    stock: number;
    category?: Category;
    images: { id: number; image_path: string; is_primary: boolean }[];
    variants: ProductVariant[];
}

interface CartItem {
    id: string;
    product_id: number;
    variant_id: number | null;
    name: string;
    variant_name: string;
    price: number;
    quantity: number;
    max_stock: number;
    image: string | null;
}

interface PageProps {
    customers: Customer[];
    technicians: { id: number, name: string }[];
    categories: Category[];
    products: Product[];
}

export default function ServiceCreate({
    customers,
    technicians,
    categories,
    products,
}: PageProps) {
    const { toast } = useToast();
    const searchInputRef = useRef<HTMLInputElement>(null);

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
    const [cart, setCart] = useState<CartItem[]>([]);

    // Checkout Form state
    const { data, setData, post, processing, reset, errors, transform } =
        useForm({
            customer_id: "",
            technician_id: "",
            service_type: "",
            service_charge: 0,
            payment_method: "cash",
            discount: 0,
            tax_percentage: 0,
            note: "",
            parts: [] as any[],
        });

    // Filtering
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesCategory = selectedCategoryId === "all" || p.category?.id === selectedCategoryId;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode && p.barcode.includes(searchQuery));
            return matchesCategory && matchesSearch;
        });
    }, [products, searchQuery, selectedCategoryId]);

    const getPrimaryImage = (p: Product) => {
        const primary = p.images?.find((i) => i.is_primary);
        return primary?.image_path || p.images?.[0]?.image_path || null;
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        return `/storage/${path}`;
    };

    const addToCart = (product: Product, variant: ProductVariant | null = null) => {
        if (product.product_type === "variant" && !variant) {
            if (product.variants.length > 0) {
                variant = product.variants[0];
            } else return;
        }

        const cartItemId = variant ? `v_${variant.id}` : `p_${product.id}`;
        const price = variant ? variant.price : product.base_price || 0;
        const maxStock = variant ? variant.stock : product.stock;

        if (maxStock <= 0) {
            toast({ title: "Out of Stock", description: "This part is unavailable.", variant: "destructive" });
            return;
        }

        let variantName = "";
        if (variant) {
            variantName = variant.attribute_values.map((av) => av.value).join(" - ");
        }

        const imagePath = variant?.images?.[0]?.image_path || getPrimaryImage(product);

        setCart((prev) => {
            const existing = prev.find((item) => item.id === cartItemId);
            if (existing) {
                if (existing.quantity >= maxStock) return prev;
                return prev.map((item) => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, {
                id: cartItemId, product_id: product.id, variant_id: variant?.id || null,
                name: product.name, variant_name: variantName, price: Number(price),
                quantity: 1, max_stock: maxStock, image: imagePath,
            }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart((prev) => prev.map((item) => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return { ...item, quantity: Math.max(1, Math.min(newQty, item.max_stock)) };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));

    // Totals
    const subtotalParts = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const subtotal = subtotalParts + Number(data.service_charge || 0);
    const discountAmount = Number(data.discount || 0);
    const totalBeforeTax = subtotal - discountAmount;
    const taxAmount = (totalBeforeTax * Number(data.tax_percentage || 0)) / 100;
    const total = totalBeforeTax + taxAmount;

    const handleCheckout = () => {
        if (!data.customer_id || !data.technician_id || !data.service_type) {
            toast({ title: "Validation Error", description: "Please fill customer, technician, and service type.", variant: "destructive" });
            return;
        }

        transform((oldData) => ({
            ...oldData,
            parts: cart.map(c => ({
                product_id: c.product_id,
                variant_id: c.variant_id,
                quantity: c.quantity,
                unit_price: c.price
            })),
        }));

        post("/services", {
            onSuccess: () => {
                setCart([]);
                reset();
                toast({ title: "Success", description: "Service Invoice created successfully." });
            },
        });
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-muted/50 overflow-hidden font-sans">
                <Head title="Create Service Invoice | SalesHub" />
                
                {/* Header */}
                <header className="sticky top-0 z-50 bg-indigo-950 text-white h-16 flex items-center justify-between px-6 shrink-0 shadow-xl">
                    <div className="flex items-center gap-6">
                        <Link href="/services" className="group flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Back to Services</span>
                        </Link>
                        <div className="h-6 w-px bg-white/10" />
                        <h1 className="text-lg font-bold tracking-tight">Create Service Invoice</h1>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Parts Catalog */}
                    <div className="flex-1 min-w-0 flex flex-col bg-muted border-r border-border">
                        <div className="p-6 bg-card border-b border-border space-y-4 shadow-sm">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    ref={searchInputRef}
                                    className="pl-12 h-12 text-lg bg-muted border-none rounded-2xl"
                                    placeholder="Search parts used..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <ScrollArea className="w-full whitespace-nowrap">
                                <div className="flex gap-2">
                                    <Button variant={selectedCategoryId === "all" ? "default" : "outline"} onClick={() => setSelectedCategoryId("all")} className="rounded-xl px-6">All Parts</Button>
                                    {categories.map((cat) => (
                                        <Button key={cat.id} variant={selectedCategoryId === cat.id ? "default" : "outline"} onClick={() => setSelectedCategoryId(cat.id)} className="rounded-xl px-6">{cat.name}</Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredProducts.map((p) => {
                                    const img = getImageUrl(getPrimaryImage(p));
                                    return (
                                        <Card key={p.id} className="cursor-pointer hover:border-primary transition-all overflow-hidden" onClick={() => addToCart(p)}>
                                            <div className="aspect-square bg-muted relative">
                                                {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><Box /></div>}
                                                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-[10px] font-black">৳{p.base_price?.toLocaleString()}</div>
                                            </div>
                                            <CardContent className="p-3">
                                                <h3 className="text-[11px] font-bold truncate">{p.name}</h3>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-[9px] text-muted-foreground">{p.category?.name || "No Category"}</span>
                                                    <Badge variant={p.stock < 10 ? "destructive" : "secondary"} className="h-4 text-[8px]">{p.stock} in stock</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Panel: Service Details & Cart */}
                    <div className="w-[450px] flex flex-col bg-card border-l border-border shadow-2xl">
                        <div className="p-6 border-b border-border bg-muted/30 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</label>
                                    <Select value={data.customer_id} onValueChange={(v) => setData("customer_id", v)}>
                                        <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select Customer" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {customers.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Technician</label>
                                    <Select value={data.technician_id} onValueChange={(v) => setData("technician_id", v)}>
                                        <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select Staff" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {technicians.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Service Type</label>
                                <Input placeholder="e.g. Engine Repair, General Maintenance" className="h-11 rounded-xl" value={data.service_type} onChange={e => setData("service_type", e.target.value)} />
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4 text-primary" /> Used Parts
                                    {cart.length > 0 && <Badge className="bg-primary/10 text-primary">{cart.length}</Badge>}
                                </h2>
                            </div>
                            <ScrollArea className="flex-1 px-4">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4"><Package className="opacity-20" /></div>
                                        <p className="text-sm font-bold opacity-50">No parts added yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pb-6">
                                        {cart.map(item => (
                                            <div key={item.id} className="bg-card border border-border p-3 rounded-2xl shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-sm truncate w-48">{item.name}</h4>
                                                        {item.variant_name && <p className="text-[9px] text-primary font-bold uppercase">{item.variant_name}</p>}
                                                        <p className="text-xs font-bold mt-1">৳{item.price.toLocaleString()}</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-red-400 h-8 w-8" onClick={() => removeFromCart(item.id)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                                <div className="flex justify-between items-center mt-3">
                                                    <div className="flex items-center bg-muted rounded-lg p-0.5">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                                                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                                                    </div>
                                                    <p className="font-black text-xs">৳{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        <div className="bg-muted/30 border-t border-border p-6 space-y-4 rounded-t-[32px]">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Service Charge</label>
                                    <Input type="number" className="h-11 rounded-xl font-bold bg-white" value={data.service_charge} onChange={e => setData("service_charge", Number(e.target.value))} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tax (%)</label>
                                    <Input type="number" className="h-11 rounded-xl font-bold bg-white" value={data.tax_percentage} onChange={e => setData("tax_percentage", Number(e.target.value))} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Discount (Fixed)</label>
                                <Input type="number" className="h-11 rounded-xl font-bold bg-white" value={data.discount} onChange={e => setData("discount", Number(e.target.value))} />
                            </div>
                            
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold"><span>Service Charge</span><span>৳{Number(data.service_charge || 0).toLocaleString()}</span></div>
                                <div className="flex justify-between text-xs font-bold"><span>Parts Total</span><span>৳{subtotalParts.toLocaleString()}</span></div>
                                <div className="flex justify-between text-xl font-black pt-2 border-t border-dashed">
                                    <span className="text-muted-foreground text-sm uppercase">Grand Total</span>
                                    <span className="text-primary tracking-tighter">৳{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button className="w-full h-14 bg-indigo-600 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl" onClick={handleCheckout} disabled={processing}>
                                {processing ? "Saving..." : "Create Invoice"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
