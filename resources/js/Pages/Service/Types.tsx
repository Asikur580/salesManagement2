import { useState } from "react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Search, Pencil, Trash2, Wrench } from "lucide-react";
import { useForm, router } from "@inertiajs/react";
import { useToast } from "@/hooks/use-toast";

interface ServiceType {
    id: number;
    name: string;
    charge: number;
}

interface PageProps {
    serviceTypes: ServiceType[];
}

export default function ServiceTypes({ serviceTypes }: PageProps) {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            charge: 0,
        });

    const filteredTypes = serviceTypes.filter(
        (st) => st.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const openCreateDialog = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (st: ServiceType) => {
        setEditingId(st.id);
        setData({
            name: st.name,
            charge: st.charge,
        });
        clearErrors();
        setIsDialogOpen(true);
    };

    const openDeleteDialog = (id: number) => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTimeout(() => reset(), 200);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            put(`/service-types/${editingId}`, {
                onSuccess: () => {
                    handleCloseDialog();
                },
            });
        } else {
            post("/service-types", {
                onSuccess: () => {
                    handleCloseDialog();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingId) return;
        router.delete(`/service-types/${deletingId}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setDeletingId(null);
            },
            onError: () => {
                setIsDeleteDialogOpen(false);
                setDeletingId(null);
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto pb-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Service Types
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage service types and their default charges.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Service Type
                    </Button>
                </div>

                <div className="bg-card border rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search service types..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Default Charge (TK)</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTypes.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <Wrench className="h-8 w-8 opacity-20" />
                                            <span>No service types found.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTypes.map((st, index) => (
                                    <TableRow key={st.id}>
                                        <TableCell className="text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {st.name}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-emerald-600">
                                                {Number(st.charge).toLocaleString()} TK
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-blue-600 h-8 w-8"
                                                    onClick={() =>
                                                        openEditDialog(st)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 h-8 w-8"
                                                    onClick={() =>
                                                        openDeleteDialog(
                                                            st.id,
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
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? "Edit Service Type" : "Add New Service Type"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Service Name{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g. Engine Repair"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                required
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="charge">
                                Default Charge (TK){" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="charge"
                                type="number"
                                placeholder="e.g. 500"
                                value={data.charge}
                                onChange={(e) =>
                                    setData("charge", Number(e.target.value))
                                }
                                required
                                min={0}
                            />
                            {errors.charge && (
                                <p className="text-xs text-red-500">
                                    {errors.charge}
                                </p>
                            )}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseDialog}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the service type. This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setDeletingId(null);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
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
