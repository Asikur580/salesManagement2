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
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm, router } from "@inertiajs/react";
import { useToast } from "@/hooks/use-toast";

interface AttributeValue {
    id: number;
    attribute_id: number;
    value: string;
}

interface Attribute {
    id: number;
    name: string;
    values: AttributeValue[];
}

interface PageProps {
    attributes: Attribute[];
}

export default function Attributes({ attributes }: PageProps) {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Form state handling for dynamic array of values
    const [attributeValues, setAttributeValues] = useState<
        { id?: number; value: string }[]
    >([]);
    const [newValueText, setNewValueText] = useState("");

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            values: [] as { id?: number; value: string }[],
        });

    const filteredAttributes = attributes.filter((attr) =>
        attr.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const openCreateDialog = () => {
        setEditingId(null);
        reset();
        setAttributeValues([]);
        setNewValueText("");
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (attr: Attribute) => {
        setEditingId(attr.id);
        setData("name", attr.name);

        // Map values exactly as they are configured
        const formattedValues = attr.values.map((v) => ({
            id: v.id,
            value: v.value,
        }));
        setAttributeValues(formattedValues);
        setData("values", formattedValues);

        setNewValueText("");
        clearErrors();
        setIsDialogOpen(true);
    };

    const handleAddValue = () => {
        if (!newValueText.trim()) return;

        // Prevent exact duplicates in the local state
        if (
            attributeValues.some(
                (v) =>
                    v.value.toLowerCase() === newValueText.trim().toLowerCase(),
            )
        ) {
            toast({
                title: "Warning",
                description: "Value already exists.",
                variant: "destructive",
            });
            return;
        }

        const newValues = [...attributeValues, { value: newValueText.trim() }];
        setAttributeValues(newValues);
        setData("values", newValues);
        setNewValueText("");
    };

    const handleRemoveValue = (index: number) => {
        const newValues = [...attributeValues];
        newValues.splice(index, 1);
        setAttributeValues(newValues);
        setData("values", newValues);
    };

    const handleValueKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddValue();
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTimeout(() => reset(), 200);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Always sync the form state right before submit to be safe
        setData("values", attributeValues);

        if (editingId) {
            put(`/attributes/${editingId}`, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    handleCloseDialog();
                    toast({
                        title: "Success",
                        description: "Attribute updated successfully",
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
            post("/attributes", {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    handleCloseDialog();
                    toast({
                        title: "Success",
                        description: "Attribute created successfully",
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

    const openDeleteDialog = (id: number) => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!deletingId) return;
        router.delete(`/attributes/${deletingId}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setDeletingId(null);
                toast({
                    title: "Success",
                    description: "Attribute deleted successfully",
                });
            },
            onError: () => {
                setIsDeleteDialogOpen(false);
                setDeletingId(null);
                toast({
                    title: "Error",
                    description: "Failed to delete attribute",
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-5xl mx-auto pb-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Attributes
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage product variations like Size, Color,
                            Material.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Attribute
                    </Button>
                </div>

                <div className="bg-card border rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search attributes..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-1/4">
                                    Attribute Name
                                </TableHead>
                                <TableHead>Available Values</TableHead>
                                <TableHead className="text-right w-32">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAttributes.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        No attributes found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAttributes.map((attr) => (
                                    <TableRow key={attr.id}>
                                        <TableCell className="font-medium text-foreground">
                                            {attr.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                {attr.values.length > 0 ? (
                                                    attr.values.map((v) => (
                                                        <Badge
                                                            key={v.id}
                                                            variant="secondary"
                                                            className="font-normal text-xs"
                                                        >
                                                            {v.value}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">
                                                        No values configured
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-blue-600 h-8 w-8"
                                                    onClick={() =>
                                                        openEditDialog(attr)
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
                                                            attr.id,
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
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? "Edit Attribute" : "Add New Attribute"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Attribute Name (e.g., Size, Color){" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Enter attribute name..."
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

                        <div className="space-y-4 border rounded-xl p-4 bg-muted/50">
                            <div>
                                <Label>Attribute Values</Label>
                                <p className="text-xs text-muted-foreground mt-1 mb-3">
                                    Add the predefined values (e.g. Small,
                                    Medium, Large, Red, Blue).
                                </p>

                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder="Type a value and press Enter..."
                                        value={newValueText}
                                        onChange={(e) =>
                                            setNewValueText(e.target.value)
                                        }
                                        onKeyDown={handleValueKeyDown}
                                        className="bg-card"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleAddValue}
                                    >
                                        Add
                                    </Button>
                                </div>

                                {/* Error checking from server array validation */}
                                {Object.keys(errors).some((k) =>
                                    k.startsWith("values"),
                                ) && (
                                    <p className="text-xs text-red-500 mb-3">
                                        Please ensure all values are valid text.
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-card border rounded-lg">
                                    {attributeValues.length > 0 ? (
                                        attributeValues.map((val, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="pl-3 pr-1 py-1.5 flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                            >
                                                {val.value}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveValue(index)
                                                    }
                                                    className="hover:opacity-100 rounded-full p-0.5 hover:bg-black/10 transition-colors"
                                                    title="Remove"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic w-full text-center py-2">
                                            No values added yet
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseDialog}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? "Saving..." : "Save Attribute"}
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
                            This will permanently delete the attribute and all
                            of its associated values. Products currently using
                            variations built from these attributes may break.
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
                            Delete Attribute
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
