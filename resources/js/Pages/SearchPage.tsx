import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { ChevronRight, Search, Filter, Check } from "lucide-react";

// ─── Dummy Data for Search Results ────────────────────────────────────────────
interface SearchPageProps {
    products: {
        data: any[];
        links: any[];
        total: number;
    };
    categories: any[];
    searchTerm: string;
}

const SearchPage = ({
    products,
    categories,
    searchTerm: propSearchTerm,
}: SearchPageProps) => {
    const [searchTerm] = useState(propSearchTerm || "");

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
                                    <span className="text-[#FF4E00]">
                                        {products.data.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="text-[#FF4E00]">
                                        {products.total}
                                    </span>{" "}
                                    results for{" "}
                                    <span className="italic">
                                        "{searchTerm}"
                                    </span>
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
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                        <h4 className="text-xl font-bold text-gray-400">
                                            No products found for this search
                                        </h4>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {products.data.length > 0 &&
                                products.links.length > 3 && (
                                    <div className="mt-16 flex justify-center gap-2">
                                        {products.links.map((link, i) => (
                                            <Link
                                                key={i}
                                                href={link.url || "#"}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                                    link.active
                                                        ? "bg-[#FF4E00] text-white shadow-lg shadow-orange-200"
                                                        : "bg-white text-gray-600 border border-gray-200 hover:border-[#FF4E00] hover:text-[#FF4E00]"
                                                } ${!link.url && "opacity-50 cursor-not-allowed"}`}
                                            />
                                        ))}
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
};

export default SearchPage;
