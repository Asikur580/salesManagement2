import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Package,
    Edit,
    Trash2,
    Image as ImageIcon,
    FileText,
} from "lucide-react";
import { Link, router } from "@inertiajs/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    name: string;
    abbreviation: string | null;
}

interface ProductImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface VariantImage {
    id: number;
    image_path: string;
}

interface VariantAttributeValue {
    id: number;
    attribute_id: number;
    value: string;
    attribute: {
        id: number;
        name: string;
    };
}

interface ProductVariant {
    id: number;
    sku: string | null;
    barcode: string | null;
    cost_price: number;
    price: number;
    stock: number;
    images: VariantImage[];
    attribute_values: VariantAttributeValue[];
}

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    barcode: string | null;
    description: string | null;
    product_type: "simple" | "variant";
    base_price: number | null;
    cost_price: number | null;
    stock: number;
    is_active: boolean;
    category?: Category;
    brand?: Brand;
    unit?: Unit;
    images: ProductImage[];
    variants: ProductVariant[];
    created_at: string;
    updated_at: string;
}

interface PageProps {
    product: Product;
}

export default function ShowProduct({ product }: PageProps) {
    const primaryImage =
        product.images.find((img) => img.is_primary) || product.images[0];
    const otherImages = product.images.filter(
        (img) => img.id !== primaryImage?.id,
    );

    const handleDelete = () => {
        router.delete(`/products/${product.id}`, {
            onSuccess: () => {
                // Return to products list on successful delete
            },
        });
    };

    const getImageUrl = (path: string) => {
        if (!path) return "/placeholder-image.jpg";
        if (path.startsWith("http")) return path;
        if (path.startsWith("/storage/")) return path;
        return `/storage/${path}`;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/products">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                {product.name}
                                <Badge
                                    variant={
                                        product.is_active
                                            ? "default"
                                            : "secondary"
                                    }
                                    className={
                                        product.is_active
                                            ? "bg-green-100 text-green-800"
                                            : ""
                                    }
                                >
                                    {product.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="capitalize bg-blue-50 text-blue-700"
                                >
                                    {product.product_type} Product
                                </Badge>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            asChild
                        >
                            <Link href={`/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" /> Edit Product
                            </Link>
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete {product.name}?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete this
                                        product, along with all its variants,
                                        images, and inventory records.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Delete Permanently
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column - Main Details */}
                    <div className="xl:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    General Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            Category
                                        </p>
                                        <p className="font-medium text-foreground mt-1">
                                            {product.category?.name || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            Brand
                                        </p>
                                        <p className="font-medium text-foreground mt-1">
                                            {product.brand?.name || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            Unit
                                        </p>
                                        <p className="font-medium text-foreground mt-1">
                                            {product.unit?.name || "N/A"}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="mt-6">
                                    <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        Product Description
                                    </h3>
                                    {product.description ? (
                                        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                                            <div 
                                                className="text-sm text-muted-foreground leading-relaxed description-content"
                                                dangerouslySetInnerHTML={{ __html: product.description }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-muted border border-border border-dashed rounded-xl p-6 text-center">
                                            <p className="text-muted-foreground italic text-sm">
                                                No description provided for this
                                                product.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Variants Section (Only for variant type) */}
                        {product.product_type === "variant" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Product Variants (
                                        {product.variants.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">
                                                        Variant
                                                    </th>
                                                    <th className="px-4 py-3 font-medium">
                                                        SKU
                                                    </th>
                                                    <th className="px-4 py-3 font-medium">
                                                        Cost Price
                                                    </th>
                                                    <th className="px-4 py-3 font-medium">
                                                        Selling Price
                                                    </th>
                                                    <th className="px-4 py-3 font-medium">
                                                        Stock/Qty
                                                    </th>
                                                    <th className="px-4 py-3 font-medium">
                                                        Images
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {product.variants.map(
                                                    (variant) => (
                                                        <tr
                                                            key={variant.id}
                                                            className="hover:bg-muted/50 transition-colors"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {variant.attribute_values?.map(
                                                                        (
                                                                            av,
                                                                        ) => (
                                                                            <Badge
                                                                                key={
                                                                                    av.id
                                                                                }
                                                                                variant="secondary"
                                                                                className="whitespace-nowrap"
                                                                            >
                                                                                {
                                                                                    av
                                                                                        .attribute
                                                                                        .name
                                                                                }

                                                                                :{" "}
                                                                                {
                                                                                    av.value
                                                                                }
                                                                            </Badge>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 font-medium text-card-foreground">
                                                                {variant.sku ||
                                                                    "-"}
                                                            </td>
                                                            <td className="px-4 py-3 text-red-600 font-medium">
                                                                ৳
                                                                {Number(
                                                                    variant.cost_price,
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-3 text-green-700 font-bold">
                                                                ৳
                                                                {Number(
                                                                    variant.price,
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        variant.stock <=
                                                                        5
                                                                            ? "bg-red-50 text-red-700 border-red-200"
                                                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                                                    }
                                                                >
                                                                    {
                                                                        variant.stock
                                                                    }{" "}
                                                                    {product
                                                                        .unit
                                                                        ?.abbreviation ||
                                                                        ""}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex -space-x-2">
                                                                    {variant.images &&
                                                                    variant
                                                                        .images
                                                                        .length >
                                                                        0 ? (
                                                                        variant.images.map(
                                                                            (
                                                                                img,
                                                                            ) => (
                                                                                <img
                                                                                    key={
                                                                                        img.id
                                                                                    }
                                                                                    src={getImageUrl(
                                                                                        img.image_path,
                                                                                    )}
                                                                                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm select-none"
                                                                                    alt="Variant thumbnail"
                                                                                />
                                                                            ),
                                                                        )
                                                                    ) : (
                                                                        <span className="text-muted-foreground text-xs italic">
                                                                            none
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Pricing & Images */}
                    <div className="space-y-6">
                        {/* Pricing Box (If Simple Product) */}
                        {product.product_type === "simple" && (
                            <Card className="bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                        Pricing & Inventory
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-muted-foreground">
                                            SKU
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {product.sku || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-muted-foreground">
                                            Barcode
                                        </span>
                                        <span className="font-mono text-foreground bg-muted/80 px-2 py-0.5 rounded text-sm">
                                            {product.barcode || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-muted-foreground">
                                            Cost Price
                                        </span>
                                        <span className="font-medium text-red-600">
                                            ৳
                                            {Number(product.cost_price).toFixed(
                                                2,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-muted-foreground font-medium">
                                            Selling Price
                                        </span>
                                        <span className="font-bold text-green-700 text-lg">
                                            ৳
                                            {Number(product.base_price).toFixed(
                                                2,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 pt-4">
                                        <span className="text-muted-foreground font-medium">
                                            Current Stock
                                        </span>
                                        <Badge className="text-base px-3 py-1 font-bold">
                                            {product.stock}{" "}
                                            {product.unit?.abbreviation || ""}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {product.product_type === "variant" && (
                            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-blue-800 font-medium">
                                            Total Global Stock
                                        </span>
                                        <Badge className="text-lg px-3 py-1 font-bold bg-blue-600 hover:bg-blue-700">
                                            {product.stock}{" "}
                                            {product.unit?.abbreviation || ""}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Images Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                    Product Gallery
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {product.images.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-muted">
                                        <Package className="h-10 w-10 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground font-medium">
                                            No images uploaded
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Primary Image */}
                                        {primaryImage && (
                                            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-border shadow-sm group">
                                                <img
                                                    src={getImageUrl(
                                                        primaryImage.image_path,
                                                    )}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute top-2 left-2">
                                                    <Badge className="bg-primary text-primary-foreground shadow-md">
                                                        Primary Picture
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}

                                        {/* Other Images Grid */}
                                        {otherImages.length > 0 && (
                                            <div className="grid grid-cols-3 gap-3">
                                                {otherImages.map((img) => (
                                                    <div
                                                        key={img.id}
                                                        className="aspect-square rounded-lg overflow-hidden border border-border shadow-sm group cursor-pointer"
                                                    >
                                                        <img
                                                            src={getImageUrl(
                                                                img.image_path,
                                                            )}
                                                            alt={`${product.name} alternate`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
