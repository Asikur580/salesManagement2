import { useState, useMemo, useEffect, useRef } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    UserPlus,
    Box,
    X,
    Clock,
    Briefcase,
    Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";

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

interface ServiceTypeItem {
    id: number;
    name: string;
    charge: number;
}

interface PageProps {
    customers: Customer[];
    technicians: { id: number, name: string }[];
    categories: Category[];
    products: Product[];
    serviceTypes: ServiceTypeItem[];
}

export default function ServiceCreate({
    customers,
    technicians,
    categories,
    products,
    serviceTypes,
}: PageProps) {
    const { toast } = useToast();
    const searchInputRef = useRef<HTMLInputElement>(null);

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isNewCustomer, setIsNewCustomer] = useState(false);

    // Checkout Form state
    const { data, setData, post, processing, reset, errors, transform } =
        useForm({
            customer_id: "",
            customer_name: "",
            customer_phone: "",
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
                setIsNewCustomer(false);
            },
        });
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-muted/50 overflow-hidden font-sans">
                <Head title="Create Service Invoice | SalesHub" />
                
                {/* Top Navigation Bar - Dark & Professional (Matching POS) */}
                <header className="sticky top-0 z-50 bg-[#1e293b] text-white h-16 flex items-center justify-between px-4 shrink-0 shadow-lg">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/services"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#334155] hover:bg-[#475569] transition-colors border border-white/5"
                        >
                            <Briefcase className="h-4 w-4" />
                            <span className="text-xs font-semibold">
                                Back to Services
                            </span>
                        </Link>
                        <div className="flex flex-col border-l border-white/10 pl-6">
                            <h1 className="text-lg font-bold leading-tight">
                                Service Invoice
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#10b981]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                                Create New
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <div className="text-sm font-bold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#10b981]" />
                                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-[10px] font-medium text-slate-400">
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </div>
                        </div>
                        <Badge className="bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                            Online
                        </Badge>
                    </div>
                </header>

                {/* Main Content: Split Parts & Cart */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Parts Catalog */}
                    <div className="flex-1 min-w-0 flex flex-col bg-white border-r border-slate-200 relative">
                        {/* Section Header */}
                        <div className="bg-[#cbd5e1] py-2 shrink-0">
                            <h2 className="text-center text-slate-700 font-bold uppercase tracking-[0.2em] text-[10px]">Parts / Products</h2>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4 border-b border-slate-200 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    ref={searchInputRef}
                                    className="pl-12 h-10 bg-slate-100 border-slate-200 rounded text-slate-700"
                                    placeholder="Search parts used..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Products List Header */}
                        <div className="grid grid-cols-[100px_1fr_150px] px-6 py-3 bg-white border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div>Ref.Id</div>
                            <div>Product Description</div>
                            <div className="text-right">Unit Price</div>
                        </div>

                        {/* Products List */}
                        <ScrollArea className="flex-1">
                            <div className="divide-y divide-slate-50">
                                {filteredProducts.map((product) => {
                                    const price =
                                        product.product_type === "simple"
                                            ? product.base_price
                                            : (product.variants?.[0]?.price || product.base_price);
                                    const outOfStock = product.stock <= 0;
                                    const refId = `#${product.id.toString().padStart(4, '0')}`;

                                    return (
                                        <div
                                            key={product.id}
                                            className={`grid grid-cols-[100px_1fr_150px] px-6 py-3 items-center hover:bg-slate-50 transition-colors cursor-pointer group ${outOfStock ? "opacity-60" : ""}`}
                                            onClick={() => !outOfStock && addToCart(product)}
                                        >
                                            <div className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded w-fit border border-slate-100">
                                                {refId}
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-[11px] font-bold text-slate-700 group-hover:text-[#10b981] transition-colors uppercase">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className={`text-[9px] font-bold ${outOfStock ? 'text-orange-500' : 'text-emerald-500'}`}>
                                                        {product.stock} IN STOCK
                                                    </span>
                                                    <span className="text-[9px] font-medium text-slate-400">
                                                        SKU: {product.sku || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-slate-800">
                                                    {Number(price || 0).toLocaleString()}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">TK</span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredProducts.length === 0 && (
                                    <div className="h-80 flex flex-col items-center justify-center text-slate-400">
                                        <Search className="h-8 w-8 opacity-20 mb-4" />
                                        <p className="font-medium text-sm">No items found</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Panel: Service Details & Cart */}
                    <div className="flex-1 flex flex-col bg-white border-l border-slate-200 z-10 shrink-0 overflow-hidden">
                        {/* Customer Selection Header */}
                        <div className="bg-[#d1d5db] flex items-center justify-between px-4 py-2 shrink-0">
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-700">
                                    <UserPlus className="h-3 w-3 text-emerald-600" /> Customer
                                </label>
                            </div>
                            <Button 
                                type="button"
                                variant="outline" 
                                size="sm" 
                                className="h-6 px-3 text-[8px] font-black uppercase rounded bg-white text-emerald-600 border-slate-300 hover:bg-emerald-50 shadow-sm"
                                onClick={() => {
                                    setIsNewCustomer(!isNewCustomer);
                                    setData({ ...data, customer_id: "", customer_name: "", customer_phone: "" });
                                }}
                            >
                                {isNewCustomer ? 'Select Existing' : 'Add New'}
                            </Button>
                        </div>

                        {/* Customer + Service Details */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
                            {isNewCustomer ? (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <Input 
                                        placeholder="Customer Name (Optional)" 
                                        className="h-10 bg-white border-slate-200 rounded text-sm font-bold"
                                        value={data.customer_name}
                                        onChange={(e) => setData("customer_name", e.target.value)}
                                    />
                                    <Input 
                                        placeholder="Phone Number (Required)" 
                                        className={`h-10 bg-white border-slate-200 rounded text-sm font-bold ${errors.customer_phone ? "border-red-500" : ""}`}
                                        value={data.customer_phone}
                                        onChange={(e) => setData("customer_phone", e.target.value)}
                                        required
                                    />
                                    {errors.customer_phone && (
                                        <p className="text-[10px] text-red-500 font-bold">{errors.customer_phone}</p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Select value={data.customer_id} onValueChange={(v) => setData("customer_id", v)}>
                                        <SelectTrigger className={`w-full h-10 bg-white border-slate-200 rounded text-slate-600 text-sm ${errors.customer_id ? "border-red-500" : ""}`}>
                                            <SelectValue placeholder="Select Customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{c.name}</span>
                                                        {c.phone && <span className="text-[10px] text-slate-400">{c.phone}</span>}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.customer_id && <p className="text-[10px] text-red-500 font-bold">{errors.customer_id}</p>}
                                </>
                            )}

                            {/* Technician & Service Type Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Technician</label>
                                    <Select value={data.technician_id} onValueChange={(v) => setData("technician_id", v)}>
                                        <SelectTrigger className={`h-10 bg-white border-slate-200 rounded text-sm ${errors.technician_id ? "border-red-500" : ""}`}>
                                            <SelectValue placeholder="Select Staff" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {technicians.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.technician_id && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.technician_id}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Service Type</label>
                                    <Select value={data.service_type} onValueChange={(v) => {
                                        setData(d => ({
                                            ...d,
                                            service_type: v,
                                            service_charge: serviceTypes.find(st => st.name === v)?.charge || d.service_charge,
                                        }));
                                    }}>
                                        <SelectTrigger className={`h-10 bg-white border-slate-200 rounded text-sm ${errors.service_type ? "border-red-500" : ""}`}>
                                            <SelectValue placeholder="Select Service Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviceTypes.map(st => (
                                                <SelectItem key={st.id} value={st.name}>
                                                    <div className="flex justify-between items-center w-full gap-4">
                                                        <span>{st.name}</span>
                                                        <span className="text-[10px] text-emerald-600 font-bold">{Number(st.charge).toLocaleString()} TK</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.service_type && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.service_type}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Used Parts Section */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="bg-[#cbd5e1] py-2 shrink-0">
                                <h2 className="text-center text-slate-700 font-bold uppercase tracking-[0.2em] text-[10px]">
                                    Used Parts
                                </h2>
                            </div>
                            
                            <ScrollArea className="flex-1">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                                        <Package className="h-16 w-16 mb-4 opacity-20" />
                                        <p className="font-bold text-sm">No parts added yet</p>
                                    </div>
                                ) : (
                                    <div className="p-3 space-y-2">
                                        {cart.map((item) => (
                                            <div key={item.id} className="bg-white border border-slate-200 rounded p-3">
                                                {/* Top Row: Ref ID, Name, Delete */}
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-start gap-2 min-w-0 flex-1">
                                                        <div className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0 mt-0.5">
                                                            #{item.product_id.toString().padStart(3, '0')}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-bold text-xs text-slate-700 leading-tight line-clamp-2">{item.name}</h4>
                                                            {item.variant_name && <p className="text-[9px] text-primary font-bold mt-0.5">{item.variant_name}</p>}
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)} 
                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                {/* Bottom Row: Qty & Price */}
                                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Qty:</span>
                                                        <div className="flex items-center gap-2 bg-slate-50 rounded px-1">
                                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 hover:text-slate-600"><Minus className="h-3 w-3" /></button>
                                                            <span className="text-sm font-black text-slate-700 w-6 text-center">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400 hover:text-slate-600"><Plus className="h-3 w-3" /></button>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase mr-2">Price:</span>
                                                        <span className="text-sm font-black text-slate-800">{(item.price * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        {/* Calculation & Checkout Footer */}
                        <div className="bg-white border-t border-slate-200 p-6">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Service Charge</label>
                                    <Input type="number" className="h-10 bg-white border-slate-200 rounded font-bold" value={data.service_charge || ""} onChange={e => setData("service_charge", Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Discount (Fixed)</label>
                                    <Input type="number" className="h-10 bg-white border-slate-200 rounded font-bold" value={data.discount || ""} onChange={e => setData("discount", Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Tax (%)</label>
                                    <Input type="number" className="h-10 bg-white border-slate-200 rounded font-bold" value={data.tax_percentage || ""} onChange={e => setData("tax_percentage", Number(e.target.value))} />
                                </div>
                            </div>

                            {/* Summary Row */}
                            <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Parts Total</label>
                                    <div className="text-lg font-black text-slate-600">{subtotalParts.toLocaleString()} <span className="text-[10px] text-slate-400">TK</span></div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Service Charge</label>
                                    <div className="text-lg font-black text-slate-600">{Number(data.service_charge || 0).toLocaleString()} <span className="text-[10px] text-slate-400">TK</span></div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Grand Total</label>
                                    <div className="text-2xl font-black text-emerald-600 tracking-tight">{total.toLocaleString()} <span className="text-sm text-slate-400">TK</span></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    className="h-14 bg-[#10b981] hover:bg-[#059669] text-white font-black uppercase tracking-widest rounded-lg shadow-lg shadow-[#10b981]/20 transition-all text-sm"
                                    onClick={handleCheckout}
                                    disabled={processing}
                                >
                                    {processing ? "Saving..." : "Create Invoice"}
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="h-14 bg-[#f43f5e] hover:bg-[#e11d48] text-white font-black uppercase tracking-widest rounded-lg shadow-lg shadow-[#f43f5e]/20 transition-all flex items-center justify-center gap-2 text-sm"
                                    onClick={() => {
                                        setCart([]);
                                        reset();
                                    }}
                                >
                                    <X className="h-5 w-5" /> Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
