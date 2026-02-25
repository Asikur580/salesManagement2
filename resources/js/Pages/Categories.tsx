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
import { CategoryCard } from "@/components/categories/CategoryCard";
import { useAuth } from "@/hooks/useAuth";

interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    parent_id: number | null;
    parent_name: string | null;
}

interface CategoriesProps {
    initialCategories: Category[];
    allCategories: { id: number; name: string }[];
    filters: {
        search?: string;
    };
}

const Categories = ({
    initialCategories = [],
    allCategories = [],
    filters,
}: CategoriesProps) => {
    const { toast } = useToast();
    const { user } = useAuth();

    const [categories, setCategories] = useState<Category[]>(
        initialCategories || [],
    );

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
        parent_id: null as number | null,
        image: null as File | string | null,
    });

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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Scroll to top detection
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (initialCategories) {
            setCategories(initialCategories);
        }
    }, [initialCategories]);

    // Server-side search debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (filters?.search || "")) {
                router.get(
                    "/categories",
                    { search: searchTerm },
                    { preserveState: true, replace: true },
                );
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const filteredCategories = categories;

    // Pagination
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setData({
                name: category.name,
                slug: category.slug,
                parent_id: category.parent_id,
                image: null,
            });
            setPreviewUrl(category.image);
        } else {
            setEditingCategory(null);
            reset();
            setPreviewUrl(null);
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
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

        if (editingCategory) {
            // Use post with _method spoofing for file uploads in Laravel
            router.post(
                `/categories/${editingCategory.id}`,
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
                            description: "Category updated successfully",
                        });
                    },
                    onError: (err: Record<string, string>) => {
                        toast({
                            title: "Error",
                            description:
                                Object.values(err)[0] ||
                                "Failed to update category",
                            variant: "destructive",
                        });
                    },
                },
            );
        } else {
            transform(prepareData).post("/categories", {
                forceFormData: true,
                onSuccess: () => {
                    handleCloseDialog();
                    toast({
                        title: "Success",
                        description: "Category created successfully",
                    });
                },
                onError: (err: Record<string, string>) => {
                    toast({
                        title: "Error",
                        description:
                            Object.values(err)[0] ||
                            "Failed to create category",
                        variant: "destructive",
                    });
                },
            });
        }
    };

    const handleDelete = () => {
        if (deleteCategoryId) {
            destroy(`/categories/${deleteCategoryId}`, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setDeleteCategoryId(null);
                    toast({
                        title: "Success",
                        description: "Category deleted successfully",
                    });
                },
            });
        }
    };

    const openDeleteDialog = (id: number) => {
        setDeleteCategoryId(id);
        setIsDeleteDialogOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Categories
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Manage your product categories & hierarchy
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
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <div className="border rounded-lg overflow-hidden">
                                <div className="max-h-[600px] overflow-y-auto">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background z-10">
                                            <TableRow>
                                                <TableHead className="w-[80px]">
                                                    Logo
                                                </TableHead>
                                                <TableHead>
                                                    Category Name
                                                </TableHead>
                                                <TableHead>Slug</TableHead>
                                                <TableHead>Parent</TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedCategories.length ===
                                            0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="text-center py-8 text-muted-foreground"
                                                    >
                                                        No categories found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedCategories.map(
                                                    (category) => (
                                                        <TableRow
                                                            key={category.id}
                                                        >
                                                            <TableCell>
                                                                {category.image ? (
                                                                    <img
                                                                        src={
                                                                            category.image
                                                                        }
                                                                        alt={
                                                                            category.name
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
                                                                {category.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                                                    {
                                                                        category.slug
                                                                    }
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                {category.parent_name ? (
                                                                    <span className="text-xs font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                                                                        {
                                                                            category.parent_name
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground italic">
                                                                        Root
                                                                    </span>
                                                                )}
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
                                                                                    category,
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
                                                                                    category.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
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
                                        value={itemsPerPage.toString()}
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
                                        {filteredCategories.length === 0
                                            ? "No results"
                                            : `${startIndex + 1}-${Math.min(endIndex, filteredCategories.length)} of ${filteredCategories.length}`}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <ChevronLeft className="h-4 w-4 -ml-2" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() =>
                                                setCurrentPage(currentPage - 1)
                                            }
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() =>
                                                setCurrentPage(currentPage + 1)
                                            }
                                            disabled={
                                                currentPage === totalPages ||
                                                totalPages === 0
                                            }
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() =>
                                                setCurrentPage(totalPages)
                                            }
                                            disabled={
                                                currentPage === totalPages ||
                                                totalPages === 0
                                            }
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                            <ChevronRight className="h-4 w-4 -ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- CATEGORY PROTOCOL DIALOG --- */}
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

                        <div className="space-y-4 py-4">
                            <div className="space-y-4">
                                {/* Image Upload Area */}
                                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-accent rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer relative group overflow-hidden">
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
                                                Logo
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
                                    <p className="text-xs text-red-500 text-center">
                                        {errors.image}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    placeholder="Enter category name"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
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
                                    placeholder="category-slug (optional)"
                                />
                                {errors.slug && (
                                    <p className="text-xs text-red-500">
                                        {errors.slug}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parent_id">
                                    Parent Category
                                </Label>
                                <Select
                                    value={data.parent_id?.toString() || "null"}
                                    onValueChange={(val) =>
                                        setData(
                                            "parent_id",
                                            val === "null" ? null : Number(val),
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Root Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">
                                            None (Root)
                                        </SelectItem>
                                        {allCategories
                                            .filter(
                                                (cat) =>
                                                    cat.id !==
                                                    editingCategory?.id,
                                            ) // Prevent self-parenting
                                            .map((cat) => (
                                                <SelectItem
                                                    key={cat.id}
                                                    value={cat.id.toString()}
                                                >
                                                    {cat.name}
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

                <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the category and all its
                                sub-categories.
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

export default Categories;
