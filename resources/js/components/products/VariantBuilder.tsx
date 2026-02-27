import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { ProductImageUploader } from "./ProductImageUploader";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Attribute {
    id: number;
    name: string;
    values: { id: number; value: string }[];
}

interface Variant {
    id?: number;
    sku: string;
    barcode: string;
    price: string;
    cost_price: string;
    stock: string;
    low_stock_alert: string;
    attribute_values: number[]; // IDs of attribute values
    images: any[];
    delete_images?: number[];
    _ui_name: string; // for display only
}

interface VariantBuilderProps {
    attributes: Attribute[];
    variants: Variant[];
    onChange: (variants: Variant[]) => void;
    basePrice: string;
    productName: string;
}

export function VariantBuilder({
    attributes,
    variants,
    onChange,
    basePrice,
    productName,
}: VariantBuilderProps) {
    const [selectedAttributes, setSelectedAttributes] = useState<number[]>([]);
    const [expandedVariant, setExpandedVariant] = useState<number | null>(null);

    // Helpers to generate Cartesian product
    const cartesian = (...args: any[][]) =>
        args.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

    const generateCombinations = () => {
        if (selectedAttributes.length === 0) return;

        const activeAttrs = attributes.filter((a) =>
            selectedAttributes.includes(a.id),
        );
        const activeVals = activeAttrs.map((a) => a.values);

        let combinations = [];
        if (activeVals.length === 1) {
            combinations = activeVals[0].map((v) => [v]);
        } else if (activeVals.length > 1) {
            combinations = cartesian(...activeVals);
        }

        const newVariants: Variant[] = combinations.map((combo: any[]) => {
            const nameArr = Array.isArray(combo) ? combo : [combo];
            const nameStr = nameArr.map((v: any) => v.value).join(" / ");
            const skuSuffix = nameArr
                .map((v: any) => v.value.substring(0, 3).toUpperCase())
                .join("");
            const prefix = productName.substring(0, 3).toUpperCase() || "PRD";

            return {
                sku: `${prefix}-${skuSuffix}-${Math.floor(Math.random() * 1000)}`,
                barcode: "",
                price: basePrice || "0",
                cost_price: "0",
                stock: "0",
                low_stock_alert: "5",
                attribute_values: nameArr.map((v: any) => v.id),
                images: [],
                _ui_name: nameStr,
            };
        });

        // We could intelligently merge existing variants, but for simplicity, we append or replace.
        // Let's replace if empty, append if not empty? User usually generates once.
        onChange(newVariants);
    };

    const toggleAttribute = (attrId: number) => {
        if (selectedAttributes.includes(attrId)) {
            setSelectedAttributes((prev) => prev.filter((id) => id !== attrId));
        } else {
            setSelectedAttributes((prev) => [...prev, attrId]);
        }
    };

    const updateVariant = (index: number, field: keyof Variant, value: any) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        onChange(newVariants);
    };

    const removeVariant = (index: number) => {
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        onChange(newVariants);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-primary" /> Variant Generator
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                    {attributes.map((attr) => (
                        <Badge
                            key={attr.id}
                            variant={
                                selectedAttributes.includes(attr.id)
                                    ? "default"
                                    : "outline"
                            }
                            className={`cursor-pointer px-3 py-1 ${selectedAttributes.includes(attr.id) ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-gray-100"}`}
                            onClick={() => toggleAttribute(attr.id)}
                        >
                            {attr.name}
                        </Badge>
                    ))}
                </div>

                <Button
                    variant="default"
                    onClick={generateCombinations}
                    disabled={selectedAttributes.length === 0}
                    className="w-full sm:w-auto"
                >
                    Generate{" "}
                    {selectedAttributes.length > 0
                        ? "Combinations"
                        : "Variants"}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                    Select attributes above and click generate to create all
                    combinations. Note: This will overwrite current rows.
                </p>
            </div>

            {variants.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                            Configured Variants ({variants.length})
                        </h4>
                    </div>

                    <div className="border rounded-md divide-y overflow-hidden">
                        {variants.map((v, i) => (
                            <div key={i} className="bg-white">
                                <div className="p-3 flex items-center justify-between gap-4 hover:bg-gray-50">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() =>
                                                setExpandedVariant(
                                                    expandedVariant === i
                                                        ? null
                                                        : i,
                                                )
                                            }
                                        >
                                            {expandedVariant === i ? "-" : "+"}
                                        </Button>
                                        <div className="font-medium text-sm">
                                            {v._ui_name}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Input
                                            className="w-24 h-8 text-sm"
                                            placeholder="Price"
                                            value={v.price}
                                            onChange={(e) =>
                                                updateVariant(
                                                    i,
                                                    "price",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <Input
                                            className="w-20 h-8 text-sm"
                                            placeholder="Stock"
                                            value={v.stock}
                                            onChange={(e) =>
                                                updateVariant(
                                                    i,
                                                    "stock",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 h-8 w-8 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => removeVariant(i)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {expandedVariant === i && (
                                    <div className="p-4 bg-gray-50/50 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">
                                                        SKU
                                                    </Label>
                                                    <Input
                                                        className="h-8 text-sm"
                                                        value={v.sku}
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                i,
                                                                "sku",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">
                                                        Barcode
                                                    </Label>
                                                    <Input
                                                        className="h-8 text-sm"
                                                        value={v.barcode}
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                i,
                                                                "barcode",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">
                                                        Price
                                                    </Label>
                                                    <Input
                                                        className="h-8 text-sm"
                                                        value={v.price}
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                i,
                                                                "price",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">
                                                        Cost Price
                                                    </Label>
                                                    <Input
                                                        className="h-8 text-sm"
                                                        value={v.cost_price}
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                i,
                                                                "cost_price",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-green-600 font-medium">
                                                        Profit
                                                    </Label>
                                                    <div className="h-8 bg-green-50 rounded-md border border-green-100 flex items-center px-3 text-sm text-green-700 font-semibold">
                                                        ৳
                                                        {(
                                                            Number(v.price) -
                                                            Number(v.cost_price)
                                                        ).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">
                                                        Stock
                                                    </Label>
                                                    <Input
                                                        className="h-8 text-sm"
                                                        value={v.stock}
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                i,
                                                                "stock",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">
                                                        Low Stock Alert
                                                    </Label>
                                                    <Input
                                                        className="h-8 text-sm"
                                                        value={
                                                            v.low_stock_alert
                                                        }
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                i,
                                                                "low_stock_alert",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 border-l pl-4">
                                            <Label className="text-xs">
                                                Variant Images
                                            </Label>
                                            <ProductImageUploader
                                                images={v.images}
                                                onChange={(newImages) =>
                                                    updateVariant(
                                                        i,
                                                        "images",
                                                        newImages,
                                                    )
                                                }
                                                maxFiles={3}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
