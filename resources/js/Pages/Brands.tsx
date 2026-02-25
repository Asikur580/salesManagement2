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
import { useState, useEffect } from "react";
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

interface Brand {
    id: number;
    name: string;
    slug: string;
    image: string | null;
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

const Brands = ({ initialBrands, filters }: BrandsProps) => {
    const { toast } = useToast();
    const { user } = useAuth();

    const [brands, setBrands] = useState<Brand[]>([]);

    useEffect(() => {
        if (initialBrands?.data) {
            setBrands(initialBrands.data);
        }
    }, [initialBrands]);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        transform,
    } = useForm({
        name: "",
        slug: "",
        image: null as File | string | null,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [deleteBrandId, setDeleteBrandId] = useState<number | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (filters.search || "")) {
                router.get(
                    "/brands",
                    { search: searchTerm, per_page: filters.per_page },
                    { preserveState: true, replace: true },
                );
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Scroll to top detection
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

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
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    const handleOpenDialog = (brand?: Brand) => {
        if (brand) {
            setEditingBrand(brand);
            setData({
                name: brand.name,
                slug: brand.slug,
                image: null,
            });
            setPreviewUrl(brand.image);
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
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("image", file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        const prepareData = (d: typeof data) => ({
            ...d,
            image: d.image instanceof File ? d.image : undefined,
        });

        if (editingBrand) {
            // Use post with _method spoofing for file uploads in Laravel
            router.post(
                `/brands/${editingBrand.id}`,
                {
                    ...prepareData(data),
                    _method: "PUT",
                },
                {
                    forceFormData: true,
                    onSuccess: () => {
                        handleCloseDialog();
                        toast({
                            title: "Success",
                            description: "Brand updated successfully",
                        });
                    },
                    onError: (err) => {
                        toast({
                            title: "Error",
                            description:
                                Object.values(err)[0] ||
                                "Failed to update brand",
                            variant: "destructive",
                        });
                    },
                },
            );
        } else {
            transform(prepareData).post("/brands", {
                forceFormData: true,
                onSuccess: () => {
                    handleCloseDialog();
                    toast({
                        title: "Success",
                        description: "Brand created successfully",
                    });
                },
                onError: (err) => {
                    toast({
                        title: "Error",
                        description:
                            Object.values(err)[0] || "Failed to create brand",
                        variant: "destructive",
                    });
                },
            });
        }
    };

    const handleDelete = () => {
        if (deleteBrandId) {
            destroy(`/brands/${deleteBrandId}`, {
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

    return (
        <DashboardLayout>
            <div className="space-y-4 md:space-y-6">
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
                                                <TableHead className="w-[80px]">
                                                    Image
                                                </TableHead>
                                                <TableHead>
                                                    Brand Name
                                                </TableHead>
                                                <TableHead>Slug</TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {brands.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={4}
                                                        className="text-center py-8 text-muted-foreground"
                                                    >
                                                        No brands found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                brands.map((brand) => (
                                                    <TableRow key={brand.id}>
                                                        <TableCell>
                                                            {brand.image ? (
                                                                <img
                                                                    src={
                                                                        brand.image
                                                                    }
                                                                    alt={
                                                                        brand.name
                                                                    }
                                                                    className="w-10 h-10 object-cover rounded shadow-sm"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-accent rounded flex items-center justify-center text-[10px] text-muted-foreground">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {brand.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                                                {brand.slug}
                                                            </span>
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
                                            const isActive = link.active;
                                            const label = link.label
                                                .replace("&laquo; Previous", "")
                                                .replace("Next &raquo;", "");

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

                                            return (
                                                <Button
                                                    key={idx}
                                                    variant={
                                                        isActive
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

                        <div className="space-y-4 py-4">
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

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) =>
                                        setData("slug", e.target.value)
                                    }
                                    placeholder="brand-slug (optional)"
                                />
                                {errors.slug && (
                                    <p className="text-sm text-red-500">
                                        {errors.slug}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Brand Logo</Label>
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
                                        id="image"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="cursor-pointer"
                                    />
                                </div>
                                {errors.image && (
                                    <p className="text-sm text-red-500">
                                        {errors.image}
                                    </p>
                                )}
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

                {/* Scroll to Top Button - Mobile Only */}
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
