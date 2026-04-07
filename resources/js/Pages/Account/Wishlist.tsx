import React from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { Heart, ShoppingCart, Trash2, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WishlistItem {
    id: number;
    product: {
        id: number;
        name: string;
        slug: string;
        base_price: number;
        primary_image?: {
            image_path: string;
        };
        variants: {
            primary_image: {
                image_path: string;
            };
        }[];
        category?: {
            name: string;
        };
    };
}

export default function Wishlist({
    wishlistItems,
}: {
    wishlistItems: WishlistItem[];
}) {
    return (
        <ShopLayout>
            <Head title="My Wishlist" />

            <div className="bg-card min-h-screen py-12 px-4 md:px-6 lg:px-12">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>                           
                            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-foreground">
                                My{" "}
                                <span className="text-primary">Wishlist</span>
                            </h1>
                        </div>
                        <p className="text-muted-foreground font-bold">
                            {wishlistItems.length} items saved
                        </p>
                    </div>

                    {wishlistItems.length === 0 ? (
                        <div className="text-center py-24 bg-muted rounded-[40px] border-2 border-dashed border-border">
                            <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/5">
                                <Heart className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-2xl font-black italic text-foreground mb-2">
                                Your wishlist is empty
                            </h3>
                            <p className="text-muted-foreground font-medium mb-8">
                                Save items you love to build your dream fleet.
                            </p>
                            <Link href="/">
                                <Button className="bg-primary hover:bg-orange-600 text-white h-14 px-8 rounded-2xl font-black gap-2 transition-all active:scale-95 shadow-xl shadow-orange-500/20">
                                    Explore Products{" "}
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {wishlistItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="group bg-card rounded-[32px] overflow-hidden border border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-[#FF4E00]/10 transition-all duration-500 relative"
                                >
                                    {/* Remove Button */}
                                    <Link
                                        method="delete"
                                        href={route(
                                            "wishlist.destroy",
                                            item.id,
                                        )}
                                        as="button"
                                        className="absolute top-4 right-4 z-10 w-10 h-10 bg-card/90 backdrop-blur-md rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-card transition-all shadow-lg active:scale-9"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Link>

                                    {/* Image */}
                                    <Link
                                        href={route(
                                            "shop.product.show",
                                            item.product.slug,
                                        )}
                                        className="block aspect-[4/3] overflow-hidden bg-muted"
                                    >
                                        <img
                                            src={
                                                item.product.primary_image
                                                    ?.image_path
                                                    ? `${item.product.primary_image.image_path}`
                                                    : `${item.product.variants[0].primary_image.image_path}`
                                            }
                                            alt={item.product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </Link>

                                    {/* Content */}
                                    <div className="p-6">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                                            {item.product.category?.name ||
                                                "Premium Car"}
                                        </p>
                                        <Link
                                            href={route(
                                                "shop.product.show",
                                                item.product.slug,
                                            )}
                                        >
                                            <h3 className="text-xl font-black italic tracking-tight text-foreground mb-4 group-hover:text-primary transition-colors line-clamp-1">
                                                {item.product.name}
                                            </h3>
                                        </Link>

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    Price
                                                </span>
                                                <span className="text-2xl font-black italic text-foreground">
                                                    $
                                                    {Number(
                                                        item.product.base_price,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                            <Link
                                                method="post"
                                                href={route("cart.store")}
                                                data={{
                                                    product_id: item.product.id,
                                                    quantity: 1,
                                                }}
                                                as="button"
                                                className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all active:scale-95 shadow-lg shadow-black/10 hover:shadow-[#FF4E00]/20"
                                            >
                                                <ShoppingCart className="h-5 w-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}
