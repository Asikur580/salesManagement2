import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { ChevronRight, Search, Check } from "lucide-react";

interface Brand {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface SearchPageProps {
    products: {
        data: any[];
        links: any[];
        total: number;
    };
    filterCategories: Category[];
    brands: Brand[];
    searchTerm: string;
    filters: {
        min_price?: string;
        max_price?: string;
        brands?: string;
        sort?: string;
        category?: string;
    };
}

const SearchPage = ({
    products,
    filterCategories,
    brands = [],
    searchTerm: propSearchTerm,
    filters = {},
}: SearchPageProps) => {
    const [searchTerm] = useState(propSearchTerm || "");
    const [minPrice, setMinPrice] = useState(() =>
        filters?.min_price ? String(filters.min_price) : "",
    );
    const [maxPrice, setMaxPrice] = useState(() =>
        filters?.max_price ? String(filters.max_price) : "",
    );
    const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
        try {
            if (filters && filters.brands) {
                return String(filters.brands).split(",").filter(Boolean);
            }
        } catch (e) {
            console.error("Error parsing brands filter:", e);
        }
        return [];
    });
    const [currentSort, setCurrentSort] = useState(() =>
        filters?.sort ? String(filters.sort) : "default",
    );

    const applyFilters = () => {
        try {
            const params: any = {};
            if (searchTerm) params.q = searchTerm;
            if (minPrice) params.min_price = minPrice;
            if (maxPrice) params.max_price = maxPrice;
            if (selectedBrands && selectedBrands.length > 0)
                params.brands = selectedBrands.join(",");
            if (currentSort && currentSort !== "default")
                params.sort = currentSort;
            if (filters?.category) params.category = filters.category;

            router.get(route("shop.search"), params, {
                preserveState: true,
                preserveScroll: true,
            });
        } catch (e) {
            console.error("Error in applyFilters:", e);
        }
    };

    const handleBrandChange = (brandId: string) => {
        setSelectedBrands((prev) =>
            prev.includes(brandId)
                ? prev.filter((id) => id !== brandId)
                : [...prev, brandId],
        );
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentSort(e.target.value);
    };

    useEffect(() => {
        if (currentSort !== (filters?.sort || "default")) {
            applyFilters();
        }
    }, [currentSort]);

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
                                {searchTerm
                                    ? `Results for "${searchTerm}"`
                                    : "All Products"}
                            </h1>
                            <p className="text-gray-500 font-medium mt-1">
                                We found {products?.total || 0} great products
                                for you.
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
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {filterCategories?.map((cat: any) => (
                                        <Link
                                            key={cat.id}
                                            href={route("shop.search", {
                                                ...filters,
                                                category: cat.slug,
                                                q: searchTerm,
                                            })}
                                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                                                filters?.category === cat.slug
                                                    ? "bg-[#FF4E00]/10 text-[#FF4E00]"
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-[#FF4E00]"
                                            }`}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                    {filters?.category && (
                                        <Link
                                            href={route("shop.search", {
                                                ...filters,
                                                category: undefined,
                                                q: searchTerm,
                                            })}
                                            className="block w-full text-left mt-2 px-3 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            Clear Category Filter
                                        </Link>
                                    )}
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
                                        Filter Results
                                    </button>
                                </div>
                            </div>

                            {/* Brand Filter */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 border-b pb-2">
                                    Brands
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {brands.map((brand) => (
                                        <label
                                            key={brand.id}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                                        >
                                            <span className="text-sm font-bold text-gray-600 group-hover:text-[#FF4E00] transition-colors">
                                                {brand.name}
                                            </span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(
                                                        brand.id.toString(),
                                                    )}
                                                    onChange={() =>
                                                        handleBrandChange(
                                                            brand.id.toString(),
                                                        )
                                                    }
                                                    className="peer hidden"
                                                />
                                                <div className="w-5 h-5 border-2 border-gray-200 rounded-md peer-checked:bg-[#FF4E00] peer-checked:border-[#FF4E00] transition-all" />
                                                <Check className="h-3.5 w-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <button
                                    onClick={applyFilters}
                                    className="w-full mt-4 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-black hover:bg-gray-800 transition-all"
                                >
                                    Apply Brands
                                </button>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100 gap-4">
                                <div className="text-sm font-bold text-gray-700">
                                    Showing{" "}
                                    <span className="text-[#FF4E00]">
                                        {products?.data?.length || 0}
                                    </span>{" "}
                                    of{" "}
                                    <span className="text-[#FF4E00]">
                                        {products?.total || 0}
                                    </span>{" "}
                                    results
                                    {searchTerm && (
                                        <>
                                            {" "}
                                            for{" "}
                                            <span className="italic">
                                                "{searchTerm}"
                                            </span>
                                        </>
                                    )}
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
                                            Relevance
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
                            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products?.data?.length > 0 ? (
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
                            {products?.data?.length > 0 &&
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
