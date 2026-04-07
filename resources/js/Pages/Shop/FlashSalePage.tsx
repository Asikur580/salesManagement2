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

            <div className="bg-[#1a1a1a] py-12 border-b relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-[100rem] mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Link href="/" className="hover:text-primary">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-white font-medium">
                            Flash Sale
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="h-8 w-8 text-primary fill-[#FF4E00] animate-pulse" />
                                <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                                    Flash Sale
                                </h1>
                            </div>
                            <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                                Hurry up! Don't miss out on these limited-time
                                premium car accessory deals.
                            </p>
                        </div>

                        {/* Large Countdown Timer */}
                        <div className="flex items-center gap-4 bg-card/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
                            <Clock className="h-6 w-6 text-primary" />
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                    <span className="bg-primary text-white px-3 py-2 rounded-xl font-black text-2xl min-w-[50px] text-center shadow-lg shadow-orange-900/20">
                                        {String(timeLeft.hours).padStart(
                                            2,
                                            "0",
                                        )}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                        Hours
                                    </span>
                                </div>
                                <span className="text-white font-black text-2xl mb-5">
                                    :
                                </span>
                                <div className="flex flex-col items-center">
                                    <span className="bg-primary text-white px-3 py-2 rounded-xl font-black text-2xl min-w-[50px] text-center shadow-lg shadow-orange-900/20">
                                        {String(timeLeft.minutes).padStart(
                                            2,
                                            "0",
                                        )}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                        Mins
                                    </span>
                                </div>
                                <span className="text-white font-black text-2xl mb-5">
                                    :
                                </span>
                                <div className="flex flex-col items-center">
                                    <span className="bg-card text-black px-3 py-2 rounded-xl font-black text-2xl min-w-[50px] text-center shadow-lg shadow-gray-900/20">
                                        {String(timeLeft.seconds).padStart(
                                            2,
                                            "0",
                                        )}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
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
                        <div className="mt-20 flex justify-center gap-3">
                            {products.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || "#"}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`px-6 py-3 rounded-xl font-black text-sm transition-all shadow-sm ${
                                        link.active
                                            ? "bg-primary text-white shadow-lg shadow-orange-200 scale-110"
                                            : "bg-card text-muted-foreground border border-border hover:border-primary hover:text-primary hover:shadow-md"
                                    } ${!link.url && "opacity-40 cursor-not-allowed"}`}
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
