import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import {
    ChevronRight,
    SlidersHorizontal,
    ArrowUpDown,
    Filter,
    Check,
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

    const handleSortChange = (value: string) => {
        setCurrentSort(value);
    };

    // Auto apply sort change
    useEffect(() => {
        if (currentSort !== (filters?.sort || "default")) {
            applyFilters();
        }
    }, [currentSort]);

    const clearFilters = () => {
        setMinPrice("");
        setMaxPrice("");
        router.get(route("shop.brand", brand.slug), {}, {
            preserveState: false,
            preserveScroll: true,
        });
    };

    const filterContent = (
        <div className="space-y-8">
            {/* Clear All Filters Button */}
            {(filters?.min_price || filters?.max_price) && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold border border-red-100 rounded-xl py-6 underline underline-offset-4"
                >
                    Clear All Filters
                </Button>
            )}

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
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full pl-7 pr-3 py-2 border-border rounded-lg text-sm focus:ring-[#FF4E00] focus:border-primary bg-muted/30"
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
                                className="w-full pl-7 pr-3 py-2 border-border rounded-lg text-sm focus:ring-[#FF4E00] focus:border-primary bg-muted/30"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={applyFilters}
                        className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-black hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                    >
                        Apply Filters
                    </Button>
                </div>
            </div>
        </div>
    );

    const SortOptions = [
        { label: "Default Sorting", value: "default" },
        { label: "Newest First", value: "newest" },
        { label: "Price: Low to High", value: "price_low" },
        { label: "Price: High to Low", value: "price_high" },
    ];

    return (
        <ShopLayout>
            <Head title={`${brand.name} | CarMart`} />

            {/* Desktop Header Section (Hidden on Mobile) */}
            <div className="hidden lg:block bg-[#F8F9FA] py-8 border-b">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link href="/" className="hover:text-primary">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link
                            href={route("shop.all-brands")}
                            className="hover:text-primary"
                        >
                            Brands
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">
                            {brand.name}
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-24 h-24 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center p-2 shrink-0 overflow-hidden">
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
                            <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase italic tracking-tighter">
                                {brand.name} Products
                            </h1>
                            <p className="text-muted-foreground font-medium mt-1 max-w-4xl">
                                {brand.description ||
                                    `Explore the best quality car accessories from ${brand.name}. Check out our top products at the best prices.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Header Section (Sticky) */}
            <div className="lg:hidden sticky top-16 z-30 bg-card border-b px-4 py-4 shadow-sm transform-gpu translate-z-0">
                <h1 className="text-lg font-black text-foreground mb-4">
                    {brand.name}
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
                        <SheetContent
                            side="right"
                            className="w-[300px] sm:w-[400px] overflow-y-auto"
                        >
                            <SheetHeader className="mb-6">
                                <SheetTitle className="text-left flex items-center gap-2 font-black">
                                    <Filter className="h-5 w-5 text-primary" />{" "}
                                    FILTERS
                                </SheetTitle>
                                <SheetDescription className="text-left">
                                    Refine your results for {brand.name}.
                                </SheetDescription>
                            </SheetHeader>
                            {filterContent}
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="py-6 lg:py-12 bg-card min-h-screen">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters (Hidden on Mobile) */}
                        <aside className="hidden lg:block w-72 shrink-0">
                            {filterContent}
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Desktop Toolbar (Hidden on Mobile) */}
                            <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-muted p-4 rounded-2xl border border-border gap-4">
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
                                        "{brand.name}"
                                    </span>
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
                                        className="border-border bg-card rounded-lg text-sm font-bold text-foreground focus:ring-[#FF4E00] focus:border-primary cursor-pointer h-9 px-3"
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
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-muted rounded-3xl border border-dashed border-border px-4">
                                        <h4 className="text-xl font-bold text-muted-foreground">
                                            No products found for this brand
                                        </h4>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Try adjusting your filters.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {products.data.length > 0 &&
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

export default BrandProductsPage;
