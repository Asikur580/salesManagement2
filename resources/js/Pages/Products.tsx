import { useState, useEffect } from "react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { router, Link } from "@inertiajs/react";
import {
    Plus,
    Search,
    Pencil, // Keep Pencil for now, as the instruction only adds Eye and the snippet implies a full replacement.
    Trash2,
    Package,
    RefreshCw,
    X,
    Eye, // Added Eye icon
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Product {
    id: number;
    name: string;
    product_type: "simple" | "variant";
    base_price: number | null;
    sku: string | null;
    barcode: string | null;
    is_active: boolean;
    category: { id: number; name: string } | null;
    brand: { id: number; name: string } | null;
    unit: { id: number; name: string } | null;
    primary_image: { image_path: string } | null;
    variants: any[];
    stock: number | null;
}

interface ProductsProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        links: any[];
    };
    categories: any[];
    brands: any[];
    units: any[];
    filters: any;
}

export default function Products({
    products,
    categories,
    brands,
    units,
    filters,
}: ProductsProps) {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [categoryFilter, setCategoryFilter] = useState(
        filters?.category_id || "all",
    );
    const [brandFilter, setBrandFilter] = useState(filters?.brand_id || "all");
    const [typeFilter, setTypeFilter] = useState(
        filters?.product_type || "all",
    );

    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Apply filters with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params: any = {};
            if (searchTerm) params.search = searchTerm;
            if (categoryFilter !== "all") params.category_id = categoryFilter;
            if (brandFilter !== "all") params.brand_id = brandFilter;
            if (typeFilter !== "all") params.product_type = typeFilter;

            router.get("/products", params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, categoryFilter, brandFilter, typeFilter]);

    const handleClearFilters = () => {
        setSearchTerm("");
        setCategoryFilter("all");
        setBrandFilter("all");
        setTypeFilter("all");
        router.get("/products");
    };

    const handleDelete = () => {
        if (!deletingId) return;
        router.delete(`/products/${deletingId}`, {
            onSuccess: () => {
                setDeletingId(null);
            },
            onError: () => {
                setDeletingId(null);
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Products
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your inventory, pricing, and variants.
                        </p>
                    </div>
                    <Link href="/products/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3 border-b">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products by name, SKU, or barcode..."
                                    className="pl-9 w-full"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>

                            <Select
                                value={categoryFilter}
                                onValueChange={setCategoryFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Categories
                                    </SelectItem>
                                    {categories.map((c: any) => (
                                        <SelectItem
                                            key={c.id}
                                            value={c.id.toString()}
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={brandFilter}
                                onValueChange={setBrandFilter}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Brands
                                    </SelectItem>
                                    {brands.map((b: any) => (
                                        <SelectItem
                                            key={b.id}
                                            value={b.id.toString()}
                                        >
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={typeFilter}
                                onValueChange={setTypeFilter}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Types
                                    </SelectItem>
                                    <SelectItem value="simple">
                                        Simple
                                    </SelectItem>
                                    <SelectItem value="variant">
                                        Variant
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {(searchTerm ||
                                categoryFilter !== "all" ||
                                brandFilter !== "all" ||
                                typeFilter !== "all") && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearFilters}
                                    title="Clear Filters"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="rounded-md border-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[60px]">
                                            Image
                                        </TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock / Variants</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="h-32 text-center text-muted-foreground"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <Package className="h-8 w-8 text-muted-foreground mb-2" />
                                                    <p>No products found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        products.data.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div className="h-10 w-10 rounded-md border flex items-center justify-center bg-muted overflow-hidden">
                                                        {product.primary_image ? (
                                                            <img
                                                                src={
                                                                    product
                                                                        .primary_image
                                                                        .image_path
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-foreground">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                                                        {product.category && (
                                                            <span>
                                                                {
                                                                    product
                                                                        .category
                                                                        .name
                                                                }
                                                            </span>
                                                        )}
                                                        {product.brand && (
                                                            <span>
                                                                •{" "}
                                                                {
                                                                    product
                                                                        .brand
                                                                        .name
                                                                }
                                                            </span>
                                                        )}
                                                        {product.sku && (
                                                            <span>
                                                                • SKU: {product.sku}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            product.product_type ===
                                                            "simple"
                                                                ? "bg-blue-50 text-blue-700"
                                                                : "bg-purple-50 text-purple-700"
                                                        }
                                                    >
                                                        {product.product_type ===
                                                        "simple"
                                                            ? "Simple"
                                                            : "Variant"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {product.product_type ===
                                                    "simple" ? (
                                                        <span className="font-medium text-foreground">
                                                            ৳
                                                            {Number(
                                                                product.base_price ||
                                                                    0,
                                                            ).toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">
                                                            {
                                                                product.variants
                                                                    .length
                                                            }{" "}
                                                            pricing tiers
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {product.product_type ===
                                                    "simple" ? (
                                                        <div className={`text-sm font-medium ${Number(product.stock) <= 5 ? "text-red-600" : "text-foreground"}`}>
                                                            {product.stock ?? 0} pcs
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-muted-foreground">
                                                            {
                                                                product.variants
                                                                    .length
                                                            }{" "}
                                                            Variants
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            product.is_active
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                        className={
                                                            product.is_active
                                                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                                : ""
                                                        }
                                                    >
                                                        {product.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Eye icon button added */}
                                                        <Link
                                                            href={`/products/${product.id}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={`/products/${product.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-600"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600"
                                                            onClick={() =>
                                                                setDeletingId(
                                                                    product.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Links */}
                        {products.last_page > 1 && (
                            <div className="p-4 border-t flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {products.data.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">
                                        {products.total}
                                    </span>{" "}
                                    products
                                </p>
                                <div className="flex gap-1">
                                    {products.links.map((link, idx) => {
                                        if (link.url === null) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="cursor-not-allowed opacity-50 px-3 py-1 text-sm border rounded-md bg-muted text-muted-foreground"
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            );
                                        }
                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-card-foreground hover:bg-muted"}`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the product, its
                            variants, and associated images. This action cannot
                            be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
