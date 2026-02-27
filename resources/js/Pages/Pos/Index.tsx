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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
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
    selling_price: number;
    stock: number;
    attributeValues: VariantAttribute[];
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
    const { data, setData, post, processing, reset, errors } = Object.assign(
        useForm({
            customer_id: "",
            payment_method: "cash",
            discount: 0,
            discount_type: "fixed",
            note: "",
            items: [] as any[],
        }),
    );

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
        const price = variant ? variant.selling_price : product.base_price || 0;
        const maxStock = variant ? variant.stock : product.stock;

        let variantName = "";
        if (variant) {
            variantName = variant.attributeValues
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

            if (maxStock <= 0) {
                toast({
                    title: "Out of Stock",
                    description: "Cannot add out of stock items.",
                    variant: "destructive",
                });
                return prev;
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

    // Calculations
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const discountAmount =
        data.discount_type === "percentage"
            ? (subtotal * Number(data.discount || 0)) / 100
            : Number(data.discount || 0);
    const total = subtotal - discountAmount;

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

        setData("items", payloadItems);

        // the actual submit must happen after state connects. We can use a trick or just use standard fetch/inertia post.
        // We'll post directly because Inertia's hook needs data to be set.
        post("/pos/checkout", {
            data: { ...data, items: payloadItems }, // Immediate override
            onSuccess: () => {
                setCart([]);
                reset();
                toast({
                    title: "Success",
                    description: "Transaction completed successfully.",
                });
                // Return focus to scanner
                searchInputRef.current?.focus();
            },
        });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="bg-slate-900 text-white h-14 flex items-center justify-between px-4 shrink-0 shadow-md z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                    >
                        <Home className="h-5 w-5" />
                        <span className="font-semibold tracking-wide">
                            Dashboard
                        </span>
                    </Link>
                    <Separator
                        orientation="vertical"
                        className="h-6 bg-slate-700"
                    />
                    <h1 className="text-xl font-bold tracking-tight">
                        Point of Sale
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-light text-slate-300">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </div>
                </div>
            </header>

            {/* Main Content Split */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Products Section */}
                <div className="flex-1 flex flex-col bg-gray-50 border-r border-gray-200 shadow-inner">
                    {/* Filter Header */}
                    <div className="p-4 bg-white border-b border-gray-200 space-y-3 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                ref={searchInputRef}
                                className="pl-10 h-12 text-lg bg-gray-50 border-gray-300 focus:ring-blue-500 rounded-xl"
                                placeholder="Scan Barcode or Search Products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="w-full whitespace-nowrap pb-2">
                            <div className="flex gap-2">
                                <Button
                                    variant={
                                        selectedCategoryId === "all"
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => setSelectedCategoryId("all")}
                                    className="rounded-full px-5"
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
                                        className="rounded-full px-5 whitespace-nowrap bg-white hover:bg-gray-100"
                                    >
                                        {cat.name}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Products Grid */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                            {filteredProducts.map((product) => {
                                const price =
                                    product.product_type === "simple"
                                        ? product.base_price
                                        : product.variants[0]?.selling_price;
                                const imgPath = getImageUrl(
                                    getPrimaryImage(product),
                                );
                                const outOfStock = product.stock <= 0;

                                return (
                                    <Card
                                        key={product.id}
                                        className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg border-transparent hover:border-blue-200 ${outOfStock ? "opacity-50 grayscale" : ""}`}
                                        onClick={() =>
                                            !outOfStock && addToCart(product)
                                        }
                                    >
                                        <div className="aspect-square bg-gray-100 relative">
                                            {imgPath ? (
                                                <img
                                                    src={imgPath}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Box className="w-12 h-12" />
                                                </div>
                                            )}
                                            {product.product_type ===
                                                "variant" && (
                                                <Badge className="absolute top-2 right-2 bg-purple-500 hover:bg-purple-600 shadow-sm border-0">
                                                    Variations
                                                </Badge>
                                            )}
                                            {outOfStock && (
                                                <div className="absolute inset-0 bg-red-900/10 flex items-center justify-center">
                                                    <Badge
                                                        variant="destructive"
                                                        className="z-10 shadow-lg text-sm px-3 py-1"
                                                    >
                                                        Out of Stock
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-3 bg-white">
                                            <div
                                                className="font-semibold text-gray-900 line-clamp-1"
                                                title={product.name}
                                            >
                                                {product.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mb-1">
                                                {product.category?.name ||
                                                    "Uncategorized"}
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <div className="font-bold text-blue-700">
                                                    ৳
                                                    {Number(price || 0).toFixed(
                                                        2,
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium">
                                                    Qty: {product.stock}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {filteredProducts.length === 0 && (
                                <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400">
                                    <Box className="h-16 w-16 mb-4 opacity-50" />
                                    <p className="text-lg">No products found</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Panel: Cart & Checkout */}
                <div className="w-96 flex flex-col bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] z-10 shrink-0">
                    {/* Customer Selection */}
                    <div className="p-4 bg-gray-50 border-b">
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                            <UserPlus className="h-4 w-4" /> Customer Details
                            {errors.customer_id && (
                                <span className="text-red-500 text-xs ml-auto">
                                    Required
                                </span>
                            )}
                        </div>
                        <Select
                            value={data.customer_id}
                            onValueChange={(v) => setData("customer_id", v)}
                        >
                            <SelectTrigger className="w-full bg-white border-gray-300">
                                <SelectValue placeholder="Select Customer..." />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map((c) => (
                                    <SelectItem
                                        key={c.id}
                                        value={c.id.toString()}
                                    >
                                        {c.name} {c.phone ? `(${c.phone})` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cart Items */}
                    <ScrollArea className="flex-1 p-2">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10 mt-20">
                                <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
                                <p>Your cart is empty</p>
                                <p className="text-xs mt-2 text-center">
                                    Scan a barcode or click a product to begin.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 pb-4">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col bg-white border border-gray-100 p-3 rounded-lg shadow-sm hover:border-blue-100 transition-colors group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                {item.image ? (
                                                    <img
                                                        src={
                                                            getImageUrl(
                                                                item.image,
                                                            ) as string
                                                        }
                                                        className="w-12 h-12 rounded object-cover border"
                                                        alt={item.name}
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center border text-gray-300">
                                                        <Box className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-sm line-clamp-1">
                                                        {item.name}
                                                    </div>
                                                    {item.variant_name && (
                                                        <div className="text-xs text-purple-600 font-medium">
                                                            {item.variant_name}
                                                        </div>
                                                    )}
                                                    <div className="text-blue-600 font-bold text-sm mt-0.5">
                                                        ৳{item.price.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeFromCart(item.id)
                                                }
                                                className="text-red-400 hover:text-red-600 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pl-14">
                                            <div className="flex items-center bg-gray-100 rounded-md border text-sm overflow-hidden shadow-inner">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            -1,
                                                        )
                                                    }
                                                    className="px-3 py-1.5 hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50"
                                                    disabled={
                                                        item.quantity <= 1
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <div className="px-3 font-semibold w-10 text-center bg-white py-1">
                                                    {item.quantity}
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            1,
                                                        )
                                                    }
                                                    className="px-3 py-1.5 hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50"
                                                    disabled={
                                                        item.quantity >=
                                                        item.max_stock
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <div className="font-bold text-gray-900">
                                                ৳
                                                {(
                                                    item.price * item.quantity
                                                ).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Calculation & Checkout Footer */}
                    <div className="bg-slate-50 border-t border-gray-200 shrink-0">
                        <div className="p-4 space-y-3">
                            {/* Discount Inputs */}
                            <div className="flex items-end gap-2 px-1">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                        Add Discount
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="0.00"
                                        className="h-9 bg-white"
                                        value={data.discount || ""}
                                        onChange={(e) =>
                                            setData(
                                                "discount",
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                                <div className="w-24">
                                    <Select
                                        value={data.discount_type}
                                        onValueChange={(v) =>
                                            setData("discount_type", v as any)
                                        }
                                    >
                                        <SelectTrigger className="h-9 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed">
                                                Flat (৳)
                                            </SelectItem>
                                            <SelectItem value="percentage">
                                                Percent (%)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Waiter/Payment */}
                            <div className="flex items-end gap-2 px-1">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                        Payment Method
                                    </label>
                                    <Select
                                        value={data.payment_method}
                                        onValueChange={(v) =>
                                            setData("payment_method", v)
                                        }
                                    >
                                        <SelectTrigger className="h-9 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">
                                                Cash
                                            </SelectItem>
                                            <SelectItem value="credit">
                                                Credit / Due
                                            </SelectItem>
                                            <SelectItem value="card">
                                                Credit Card
                                            </SelectItem>
                                            <SelectItem value="mobile_banking">
                                                Mobile Banking
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator className="my-3 border-gray-200" />

                            {/* Totals */}
                            <div className="space-y-1.5 px-1">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>৳{subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-red-500">
                                        <span>Discount</span>
                                        <span>
                                            - ৳{discountAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-2 mt-2 border-t border-gray-200">
                                    <span className="text-gray-900 font-bold text-lg">
                                        Total Payable
                                    </span>
                                    <span className="text-green-600 font-black text-3xl tracking-tight">
                                        ৳{total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <div className="p-4 bg-white border-t">
                            <Button
                                className="w-full h-14 text-lg font-bold shadow-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                onClick={handleCheckout}
                                disabled={processing || cart.length === 0}
                            >
                                <CreditCard className="mr-2 h-6 w-6" />
                                {processing
                                    ? "Processing..."
                                    : "Pay & Checkout"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
