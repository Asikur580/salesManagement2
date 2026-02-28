import React, { useState, useEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
import { Zap, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface FlashSaleProps {
    products?: any[];
}

export function FlashSale({ products = [] }: FlashSaleProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [timeLeft, setTimeLeft] = useState({
        hours: 12,
        minutes: 45,
        seconds: 0,
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0)
                    return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0)
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0)
                    return {
                        ...prev,
                        hours: prev.hours - 1,
                        minutes: 59,
                        seconds: 59,
                    };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-[#FF4E00] fill-[#FF4E00]" />
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                FLASH SALE
                            </h2>
                        </div>

                        {/* Countdown Timer */}
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div className="flex items-center gap-1.5">
                                <div className="flex flex-col items-center">
                                    <span className="bg-[#1a1a1a] text-white px-1.5 py-0.5 rounded font-black text-xs min-w-[24px] text-center">
                                        {String(timeLeft.hours).padStart(
                                            2,
                                            "0",
                                        )}
                                    </span>
                                </div>
                                <span className="text-gray-400 font-black text-xs">
                                    :
                                </span>
                                <div className="flex flex-col items-center">
                                    <span className="bg-[#1a1a1a] text-white px-1.5 py-0.5 rounded font-black text-xs min-w-[24px] text-center">
                                        {String(timeLeft.minutes).padStart(
                                            2,
                                            "0",
                                        )}
                                    </span>
                                </div>
                                <span className="text-gray-400 font-black text-xs">
                                    :
                                </span>
                                <div className="flex flex-col items-center">
                                    <span className="bg-[#FF4E00] text-white px-1.5 py-0.5 rounded font-black text-xs min-w-[24px] text-center">
                                        {String(timeLeft.seconds).padStart(
                                            2,
                                            "0",
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/offers"
                        className="bg-[#FF4E00] hover:bg-orange-600 text-white px-4 py-1.5 rounded-md text-xs font-bold transition-colors uppercase w-fit"
                    >
                        View all deals
                    </Link>
                </div>

                {/* Slider Section */}
                <div className="relative group/slider">
                    {/* Navigation Arrows */}
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 shadow-lg rounded-full p-2 border border-gray-100 hover:bg-white transition-all transform -translate-x-1/2 opacity-0 group-hover/slider:opacity-100"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 shadow-lg rounded-full p-2 border border-gray-100 hover:bg-white transition-all transform translate-x-1/2 opacity-0 group-hover/slider:opacity-100"
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
                                <div className="relative group">
                                    <ProductCard product={product} />
                                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                                        <div className="bg-[#FF4E00] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm shadow-md uppercase">
                                            -15%
                                        </div>
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
