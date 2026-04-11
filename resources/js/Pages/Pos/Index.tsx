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

    // Checkout Form state
    const { data, setData, post, processing, reset, errors, transform } =
        useForm({
            customer_id: "",
            payment_method: "cash",
            discount: 0,
            discount_type: "fixed",
            tax_percentage: 0,
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
                toast({
                    title: "Error",
                    description: "This product has no configured variants.",
                    variant: "destructive",
                });
                return;
            }
        }

        const cartItemId = variant ? `v_${variant.id}` : `p_${product.id}`;
        const price = variant ? variant.price : product.base_price || 0;
        const maxStock = variant ? variant.stock : product.stock;

        if (maxStock <= 0) {
            toast({
                title: "Out of Stock",
                description: `${product.name} ${variant ? "variant" : ""} is currently unavailable.`,
                variant: "destructive",
            });
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
                    toast({
                        title: "Stock Limit Reached",
                        description: `Only ${maxStock} items available.`,
                        variant: "destructive",
                    });
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
                        toast({
                            title: "Limit Reached",
                            description: `Max stock is ${item.max_stock}`,
                        });
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
    const discountAmount =
        data.discount_type === "percentage"
            ? (subtotal * Number(data.discount || 0)) / 100
            : Number(data.discount || 0);

    const totalBeforeTax = subtotal - discountAmount;
    const taxAmount = (totalBeforeTax * Number(data.tax_percentage || 0)) / 100;
    const total = totalBeforeTax + taxAmount;

    // Checkout
    const handleCheckout = () => {
        if (cart.length === 0) {
            toast({
                title: "Empty Cart",
                description: "Add items to the cart before checking out.",
                variant: "destructive",
            });
            return;
        }

        if (!data.customer_id) {
            toast({
                title: "Customer Required",
                description: "Please select a customer for the receipt.",
                variant: "destructive",
            });
            return;
        }

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
                    toast({
                        title: "Success",
                        description: "Transaction completed successfully.",
                    });
                    searchInputRef.current?.focus();
                }
            },
            onError: (err) => {
                const message = Object.values(err).flat().join(", ");
                toast({
                    title: "Checkout Failed",
                    description:
                        message || "Something went wrong during checkout.",
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-muted/50 overflow-hidden font-sans selection:bg-primary/10 selection:text-primary">
                <Head title="Point of Sale | Premium POS" />
                
                {/* Top Navigation Bar - Premium Glassmorphism */}
                <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10 text-white h-16 flex items-center justify-between px-6 shrink-0 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-card/5 hover:bg-card/10 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-sm"
                        >
                            <LayoutDashboard className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium tracking-wide">
                                Dashboard
                            </span>
                        </Link>
                        <div className="h-6 w-px bg-card/10 hidden sm:block" />
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                                Smart POS System
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                <Zap className="h-2.5 w-2.5 fill-primary" />
                                Live Transaction
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <div className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-[11px] font-medium text-slate-400 tabular-nums">
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </div>
                        </div>
                        <div className="h-8 w-px bg-card/10" />
                        <div className="flex items-center gap-3">
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                Online
                            </Badge>
                        </div>
                    </div>
                </header>

                {/* Main Content Split */}
                {/* Main Content: Split Products & Cart */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Products Section */}
                    <div className="flex-[1.5] min-w-0 flex flex-col bg-muted border-r border-border relative">
                        {/* Filter Header - Modern & Clean */}
                        <div className="p-6 bg-card border-b border-border space-y-5 shrink-0 shadow-sm">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    ref={searchInputRef}
                                    className="pl-12 h-14 text-lg bg-muted border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all duration-300 placeholder:text-muted-foreground shadow-sm"
                                    placeholder="Scan Barcode or Search Products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <ScrollArea className="w-full whitespace-nowrap">
                                <div className="flex gap-2 pb-2">
                                    <Button
                                        variant={
                                            selectedCategoryId === "all"
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() => setSelectedCategoryId("all")}
                                        className={`rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                            selectedCategoryId === "all"
                                                ? "bg-primary hover:bg-black text-white shadow-xl shadow-primary/20"
                                                : "bg-card hover:bg-primary/5 hover:text-primary border-border"
                                        }`}
                                    >
                                        All Items
                                    </Button>
                                    {categories.map((cat) => (
                                        <Button
                                            key={cat.id}
                                            variant={
                                                selectedCategoryId === cat.id
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                setSelectedCategoryId(cat.id)
                                            }
                                            className={`rounded-xl px-6 h-10 font-medium transition-all duration-300 ${
                                                selectedCategoryId === cat.id
                                                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                                                    : "bg-card hover:bg-indigo-50 hover:text-indigo-600 border-border"
                                            }`}
                                        >
                                            {cat.name}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Products Grid - Modern Responsive Grid */}
                        <ScrollArea className="flex-1">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 p-4 pb-32">
                                {filteredProducts.map((product) => {
                                    const price =
                                        product.product_type === "simple"
                                            ? product.base_price
                                            : (product.variants?.[0]?.price || product.base_price);
                                    const imgPath = getImageUrl(
                                        getPrimaryImage(product),
                                    );
                                    const outOfStock = product.stock <= 0;

                                    return (
                                        <div
                                            key={product.id}
                                            className={`group relative bg-card rounded-xl border border-border p-2 transition-all duration-300 hover:shadow-xl hover:border-indigo-400 cursor-pointer active:scale-95 flex flex-col h-[220px] min-w-0 overflow-hidden shadow-sm ${outOfStock ? "opacity-60 grayscale" : ""}`}
                                            onClick={() =>
                                                !outOfStock && addToCart(product)
                                            }
                                        >
                                            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative mb-2 shrink-0">
                                                {imgPath ? (
                                                    <img
                                                        src={imgPath}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/30">
                                                        <Box className="w-8 h-8" />
                                                    </div>
                                                )}
                                                
                                                {/* Compact Price Overlay */}
                                                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-white">
                                                    <span className="text-[10px] font-black">
                                                        ৳{Number(price || 0).toLocaleString()}
                                                    </span>
                                                </div>

                                                {product.product_type === "variant" && (
                                                    <div className="absolute top-1.5 right-1.5">
                                                        <div className="bg-primary h-2 w-2 rounded-full border border-white shadow-sm" />
                                                    </div>
                                                )}

                                                {outOfStock && (
                                                    <div className="absolute inset-0 bg-card/60 flex items-center justify-center p-2 text-center">
                                                        <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                                                            Sold Out
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                                <h3 className="text-[11px] font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center justify-between gap-1 mt-1">
                                                    <span className="text-[9px] text-muted-foreground truncate font-medium">
                                                        {product.category?.name || "Other"}
                                                    </span>
                                                    <span className={`text-[9px] font-black shrink-0 ${product.stock < 5 ? 'text-primary' : 'text-emerald-500'}`}>
                                                        {product.stock}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full h-80 flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <Search className="h-8 w-8 opacity-20" />
                                        </div>
                                        <p className="text-muted-foreground font-medium text-sm">No items found</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Panel: Checkout / Cart */}
                    <div className="w-[380px] flex flex-col bg-card border-l border-border shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-10 shrink-0 overflow-hidden">
                        {/* Customer Selection - Refined */}
                        <div className="p-6 bg-muted/50 border-b border-border">
                            <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    <UserPlus className="h-3.5 w-3.5" /> Customer Details
                                </label>
                                {errors.customer_id && (
                                    <Badge variant="destructive" className="h-5 px-1.5 text-[9px] font-black uppercase">
                                        Required
                                    </Badge>
                                )}
                            </div>
                            <Select
                                value={data.customer_id}
                                onValueChange={(v) => setData("customer_id", v)}
                            >
                                <SelectTrigger className="w-full h-11 bg-card border-border rounded-xl focus:ring-4 focus:ring-primary/5 transition-all">
                                    <SelectValue placeholder="Walk-in Customer" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border shadow-xl">
                                    {customers.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={c.id.toString()}
                                            className="rounded-lg py-2.5"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{c.name}</span>
                                                {c.phone && <span className="text-[10px] text-muted-foreground font-medium">{c.phone}</span>}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Cart Items - Clean & Scannable */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4 text-primary" />
                                    Your Cart
                                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                                        {cart.length}
                                    </Badge>
                                </h2>
                                {cart.length > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setCart([])}
                                        className="h-8 text-[11px] font-bold text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </div>
                            
                            <ScrollArea className="flex-1 px-4">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center mt-12">
                                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 animate-bounce duration-1000">
                                            <ShoppingCart className="h-10 w-10 opacity-20" />
                                        </div>
                                        <p className="font-bold text-muted-foreground text-sm">Cart is feeling light</p>
                                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                            Start scanning items or browse the catalog to add products
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pb-6">
                                        {cart.map((item) => (
                                            <div
                                                key={item.id}
                                                className="group flex flex-col bg-card border border-border p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-300"
                                            >
                                                <div className="flex w-[20rem] justify-between items-start gap-3">
                                                    <div className="flex gap-4 min-w-0 flex-1">
                                                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-border bg-muted shrink-0">
                                                            {item.image ? (
                                                                <img
                                                                    src={getImageUrl(item.image) as string}
                                                                    className="w-full h-full object-cover"
                                                                    alt={item.name}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                                    <Box className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-bold text-sm text-foreground truncate">
                                                                {item.name}
                                                            </h4>
                                                            {item.variant_name && (
                                                                <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5 truncate">
                                                                    {item.variant_name}
                                                                </p>
                                                            )}
                                                            <p className="text-xs font-bold text-muted-foreground mt-1">
                                                                ৳{item.price.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="shrink-0 h-8 w-8 rounded-full text-red-400 hover:text-red-700 hover:bg-red-50 transition-all shadow-sm border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center bg-muted rounded-xl border border-border overflow-hidden p-0.5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            disabled={item.quantity <= 1}
                                                            className="h-8 w-8 rounded-lg hover:bg-card hover:shadow-sm"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-10 text-center text-sm font-black text-foreground italic">
                                                            {item.quantity.toString().padStart(2, '0')}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            disabled={item.quantity >= item.max_stock}
                                                            className="h-8 w-8 rounded-lg hover:bg-card hover:shadow-sm"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <p className="font-black text-foreground">
                                                        ৳{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        {/* Calculation & Checkout Footer - Receipt Style */}
                        <div className="bg-card border-t border-border pt-6 px-6 pb-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] rounded-t-[32px]">
                            <div className="space-y-4">
                                {/* Inputs Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            Discount
                                        </label>
                                        <div className="flex gap-1.5">
                                            <Input
                                                type="number"
                                                className="h-10 bg-muted/50 border-border rounded-xl text-center font-bold"
                                                value={data.discount || ""}
                                                onChange={(e) => setData("discount", Number(e.target.value))}
                                            />
                                            <Select
                                                value={data.discount_type}
                                                onValueChange={(v) => setData("discount_type", v as any)}
                                            >
                                                <SelectTrigger className="w-16 h-10 bg-muted border-border rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl min-w-[5rem]">
                                                    <SelectItem value="fixed">৳</SelectItem>
                                                    <SelectItem value="percentage">%</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            Tax (%)
                                        </label>
                                        <Input
                                            type="number"
                                            className="h-10 bg-muted/50 border-border rounded-xl text-center font-bold"
                                            placeholder="0"
                                            value={data.tax_percentage || ""}
                                            onChange={(e) => setData("tax_percentage", Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            Payment
                                        </label>
                                        <Select
                                            value={data.payment_method}
                                            onValueChange={(v) => setData("payment_method", v)}
                                        >
                                            <SelectTrigger className="h-10 bg-muted border-border rounded-xl font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="credit">Due</SelectItem>
                                                <SelectItem value="card">Card</SelectItem>
                                                <SelectItem value="mobile_banking">Mobile</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator className="bg-muted" />

                                {/* Totals Section */}
                                <div className="space-y-2 py-1">
                                    <div className="flex justify-between items-center text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                        <span>Subtotal</span>
                                        <span className="text-foreground">৳{subtotal.toLocaleString()}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between items-center text-xs font-bold text-red-500 uppercase tracking-wider">
                                            <span>Discount</span>
                                            <span>- ৳{discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {taxAmount > 0 && (
                                        <div className="flex justify-between items-center text-xs font-bold text-primary uppercase tracking-wider">
                                            <span>Tax ({data.tax_percentage}%)</span>
                                            <span>+ ৳{taxAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-baseline pt-4 border-t border-dashed border-border mt-2">
                                        <span className="text-sm font-black text-foreground uppercase tracking-widest">Total Payable</span>
                                        <span className="text-4xl font-black text-primary tracking-tighter tabular-nums drop-shadow-sm">
                                            ৳{total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-primary hover:bg-black text-white rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 group"
                                    onClick={handleCheckout}
                                    disabled={processing || cart.length === 0}
                                >
                                    {processing ? (
                                        <Clock className="animate-spin h-6 w-6 mr-3" />
                                    ) : (
                                        <CreditCard className="h-6 w-6 mr-3 transition-transform group-hover:scale-110" />
                                    )}
                                    {processing ? "Processing..." : "Finish Sale"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
