import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ProductCardProps {
    product: any;
}

export function ProductCard({ product }: ProductCardProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isAdding, setIsAdding] = React.useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.visit(route("login"));
            return;
        }

        if (product.stock <= 0) {
            toast({
                title: "Out of Stock",
                description: "This product is currently unavailable.",
                variant: "destructive",
            });
            return;
        }

        setIsAdding(true);
        router.post(
            route("cart.store"),
            {
                product_id: product.id,
                quantity: 1,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: "Added to Cart",
                        description: `${product.name} has been added to your cart.`,
                    });
                },
                onError: (errors) => {
                    toast({
                        title: "Error",
                        description:
                            Object.values(errors)[0] ||
                            "Failed to add to cart.",
                        variant: "destructive",
                    });
                },
                onFinish: () => setIsAdding(false),
            },
        );
    };

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.visit(route("login"));
            return;
        }

        router.post(
            route("wishlist.toggle"),
            {
                product_id: product.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: product.is_wishlisted
                            ? "Removed from Wishlist"
                            : "Added to Wishlist",
                        description: `${product.name} has been ${product.is_wishlisted ? "removed from" : "added to"} your wishlist.`,
                    });
                },
            },
        );
    };

    const getImagePath = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        if (path.startsWith("/storage/")) return path;
        return `/storage/${path}`;
    };

    const displayImage =
        getImagePath(product.primary_image?.image_path) ||
        getImagePath(product.variants?.[0]?.primary_image?.image_path) ||
        `https://placehold.co/400x400/f5f5f5/333333?text=${product.name}`;

    return (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden group hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500 flex flex-col relative h-full">
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                {product.old_price > product.price && (
                    <Badge className="bg-primary text-white border-none font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                        -
                        {Math.round(
                            ((product.old_price - product.price) /
                                product.old_price) *
                                100,
                        )}
                        %
                    </Badge>
                )}
            </div>

            {/* Image Container */}
            <Link
                href={
                    product.slug
                        ? route("shop.product.show", product.slug)
                        : "#"
                }
                className="relative aspect-[4/5] sm:aspect-square bg-[#F9F9F9] overflow-hidden block group/img"
            >
                <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 p-0"
                />

                {/* Overlay Actions (Hidden on small mobile for cleaner look) */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-3">
                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={handleWishlistToggle}
                        className={`rounded-full shadow-md scale-90 group-hover:scale-100 transition-transform duration-300 ${
                            product.is_wishlisted
                                ? "bg-primary text-white hover:bg-primary/90 border-primary"
                                : "bg-card text-muted-foreground hover:text-primary"
                        }`}
                    >
                        <Heart
                            className={`h-4 w-4 ${product.is_wishlisted ? "fill-white text-white" : ""}`}
                        />
                    </Button>
                </div>
            </Link>

            {/* Content */}
            <div className="p-3 md:p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.1em]">
                        {product.category?.name || "OrenMart"}
                    </span>
                </div>
                <Link
                    href={
                        product.slug
                            ? route("shop.product.show", product.slug)
                            : "#"
                    }
                >
                    <h4 className="font-bold text-[13px] md:text-sm text-[#333] line-clamp-2 mb-2 min-h-[36px] md:min-h-[40px] group-hover:text-primary transition-colors leading-tight">
                        {product.name}
                    </h4>
                </Link>

                <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-base md:text-lg font-black text-primary">
                            ৳
                            {product.price
                                ? parseFloat(product.price).toLocaleString()
                                : "0"}
                        </span>
                        {product.old_price > product.price && (
                            <span className="text-[10px] text-muted-foreground line-through font-bold opacity-60">
                                ৳
                                {parseFloat(
                                    product.old_price,
                                ).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <Button
                        disabled={product.stock <= 0 || isAdding}
                        onClick={handleAddToCart}
                        className={`w-full bg-orange-50 hover:bg-primary text-primary hover:text-white rounded-lg transition-all shadow-none h-9 text-xs font-black uppercase tracking-wider gap-2 ${isAdding ? "opacity-50" : ""}`}
                    >
                        {isAdding ? (
                            "Adding..."
                        ) : (
                            <>
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Add to Cart
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
