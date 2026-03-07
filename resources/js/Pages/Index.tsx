import React from "react";
import { Head, Link } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { ShopHero } from "@/components/shop/ShopHero";
import { CategoryGrid } from "@/components/shop/CategoryGrid";
import { NewArrivals } from "@/components/shop/NewArrivals";
import { PopularBrands } from "@/components/shop/PopularBrands";
import { YouMayLike } from "@/components/shop/YouMayLike";
import { Service } from "@/components/shop/Service";
import { PromotionalBanners } from "@/components/shop/PromotionalBanners";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";

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
            <Service />

            {/* Promotional Banners */}
            <PromotionalBanners />
        </ShopLayout>
    );
};

export default Index;
