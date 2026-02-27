import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    RefreshCw,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { BrandCard } from "@/components/brands/BrandCard";
import { useAuth } from "@/hooks/useAuth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a string to a URL-friendly slug (mirrors PHP's Str::slug). */
const toSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    is_active: boolean;
    order: number;
}

interface BrandsProps {
    initialBrands: {
        data: Brand[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        per_page?: string | number;
    };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Brands = ({ initialBrands, filters }: BrandsProps) => {
    const { toast } = useToast();
    const { user } = useAuth();

    const [brands, setBrands] = useState<Brand[]>([]);

    useEffect(() => {
        if (initialBrands?.data) {
            setBrands(initialBrands.data);
        }
    }, [initialBrands]);

    // -------------------------------------------------------------------------
    // Form state
    // -------------------------------------------------------------------------

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        slug: "",
        logo: null as File | string | null,
        description: "",
        is_active: true as boolean,
        order: 0 as number,
    });

    /** When true, the user has manually edited the slug – stop auto-generating. */
    const slugManuallyEdited = useRef(false);

    /** Auto-generate slug from name unless the user has overridden it. */
    useEffect(() => {
        if (!slugManuallyEdited.current) {
            setData("slug", toSlug(data.name));
        }
    }, [data.name]);

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        slugManuallyEdited.current = true;
        setData("slug", e.target.value);
    };

    const handleResetSlug = () => {
        slugManuallyEdited.current = false;
        setData("slug", toSlug(data.name));
    };

    // -------------------------------------------------------------------------
    // UI state
    // -------------------------------------------------------------------------

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [deleteBrandId, setDeleteBrandId] = useState<number | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // -------------------------------------------------------------------------
    // Search
    // -------------------------------------------------------------------------

    useEffect(() => {
        const id = setTimeout(() => {
            if (searchTerm !== (filters.search || "")) {
                router.get(
                    "/brands",
                    { search: searchTerm, per_page: filters.per_page },
                    { preserveState: true, replace: true },
                );
            }
        }, 300);
        return () => clearTimeout(id);
    }, [searchTerm]);

    // -------------------------------------------------------------------------
    // Scroll-to-top
    // -------------------------------------------------------------------------

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    // -------------------------------------------------------------------------
    // Pagination
    // -------------------------------------------------------------------------

    const currentMeta = initialBrands.meta;
    const paginationLinks = initialBrands.links;

    const handleItemsPerPageChange = (value: string) => {
        router.get(
            "/brands",
            { search: searchTerm, per_page: value },
            { preserveState: true },
        );
    };

    const handlePageChange = (url: string | null) => {
        if (url) router.get(url, {}, { preserveState: true });
    };

    // -------------------------------------------------------------------------
    // Dialog helpers
    // -------------------------------------------------------------------------

    const handleOpenDialog = (brand?: Brand) => {
        slugManuallyEdited.current = false;

        if (brand) {
            setEditingBrand(brand);
            setData({
                name: brand.name,
                slug: brand.slug,
                logo: null,
                description: brand.description ?? "",
                is_active: brand.is_active,
                order: brand.order,
            });
            setPreviewUrl(brand.logo);
            // Editing an existing brand – slug is already set, treat as manual
            slugManuallyEdited.current = true;
        } else {
            setEditingBrand(null);
            reset();
            setPreviewUrl(null);
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingBrand(null);
        reset();
        setPreviewUrl(null);
        slugManuallyEdited.current = false;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("logo", file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // -------------------------------------------------------------------------
    // Submit
    // -------------------------------------------------------------------------

    const handleSubmit = () => {
        const payload: Record<string, any> = {
            name: data.name,
            slug: data.slug,
            description: data.description,
            is_active: data.is_active ? 1 : 0,
            order: data.order,
        };

        if (data.logo instanceof File) {
            payload.logo = data.logo;
        }

        const options = {
            forceFormData: true,
            onSuccess: () => {
                handleCloseDialog();
                toast({
                    title: "Success",
                    description: editingBrand
                        ? "Brand updated successfully"
                        : "Brand created successfully",
                });
            },
            onError: (err: Record<string, string>) => {
                toast({
                    title: "Error",
                    description:
                        Object.values(err)[0] ||
                        (editingBrand
                            ? "Failed to update brand"
                            : "Failed to create brand"),
                    variant: "destructive",
                });
            },
        };

        if (editingBrand) {
            router.post(
                `/brands/${editingBrand.id}`,
                { ...payload, _method: "PUT" },
                options,
            );
        } else {
            router.post("/brands", payload, options);
        }
    };

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    const handleDelete = () => {
        if (deleteBrandId) {
            router.delete(`/brands/${deleteBrandId}`, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setDeleteBrandId(null);
                    toast({
                        title: "Success",
                        description: "Brand deleted successfully",
                    });
                },
                onError: () => {
                    toast({
                        title: "Error",
                        description: "Failed to delete brand",
                        variant: "destructive",
                    });
                },
            });
        }
    };

    const openDeleteDialog = (id: number) => {
        setDeleteBrandId(id);
        setIsDeleteDialogOpen(true);
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <DashboardLayout>
            <div className="space-y-4 md:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Brands
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Manage your product brands
                        </p>
                    </div>
                    {user?.permissions?.includes("brand.create") && (
                        <Button
                            className="w-full sm:w-auto"
                            onClick={() => handleOpenDialog()}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Brand
                        </Button>
                    )}
                </div>

                {/* Table Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <CardTitle className="text-lg md:text-xl">
                                Brand List
                            </CardTitle>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search brands..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Mobile Card View */}
                        <div className="md:hidden">
                            {brands.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">
                                    No brands found
                                </p>
                            ) : (
                                brands.map((brand) => (
                                    <BrandCard
                                        key={brand.id}
                                        brand={brand}
                                        onEdit={handleOpenDialog}
                                        onDelete={openDeleteDialog}
                                    />
                                ))
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <div className="border rounded-lg overflow-hidden">
                                <div className="max-h-[600px] overflow-y-auto">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background z-10">
                                            <TableRow>
                                                <TableHead className="w-[70px]">
                                                    Logo
                                                </TableHead>
                                                <TableHead>
                                                    Brand Name
                                                </TableHead>
                                                <TableHead>Slug</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-[60px] text-center">
                                                    Order
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {brands.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={6}
                                                        className="text-center py-8 text-muted-foreground"
                                                    >
                                                        No brands found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                brands.map((brand) => (
                                                    <TableRow key={brand.id}>
                                                        <TableCell>
                                                            {brand.logo ? (
                                                                <img
                                                                    src={
                                                                        brand.logo
                                                                    }
                                                                    alt={
                                                                        brand.name
                                                                    }
                                                                    className="w-10 h-10 object-cover rounded shadow-sm"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-accent rounded flex items-center justify-center text-[10px] text-muted-foreground">
                                                                    No Logo
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {brand.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                                                {brand.slug}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    brand.is_active
                                                                        ? "default"
                                                                        : "secondary"
                                                                }
                                                            >
                                                                {brand.is_active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center text-sm">
                                                            {brand.order}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                {user?.permissions?.includes(
                                                                    "brand.update",
                                                                ) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleOpenDialog(
                                                                                brand,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                {user?.permissions?.includes(
                                                                    "brand.delete",
                                                                ) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            openDeleteDialog(
                                                                                brand.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="sticky bottom-0 bg-background border-t mt-4 pt-4 pb-2 z-10">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                                    <span className="text-xs sm:text-sm text-muted-foreground">
                                        Rows per page:
                                    </span>
                                    <Select
                                        value={currentMeta.per_page.toString()}
                                        onValueChange={handleItemsPerPageChange}
                                    >
                                        <SelectTrigger className="w-[70px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="10">
                                                10
                                            </SelectItem>
                                            <SelectItem value="20">
                                                20
                                            </SelectItem>
                                            <SelectItem value="50">
                                                50
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                                    <span className="text-xs sm:text-sm text-muted-foreground">
                                        {currentMeta.total === 0
                                            ? "No results"
                                            : `${currentMeta.from}-${currentMeta.to} of ${currentMeta.total}`}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {paginationLinks.map((link, idx) => {
                                            const isPrev = idx === 0;
                                            const isNext =
                                                idx ===
                                                paginationLinks.length - 1;

                                            if (isPrev) {
                                                return (
                                                    <Button
                                                        key={idx}
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            handlePageChange(
                                                                link.url,
                                                            )
                                                        }
                                                        disabled={!link.url}
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                );
                                            }

                                            if (isNext) {
                                                return (
                                                    <Button
                                                        key={idx}
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            handlePageChange(
                                                                link.url,
                                                            )
                                                        }
                                                        disabled={!link.url}
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                );
                                            }

                                            if (link.label === "...") {
                                                return (
                                                    <span
                                                        key={idx}
                                                        className="px-2"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }

                                            const label = link.label
                                                .replace("&laquo; Previous", "")
                                                .replace("Next &raquo;", "");

                                            return (
                                                <Button
                                                    key={idx}
                                                    variant={
                                                        link.active
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="icon"
                                                    className="h-8 w-8 text-xs"
                                                    onClick={() =>
                                                        handlePageChange(
                                                            link.url,
                                                        )
                                                    }
                                                >
                                                    {label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Create / Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingBrand ? "Edit Brand" : "Add New Brand"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingBrand
                                    ? "Update brand information"
                                    : "Enter brand details"}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Brand Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    placeholder="Enter brand name"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Slug – auto-generated, manually overrideable */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="slug">
                                        Slug
                                        {!slugManuallyEdited.current &&
                                            data.name && (
                                                <span className="ml-2 text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                    auto
                                                </span>
                                            )}
                                    </Label>
                                    {slugManuallyEdited.current && (
                                        <button
                                            type="button"
                                            onClick={handleResetSlug}
                                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                            Auto-generate
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={handleSlugChange}
                                    placeholder="brand-slug"
                                    className="font-mono text-sm"
                                />
                                {errors.slug && (
                                    <p className="text-sm text-red-500">
                                        {errors.slug}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    placeholder="Brand description (optional)"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Logo upload */}
                            <div className="space-y-2">
                                <Label htmlFor="logo">Brand Logo</Label>
                                <div className="flex flex-col gap-3">
                                    {previewUrl && (
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-accent/20">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <Input
                                        id="logo"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="cursor-pointer"
                                    />
                                    <p className="text-[11px] text-muted-foreground leading-snug">
                                        Recommended size:{" "}
                                        <span className="font-medium text-foreground">
                                            200 × 200 px
                                        </span>{" "}
                                        (square). Max{" "}
                                        <span className="font-medium text-foreground">
                                            2 MB
                                        </span>
                                        . Accepted formats: JPG, PNG, SVG, WebP.
                                    </p>
                                </div>
                                {errors.logo && (
                                    <p className="text-sm text-red-500">
                                        {errors.logo}
                                    </p>
                                )}
                            </div>

                            {/* Is Active + Order (side-by-side) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="is_active">Active</Label>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData("is_active", checked)
                                            }
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {data.is_active ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order">Display Order</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        min={0}
                                        value={data.order}
                                        onChange={(e) =>
                                            setData(
                                                "order",
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                    {errors.order && (
                                        <p className="text-sm text-red-500">
                                            {errors.order}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleCloseDialog}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                            >
                                {processing
                                    ? "Saving..."
                                    : editingBrand
                                      ? "Update"
                                      : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the brand.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Scroll to Top – Mobile Only */}
                {showScrollTop && (
                    <Button
                        onClick={scrollToTop}
                        size="icon"
                        className="fixed bottom-20 right-4 md:hidden z-50 h-12 w-12 rounded-full shadow-lg"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Brands;
