import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ShopLayout } from "@/components/layout/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { ChevronRight, Filter, ChevronDown, Check } from "lucide-react";

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Brand {
    id: number;
    name: string;
}

interface CategoryPageProps {
    category: Category;
    products: {
        data: any[];
        links: any[];
        total: number;
        current_page: number;
    };
    brands: Brand[];
    filters: {
        min_price?: string;
        max_price?: string;
        brands?: string;
        sort?: string;
    };
}

const CategoryPage = ({
    category,
    products,
    brands,
    filters,
}: CategoryPageProps) => {
    const [minPrice, setMinPrice] = useState(filters.min_price || "");
    const [maxPrice, setMaxPrice] = useState(filters.max_price || "");
    const [selectedBrands, setSelectedBrands] = useState<string[]>(
        filters.brands ? filters.brands.split(",") : [],
    );
    const [sort, setSort] = useState(filters.sort || "default");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const applyFilters = () => {
        router.get(
            route("shop.category", category.slug),
            {
                min_price: minPrice,
                max_price: maxPrice,
                brands: selectedBrands.join(","),
                sort: sort,
            },
            { preserveState: true },
        );
    };

    const handleBrandChange = (brandId: string) => {
        setSelectedBrands((prev) =>
            prev.includes(brandId)
                ? prev.filter((id) => id !== brandId)
                : [...prev, brandId],
        );
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSort(e.target.value);
    };

    // Auto apply sort change
    useEffect(() => {
        if (sort !== filters.sort) {
            applyFilters();
        }
    }, [sort]);

    return (
        <ShopLayout>
            <Head title={`${category.name} | OrenMart`} />

            {/* Header Section */}
            <div className="bg-[#F8F9FA] py-8 border-b">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-[#FF4E00]">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900 font-medium">
                            {category.name}
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                        Best {category.name} in Bangladesh | Mods with Best
                        Price
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 max-w-4xl">
                        Upgrade your ride with premium{" "}
                        {category.name.toLowerCase()} in Bangladesh. Explore
                        stylish mods, stickers, covers, and care items at the
                        best price.
                    </p>
                </div>
            </div>

            <div className="py-12 bg-white">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className="w-full lg:w-64 shrink-0 space-y-8">
                            {/* Price Filter */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 border-b pb-2">
                                    Filter By Price
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) =>
                                                setMinPrice(e.target.value)
                                            }
                                            className="w-full border-gray-200 rounded-lg text-sm focus:ring-[#FF4E00] focus:border-[#FF4E00]"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) =>
                                                setMaxPrice(e.target.value)
                                            }
                                            className="w-full border-gray-200 rounded-lg text-sm focus:ring-[#FF4E00] focus:border-[#FF4E00]"
                                        />
                                    </div>
                                    <button
                                        onClick={applyFilters}
                                        className="w-full bg-[#FF4E00] text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                                    >
                                        Filter
                                    </button>
                                    <p className="text-xs text-gray-500 font-bold">
                                        Price: ৳{minPrice || 0} — ৳
                                        {maxPrice || "3000+"}
                                    </p>
                                </div>
                            </div>

                            {/* Brand Filter */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 border-b pb-2">
                                    Filter By Brand
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {brands.map((brand) => (
                                        <label
                                            key={brand.id}
                                            className="flex items-center justify-between group cursor-pointer"
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
                                    className="w-full mt-4 bg-gray-100 text-gray-800 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Apply Brands
                                </button>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between mb-8 bg-gray-50 p-4 rounded-2xl">
                                <div className="text-sm font-bold text-gray-600">
                                    Showing {products.data.length} of{" "}
                                    {products.total} results for{" "}
                                    <span className="text-[#FF4E00]">
                                        "{category.name}"
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <select
                                        value={sort}
                                        onChange={handleSortChange}
                                        className="border-0 bg-transparent text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer"
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
                                            No products found for this category
                                            or filter
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

export default CategoryPage;
