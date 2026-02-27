import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useForm, router } from "@inertiajs/react";
import { useToast } from "@/hooks/use-toast";

interface Unit {
    id: number;
    name: string;
    abbreviation: string | null;
}

interface PageProps {
    units: Unit[];
}

export default function Units({ units }: PageProps) {
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
            abbreviation: "",
        });

    const filteredUnits = units.filter(
        (unit) =>
            unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (unit.abbreviation &&
                unit.abbreviation
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())),
    );

    const openCreateDialog = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (unit: Unit) => {
        setEditingId(unit.id);
        setData({
            name: unit.name,
            abbreviation: unit.abbreviation || "",
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
            put(`/units/${editingId}`, {
                onSuccess: () => {
                    handleCloseDialog();
                    toast({
                        title: "Success",
                        description: "Unit updated successfully",
                    });
                },
                onError: (err) => {
                    toast({
                        title: "Error",
                        description: Object.values(err)[0] as string,
                        variant: "destructive",
                    });
                },
            });
        } else {
            post("/units", {
                onSuccess: () => {
                    handleCloseDialog();
                    toast({
                        title: "Success",
                        description: "Unit created successfully",
                    });
                },
                onError: (err) => {
                    toast({
                        title: "Error",
                        description: Object.values(err)[0] as string,
                        variant: "destructive",
                    });
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingId) return;
        router.delete(`/units/${deletingId}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setDeletingId(null);
                toast({
                    title: "Success",
                    description: "Unit deleted successfully",
                });
            },
            onError: () => {
                setIsDeleteDialogOpen(false);
                setDeletingId(null);
                toast({
                    title: "Error",
                    description: "Failed to delete unit",
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto pb-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Units
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage measurements like kg, pieces, liters.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Unit
                    </Button>
                </div>

                <div className="bg-white border rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search units..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead>Unit Name</TableHead>
                                <TableHead>Abbreviation</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUnits.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="h-32 text-center text-gray-500"
                                    >
                                        No units found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUnits.map((unit) => (
                                    <TableRow key={unit.id}>
                                        <TableCell className="font-medium text-gray-900">
                                            {unit.name}
                                        </TableCell>
                                        <TableCell>
                                            {unit.abbreviation || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-blue-600 h-8 w-8"
                                                    onClick={() =>
                                                        openEditDialog(unit)
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
                                                            unit.id,
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
                            {editingId ? "Edit Unit" : "Add New Unit"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Unit Name{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g. Kilogram"
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
                            <Label htmlFor="abbreviation">Abbreviation</Label>
                            <Input
                                id="abbreviation"
                                placeholder="e.g. kg"
                                value={data.abbreviation}
                                onChange={(e) =>
                                    setData("abbreviation", e.target.value)
                                }
                            />
                            {errors.abbreviation && (
                                <p className="text-xs text-red-500">
                                    {errors.abbreviation}
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
                                {processing ? "Saving..." : "Save Unit"}
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
                            This will permanently delete the unit. This action
                            cannot be undone and may affect products currently
                            using this unit.
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
                            Delete Unit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
