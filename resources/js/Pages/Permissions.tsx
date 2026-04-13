import { useState, useEffect } from "react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { router, usePage } from "@inertiajs/react";
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PermissionCard } from "@/components/permissions/PermissionCard";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/hooks/useAuth";

interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    description?: string; // Optional/Not in API
    category?: string; // Derived
}

interface PermissionsProps {
    initialPermissions: any[];
    filters: any;
}

export default function Permissions({
    initialPermissions,
    filters,
}: PermissionsProps) {
    // Process initial data to match the format used in state (adding category)
    const processPermissions = (data: any[]) => {
        return data.map((perm: any) => {
            const parts = perm.name.split(/[_-]/);
            const category =
                parts.length > 1 ? parts[parts.length - 1] : "General";
            return {
                ...perm,
                category: category.charAt(0).toUpperCase() + category.slice(1),
            };
        });
    };

    const [permissions, setPermissions] = useState<Permission[]>(
        initialPermissions ? processPermissions(initialPermissions) : [],
    );
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    // Permission helper function
    const hasPermission = (permission: string): boolean => {
        return user?.permissions?.includes(permission) || false;
    };

    const handleRefresh = () => {
        router.reload({
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

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

    const filteredPermissions = permissions.filter(
        (permission) =>
            permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (permission.description &&
                permission.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) ||
            (permission.category &&
                permission.category
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())),
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPermissions = filteredPermissions.slice(
        startIndex,
        endIndex,
    );

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        router.get(
            "/permissions",
            { search: value },
            { preserveState: true, replace: true },
        );
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    const handleOpenDialog = (permission?: Permission) => {
        if (permission) {
            setSelectedPermission(permission);
            setFormData({
                name: permission.name,
                description: permission.description || "",
                category: permission.category || "",
            });
            setIsDialogOpen(true);
        } else {
            setFormData({
                name: "",
                description: "",
                category: "",
            });
            setIsDialogOpen(true);
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedPermission(null);
        setFormData({
            name: "",
            description: "",
            category: "",
        });
    };

    const handleSubmit = async () => {
        // Check permissions
        const requiredPermission = selectedPermission
            ? "permission.update"
            : "permission.create";
        if (!hasPermission(requiredPermission)) {
            return;
        }

        if (!formData.name.trim()) {
            return;
        }

        setIsLoading(true);

        if (selectedPermission) {
            router.put(
                `/permissions/${selectedPermission.id}`,
                {
                    name: formData.name,
                },
                {
                    onSuccess: () => {
                        handleCloseDialog();
                    },
                    onError: (errors: any) => {},
                    onFinish: () => setIsLoading(false),
                },
            );
        } else {
            router.post(
                "/permissions",
                {
                    name: formData.name,
                },
                {
                    onSuccess: () => {
                        handleCloseDialog();
                    },
                    onError: (errors: any) => {},
                    onFinish: () => setIsLoading(false),
                },
            );
        }
    };

    const handleOpenDeleteDialog = (permission: Permission) => {
        setSelectedPermission(permission);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!hasPermission("permission.delete")) {
            setIsDeleteDialogOpen(false);
            return;
        }

        if (!selectedPermission) return;

        setIsLoading(true);
        router.delete(`/permissions/${selectedPermission.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedPermission(null);
            },
            onError: (errors: any) => {},
            onFinish: () => setIsLoading(false),
        });
    };

    // Effect to update local permissions when prop changes
    useEffect(() => {
        if (initialPermissions) {
            setPermissions(processPermissions(initialPermissions));
        }
    }, [initialPermissions]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Manage Permissions
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            View system permissions
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                            />
                            Refresh
                        </Button>
                        {hasPermission("permission.create") && (
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="w-full sm:w-auto"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Permission
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search permissions..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {isLoading ? (
                        <p className="text-center py-4">Loading...</p>
                    ) : paginatedPermissions.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">
                            No permissions found
                        </p>
                    ) : (
                        paginatedPermissions.map((permission) => (
                            <PermissionCard
                                key={permission.id}
                                permission={permission as any} // Cast for demo component compatibility if needed
                                onEdit={() => handleOpenDialog(permission)}
                                onDelete={() =>
                                    handleOpenDeleteDialog(permission)
                                }
                            />
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-lg border bg-card">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">
                                        SI No
                                    </TableHead>
                                    <TableHead>Permission Name</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center py-8"
                                        >
                                            Loading permissions...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedPermissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            No permissions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedPermissions.map(
                                        (permission, index) => (
                                            <TableRow key={permission.id}>
                                                <TableCell>
                                                    {startIndex + index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium font-mono text-sm">
                                                    {permission.name}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        permission.created_at,
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {hasPermission(
                                                            "permission.update",
                                                        ) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleOpenDialog(
                                                                        permission,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {hasPermission(
                                                            "permission.delete",
                                                        ) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleOpenDeleteDialog(
                                                                        permission,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
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

                {/* Pagination */}
                {filteredPermissions.length > 0 && (
                    <div className="sticky bottom-0 bg-background border-t mt-4 pt-4 pb-2 z-10">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                    {filteredPermissions.length === 0
                                        ? "No results"
                                        : `${startIndex + 1}-${Math.min(endIndex, filteredPermissions.length)} of ${filteredPermissions.length}`}
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
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedPermission
                                ? "Edit Permission"
                                : "Add New Permission"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center gap-4">
                            <Label htmlFor="name" className="text-left">
                                Permission Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="e.g. permission.add"
                                className="col-span-3"
                            />
                        </div>
                        {/* Description and Category are ignored for now as strictly not requested/supported by API spec yet
            <div className="grid items-center gap-4">
              <Label htmlFor="description" className="text-left">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this permission does..."
                className="col-span-3"
              />
            </div>
             */}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
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
                            This action cannot be undone. This will permanently
                            delete the permission
                            <span className="font-semibold px-1">
                                "{selectedPermission?.name}"
                            </span>
                            from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isLoading}
                        >
                            {isLoading ? "Deleting..." : "Delete"}
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
        </DashboardLayout>
    );
}
