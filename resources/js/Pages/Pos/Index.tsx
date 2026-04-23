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
    sku: string | null;
    barcode: string | null;
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
    unit?: { abbreviation: string };
    images: { id: number; image_path: string; is_primary: boolean }[];
    variants: ProductVariant[];
}

interface CartItem {
    id: string; // Unique string for cart mapping
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
    categories: Category[];
    products: Product[];
}

export default function PosIndex({
    customers,
    categories,
    products,
}: PageProps) {
    const { toast } = useToast();
    const searchInputRef = useRef<HTMLInputElement>(null);

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<
        number | "all"
    >("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isNewCustomer, setIsNewCustomer] = useState(false);

    // Checkout Form state
    const { data, setData, post, processing, reset, errors, transform } =
        useForm({
            customer_id: "",
            customer_name: "",
            customer_phone: "",
            payment_method: "cash",
            discount: 0,
            discount_type: "fixed",
            tax_percentage: 0,
            paid_amount: 0,
            less_fixed: 0,
            note: "",
            items: [] as any[],
        });

    // Focus scanner on mount
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // Product Filtering
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesCategory =
                selectedCategoryId === "all" ||
                p.category?.id === selectedCategoryId;
            const matchesSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.barcode && p.barcode.includes(searchQuery)) ||
                (p.sku &&
                    p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [products, searchQuery, selectedCategoryId]);

    // Handle Barcode Scan (if exactly one product/variant matches, auto-add)
    useEffect(() => {
        if (!searchQuery) return;

        // Find exact barcode match across simple products AND variants
        let matchedProduct: Product | null = null;
        let matchedVariant: ProductVariant | null = null;

        for (const p of products) {
            if (p.product_type === "simple" && p.barcode === searchQuery) {
                matchedProduct = p;
                break;
            } else if (p.product_type === "variant") {
                const variant = p.variants.find(
                    (v) => v.barcode === searchQuery,
                );
                if (variant) {
                    matchedProduct = p;
                    matchedVariant = variant;
                    break;
                }
            }
        }

        if (matchedProduct) {
            addToCart(matchedProduct, matchedVariant);
            setSearchQuery(""); // clear scanner
        }
    }, [searchQuery, products]);

    const getPrimaryImage = (p: Product) => {
        const primary = p.images?.find((i) => i.is_primary);
        return primary?.image_path || p.images?.[0]?.image_path || null;
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        return `/storage/${path}`;
    };

    const addToCart = (
        product: Product,
        variant: ProductVariant | null = null,
    ) => {
        // If it's a variant product but no variant was provided, we need to show a selector modal.
        // For standard POS speed, if a user clicks a variant product card, we can either:
        // 1. Open a modal.
        // 2. Select the first variant automatically.
        // We will default to opening a native prompt or a simple alert for now to keep it lightweight.
        if (product.product_type === "variant" && !variant) {
            // Simplified handling: Just pick the first variant if they click the generic card
            // In a full production build, you'd throw an actual Dialog here.
            if (product.variants.length > 0) {
                variant = product.variants[0];
            } else {
                return;
            }
        }

        const cartItemId = variant ? `v_${variant.id}` : `p_${product.id}`;
        const price = variant ? variant.price : product.base_price || 0;
        const maxStock = variant ? variant.stock : product.stock;

        if (maxStock <= 0) {
            return;
        }

        let variantName = "";
        if (variant) {
            variantName = variant.attribute_values
                .map((av) => av.value)
                .join(" - ");
        }

        const imagePath =
            variant?.images?.[0]?.image_path || getPrimaryImage(product);

        setCart((prev) => {
            const existing = prev.find((item) => item.id === cartItemId);
            if (existing) {
                if (existing.quantity >= maxStock) {
                    return prev;
                }
                return prev.map((item) =>
                    item.id === cartItemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }

            return [
                ...prev,
                {
                    id: cartItemId,
                    product_id: product.id,
                    variant_id: variant?.id || null,
                    name: product.name,
                    variant_name: variantName,
                    price: Number(price),
                    quantity: 1,
                    max_stock: maxStock,
                    image: imagePath,
                },
            ];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQty = item.quantity + delta;
                    if (newQty > item.max_stock) {
                        return item;
                    }
                    return { ...item, quantity: Math.max(1, newQty) };
                }
                return item;
            }),
        );
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const discountAmount = (subtotal * Number(data.discount || 0)) / 100;
    const total = subtotal - discountAmount - Number(data.less_fixed || 0);

    // Checkout
    const handleCheckout = () => {
        const payloadItems = cart.map((c) => ({
            product_id: c.product_id,
            variant_id: c.variant_id,
            quantity: c.quantity,
            unit_price: c.price,
        }));

        // Use transform to sync the cart items into the form data for the request
        transform((oldData) => ({
            ...oldData,
            items: payloadItems,
        }));

        post("/pos/checkout", {
            onSuccess: (page) => {
                // Only clear if the server didn't send back an error flash
                if (!(page.props.flash as any)?.error) {
                    setCart([]);
                    reset();
                    setIsNewCustomer(false); // Reset to selection mode
                    searchInputRef.current?.focus();
                }
            },
            onError: (err) => {
                // Handled by global flash
            },
        });
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-muted/50 overflow-hidden font-sans selection:bg-primary/10 selection:text-primary">
                <Head title="Point of Sale | Premium POS" />
                
                {/* Top Navigation Bar - Dark & Professional */}
                <header className="sticky top-0 z-50 bg-[#1e293b] text-white h-16 flex items-center justify-between px-4 shrink-0 shadow-lg">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#334155] hover:bg-[#475569] transition-colors border border-white/5"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="text-xs font-semibold">
                                Dashboard
                            </span>
                        </Link>
                        <div className="flex flex-col border-l border-white/10 pl-6">
                            <h1 className="text-lg font-bold leading-tight">
                                Smart POS System
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#10b981]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                                Live Transaction
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <div className="text-sm font-bold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#10b981]" />
                                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} PM
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

                {/* Main Content Split */}
                {/* Main Content: Split Products & Cart */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Products Section */}
                    <div className="flex-1 min-w-0 flex flex-col bg-white border-r border-slate-200 relative">
                        {/* Search Bar - Modern & Clean */}
                        <div className="p-4 bg-slate-50/50 border-b border-slate-200 shrink-0">
                            <h2 className="text-center text-slate-500 font-bold uppercase tracking-[0.2em] text-sm mb-4">Products</h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    ref={searchInputRef}
                                    className="pl-12 h-12 bg-slate-100 border-slate-200 rounded-full focus:ring-0 focus:border-slate-300 placeholder:text-slate-400 text-slate-700"
                                    placeholder="Search Products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Products List Header */}
                        <div className="grid grid-cols-[100px_1fr_150px] px-6 py-3 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div>Ref.Id</div>
                            <div>Product Description</div>
                            <div className="text-right">Unit Price</div>
                        </div>

                        {/* Products List */}
                        <ScrollArea className="flex-1">
                            <div className="divide-y divide-slate-100">
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
                                            className={`grid grid-cols-[100px_1fr_150px] px-6 py-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group ${outOfStock ? "opacity-60" : ""}`}
                                            onClick={() => !outOfStock && addToCart(product)}
                                        >
                                            <div className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md w-fit">
                                                {refId}
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-[10px] font-bold uppercase ${outOfStock ? 'text-orange-500' : 'text-emerald-500'}`}>
                                                        {product.stock} IN STOCK
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-400 uppercase">
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
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Search className="h-8 w-8 opacity-20" />
                                        </div>
                                        <p className="font-medium text-sm">No items found</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Panel: Checkout / Cart */}
                    <div className="flex-1 flex flex-col bg-white border-l border-slate-200 z-10 shrink-0 overflow-hidden">
                        {/* Customer Selection - Refined */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <UserPlus className="h-3 w-3" /> {isNewCustomer ? 'New Customer' : 'Customer'}
                                </label>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    size="sm" 
                                    className={`h-7 px-3 text-[9px] font-black uppercase rounded transition-all ${isNewCustomer ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50'}`}
                                    onClick={() => {
                                        setIsNewCustomer(!isNewCustomer);
                                        setData({ ...data, customer_id: "", customer_name: "", customer_phone: "" });
                                    }}
                                >
                                    {isNewCustomer ? 'Select Existing' : 'Add New'}
                                </Button>
                            </div>

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
                                        <p className="text-[10px] text-red-500 font-bold">
                                            {errors.customer_phone}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Select
                                        value={data.customer_id}
                                        onValueChange={(v) => setData("customer_id", v)}
                                    >
                                        <SelectTrigger className={`w-full h-10 bg-white border-slate-200 rounded text-slate-600 text-sm ${errors.customer_id ? "border-red-500" : ""}`}>
                                            <SelectValue placeholder="Walk-in Customer" />
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
                                    {errors.customer_id && (
                                        <p className="text-[10px] text-red-500 font-bold mt-1">
                                            {errors.customer_id}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Cart Items Section */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                <h2 className="text-center text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                                    Products Will Be Sold
                                </h2>
                            </div>
                            
                            <ScrollArea className="flex-1">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                                        <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
                                        <p className="font-bold text-sm">Cart is empty</p>
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

                        {/* Calculation & Checkout Footer - As per Image */}
                        <div className="bg-white border-t border-slate-200 p-4">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Total Payable</label>
                                    <div className="text-2xl font-black text-slate-800 tracking-tight">
                                        {total.toLocaleString()} <span className="text-xs font-bold text-slate-400">TK</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Paid Amount</label>
                                    <Input
                                        type="number"
                                        className="h-10 bg-white border-slate-200 rounded font-bold"
                                        value={data.paid_amount || ""}
                                        onChange={(e) => setData("paid_amount", Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Change Return</label>
                                    <div className="text-2xl font-black text-emerald-500 tracking-tight">
                                        {Math.max(0, (data.paid_amount || 0) - total).toLocaleString()} <span className="text-xs font-bold text-slate-400">TK</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Discount (%)</label>
                                    <Input
                                        type="number"
                                        className="h-10 bg-white border-slate-200 rounded font-bold"
                                        value={data.discount || ""}
                                        onChange={(e) => setData("discount", Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Less (Fixed)</label>
                                    <Input
                                        type="number"
                                        className="h-10 bg-white border-slate-200 rounded font-bold"
                                        value={data.less_fixed || ""}
                                        onChange={(e) => setData("less_fixed", Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    className="h-12 bg-[#6ee7b7] hover:bg-[#34d399] text-[#065f46] font-black uppercase tracking-widest rounded transition-all"
                                    onClick={handleCheckout}
                                    disabled={processing || cart.length === 0}
                                >
                                    Sale
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="h-12 bg-[#ef4444] hover:bg-[#dc2626] text-white font-black uppercase tracking-widest rounded transition-all flex items-center gap-2"
                                    onClick={() => {
                                        setCart([]);
                                        reset();
                                    }}
                                >
                                    <X className="h-4 w-4" /> Cancel Order
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
