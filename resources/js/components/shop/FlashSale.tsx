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
        <div className="w-full bg-[#121212] py-8 lg:py-12 border-b border-white/5 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-[100rem] mx-auto px-4 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 lg:gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Zap className="h-5 w-5 text-primary fill-primary" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none skew-x-[-6deg]">
                                FLASH SALE
                            </h2>
                        </div>

                        {/* Styled Countdown Timer (As per image) */}
                        <div className="inline-flex items-center gap-3 bg-[#1e1e1e] px-4 py-2.5 rounded-2xl border border-white/5 shadow-2xl">
                            <Clock className="h-4 w-4 text-[#00a651]" />
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-center">
                                    <div className="bg-[#00a651] text-white w-9 h-9 rounded-lg flex items-center justify-center font-black text-base shadow-lg">
                                        {String(timeLeft.hours).padStart(2, "0")}
                                    </div>
                                    <span className="text-[6px] text-muted-foreground/60 font-black uppercase mt-1 tracking-widest">
                                        Hours
                                    </span>
                                </div>
                                <span className="text-white font-black text-base mb-3.5">:</span>
                                <div className="flex flex-col items-center">
                                    <div className="bg-[#00a651] text-white w-9 h-9 rounded-lg flex items-center justify-center font-black text-base shadow-lg">
                                        {String(timeLeft.minutes).padStart(2, "0")}
                                    </div>
                                    <span className="text-[6px] text-muted-foreground/60 font-black uppercase mt-1 tracking-widest">
                                        Mins
                                    </span>
                                </div>
                                <span className="text-white font-black text-base mb-3.5">:</span>
                                <div className="flex flex-col items-center">
                                    <div className="bg-white text-black w-9 h-9 rounded-lg flex items-center justify-center font-black text-base shadow-lg">
                                        {String(timeLeft.seconds).padStart(2, "0")}
                                    </div>
                                    <span className="text-[6px] text-muted-foreground/60 font-black uppercase mt-1 tracking-widest">
                                        Secs
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={route("shop.flash-sales")}
                        className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest border border-primary/20 shadow-sm"
                    >
                        View all deals
                    </Link>
                </div>

                {/* Slider Section */}
                <div className="relative group/slider">
                    {/* Navigation Arrows */}
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-card/90 shadow-lg rounded-full p-2 border border-border hover:bg-card transition-all transform -translate-x-1/2 opacity-0 group-hover/slider:opacity-100"
                    >
                        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-card/90 shadow-lg rounded-full p-2 border border-border hover:bg-card transition-all transform translate-x-1/2 opacity-0 group-hover/slider:opacity-100"
                    >
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
                                        <div className="bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm shadow-md uppercase">
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
