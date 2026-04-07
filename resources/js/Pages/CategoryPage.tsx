import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
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

const CategoryPage = (props: CategoryPageProps) => {
    // Ultra-safe prop handling with logging
    console.log("CategoryPage Full Props:", props);

    // Explicit null/undefined checks for everything
    const category =
        props && props.category ? props.category : ({} as Category);
    const products =
        props && props.products
            ? props.products
            : { data: [], links: [], total: 0 };
    const brands = props && props.brands ? props.brands : [];
    const filters = props && props.filters ? props.filters : {};

    const [minPrice, setMinPrice] = useState(() =>
        filters && filters.min_price ? String(filters.min_price) : "",
    );
    const [maxPrice, setMaxPrice] = useState(() =>
        filters && filters.max_price ? String(filters.max_price) : "",
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
        filters && filters.sort ? String(filters.sort) : "default",
    );
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const applyFilters = () => {
        try {
            const slug = category && category.slug ? category.slug : "";
            if (!slug) {
                console.warn("Cannot apply filters: category slug is missing");
                return;
            }

            const params: any = {};
            if (minPrice) params.min_price = minPrice;
            if (maxPrice) params.max_price = maxPrice;
            if (selectedBrands && selectedBrands.length > 0)
                params.brands = selectedBrands.join(",");
            if (currentSort && currentSort !== "default")
                params.sort = currentSort;

            console.log("Applying filters with params:", params);

            router.get(route("shop.category", slug), params, {
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

    // Auto apply sort change
    useEffect(() => {
        if (currentSort !== (filters?.sort || "default")) {
            applyFilters();
        }
    }, [currentSort]);

    return (
        <ShopLayout>
            <Head title={`${category.name} | CarMart`} />

            {/* Header Section */}
            <div className="bg-[#F8F9FA] py-8 border-b">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link href="/" className="hover:text-primary">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">
                            {category.name}
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase italic tracking-tighter">
                        Best {category.name} in Bangladesh | Mods with Best
                        Price
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1 max-w-4xl">
                        Upgrade your ride with premium{" "}
                        {category.name.toLowerCase()} in Bangladesh. Explore
                        stylish mods, stickers, covers, and care items at the
                        best price.
                    </p>
                </div>
            </div>

            <div className="py-12 bg-card">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className="w-full lg:w-72 shrink-0 space-y-8">
                            {/* Price Filter */}
                            <div>
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-4 border-b pb-2">
                                    Filter By Price
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                                                ৳
                                            </span>
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={minPrice}
                                                onChange={(e) =>
                                                    setMinPrice(e.target.value)
                                                }
                                                className="w-full pl-7 pr-3 py-2 border-border rounded-lg text-sm focus:ring-[#FF4E00] focus:border-primary"
                                            />
                                        </div>
                                        <span className="text-muted-foreground font-bold">
                                            -
                                        </span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                                                ৳
                                            </span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={maxPrice}
                                                onChange={(e) =>
                                                    setMaxPrice(e.target.value)
                                                }
                                                className="w-full pl-7 pr-3 py-2 border-border rounded-lg text-sm focus:ring-[#FF4E00] focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={applyFilters}
                                        className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-black hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                                    >
                                        Filter
                                    </button>
                                </div>
                            </div>

                            {/* Brand Filter */}
                            <div>
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-4 border-b pb-2">
                                    Filter By Brand
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {brands.map((brand) => (
                                        <label
                                            key={brand.id}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                                        >
                                            <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
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
                                                <div className="w-5 h-5 border-2 border-border rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all" />
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-muted p-4 rounded-2xl border border-border gap-4">
                                <div className="text-sm font-bold text-card-foreground">
                                    Showing{" "}
                                    <span className="text-primary">
                                        {products.data.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="text-primary">
                                        {products.total}
                                    </span>{" "}
                                    results for{" "}
                                    <span className="italic">
                                        "{category.name}"
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                                        Sort By:
                                    </span>
                                    <select
                                        value={currentSort}
                                        onChange={handleSortChange}
                                        className="border-border bg-card rounded-lg text-sm font-bold text-foreground focus:ring-[#FF4E00] focus:border-primary cursor-pointer"
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
                                    <div className="col-span-full py-20 text-center bg-muted rounded-3xl border border-dashed border-border">
                                        <h4 className="text-xl font-bold text-muted-foreground">
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
                                                        ? "bg-primary text-white shadow-lg shadow-orange-200"
                                                        : "bg-card text-muted-foreground border border-border hover:border-primary hover:text-primary"
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
