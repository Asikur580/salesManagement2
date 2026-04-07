import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { ChevronRight, Zap, Clock } from "lucide-react";

interface FlashSalePageProps {
    products: {
        data: any[];
        links: any[];
        total: number;
    };
}

const FlashSalePage = ({ products }: FlashSalePageProps) => {
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

    return (
        <ShopLayout>
            <Head title="Flash Sale | CarMart" />

            <div className="bg-[#121212] py-6 lg:py-10 border-b border-white/5 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-[100rem] mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-white/50 mb-3 font-bold">
                        <Link href="/" className="hover:text-white transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="text-white/90">
                            Flash Sale
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-1.5 md:gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <Zap className="h-6 w-6 text-primary fill-primary" />
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none skew-x-[-6deg]">
                                    FLASH SALE
                                </h1>
                            </div>
                            <p className="text-white/70 font-medium text-[13px] md:text-lg max-w-xl leading-relaxed mb-3 md:mb-4">
                                Hurry up! Don't miss out on these limited-time
                                premium car accessory deals.
                            </p>
                        </div>

                        {/* Styled Countdown Timer (As per image) */}
                        <div className="inline-flex items-center gap-3 bg-[#1e1e1e] p-3 rounded-[2rem] border border-white/5 shadow-2xl">
                            <Clock className="h-5 w-5 text-[#00a651]" />
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-center">
                                    <div className="bg-[#00a651] text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                                        {String(timeLeft.hours).padStart(2, "0")}
                                    </div>
                                    <span className="text-[7px] text-muted-foreground/60 font-black uppercase mt-1 tracking-widest">
                                        Hours
                                    </span>
                                </div>
                                <span className="text-white font-black text-lg mb-4 text-center">:</span>
                                <div className="flex flex-col items-center">
                                    <div className="bg-[#00a651] text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                                        {String(timeLeft.minutes).padStart(2, "0")}
                                    </div>
                                    <span className="text-[7px] text-muted-foreground/60 font-black uppercase mt-1 tracking-widest">
                                        Mins
                                    </span>
                                </div>
                                <span className="text-white font-black text-lg mb-4">:</span>
                                <div className="flex flex-col items-center">
                                    <div className="bg-white text-black w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                                        {String(timeLeft.seconds).padStart(2, "0")}
                                    </div>
                                    <span className="text-[7px] text-muted-foreground/60 font-black uppercase mt-1 tracking-widest">
                                        Secs
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-16 bg-card">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                            All Flash Deals{" "}
                            <span className="text-muted-foreground text-sm font-medium">
                                ({products.total} products)
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {products.data.length > 0 ? (
                            products.data.map((product) => (
                                <div
                                    key={product.id}
                                    className="relative group"
                                >
                                    <ProductCard product={product} />
                                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                                        <div className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">
                                            Flash Sale
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center bg-muted rounded-[2.5rem] border-2 border-dashed border-border">
                                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h4 className="text-xl font-bold text-muted-foreground">
                                    No flash sales at the moment.
                                </h4>
                                <p className="text-muted-foreground mt-1">
                                    Check back later for exciting car accessory
                                    deals!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {products.data.length > 0 && products.links.length > 3 && (
                        <div className="mt-12 md:mt-20 flex flex-wrap justify-center gap-2 md:gap-3">
                            {products.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || "#"}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`px-3 py-1.5 md:px-6 md:py-3 min-w-[36px] md:min-w-[44px] flex items-center justify-center rounded-lg md:rounded-xl font-black text-xs md:text-sm transition-all shadow-sm ${
                                        link.active
                                            ? "bg-primary text-white shadow-lg shadow-orange-200"
                                            : "bg-card text-muted-foreground border border-border hover:border-primary hover:text-primary"
                                    } ${!link.url && "opacity-40 cursor-not-allowed cursor-default"}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
};

export default FlashSalePage;
