import { useState, useEffect } from "react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { useForm, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Save, Type } from "lucide-react";
import { ProductImageUploader } from "@/components/products/ProductImageUploader";
import { VariantBuilder } from "@/components/products/VariantBuilder";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useToast } from "@/hooks/use-toast";

interface Props {
    product: any;
    categories: any[];
    brands: any[];
    units: any[];
    attributes: any[];
}

export default function EditProduct({
    product,
    categories,
    brands,
    units,
    attributes,
}: Props) {
    const { toast } = useToast();

    // Map initial images
    const initialImages =
        product.images?.map((img: any) => ({
            id: img.id,
            preview: img.image_path,
            isPrimary: img.is_primary,
        })) || [];

    // Map initial variants
    const initialVariants =
        product.variants?.map((v: any) => ({
            id: v.id,
            sku: v.sku || "",
            barcode: v.barcode || "",
            price: v.price?.toString() || "0",
            cost_price: v.cost_price?.toString() || "0",
            stock: v.stock?.toString() || "0",
            low_stock_alert: v.low_stock_alert?.toString() || "5",
            attribute_values: v.attribute_values?.map((a: any) => a.id) || [],
            images:
                v.images?.map((img: any) => ({
                    id: img.id,
                    preview: img.image_path,
                    isPrimary: img.is_primary,
                })) || [],
            delete_images: [],
            _ui_name:
                v.attribute_values?.map((a: any) => a.value).join(" / ") ||
                "Variant",
        })) || [];

    const { data, setData, post, processing, errors, transform } = useForm({
        _method: "put",
        category_id: product.category_id?.toString() || "",
        brand_id: product.brand_id?.toString() || "",
        unit_id: product.unit_id?.toString() || "",
        name: product.name || "",
        description: product.description || "",
        product_type: product.product_type || "simple",
        base_price: product.base_price?.toString() || "",
        cost_price: product.cost_price?.toString() || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        low_stock_alert: product.low_stock_alert?.toString() || "10",
        is_active: product.is_active === 1 || product.is_active === true,
        images: initialImages as any[],
        delete_images: [] as number[],
        variants: initialVariants as any[],
    });

    const [profit, setProfit] = useState(
        (parseFloat(data.base_price) || 0) - (parseFloat(data.cost_price) || 0),
    );

    const calculateProfit = (price: string, cost: string) => {
        const p = parseFloat(price) || 0;
        const c = parseFloat(cost) || 0;
        return p - c;
    };

    const handlePriceChange = (
        field: "base_price" | "cost_price",
        value: string,
    ) => {
        setData(field, value);
        if (field === "base_price") {
            setProfit(calculateProfit(value, data.cost_price));
        } else {
            setProfit(calculateProfit(data.base_price, value));
        }
    };

    const handleImagesChange = (newImages: any[]) => {
        // Find deleted existing images
        const currentExistingIds = newImages
            .filter((img) => img.id)
            .map((img) => img.id);
        const originalExistingIds = initialImages
            .filter((img: any) => img.id)
            .map((img: any) => img.id);
        const newlyDeleted = originalExistingIds.filter(
            (id: number) => !currentExistingIds.includes(id),
        );

        setData((prevData) => ({
            ...prevData,
            images: newImages,
            delete_images: [
                ...new Set([...prevData.delete_images, ...newlyDeleted]),
            ],
        }));
    };

    const handleVariantsChange = (newVariants: any[]) => {
        // Track deleted variant images here if needed, or handle inside VariantBuilder
        setData("variants", newVariants);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.product_type === "variant" && data.variants.length === 0) {
            return;
        }

        transform((currentData) => ({
            ...currentData,
            // Only send actual files to be uploaded
            images: currentData.images
                .filter((img: any) => img.file)
                .map((img: any) => img.file),
            variants: currentData.variants.map((v: any) => ({
                ...v,
                images:
                    v.images
                        ?.filter((img: any) => img.file)
                        .map((img: any) => img.file) || [],
            })),
        }));

        // Standard post with _method=put for multipart/form-data support
        post(`/products/${product.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errs) => {
                // Handled by global flash
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto pb-10">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/products">
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Edit Product: {product.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update product details, pricing, and variants.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-card p-6 rounded-lg shadow-sm border space-y-6">
                        <h2 className="text-lg font-semibold border-bottom pb-2">
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Product Name{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Product Type</Label>
                                <Select
                                    value={data.product_type}
                                    onValueChange={(val) =>
                                        setData("product_type", val)
                                    }
                                    disabled
                                >
                                    <SelectTrigger className="bg-muted">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="simple">
                                            Simple Product
                                        </SelectItem>
                                        <SelectItem value="variant">
                                            Variant Product
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Type cannot be changed after creation.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Category{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(val) =>
                                        setData("category_id", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem
                                                key={c.id}
                                                value={c.id.toString()}
                                            >
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.category_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Brand</Label>
                                <Select
                                    value={data.brand_id}
                                    onValueChange={(val) =>
                                        setData("brand_id", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((b) => (
                                            <SelectItem
                                                key={b.id}
                                                value={b.id.toString()}
                                            >
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Unit Base</Label>
                                <Select
                                    value={data.unit_id}
                                    onValueChange={(val) =>
                                        setData("unit_id", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((u) => (
                                            <SelectItem
                                                key={u.id}
                                                value={u.id.toString()}
                                            >
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description" className="flex items-center gap-2">
                                    <Type className="h-4 w-4" /> Description
                                </Label>
                                <RichTextEditor
                                    value={data.description}
                                    onChange={(val) => setData("description", val)}
                                />
                            </div>

                            <div className="flex items-center space-x-2 md:col-span-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(val) =>
                                        setData("is_active", val)
                                    }
                                />
                                <Label htmlFor="is_active">
                                    Active (Visible in POS and store)
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Inventory (For Simple Products) */}
                    {data.product_type === "simple" && (
                        <div className="bg-card p-6 rounded-lg shadow-sm border space-y-6">
                            <h2 className="text-lg font-semibold border-bottom pb-2">
                                Pricing & Inventory
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Selling Price (Base Price)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.base_price}
                                        onChange={(e) =>
                                            handlePriceChange(
                                                "base_price",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Cost Price</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.cost_price}
                                        onChange={(e) =>
                                            handlePriceChange(
                                                "cost_price",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-green-600 font-bold">
                                        Estimated Profit
                                    </Label>
                                    <div className="h-10 bg-green-50 rounded-md border border-green-200 flex items-center px-4 text-green-700 font-semibold text-lg">
                                        ৳{profit.toFixed(2)}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>SKU</Label>
                                    <Input
                                        value={data.sku}
                                        onChange={(e) =>
                                            setData("sku", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Barcode (For POS)</Label>
                                    <Input
                                        value={data.barcode}
                                        onChange={(e) =>
                                            setData("barcode", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Low Stock Alert</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={data.low_stock_alert}
                                        onChange={(e) =>
                                            setData("low_stock_alert", e.target.value)
                                        }
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Notify when stock is at or below this level.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Variant Builder */}
                    {data.product_type === "variant" && (
                        <div className="bg-card p-6 rounded-lg shadow-sm border space-y-6">
                            <div className="flex justify-between items-center border-bottom pb-2 mb-4">
                                <h2 className="text-lg font-semibold">
                                    Variants Configuration
                                </h2>
                            </div>
                            <VariantBuilder
                                attributes={attributes}
                                variants={data.variants}
                                onChange={handleVariantsChange}
                                basePrice={data.base_price || "0"}
                                productName={data.name}
                            />
                            {errors.variants && (
                                <p className="text-sm text-red-500">
                                    Please check your variant configurations.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Product Level Images */}
                    <div className="bg-card p-6 rounded-lg shadow-sm border space-y-6">
                        <h2 className="text-lg font-semibold border-bottom pb-2">
                            Product Images
                        </h2>
                        <ProductImageUploader
                            images={data.images}
                            onChange={handleImagesChange}
                        />
                    </div>

                    <div className="flex justify-end gap-4 pb-10">
                        <Link href="/products">
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="min-w-[150px]"
                        >
                            {processing ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save
                                    Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
