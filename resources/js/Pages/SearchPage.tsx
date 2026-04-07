import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import {
    ChevronRight,
    Search,
    Check,
    SlidersHorizontal,
    ArrowUpDown,
    ArrowDownWideNarrow,
    Filter,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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

    const handleSortChange = (value: string) => {
        setCurrentSort(value);
    };

    useEffect(() => {
        if (currentSort !== (filters?.sort || "default")) {
            applyFilters();
        }
    }, [currentSort]);

    const FilterContent = () => (
        <div className="space-y-8">
            {/* Category Filter */}
            <div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-4 border-b pb-2">
                    Categories
                </h3>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
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
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted/80 hover:text-primary"
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
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-4 border-b pb-2">
                    Price Range
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
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full pl-7 pr-3 py-2 border-border rounded-lg text-sm focus:ring-primary focus:border-primary bg-muted/30"
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
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full pl-7 pr-3 py-2 border-border rounded-lg text-sm focus:ring-primary focus:border-primary bg-muted/30"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={applyFilters}
                        className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-black hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                    >
                        Filter Results
                    </Button>
                </div>
            </div>

            {/* Brand Filter */}
            <div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-4 border-b pb-2">
                    Brands
                </h3>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
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
                                        handleBrandChange(brand.id.toString())
                                    }
                                    className="peer hidden"
                                />
                                <div className="w-5 h-5 border-2 border-border rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all" />
                                <Check className="h-3.5 w-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                        </label>
                    ))}
                </div>
                <Button
                    onClick={applyFilters}
                    className="w-full mt-4 bg-gray-900 text-white font-black hover:bg-gray-800"
                >
                    Apply Brands
                </Button>
            </div>
        </div>
    );

    const SortOptions = [
        { label: "Relevance", value: "default" },
        { label: "Newest First", value: "newest" },
        { label: "Price: Low to High", value: "price_low" },
        { label: "Price: High to Low", value: "price_high" },
    ];

    return (
        <ShopLayout>
            <Head title={`Search: ${searchTerm} | CarMart`} />

            {/* Desktop Header Section (Hidden on Mobile) */}
            <div className="hidden lg:block bg-[#F8F9FA] py-8 border-b">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link href="/" className="hover:text-primary">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">
                            Search Results
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Search className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase italic tracking-tighter">
                                {searchTerm
                                    ? `Results for "${searchTerm}"`
                                    : "All Products"}
                            </h1>
                            <p className="text-muted-foreground font-medium mt-1">
                                We found {products?.total || 0} great products
                                for you.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Header Section (Sticky) */}
            <div className="lg:hidden sticky top-16 z-30 bg-card border-b px-4 py-4 shadow-sm transform-gpu translate-z-0">
                <h1 className="text-lg font-black text-foreground mb-4">
                    Search - {searchTerm}
                </h1>
                <div className="flex items-center gap-3">
                    {/* Mobile Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex-1 bg-card border-border text-[#333] font-bold h-10 rounded-lg flex items-center justify-center gap-2"
                            >
                                Sort <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {SortOptions.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() => handleSortChange(opt.value)}
                                    className={`font-bold ${currentSort === opt.value ? "text-primary bg-primary/5" : ""}`}
                                >
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile Filter Sheet */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-black h-10 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-100">
                                Filter{" "}
                                <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle className="text-left flex items-center gap-2 font-black">
                                    <Filter className="h-5 w-5 text-primary" /> FILTERS
                                </SheetTitle>
                                <SheetDescription className="text-left">
                                    Refine your search results.
                                </SheetDescription>
                            </SheetHeader>
                            <FilterContent />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="py-6 lg:py-12 bg-card min-h-screen">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters (Hidden on Mobile) */}
                        <aside className="hidden lg:block w-72 shrink-0">
                            <FilterContent />
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Desktop Toolbar (Hidden on Mobile) */}
                            <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-muted p-4 rounded-2xl border border-border gap-4">
                                <div className="text-sm font-bold text-card-foreground">
                                    Showing{" "}
                                    <span className="text-primary">
                                        {products?.data?.length || 0}
                                    </span>{" "}
                                    of{" "}
                                    <span className="text-primary">
                                        {products?.total || 0}
                                    </span>{" "}
                                    results
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                                        Sort By:
                                    </span>
                                    <select
                                        value={currentSort}
                                        onChange={(e) =>
                                            handleSortChange(e.target.value)
                                        }
                                        className="border-border bg-card rounded-lg text-sm font-bold text-foreground focus:ring-primary focus:border-primary cursor-pointer h-9 px-3"
                                    >
                                        {SortOptions.map((opt) => (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Product Grid - 2 columns on mobile */}
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {products?.data?.length > 0 ? (
                                    products.data.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-muted rounded-3xl border border-dashed border-border px-4">
                                        <h4 className="text-xl font-bold text-muted-foreground">
                                            No products found for this search
                                        </h4>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Try adjusting your filters or search query.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {products?.data?.length > 0 &&
                                products.links.length > 3 && (
                                    <div className="mt-12 md:mt-16 flex justify-center gap-2 flex-wrap">
                                        {products.links.map((link, i) => (
                                            <Link
                                                key={i}
                                                href={link.url || "#"}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                                className={`px-3 md:px-4 py-2 rounded-lg font-bold text-[13px] md:text-sm transition-all ${
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

export default SearchPage;
