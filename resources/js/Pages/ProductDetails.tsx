import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { ShopLayout } from "@/components/layout/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShoppingCart,
    Heart,
    Share2,
    Truck,
    ShieldCheck,
    RotateCcw,
    Star,
    Plus,
    Minus,
    CheckCircle2,
    Info,
    ArrowRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductDetailsProps {
    product: any;
    relatedProducts: any[];
}

export default function ProductDetails({
    product,
    relatedProducts,
}: ProductDetailsProps) {
    const getImagePath = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        if (path.startsWith("/storage/")) return path;
        return `/storage/${path}`;
    };

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(
        getImagePath(product.primary_image?.image_path) || product.image,
    );
    const [selectedAttributes, setSelectedAttributes] = useState<
        Record<number, number>
    >({});

    const availableAttributes = React.useMemo(() => {
        const result: Record<
            number,
            { name: string; values: Record<number, string> }
        > = {};

        const variants = product.variants || [];
        variants.forEach((variant: any) => {
            const vals =
                variant.attribute_values || variant.attributeValues || [];
            vals.forEach((val: any) => {
                if (!val.attribute) return;
                const attrId = val.attribute.id;
                if (!result[attrId]) {
                    result[attrId] = { name: val.attribute.name, values: {} };
                }
                result[attrId].values[val.id] = val.value;
            });
        });

        return Object.entries(result).map(([id, data]) => ({
            id: Number(id),
            name: data.name,
            values: Object.entries(data.values).map(([vId, vValue]) => ({
                id: Number(vId),
                value: vValue as string,
            })),
        }));
    }, [product.variants]);

    const selectedVariant = React.useMemo(() => {
        const variants = product.variants || [];
        if (variants.length === 0) return null;
        if (
            Object.keys(selectedAttributes).length !==
            availableAttributes.length
        )
            return null;

        return variants.find((variant: any) => {
            const vals =
                variant.attribute_values || variant.attributeValues || [];
            if (vals.length !== availableAttributes.length) return false;

            return vals.every(
                (v: any) => selectedAttributes[v.attribute_id] === v.id,
            );
        });
    }, [selectedAttributes, product.variants, availableAttributes]);

    React.useEffect(() => {
        if (
            availableAttributes.length > 0 &&
            Object.keys(selectedAttributes).length === 0
        ) {
            const initialSelection: Record<number, number> = {};
            const firstVariant = (product.variants || [])[0];
            if (firstVariant) {
                const vals =
                    firstVariant.attribute_values ||
                    firstVariant.attributeValues ||
                    [];
                vals.forEach((v: any) => {
                    initialSelection[v.attribute_id] = v.id;
                });
                setSelectedAttributes(initialSelection);
            }
        }
    }, [availableAttributes, product.variants]);

    React.useEffect(() => {
        if (selectedVariant) {
            const variantImage =
                selectedVariant.primary_image?.image_path ||
                selectedVariant.image ||
                selectedVariant.image_path;

            if (variantImage) {
                setSelectedImage(getImagePath(variantImage));
            } else {
                setSelectedImage(
                    getImagePath(product.primary_image?.image_path) ||
                        product.image,
                );
            }
        } else {
            setSelectedImage(
                getImagePath(product.primary_image?.image_path) ||
                    product.image,
            );
        }
    }, [selectedVariant, product.primary_image, product.image]);

    const activeStock = selectedVariant
        ? Number(selectedVariant.stock)
        : Number(product.stock || 0);
    const activePrice =
        selectedVariant && selectedVariant.price
            ? parseFloat(selectedVariant.price)
            : parseFloat(product.price || 0);

    const incrementQty = () =>
        setQuantity((prev) => (prev < activeStock ? prev + 1 : prev));
    const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const originalPrice = product.old_price
        ? parseFloat(product.old_price)
        : activePrice * 1.1; // Default fallback

    const discount = Math.round(
        ((originalPrice - activePrice) / originalPrice) * 100,
    );

    return (
        <ShopLayout>
            <Head title={`${product.name} | CarMart`} />

            <div className="bg-gray-50/50 py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
                        <Link
                            href="/"
                            className="hover:text-[#FF4E00] transition-colors"
                        >
                            Home
                        </Link>
                        <span>/</span>
                        <Link
                            href={route(
                                "shop.category",
                                product.category?.slug || "",
                            )}
                            className="hover:text-[#FF4E00] transition-colors"
                        >
                            {product.category?.name || "Category"}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium truncate">
                            {product.name}
                        </span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100">
                        {/* Left: Product Images */}
                        <div className="lg:col-span-6 space-y-4">
                            <div className="relative aspect-square bg-[#F9F9F9] rounded-[2rem] overflow-hidden border border-gray-50 group">
                                <img
                                    src={
                                        selectedImage ||
                                        `https://placehold.co/800x800/f5f5f5/333333?text=${product.name}`
                                    }
                                    alt={product.name}
                                    className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                                />
                                {discount > 0 && (
                                    <Badge className="absolute top-6 left-6 bg-[#FF4E00] text-white px-4 py-1.5 rounded-full text-sm font-black border-none shadow-lg">
                                        SAVE {discount}%
                                    </Badge>
                                )}
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute top-6 right-6 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-md"
                                >
                                    <Heart className="h-5 w-5 text-gray-600" />
                                </Button>
                            </div>

                            {/* Thumbnails Gallery */}
                            <div className="grid grid-cols-4 gap-4">
                                {product.images && product.images.length > 0 ? (
                                    product.images.map(
                                        (img: any, i: number) => (
                                            <button
                                                key={img.id || i}
                                                onClick={() =>
                                                    setSelectedImage(
                                                        getImagePath(
                                                            img.image_path,
                                                        ),
                                                    )
                                                }
                                                className={`aspect-square rounded-2xl border-2 transition-all p-2 bg-gray-50 ${
                                                    selectedImage ===
                                                    getImagePath(img.image_path)
                                                        ? "border-[#FF4E00] ring-2 ring-orange-100"
                                                        : "border-transparent hover:border-gray-200"
                                                }`}
                                            >
                                                <img
                                                    src={
                                                        getImagePath(
                                                            img.image_path,
                                                        ) || ""
                                                    }
                                                    alt={`${product.name} view ${i + 1}`}
                                                    className="w-full h-full object-contain"
                                                />
                                            </button>
                                        ),
                                    )
                                ) : (
                                    <button className="aspect-square rounded-2xl border-2 border-[#FF4E00] transition-all p-2 bg-gray-50 ring-2 ring-orange-100">
                                        <img
                                            src={selectedImage || ""}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right: Product Info */}
                        <div className="lg:col-span-6 space-y-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge
                                        variant="outline"
                                        className="border-gray-200 text-gray-500 font-bold uppercase tracking-wider px-3 py-1"
                                    >
                                        {product.brand?.name || "CarMart"}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                                            />
                                        ))}
                                        <span className="text-sm text-gray-400 font-medium ml-2">
                                            (4.8 / 5.0)
                                        </span>
                                    </div>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight uppercase italic mb-4">
                                    {product.name}
                                </h1>
                                <div className="flex items-baseline gap-4 mb-6">
                                    <span className="text-4xl font-black text-[#FF4E00]">
                                        ৳{activePrice.toLocaleString()}
                                    </span>
                                    {originalPrice > activePrice && (
                                        <span className="text-xl text-gray-400 line-through font-medium">
                                            ৳{originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="h-4 w-4 text-[#FF4E00]" />
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {activeStock > 0
                                            ? `In Stock. Quick delivery available within 2-3 business days.`
                                            : `Currently out of stock. Contact us for availability.`}
                                    </p>
                                </div>

                                {/* Variants Selectors */}
                                {availableAttributes.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-6">
                                        {availableAttributes.map((attr) => (
                                            <div
                                                key={attr.id}
                                                className="space-y-3"
                                            >
                                                <h4 className="font-bold text-gray-900 uppercase text-sm tracking-wider">
                                                    {attr.name}
                                                </h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {attr.values.map((val) => {
                                                        const isSelected =
                                                            selectedAttributes[
                                                                attr.id
                                                            ] === val.id;
                                                        return (
                                                            <button
                                                                key={val.id}
                                                                onClick={() =>
                                                                    setSelectedAttributes(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [attr.id]:
                                                                                val.id,
                                                                        }),
                                                                    )
                                                                }
                                                                className={`px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                                                                    isSelected
                                                                        ? "border-[#FF4E00] text-[#FF4E00] bg-orange-50"
                                                                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                                                }`}
                                                            >
                                                                {val.value}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Quantity & Actions */}
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex items-center bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={decrementQty}
                                            className="h-12 w-12 hover:bg-white rounded-lg transition-all"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-12 text-center font-black text-lg">
                                            {quantity}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={incrementQty}
                                            className="h-12 w-12 hover:bg-white rounded-lg transition-all"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button className="w-full sm:flex-1 bg-black hover:bg-[#FF4E00] text-white py-8 rounded-[1.25rem] text-lg font-black transition-all shadow-xl shadow-gray-200 group">
                                        <ShoppingCart className="mr-3 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                                        ADD TO CART
                                    </Button>
                                </div>

                                <Button className="w-full bg-[#FF4E00] hover:bg-black text-white py-8 rounded-[1.25rem] text-lg font-black transition-all shadow-xl shadow-orange-100">
                                    BUY IT NOW
                                </Button>
                            </div>

                            {/* Features Mini Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                        <Truck className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 uppercase">
                                        Fast Delivery
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                                        <ShieldCheck className="h-6 w-6 text-green-600" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 uppercase">
                                        Secure Payment
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 col-span-2 md:col-span-1">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                        <RotateCcw className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 uppercase">
                                        7 Days Return
                                    </span>
                                </div>
                            </div>

                            {/* Share button */}
                            <div className="flex items-center justify-center pt-2">
                                <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#FF4E00] transition-colors uppercase tracking-widest">
                                    <Share2 className="h-4 w-4" />
                                    Share this product
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="mt-16">
                        <Tabs defaultValue="description" className="w-full">
                            <TabsList className="w-full flex justify-center bg-transparent border-b border-gray-200 rounded-none h-auto p-0 gap-8">
                                <TabsTrigger
                                    value="description"
                                    className="data-[state=active]:border-[#FF4E00] data-[state=active]:text-[#FF4E00] border-b-2 border-transparent rounded-none px-8 py-4 text-sm font-black uppercase tracking-widest"
                                >
                                    Description
                                </TabsTrigger>
                                <TabsTrigger
                                    value="specifications"
                                    className="data-[state=active]:border-[#FF4E00] data-[state=active]:text-[#FF4E00] border-b-2 border-transparent rounded-none px-8 py-4 text-sm font-black uppercase tracking-widest"
                                >
                                    Specifications
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="data-[state=active]:border-[#FF4E00] data-[state=active]:text-[#FF4E00] border-b-2 border-transparent rounded-none px-8 py-4 text-sm font-black uppercase tracking-widest"
                                >
                                    Reviews (24)
                                </TabsTrigger>
                            </TabsList>
                            <div className="mt-10 max-w-4xl mx-auto px-4">
                                <TabsContent
                                    value="description"
                                    className="space-y-6"
                                >
                                    <div className="prose prose-orange max-w-none">
                                        <h3 className="text-2xl font-black text-gray-900 uppercase italic">
                                            Product Overview
                                        </h3>
                                        <p className="text-gray-600 text-lg leading-relaxed">
                                            {product.description ||
                                                `Experience the ultimate quality with ${product.name}. This premium ${product.category?.name || "product"} from ${product.brand?.name || "our collection"} is designed to deliver unmatched performance and durability.`}
                                        </p>
                                        <p className="text-gray-600 text-lg leading-relaxed pt-4">
                                            Our products are carefully selected
                                            to meet the highest standards of the
                                            automotive industry. Whether you're
                                            looking for performance, style, or
                                            protection, this product has it all.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                                        <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                                            <h4 className="text-lg font-black mb-4 uppercase italic">
                                                Key Features
                                            </h4>
                                            <ul className="space-y-3">
                                                {[
                                                    "Premium Material Quality",
                                                    "Long-lasting Performance",
                                                    "Easy Implementation",
                                                    "Weather Resistant",
                                                ].map((item, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                        <span className="font-bold text-gray-700">
                                                            {item}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                                            <h4 className="text-lg font-black mb-4 uppercase italic">
                                                What's in the Box
                                            </h4>
                                            <ul className="space-y-3">
                                                {[
                                                    "Main Product Unit",
                                                    "Instruction Manual",
                                                    "Warranty Card",
                                                    "Installation Kit",
                                                ].map((item, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <Info className="h-5 w-5 text-blue-500 shrink-0" />
                                                        <span className="font-bold text-gray-700">
                                                            {item}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="specifications">
                                    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
                                        <table className="w-full text-left">
                                            <tbody>
                                                <tr className="border-b border-gray-100">
                                                    <th className="px-8 py-4 bg-gray-50 w-1/3 font-black uppercase text-xs">
                                                        Brand
                                                    </th>
                                                    <td className="px-8 py-4 text-gray-600 font-medium">
                                                        {product.brand?.name ||
                                                            "N/A"}
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-gray-100">
                                                    <th className="px-8 py-4 bg-gray-50 w-1/3 font-black uppercase text-xs">
                                                        Category
                                                    </th>
                                                    <td className="px-8 py-4 text-gray-600 font-medium">
                                                        {product.category
                                                            ?.name || "N/A"}
                                                    </td>
                                                </tr>
                                                {availableAttributes.map(
                                                    (attr) => (
                                                        <tr
                                                            key={attr.id}
                                                            className="border-b border-gray-100"
                                                        >
                                                            <th className="px-8 py-4 bg-gray-50 w-1/3 font-black uppercase text-xs">
                                                                {attr.name}
                                                            </th>
                                                            <td className="px-8 py-4 text-gray-600 font-medium">
                                                                {attr.values
                                                                    .map(
                                                                        (v) =>
                                                                            v.value,
                                                                    )
                                                                    .join(", ")}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                                <tr className="border-b border-gray-100">
                                                    <th className="px-8 py-4 bg-gray-50 w-1/3 font-black uppercase text-xs">
                                                        Stock Status
                                                    </th>
                                                    <td className="px-8 py-4 text-gray-600 font-medium">
                                                        {activeStock > 0
                                                            ? `${activeStock} Units Available`
                                                            : "Out of Stock"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th className="px-8 py-4 bg-gray-50 w-1/3 font-black uppercase text-xs">
                                                        Warranty
                                                    </th>
                                                    <td className="px-8 py-4 text-gray-600 font-medium">
                                                        1 Year Replacement
                                                        Warranty
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-24">
                            <div className="flex items-end justify-between mb-10">
                                <div className="space-y-2">
                                    <div className="bg-orange-50 text-[#FF4E00] text-xs font-black px-4 py-1.5 rounded-full inline-block uppercase tracking-[0.2em]">
                                        Explore More
                                    </div>
                                    <h2 className="text-4xl font-black text-gray-900 uppercase italic">
                                        Related{" "}
                                        <span className="text-[#FF4E00]">
                                            Products
                                        </span>
                                    </h2>
                                </div>
                                <Link
                                    href={route(
                                        "shop.category",
                                        product.category?.slug || "",
                                    )}
                                    className="hidden md:flex items-center text-sm font-black text-gray-400 hover:text-[#FF4E00] transition-colors uppercase tracking-[0.2em] group"
                                >
                                    VIEW ALL CATEGORY
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {relatedProducts.map((related) => (
                                    <ProductCard
                                        key={related.id}
                                        product={related}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}
