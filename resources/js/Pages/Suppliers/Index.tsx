import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { router, useForm, usePage } from "@inertiajs/react";
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
    Building2,
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
import { useAuth } from "@/hooks/useAuth";

interface Supplier {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    contact_person: string | null;
    is_active: boolean;
}

interface IndexProps {
    initialSuppliers: {
        data: Supplier[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        per_page?: string | number;
    };
}

export default function SuppliersIndex({ initialSuppliers, filters }: IndexProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        contact_person: "",
        is_active: true,
    });

    useEffect(() => {
        const id = setTimeout(() => {
            if (searchTerm !== (filters.search || "")) {
                router.get(
                    "/suppliers",
                    { search: searchTerm, per_page: filters.per_page },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(id);
    }, [searchTerm]);

    const handleOpenDialog = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setData({
                name: supplier.name,
                email: supplier.email || "",
                phone: supplier.phone || "",
                address: supplier.address || "",
                contact_person: supplier.contact_person || "",
                is_active: supplier.is_active,
            });
        } else {
            setEditingSupplier(null);
            reset();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
                toast({ title: "Success", description: editingSupplier ? "Supplier updated" : "Supplier created" });
            },
        };

        if (editingSupplier) {
            put(`/suppliers/${editingSupplier.id}`, options);
        } else {
            post("/suppliers", options);
        }
    };

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/suppliers/${deleteId}`, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    toast({ title: "Success", description: "Supplier deleted" });
                },
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Suppliers</h1>
                        <p className="text-muted-foreground">Manage your product suppliers and vendors</p>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Supplier
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <CardTitle>Supplier List</CardTitle>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search suppliers..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Contact Person</TableHead>
                                        <TableHead>Phone / Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {initialSuppliers.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">No suppliers found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        initialSuppliers.data.map((supplier) => (
                                            <TableRow key={supplier.id}>
                                                <TableCell className="font-medium">{supplier.name}</TableCell>
                                                <TableCell>{supplier.contact_person || "N/A"}</TableCell>
                                                <TableCell>
                                                    <div className="text-xs">
                                                        <div>{supplier.phone || "No Phone"}</div>
                                                        <div className="text-muted-foreground">{supplier.email || "No Email"}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={supplier.is_active ? "default" : "secondary"}>
                                                        {supplier.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(supplier)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => { setDeleteId(supplier.id); setIsDeleteDialogOpen(true); }}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dialogs */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
                            <DialogDescription>Enter supplier details below.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input value={data.name} onChange={e => setData("name", e.target.value)} required />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Contact Person</Label>
                                    <Input value={data.contact_person} onChange={e => setData("contact_person", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input value={data.phone} onChange={e => setData("phone", e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={data.email} onChange={e => setData("email", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Textarea value={data.address} onChange={e => setData("address", e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={data.is_active} onCheckedChange={checked => setData("is_active", checked)} />
                                <Label>Active Status</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{editingSupplier ? "Update" : "Save"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the supplier.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
