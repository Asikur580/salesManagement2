import React, { useRef } from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface NewArrivalsProps {
    products?: any[];
}

export function NewArrivals({ products = [] }: NewArrivalsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            const scrollTo =
                direction === "left"
                    ? scrollLeft - scrollAmount
                    : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    if (!products || products.length === 0) return null;

    return (
        <div className="w-full bg-white py-10 border-b">
            <div className="max-w-[100rem] mx-auto px-4">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        NEW ARRIVALS
                    </h2>
                    <Link
                        href={route("shop.new-arrivals")}
                        className="bg-[#FF4E00] hover:bg-orange-600 text-white px-4 py-1.5 rounded-md text-xs font-bold transition-colors uppercase"
                    >
                        View all
                    </Link>
                </div>

                {/* Slider Section */}
                <div className="relative group">
                    {/* Navigation Arrows */}
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-[40%] -translate-y-1/2 z-20 bg-white/90 shadow-lg rounded-full p-2 border border-gray-100 hover:bg-white transition-all transform -translate-x-1/2 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-[40%] -translate-y-1/2 z-20 bg-white/90 shadow-lg rounded-full p-2 border border-gray-100 hover:bg-white transition-all transform translate-x-1/2 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto no-scrollbar gap-5 pb-4"
                    >
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="flex-shrink-0 w-[200px] md:w-[280px]"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
