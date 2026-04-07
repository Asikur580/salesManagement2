import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CartProps {
    cart: any;
}

export default function Cart({ cart }: CartProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [loginOpen, setLoginOpen] = useState(true);
    const items = cart?.items || [];

    // If not logged in, show sign in message with link to login page
    if (!user) {
        return (
            <ShopLayout>
                <Head title="Shopping Cart | CarMart" />
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
                    <ShoppingBag className="h-16 w-16 text-gray-200" />
                    <h2 className="text-2xl font-black text-foreground uppercase">
                        Sign in to view your cart
                    </h2>
                    <p className="text-muted-foreground font-bold max-w-sm uppercase text-xs tracking-widest">
                        Please log in with your phone number or password to
                        access your shopping cart.
                    </p>
                    <Button
                        onClick={() => router.visit(route("login"))}
                        className="mt-4 bg-primary hover:bg-black text-white px-10 py-7 rounded-2xl font-black uppercase italic tracking-tighter shadow-xl shadow-orange-100"
                    >
                        Sign In Now
                    </Button>
                </div>
            </ShopLayout>
        );
    }

    const updateQuantity = (id: string, newQty: number) => {
        if (newQty < 1) return;
        router.patch(
            route("cart.update", id),
            { quantity: newQty },
            {
                preserveScroll: true,
                onSuccess: () => toast({ title: "Cart Updated" }),
            },
        );
    };

    const removeItem = (id: string) => {
        router.delete(route("cart.destroy", id), {
            preserveScroll: true,
            onSuccess: () =>
                toast({ title: "Item Removed", variant: "destructive" }),
        });
    };

    const clearCart = () => {
        if (confirm("Are you sure you want to clear your cart?")) {
            router.post(
                route("cart.clear"),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => toast({ title: "Cart Cleared" }),
                },
            );
        }
    };

    return (
        <ShopLayout>
            <Head title="Shopping Cart | CarMart" />

            <div className="bg-[#DFE0E2] py-6 md:py-12 min-h-screen">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-8">
                        <Link
                            href="/"
                            className="p-2 hover:bg-white/50 rounded-full transition-all text-foreground"
                        >
                            <ArrowLeft className="h-6 w-6 stroke-[3px]" />
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
                            Your <span className="text-primary italic">Cart</span>
                        </h1>
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-white rounded-[3rem] p-12 text-center shadow-xl border border-white/20">
                            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="h-12 w-12 text-primary" />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-foreground mb-2">
                                Your cart is empty
                            </h2>
                            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest mb-8">
                                Looks like you haven't added anything to your
                                cart yet.
                            </p>
                            <Button
                                asChild
                                className="bg-primary hover:bg-black text-white px-10 py-7 rounded-2xl font-black italic uppercase tracking-tighter shadow-lg shadow-orange-100"
                            >
                                <Link href="/">Start Shopping</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Items List */}
                            <div className="space-y-4">
                                {items.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-[2.5rem] p-4 md:p-6 shadow-sm flex gap-4 md:gap-6 items-center relative group"
                                    >
                                        <Link
                                            href={route("shop.product.show", item.slug)}
                                            className="w-28 h-28 md:w-36 md:h-36 bg-[#F3F4F6] rounded-[2rem] overflow-hidden shrink-0 border border-transparent hover:border-primary/20 transition-all p-2"
                                        >
                                            <img
                                                src={item.image || `https://placehold.co/200x200?text=${item.name}`}
                                                alt={item.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </Link>
                                        
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="max-w-xs">
                                                <Link
                                                    href={route("shop.product.show", item.slug)}
                                                    className="font-black text-sm md:text-xl hover:text-primary transition-colors leading-tight block mb-1 uppercase tracking-tight"
                                                >
                                                    {item.name}
                                                </Link>
                                                {item.variant_name && (
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2">
                                                        {item.variant_name}
                                                    </p>
                                                )}
                                                <p className="text-primary font-black text-lg">
                                                    ৳{parseFloat(item.price).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end justify-between self-stretch md:self-center">
                                                {/* Pill-shaped quantity controls */}
                                                <div className="flex items-center bg-[#D1D5DB] rounded-full p-1 shadow-inner mb-4">
                                                    <button
                                                        className="h-8 w-8 flex items-center justify-center hover:bg-white rounded-full transition-all text-gray-600 active:scale-95"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-4 w-4 stroke-[3px]" />
                                                    </button>
                                                    <span className="w-10 text-center font-black text-sm text-gray-800">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        className="h-8 w-8 flex items-center justify-center hover:bg-white rounded-full transition-all text-gray-600 active:scale-95"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-4 w-4 stroke-[3px]" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <p className="font-black text-lg text-foreground leading-none">
                                                        ৳{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-2 bg-gray-50 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded-full transition-all shadow-sm border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-between items-center px-2 py-4">
                                    <Link
                                        href="/"
                                        className="bg-white hover:bg-gray-50 text-foreground px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-md transition-all active:scale-95"
                                    >
                                        <ArrowLeft className="h-4 w-4 stroke-[3px]" />
                                        Continue Shopping
                                    </Link>
                                    <button
                                        onClick={clearCart}
                                        className="text-xs font-black text-gray-600 hover:text-red-600 transition-colors uppercase tracking-[0.2em]"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-white rounded-[3.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                
                                <h3 className="text-2xl md:text-3xl font-black italic uppercase italic mb-8">
                                    Order <span className="text-primary italic">Summary</span>
                                </h3>

                                <div className="space-y-5 mb-10">
                                    <div className="flex justify-between text-muted-foreground font-black uppercase text-[10px] md:text-xs tracking-[0.2em]">
                                        <span>Subtotal ({cart.count} items)</span>
                                        <span className="text-foreground">
                                            ৳{cart.total.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground font-black uppercase text-[10px] md:text-xs tracking-[0.2em]">
                                        <span>Shipping</span>
                                        <span className="text-[#00a651] font-black">
                                            FREE
                                        </span>
                                    </div>
                                    <div className="h-[2px] bg-muted/30 my-4" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl md:text-2xl font-black italic uppercase tracking-tight">
                                            Total
                                        </span>
                                        <span className="text-3xl md:text-4xl font-black text-primary italic">
                                            ৳{cart.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    asChild
                                    className="w-full bg-black hover:bg-primary text-white py-10 rounded-[2rem] text-xl font-black transition-all shadow-2xl shadow-gray-200 group relative overflow-hidden"
                                >
                                    <Link
                                        href={route("checkout.index")}
                                        className="flex items-center justify-center w-full h-full"
                                    >
                                        <span className="relative z-10">CHECKOUT NOW</span>
                                        <ShoppingBag className="ml-3 h-6 w-6 relative z-10 transition-transform group-hover:-translate-y-2" />
                                    </Link>
                                </Button>

                                <div className="mt-8 flex flex-col gap-3">
                                    <p className="text-[10px] text-muted-foreground/60 font-black text-center uppercase tracking-[0.3em] leading-relaxed">
                                        Secure Checkout powered by SSLCommerz
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}
