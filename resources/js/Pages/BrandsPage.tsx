import React from "react";
import { Head, Link } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { ChevronRight } from "lucide-react";

interface Brand {
    id: number;
    name: string;
    logo?: string;
    slug: string;
}

interface BrandsPageProps {
    brands: Brand[];
}

const BrandsPage = ({ brands }: BrandsPageProps) => {
    return (
        <ShopLayout>
            <Head title="Official Partners | OrenMart" />

            <div className="bg-[#F8F9FA] py-8 border-b">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link href="/" className="hover:text-primary">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">
                            All Brands
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">
                        Our Official Brands
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        We partner with the world's leading car accessory and
                        maintenance brands.
                    </p>
                </div>
            </div>

            <div className="py-12 bg-card">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={route("shop.brand", brand.slug)}
                                className="flex flex-col items-center group"
                            >
                                <div className="w-24 h-24 rounded-full border border-border bg-card p-3 mb-4 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center overflow-hidden">
                                    <img
                                        src={
                                            brand.logo
                                                ? brand.logo.startsWith(
                                                      "http",
                                                  ) ||
                                                  brand.logo.startsWith(
                                                      "/storage/",
                                                  )
                                                    ? brand.logo
                                                    : `/storage/${brand.logo}`
                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=f9fafb&color=ff4e00&bold=true`
                                        }
                                        alt={brand.name}
                                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <span className="text-[14px] font-bold text-center text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                                    {brand.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
};

export default BrandsPage;
