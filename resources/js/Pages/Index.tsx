import React from "react";
import { Head, Link } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { ShopHero } from "@/components/shop/ShopHero";
import { CategoryGrid } from "@/components/shop/CategoryGrid";
import { NewArrivals } from "@/components/shop/NewArrivals";
import { PopularBrands } from "@/components/shop/PopularBrands";
import { YouMayLike } from "@/components/shop/YouMayLike";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Truck, ShieldCheck, Clock } from "lucide-react";

import { FlashSale } from "@/components/shop/FlashSale";

interface IndexProps {
    flashSaleProducts: any[];
    newArrivals: any[];
    youMayLike: any[];
    categories: any[];
    brands: any[];
}

const Index = ({
    flashSaleProducts,
    newArrivals,
    youMayLike,
    categories,
    brands,
}: IndexProps) => {
    return (
        <ShopLayout>
            <Head title="CarMart | Premium Car Accessories & Ceramic Coating" />

            {/* Hero Section */}
            <ShopHero categories={categories} />

            {/* Top Categories */}
            <CategoryGrid categories={categories} />

            {/* Flash Sale Section */}
            <FlashSale products={flashSaleProducts} />

            {/* New Arrivals Section */}
            <NewArrivals products={newArrivals} />

            {/* Popular Brands Section (Matched to Screenshot) */}
            <PopularBrands brands={brands} />

            {/* You May Like Section */}
            <YouMayLike products={youMayLike} />

            {/* Services Section - Ceramic Coating */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 relative">
                            <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-100 rounded-full mix-blend-multiply opacity-70 animate-blob" />
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-100 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
                            <img
                                src="https://cdn.biswasautomobilesbd.com/article_images/655b1cbf475703d5024fb9fd.webp"
                                className="relative rounded-[2.5rem] shadow-2xl z-10 border-8 border-gray-50"
                                alt="Ceramic Coating Service"
                            />
                        </div>
                        <div className="flex-1 space-y-6">
                            <div className="bg-orange-50 text-[#FF4E00] text-xs font-black px-4 py-1.5 rounded-full inline-block uppercase tracking-[0.2em]">
                                Premium Services
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-800 leading-tight uppercase italic">
                                Nano Ceramic <br />
                                <span className="text-[#FF4E00]">
                                    Coating Service
                                </span>
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed font-medium">
                                Protect your vehicle's paint with our
                                world-class 9H & 10H Nano Ceramic Coating.
                                Experience unmatched gloss, UV protection, and
                                hydrophobic properties that keep your car
                                looking brand new for years.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                {[
                                    "9H & 10H Protection",
                                    "3-5 Years Durability",
                                    "Self-Cleaning Effect",
                                    "Maximum UV Resistance",
                                    "Scratch Resistance",
                                    "Interior Cleaning Free",
                                ].map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="font-bold text-gray-700">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-6">
                                <Button className="bg-black hover:bg-[#FF4E00] text-white font-black px-10 py-7 rounded-xl text-lg transition-all shadow-xl group">
                                    BOOK APPOINTMENT
                                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Promotional Banners */}
            <div className="bg-[#F8F9FA] py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="h-56 rounded-[2rem] relative overflow-hidden group shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1621359953476-ebcc4b0be84b?auto=format&fit=crop&q=80&w=1374"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-10 text-white">
                                <h4 className="text-3xl font-black mb-2 uppercase italic">
                                    Engine Care
                                </h4>
                                <p className="text-sm font-bold opacity-80 mb-6 max-w-[240px] uppercase tracking-wider">
                                    Premium Lubricants & Performance Tools
                                </p>
                                <Link className="inline-flex items-center text-[#FF4E00] font-black text-sm group/btn uppercase tracking-widest bg-white py-2 px-4 rounded-full w-fit">
                                    LEARN MORE{" "}
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                        <div className="h-56 rounded-[2rem] relative overflow-hidden group shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1501"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-10 text-white">
                                <h4 className="text-3xl font-black mb-2 uppercase italic">
                                    Exclusive Combos
                                </h4>
                                <p className="text-sm font-bold opacity-80 mb-6 max-w-[240px] uppercase tracking-wider">
                                    Best Value Packs for Your Car
                                </p>
                                <Link className="inline-flex items-center text-[#FF4E00] font-black text-sm group/btn uppercase tracking-widest bg-white py-2 px-4 rounded-full w-fit">
                                    SAVE NOW{" "}
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
};

export default Index;
