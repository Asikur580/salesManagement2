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

            <div className="bg-muted/50 py-12 min-h-[60vh]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-8">
                        <Link
                            href="/"
                            className="p-2 hover:bg-card rounded-full transition-all text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="text-4xl font-black italic uppercase italic">
                            Your <span className="text-primary">Cart</span>
                        </h1>
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-card rounded-[2.5rem] p-12 text-center shadow-sm border border-border italic">
                            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="h-12 w-12 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Your cart is empty
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                Looks like you haven't added anything to your
                                cart yet.
                            </p>
                            <Button
                                asChild
                                className="bg-primary hover:bg-black text-white px-8 py-6 rounded-2xl font-black italic uppercase"
                            >
                                <Link href="/">Start Shopping</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Items List */}
                            <div className="lg:col-span-8 space-y-4">
                                {items.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="bg-card rounded-3xl p-6 shadow-sm border border-border flex gap-6 items-center"
                                    >
                                        <Link
                                            href={route(
                                                "shop.product.show",
                                                item.slug,
                                            )}
                                            className="w-24 h-24 bg-muted rounded-2xl overflow-hidden shrink-0 border border-gray-50 hover:border-primary transition-colors"
                                        >
                                            <img
                                                src={
                                                    item.image
                                                        ? item.image.startsWith(
                                                              "http",
                                                          )
                                                            ? item.image
                                                            : `${item.image}`
                                                        : `https://placehold.co/200x200?text=${item.name}`
                                                }
                                                alt={item.name}
                                                className="w-full h-full object-contain p-2"
                                            />
                                        </Link>
                                        <div className="flex-1">
                                            <Link
                                                href={route(
                                                    "shop.product.show",
                                                    item.slug,
                                                )}
                                                className="font-black text-lg hover:text-primary transition-colors leading-tight block mb-1"
                                            >
                                                {item.name}
                                            </Link>
                                            {item.variant_name && (
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    {item.variant_name}
                                                </p>
                                            )}
                                            <p className="text-primary font-black mt-2">
                                                ৳
                                                {parseFloat(
                                                    item.price,
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-4">
                                            <div className="flex items-center bg-muted rounded-xl p-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-card rounded-lg"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center font-bold text-sm">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-card rounded-lg"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-black text-foreground leading-none">
                                                    ৳
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toLocaleString()}
                                                </p>
                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    className="text-muted-foreground hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="rounded-2xl border-border font-bold hover:bg-muted"
                                    >
                                        <Link
                                            href="/"
                                            className="flex items-center gap-2"
                                        >
                                            <ArrowLeft className="h-4 w-4" />{" "}
                                            Continue Shopping
                                        </Link>
                                    </Button>
                                    <button
                                        onClick={clearCart}
                                        className="text-sm font-bold text-muted-foreground hover:text-red-500 transition-colors uppercase tracking-widest"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                                <div className="bg-card rounded-[2.5rem] p-8 shadow-sm border border-border">
                                    <h3 className="text-2xl font-black italic uppercase mb-6">
                                        Order{" "}
                                        <span className="text-primary">
                                            Summary
                                        </span>
                                    </h3>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-muted-foreground font-bold uppercase text-xs tracking-widest">
                                            <span>
                                                Subtotal ({cart.count} items)
                                            </span>
                                            <span className="text-foreground">
                                                ৳{cart.total.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground font-bold uppercase text-xs tracking-widest">
                                            <span>Shipping</span>
                                            <span className="text-green-600">
                                                FREE
                                            </span>
                                        </div>
                                        <div className="h-[1px] bg-muted/80 my-2" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-black italic uppercase">
                                                Total
                                            </span>
                                            <span className="text-2xl font-black text-primary">
                                                ৳{cart.total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        asChild
                                        className="w-full bg-black hover:bg-primary text-white py-8 rounded-[1.25rem] text-lg font-black transition-all shadow-xl shadow-gray-100 group"
                                    >
                                        <Link
                                            href={route("checkout.index")}
                                            className="flex items-center justify-center w-full h-full"
                                        >
                                            CHECKOUT NOW
                                            <ShoppingBag className="ml-3 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                                        </Link>
                                    </Button>

                                    <div className="mt-6 flex flex-col gap-3">
                                        <p className="text-[10px] text-muted-foreground font-bold text-center uppercase tracking-[0.2em] leading-relaxed px-4">
                                            Secure Checkout powered by
                                            SSLCommerz
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}
