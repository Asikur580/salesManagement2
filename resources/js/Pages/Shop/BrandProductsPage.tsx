import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { ChevronRight } from "lucide-react";

interface Brand {
    id: number;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
}

interface BrandProductsPageProps {
    brand: Brand;
    products: {
        data: any[];
        links: any[];
        total: number;
        current_page: number;
    };
    filters: {
        min_price?: string;
        max_price?: string;
        sort?: string;
    };
}

const BrandProductsPage = (props: BrandProductsPageProps) => {
    const brand = props?.brand || ({} as Brand);
    const products = props?.products || { data: [], links: [], total: 0 };
    const filters = props?.filters || {};

    const [minPrice, setMinPrice] = useState(() =>
        filters?.min_price ? String(filters.min_price) : "",
    );
    const [maxPrice, setMaxPrice] = useState(() =>
        filters?.max_price ? String(filters.max_price) : "",
    );
    const [currentSort, setCurrentSort] = useState(() =>
        filters?.sort ? String(filters.sort) : "default",
    );

    const applyFilters = () => {
        try {
            const slug = brand?.slug || "";
            if (!slug) return;

            const params: any = {};
            if (minPrice) params.min_price = minPrice;
            if (maxPrice) params.max_price = maxPrice;
            if (currentSort && currentSort !== "default")
                params.sort = currentSort;

            router.get(route("shop.brand", slug), params, {
                preserveState: true,
                preserveScroll: true,
            });
        } catch (e) {
            console.error("Error applying filters:", e);
        }
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentSort(e.target.value);
    };

    // Auto apply sort change
    useEffect(() => {
        if (currentSort !== (filters?.sort || "default")) {
            applyFilters();
        }
    }, [currentSort]);

    return (
        <ShopLayout>
            <Head title={`${brand.name} | CarMart`} />

            {/* Header Section */}
            <div className="bg-[#F8F9FA] py-8 border-b">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-[#FF4E00]">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link
                            href={route("shop.all-brands")}
                            className="hover:text-[#FF4E00]"
                        >
                            Brands
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900 font-medium">
                            {brand.name}
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-24 h-24 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2 shrink-0 overflow-hidden">
                            <img
                                src={
                                    brand.logo
                                        ? brand.logo.startsWith("http") ||
                                          brand.logo.startsWith("/storage/")
                                            ? brand.logo
                                            : `/storage/${brand.logo}`
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=f9fafb&color=ff4e00&bold=true`
                                }
                                alt={brand.name}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                                {brand.name} Products
                            </h1>
                            <p className="text-gray-500 font-medium mt-1 max-w-4xl">
                                {brand.description ||
                                    `Explore the best quality car accessories from ${brand.name}. Check out our top products at the best prices.`}
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
                            {/* Price Filter */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 border-b pb-2">
                                    Filter By Price
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
                                                value={minPrice}
                                                onChange={(e) =>
                                                    setMinPrice(e.target.value)
                                                }
                                                className="w-full pl-7 pr-3 py-2 border-gray-200 rounded-lg text-sm focus:ring-[#FF4E00] focus:border-[#FF4E00]"
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
                                                value={maxPrice}
                                                onChange={(e) =>
                                                    setMaxPrice(e.target.value)
                                                }
                                                className="w-full pl-7 pr-3 py-2 border-gray-200 rounded-lg text-sm focus:ring-[#FF4E00] focus:border-[#FF4E00]"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={applyFilters}
                                        className="w-full bg-[#FF4E00] text-white py-2.5 rounded-lg text-sm font-black hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                                    >
                                        Filter
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
                                        "{brand.name}"
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                        Sort By:
                                    </span>
                                    <select
                                        value={currentSort}
                                        onChange={handleSortChange}
                                        className="border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-900 focus:ring-[#FF4E00] focus:border-[#FF4E00] cursor-pointer"
                                    >
                                        <option value="default">
                                            Default Sorting
                                        </option>
                                        <option value="newest">
                                            Newest First
                                        </option>
                                        <option value="price_low">
                                            Price: Low to High
                                        </option>
                                        <option value="price_high">
                                            Price: High to Low
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                            No products found for this brand
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

export default BrandProductsPage;
