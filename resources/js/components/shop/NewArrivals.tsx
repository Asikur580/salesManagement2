import React, { useRef } from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRODUCTS = [
    {
        id: 1,
        name: "Bike Body Cover with Mirror Pockets – All Weather Protection, Universal Fit",
        image: "https://images.unsplash.com/photo-1558981403-c5f97cb027a0?auto=format&fit=crop&q=80&w=600&h=600",
        price: 650,
        brand: null,
    },
    {
        id: 2,
        name: "Universal Car Trunk Mat – Waterproof All-Weather Cargo Liner, Anti-Slip...",
        image: "https://images.unsplash.com/photo-1599256629751-4d7a1641a27e?auto=format&fit=crop&q=80&w=600&h=600",
        price: 1190,
        brand: null,
    },
    {
        id: 3,
        name: "Flamingo Premium Coating Film F052 – High Gloss Car Polish & Paint...",
        image: "https://images.unsplash.com/photo-1619642751034-765dfdf7358e?auto=format&fit=crop&q=80&w=600&h=600",
        price: 1650,
        brand: "Flamingo",
    },
    {
        id: 4,
        name: "Car Custom-Fit Tailored Seat Covers with Professional Bucket Installation",
        image: "https://images.unsplash.com/photo-1549497538-30622843e191?auto=format&fit=crop&q=80&w=600&h=600",
        price: 7990,
        brand: null,
    },
    {
        id: 5,
        name: "Car Side Mirror Replacement Kit – Aftermarket Door Mirror Assembly...",
        image: "https://images.unsplash.com/photo-1504215642848-7315397e9281?auto=format&fit=crop&q=80&w=600&h=600",
        price: 12500,
        brand: null,
    },
    {
        id: 6,
        name: "Front Bumper Grille Upgrade Kit – Premium Exterior Styling with...",
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=600&h=600",
        price: 3490,
        brand: null,
    },
];

export function NewArrivals() {
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
                        {PRODUCTS.map((product) => (
                            <div
                                key={product.id}
                                className="flex-shrink-0 w-[200px] md:w-[240px] group cursor-pointer"
                            >
                                {/* Product Image */}
                                <div className="aspect-square bg-white rounded-lg border border-gray-100 overflow-hidden mb-3 relative">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="space-y-1.5">
                                    <h3 className="text-[13px] font-medium text-gray-700 leading-snug line-clamp-2 min-h-[40px] group-hover:text-[#FF4E00] transition-colors">
                                        {product.name}
                                    </h3>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-[16px] font-bold text-[#FF4E00]">
                                            ৳{product.price.toLocaleString()}
                                        </span>

                                        {product.brand && (
                                            <div className="inline-block bg-[#FF4E00] text-white text-[10px] font-bold px-2 py-0.5 rounded w-fit uppercase">
                                                {product.brand}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
