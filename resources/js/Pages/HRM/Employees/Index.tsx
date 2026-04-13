import { useState, useCallback } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Power, PowerOff } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>) => {
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

export default function Employees({ initialEmployees, roles, filters }: any) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);

    const { data, setData, post, put, reset, processing, errors, clearErrors } = useForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
        base_salary: 0,
        join_date: "",
        is_active: true,
    });

    const fetchEmployees = useCallback(
        debounce((search: string) => {
            setIsLoading(true);
            router.get(
                route("hrm.employees.index"),
                { search: search || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ["initialEmployees", "filters"],
                    onFinish: () => setIsLoading(false),
                }
            );
        }, 300),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        fetchEmployees(value);
    };

    const openAddDialog = () => {
        setEditingEmployee(null);
        reset();
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (employee: any) => {
        setEditingEmployee(employee);
        setData({
            name: employee.name,
            email: employee.email,
            phone: employee.phone === 'N/A' ? '' : employee.phone,
            password: "", // Leave blank unless changing
            role: employee.role === 'N/A' ? '' : employee.role,
            base_salary: employee.base_salary,
            join_date: employee.join_date || "",
            is_active: employee.is_active,
        });
        clearErrors();
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingEmployee) {
            // Edit
            put(route('hrm.employees.update', editingEmployee.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                },
            });
        } else {
            // Create
            post(route('hrm.employees.store'), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const toggleStatus = (id: number) => {
        router.patch(route('hrm.employees.toggle-status', id), {}, {
            preserveScroll: true,
            onSuccess: () => {},
        });
    };

    return (
        <DashboardLayout>
            <Head title="HRM Employees" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Employee Management</h1>
                        <p className="text-muted-foreground mt-2">Manage your staff, roles, and basic salary data.</p>
                    </div>
                    <Button onClick={openAddDialog}>
                        <Plus className="mr-2 h-4 w-4" /> Add Employee
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Base Salary</TableHead>
                                        <TableHead>Join Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {initialEmployees.data.length > 0 ? (
                                        initialEmployees.data.map((emp: any) => (
                                            <TableRow key={emp.id} className={!emp.is_active ? 'opacity-60 bg-muted/30' : ''}>
                                                <TableCell>
                                                    <p className="font-medium">{emp.name}</p>
                                                    <p className="text-xs text-muted-foreground">{emp.email}</p>
                                                </TableCell>
                                                <TableCell><Badge variant="outline">{emp.role}</Badge></TableCell>
                                                <TableCell>{emp.phone}</TableCell>
                                                <TableCell>৳{Number(emp.base_salary).toFixed(2)}</TableCell>
                                                <TableCell>{emp.join_date ? new Date(emp.join_date).toLocaleDateString() : 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={emp.is_active ? 'default' : 'destructive'}>
                                                        {emp.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(emp)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className={emp.is_active ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}
                                                            onClick={() => toggleStatus(emp.id)}
                                                            title={emp.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {emp.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                                No employees found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Component Similar to Users page */}
                        {initialEmployees?.meta?.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Showing {initialEmployees.meta.from || 0} to {initialEmployees.meta.to || 0} of {initialEmployees.meta.total} employees
                                </div>
                                <div className="flex gap-2">
                                    {initialEmployees.links.map((link: any, i: number) => {
                                        let label = link.label;
                                        if (label.includes("&laquo;")) label = "«";
                                        if (label.includes("&raquo;")) label = "»";

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    if (link.url) {
                                                        setIsLoading(true);
                                                        router.visit(link.url, {
                                                            preserveScroll: true,
                                                            only: ["initialEmployees"],
                                                            onFinish: () => setIsLoading(false),
                                                        });
                                                    }
                                                }}
                                                disabled={!link.url || link.active}
                                                className={`px-3 py-1 text-sm border rounded hover:bg-muted ${link.active ? "bg-primary text-primary-foreground border-primary" : ""} ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                                                dangerouslySetInnerHTML={{ __html: label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Role *</Label>
                                <Select value={data.role} onValueChange={(v) => setData('role', v)} required>
                                    <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r: any) => (
                                            <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Base Salary (৳)</Label>
                                <Input type="number" min="0" step="0.01" value={data.base_salary} onChange={e => setData('base_salary', parseFloat(e.target.value))} />
                                {errors.base_salary && <p className="text-xs text-red-500">{errors.base_salary}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Joining Date</Label>
                                <Input type="date" value={data.join_date} onChange={e => setData('join_date', e.target.value)} />
                                {errors.join_date && <p className="text-xs text-red-500">{errors.join_date}</p>}
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label>Password {editingEmployee && '(Leave blank to keep unchanged)'}</Label>
                                <Input type="password" value={data.password} onChange={e => setData('password', e.target.value)} required={!editingEmployee} minLength={6} />
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>

                            {editingEmployee && (
                                <div className="space-y-2 col-span-2 flex items-center justify-between border-t pt-4 mt-2">
                                    <div>
                                        <Label className="text-base">Active Account</Label>
                                        <p className="text-xs text-muted-foreground">Inactive employees cannot log in.</p>
                                    </div>
                                    <Switch checked={data.is_active} onCheckedChange={(v) => setData('is_active', v)} />
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Employee'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
