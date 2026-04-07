import React from "react";
import { ProductCard } from "./ProductCard";

interface YouMayLikeProps {
    products?: any[];
}

export function YouMayLike({ products = [] }: YouMayLikeProps) {
    if (!products || products.length === 0) return null;

    return (
        <div className="w-full bg-card py-10 border-b">
            <div className="max-w-[100rem] mx-auto px-4">
                <h2 className="text-xl font-black text-foreground mb-8 uppercase tracking-tight">
                    YOU MAY LIKE
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}
