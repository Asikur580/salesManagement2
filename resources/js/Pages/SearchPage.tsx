import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { ShopLayout } from "@/components/layout/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { ChevronRight, Search, Filter, Check } from "lucide-react";

// ─── Dummy Data for Search Results ────────────────────────────────────────────
const DUMMY_PRODUCTS = [
    {
        id: 1,
        name: "Premium Ceramic Coating Kit",
        slug: "ceramic-coating-kit",
        sale_price: 1500,
        image: "https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?q=80&w=500&auto=format&fit=crop",
        category: { name: "Car Care" },
        brand: { name: "NanoPro" },
        quantity: 10,
    },
    {
        id: 2,
        name: "Ultra-Bright LED Headlights",
        slug: "led-headlights",
        sale_price: 2200,
        image: "https://images.unsplash.com/photo-1549399500-c44d07040996?q=80&w=500&auto=format&fit=crop",
        category: { name: "Lighting" },
        brand: { name: "Lumix" },
        quantity: 5,
    },
    {
        id: 3,
        name: "Luxury Leather Steering Cover",
        slug: "steering-cover",
        sale_price: 850,
        image: "https://images.unsplash.com/photo-1594002429007-8e6f1f4400e2?q=80&w=500&auto=format&fit=crop",
        category: { name: "Interior" },
        brand: { name: "AutoElite" },
        quantity: 15,
    },
    {
        id: 4,
        name: "Car Dash Cam 4K Ultra",
        slug: "dash-cam-4k",
        sale_price: 4500,
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=500&auto=format&fit=crop",
        category: { name: "Electronics" },
        brand: { name: "VisionX" },
        quantity: 3,
    },
];

import { usePage } from "@inertiajs/react";

const SearchPage = () => {
    const { categories, searchTerm: propSearchTerm } = usePage().props as any;
    const [searchTerm] = useState(propSearchTerm || "Car Accessories");

    return (
        <ShopLayout>
            <Head title={`Search: ${searchTerm} | CarMart`} />

            {/* Header Section */}
            <div className="bg-[#F8F9FA] py-8 border-b">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-[#FF4E00]">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900 font-medium">
                            Search Results
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FF4E00]/10 flex items-center justify-center shrink-0">
                            <Search className="h-6 w-6 text-[#FF4E00]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                                Results for "{searchTerm}"
                            </h1>
                            <p className="text-gray-500 font-medium mt-1">
                                We found some great products for you.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-12 bg-white">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className="w-full lg:w-72 shrink-0 space-y-8">
                            {/* Category Filter */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 border-b pb-2">
                                    Categories
                                </h3>
                                <div className="space-y-2">
                                    {categories?.map((cat: any) => (
                                        <Link
                                            key={cat.id}
                                            href={route(
                                                "shop.category",
                                                cat.slug,
                                            )}
                                            className="block w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all hover:text-[#FF4E00]"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 border-b pb-2">
                                    Price Range
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                                                ৳
                                            </span>
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                disabled
                                                className="w-full pl-7 pr-3 py-2 border-gray-100 bg-gray-50 rounded-lg text-sm opacity-60"
                                            />
                                        </div>
                                        <span className="text-gray-400 font-bold">
                                            -
                                        </span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                                                ৳
                                            </span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                disabled
                                                className="w-full pl-7 pr-3 py-2 border-gray-100 bg-gray-50 rounded-lg text-sm opacity-60"
                                            />
                                        </div>
                                    </div>
                                    <button className="w-full bg-[#FF4E00] text-white py-2.5 rounded-lg text-sm font-black hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">
                                        Filter Results
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100 gap-4">
                                <div className="text-sm font-bold text-gray-700">
                                    Showing{" "}
                                    <span className="text-[#FF4E00]">4</span>{" "}
                                    products
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                        Sort By:
                                    </span>
                                    <select className="border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-900 focus:ring-[#FF4E00] focus:border-[#FF4E00] cursor-pointer">
                                        <option>Relevance</option>
                                        <option>Newest First</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                    </select>
                                </div>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {DUMMY_PRODUCTS.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
};

export default SearchPage;
