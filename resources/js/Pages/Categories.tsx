import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    RefreshCw,
    Box,
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
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    icon: string | null;
    parent_id: number | null;
    parent_name: string | null;
    is_active: boolean;
    order: number;
}

interface CategoriesProps {
    initialCategories: {
        data: Category[];
        links: any[];
        meta: any;
    };
    allCategories: { id: number; name: string; parent_id: number | null }[];
    filters: {
        search?: string;
        per_page?: string | number;
    };
}

// ---------------------------------------------------------------------------
// Default form values
// ---------------------------------------------------------------------------

const defaultForm = {
    name: "",
    slug: "",
    parent_id: null as number | null,
    image: null as File | null,
    icon: "",
    is_active: true,
    order: 0,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Categories = ({
    initialCategories,
    allCategories = [],
    filters,
}: CategoriesProps) => {
    const { toast } = useToast();
    const { user } = useAuth();

    // -------------------------------------------------------------------------
    // Category list state (synced from server)
    // -------------------------------------------------------------------------

    const [categories, setCategories] = useState<Category[]>(
        initialCategories?.data ?? [],
    );

    useEffect(() => {
        setCategories(initialCategories?.data ?? []);
    }, [initialCategories]);

    // -------------------------------------------------------------------------
    // Form state
    // -------------------------------------------------------------------------

    const [form, setForm] = useState({ ...defaultForm });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const slugManuallyEdited = useRef(false);

    const setField = <K extends keyof typeof defaultForm>(
        key: K,
        value: (typeof defaultForm)[K],
    ) => setForm((prev) => ({ ...prev, [key]: value }));

    /** Auto-generate slug from name unless manually overridden */
    useEffect(() => {
        if (!slugManuallyEdited.current) {
            setField("slug", toSlug(form.name));
        }
    }, [form.name]);

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        slugManuallyEdited.current = true;
        setField("slug", e.target.value);
    };

    const handleResetSlug = () => {
        slugManuallyEdited.current = false;
        setField("slug", toSlug(form.name));
    };

    // -------------------------------------------------------------------------
    // UI state
    // -------------------------------------------------------------------------

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(
        null,
    );
    const [showScrollTop, setShowScrollTop] = useState(false);

    // -------------------------------------------------------------------------
    // Search
    // -------------------------------------------------------------------------

    useEffect(() => {
        const id = setTimeout(() => {
            if (searchTerm !== (filters?.search || "")) {
                router.get(
                    "/categories",
                    {
                        search: searchTerm,
                        per_page: filters?.per_page,
                    },
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
        const h = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener("scroll", h);
        return () => window.removeEventListener("scroll", h);
    }, []);

    // -------------------------------------------------------------------------
    // Pagination
    // -------------------------------------------------------------------------

    const currentMeta = initialCategories?.meta;
    const paginationLinks = initialCategories?.links ?? [];

    const handleItemsPerPageChange = (value: string) => {
        router.get(
            "/categories",
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

    const handleOpenDialog = (category?: Category) => {
        slugManuallyEdited.current = false;
        setErrors({});

        if (category) {
            setEditingCategory(category);
            setForm({
                name: category.name,
                slug: category.slug,
                parent_id: category.parent_id,
                image: null,
                icon: category.icon ?? "",
                is_active: category.is_active,
                order: category.order,
            });
            setPreviewUrl(category.image);
            slugManuallyEdited.current = true;
        } else {
            setEditingCategory(null);
            setForm({ ...defaultForm });
            setPreviewUrl(null);
        }

        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        setForm({ ...defaultForm });
        setPreviewUrl(null);
        setErrors({});
        slugManuallyEdited.current = false;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setField("image", file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // -------------------------------------------------------------------------
    // Submit
    // -------------------------------------------------------------------------

    const handleSubmit = () => {
        setProcessing(true);

        const payload: Record<string, any> = {
            name: form.name,
            slug: form.slug,
            parent_id: form.parent_id ?? "",
            icon: form.icon,
            is_active: form.is_active ? 1 : 0,
            order: form.order,
        };

        if (form.image instanceof File) {
            payload.image = form.image;
        }

        const options = {
            forceFormData: true,
            onSuccess: () => {
                setProcessing(false);
                handleCloseDialog();
            },
            onError: (err: Record<string, string>) => {
                setProcessing(false);
                setErrors(err);
            },
        };

        if (editingCategory) {
            router.post(
                `/categories/${editingCategory.id}`,
                { ...payload, _method: "PUT" },
                options,
            );
        } else {
            router.post("/categories", payload, options);
        }
    };

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    const handleDelete = () => {
        if (deleteCategoryId) {
            router.delete(`/categories/${deleteCategoryId}`, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setDeleteCategoryId(null);
                },
                onError: () => {
                    // Handled by global flash
                },
            });
        }
    };

    const openDeleteDialog = (id: number) => {
        setDeleteCategoryId(id);
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
                            Categories
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Manage product categories &amp; hierarchy
                        </p>
                    </div>
                    {user?.permissions?.includes("category.create") && (
                        <Button
                            className="w-full sm:w-auto"
                            onClick={() => handleOpenDialog()}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    )}
                </div>

                {/* Table Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <CardTitle className="text-lg md:text-xl">
                                Category List
                            </CardTitle>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search categories..."
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
                        {/* Desktop Table */}
                        <div className="hidden md:block border rounded-lg overflow-hidden">
                            <div className="max-h-[600px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-background z-10">
                                        <TableRow>
                                            <TableHead className="w-[70px]">
                                                Image
                                            </TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Slug</TableHead>
                                            <TableHead>Parent</TableHead>
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
                                        {categories.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center py-8 text-muted-foreground"
                                                >
                                                    No categories found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            categories.map((cat) => (
                                                <TableRow key={cat.id}>
                                                    <TableCell>
                                                        {cat.image ? (
                                                            <img
                                                                src={cat.image}
                                                                alt={cat.name}
                                                                className="w-10 h-10 object-cover rounded shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-accent rounded flex items-center justify-center text-[10px] text-muted-foreground">
                                                                {cat.icon ||
                                                                    "—"}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {cat.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                                            {cat.slug}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {cat.parent_name ? (
                                                            <span className="text-xs font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                                                                {
                                                                    cat.parent_name
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                Root
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                cat.is_active
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            {cat.is_active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm">
                                                        {cat.order}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            {user?.permissions?.includes(
                                                                "category.update",
                                                            ) && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleOpenDialog(
                                                                            cat,
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {user?.permissions?.includes(
                                                                "category.delete",
                                                            ) && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        openDeleteDialog(
                                                                            cat.id,
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

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {categories.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">
                                    No categories found
                                </p>
                            ) : (
                                categories.map((cat) => (
                                    <Card key={cat.id} className="shadow-sm">
                                        <CardContent className="pt-4 pb-3">
                                            <div className="flex gap-3 items-start">
                                                {cat.image ? (
                                                    <img
                                                        src={cat.image}
                                                        alt={cat.name}
                                                        className="w-12 h-12 object-cover rounded-lg border shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-xl shrink-0">
                                                        {cat.icon || "📁"}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-semibold text-sm">
                                                            {cat.name}
                                                        </p>
                                                        <Badge
                                                            variant={
                                                                cat.is_active
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                            className="text-[10px]"
                                                        >
                                                            {cat.is_active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] font-mono text-muted-foreground truncate">
                                                        {cat.slug}
                                                    </p>
                                                    {cat.parent_name && (
                                                        <p className="text-xs text-primary mt-0.5">
                                                            ↳ {cat.parent_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                {user?.permissions?.includes(
                                                    "category.update",
                                                ) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() =>
                                                            handleOpenDialog(
                                                                cat,
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                )}
                                                {user?.permissions?.includes(
                                                    "category.delete",
                                                ) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() =>
                                                            openDeleteDialog(
                                                                cat.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="sticky bottom-0 bg-background border-t mt-4 pt-4 pb-2 z-10">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        Rows per page:
                                    </span>
                                    <Select
                                        value={
                                            currentMeta?.per_page?.toString() ??
                                            "15"
                                        }
                                        onValueChange={handleItemsPerPageChange}
                                    >
                                        <SelectTrigger className="w-[70px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["5", "10", "15", "20", "50"].map(
                                                (v) => (
                                                    <SelectItem
                                                        key={v}
                                                        value={v}
                                                    >
                                                        {v}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        {currentMeta?.total === 0
                                            ? "No results"
                                            : `${currentMeta?.from ?? 0}–${currentMeta?.to ?? 0} of ${currentMeta?.total ?? 0}`}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {paginationLinks.map((link, idx) => {
                                            const isPrev = idx === 0;
                                            const isNext =
                                                idx ===
                                                paginationLinks.length - 1;

                                            if (isPrev)
                                                return (
                                                    <Button
                                                        key={idx}
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        disabled={!link.url}
                                                        onClick={() =>
                                                            handlePageChange(
                                                                link.url,
                                                            )
                                                        }
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                );

                                            if (isNext)
                                                return (
                                                    <Button
                                                        key={idx}
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        disabled={!link.url}
                                                        onClick={() =>
                                                            handlePageChange(
                                                                link.url,
                                                            )
                                                        }
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                );

                                            if (link.label === "...")
                                                return (
                                                    <span
                                                        key={idx}
                                                        className="px-1 text-sm"
                                                    >
                                                        …
                                                    </span>
                                                );

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
                                {editingCategory
                                    ? "Edit Category"
                                    : "Add New Category"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCategory
                                    ? "Update category information"
                                    : "Enter category details"}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
                            {/* Image upload */}
                            <div className="space-y-2">
                                <Label>Category Image</Label>
                                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-accent rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer relative overflow-hidden">
                                    {previewUrl ? (
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                                            <img
                                                src={previewUrl}
                                                className="w-full h-full object-cover"
                                                alt="Preview"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 py-1">
                                            <Box className="h-8 w-8 text-muted-foreground/30" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                Click to upload
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                800 × 800 px recommended · Max 2
                                                MB
                                            </span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                </div>
                                {errors.image && (
                                    <p className="text-xs text-red-500">
                                        {errors.image}
                                    </p>
                                )}
                            </div>

                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="cat-name">
                                    Category Name *
                                </Label>
                                <Input
                                    id="cat-name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setField("name", e.target.value)
                                    }
                                    placeholder="Enter category name"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="cat-slug">
                                        Slug
                                        {!slugManuallyEdited.current &&
                                            form.name && (
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
                                    id="cat-slug"
                                    value={form.slug}
                                    onChange={handleSlugChange}
                                    placeholder="category-slug"
                                    className="font-mono text-sm"
                                />
                                {errors.slug && (
                                    <p className="text-xs text-red-500">
                                        {errors.slug}
                                    </p>
                                )}
                            </div>

                            {/* Parent Category */}
                            <div className="space-y-2">
                                <Label>Parent Category</Label>
                                <Select
                                    value={form.parent_id?.toString() ?? "null"}
                                    onValueChange={(val) =>
                                        setField(
                                            "parent_id",
                                            val === "null" ? null : Number(val),
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="None (Root)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">
                                            None (Root)
                                        </SelectItem>
                                        {allCategories
                                            .filter(
                                                (c) =>
                                                    c.id !==
                                                    editingCategory?.id,
                                            )
                                            .map((c) => (
                                                <SelectItem
                                                    key={c.id}
                                                    value={c.id.toString()}
                                                >
                                                    {c.parent_id
                                                        ? `↳ ${c.name}`
                                                        : c.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.parent_id && (
                                    <p className="text-xs text-red-500">
                                        {errors.parent_id}
                                    </p>
                                )}
                            </div>

                            {/* Icon */}
                            <div className="space-y-2">
                                <Label htmlFor="cat-icon">
                                    Icon{" "}
                                    <span className="text-[11px] text-muted-foreground font-normal">
                                        (emoji or icon class, optional)
                                    </span>
                                </Label>
                                <Input
                                    id="cat-icon"
                                    value={form.icon}
                                    onChange={(e) =>
                                        setField("icon", e.target.value)
                                    }
                                    placeholder="e.g. 📦 or fa-tag"
                                />
                                {errors.icon && (
                                    <p className="text-xs text-red-500">
                                        {errors.icon}
                                    </p>
                                )}
                            </div>

                            {/* Is Active + Order */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cat-active">Active</Label>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Switch
                                            id="cat-active"
                                            checked={form.is_active}
                                            onCheckedChange={(v) =>
                                                setField("is_active", v)
                                            }
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {form.is_active ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cat-order">
                                        Display Order
                                    </Label>
                                    <Input
                                        id="cat-order"
                                        type="number"
                                        min={0}
                                        value={form.order}
                                        onChange={(e) =>
                                            setField(
                                                "order",
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                    {errors.order && (
                                        <p className="text-xs text-red-500">
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
                                    : editingCategory
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
                                This action cannot be undone. The category and
                                all its sub-categories will be permanently
                                deleted.
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

                {/* Scroll to top */}
                {showScrollTop && (
                    <Button
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
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

export default Categories;
