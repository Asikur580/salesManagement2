import { useState } from "react";
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
    categories: any[];
    brands: any[];
    units: any[];
    attributes: any[];
}

export default function CreateProduct({
    categories,
    brands,
    units,
    attributes,
}: Props) {
    const { toast } = useToast();

    const { data, setData, post, processing, errors, transform } = useForm({
        category_id: "",
        brand_id: "",
        unit_id: "",
        name: "",
        description: "",
        product_type: "simple",
        base_price: "",
        cost_price: "",
        sku: "",
        barcode: "",
        is_active: true,
        images: [] as any[],
        variants: [] as any[],
    });

    const [profit, setProfit] = useState(0);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation before submit
        if (data.product_type === "variant" && data.variants.length === 0) {
            toast({
                title: "Error",
                description: "Variant product must have at least one variant.",
                variant: "destructive",
            });
            return;
        }

        transform((currentData) => ({
            ...currentData,
            images: currentData.images
                .map((img: any) => img.file)
                .filter(Boolean),
            variants: currentData.variants.map((v: any) => ({
                ...v,
                images:
                    v.images?.map((img: any) => img.file).filter(Boolean) || [],
            })),
        }));

        // Standard post will deep convert to FormData
        post("/products", {
            forceFormData: true,
            preserveScroll: true,
            onError: (errs) => {
                toast({
                    title: "Validation Error",
                    description: Object.values(errs).join("\n"),
                    variant: "destructive",
                });
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
                            Add New Product
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create a simple or variant product in your catalog.
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
                                    placeholder="e.g. Cotton T-Shirt"
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
                                >
                                    <SelectTrigger>
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
                                        <SelectValue placeholder="Select Unit (e.g. piece, kg)" />
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
                                        placeholder="e.g. TSHIRT-BLK-M"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Barcode (For POS)</Label>
                                    <Input
                                        value={data.barcode}
                                        onChange={(e) =>
                                            setData("barcode", e.target.value)
                                        }
                                        placeholder="Scan or type barcode"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Note: Stock quantity is managed through
                                Purchases / Stock In.
                            </p>
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
                                onChange={(variants) =>
                                    setData("variants", variants)
                                }
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
                            onChange={(imgs) => setData("images", imgs)}
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
                                    Product
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
