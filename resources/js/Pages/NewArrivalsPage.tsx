import React from "react";
import { Head, Link } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { ChevronRight } from "lucide-react";

interface NewArrivalsPageProps {
    products: {
        data: any[];
        links: any[];
    };
}

const NewArrivalsPage = ({ products }: NewArrivalsPageProps) => {
    return (
        <ShopLayout>
            <Head title="New Arrivals | OrenMart" />

            <div className="bg-[#F8F9FA] py-8 border-b">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link href="/" className="hover:text-primary">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">
                            New Arrivals
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">
                        New Arrivals
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Discover our latest collection of premium car
                        accessories.
                    </p>
                </div>
            </div>

            <div className="py-12 bg-card">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
                                    No products found
                                </h4>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {products.data.length > 0 && products.links.length > 3 && (
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
        </ShopLayout>
    );
};

export default NewArrivalsPage;
