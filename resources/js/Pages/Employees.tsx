import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    UserPlus,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL, getStorageUrl } from "@/lib/config";

interface Designation {
    id: string;
    name: string;
    company_id: string;
}

interface Role {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    designationId: string;
    designation: string;
    name: string;
    email: string;
    password?: string; // Optional as not returned in list usually
    phone: string;
    nationalId: string;
    bloodGroup: string;
    territory: string;
    district: string;
    image?: string;
    userRole: string;
    loginAllowed: boolean;
    status: string;
    supervisorId?: number;
    employeeId: string;
    creditLimit: string;
}

interface EmployeesProps {
    initialEmployees: Employee[];
    initialDesignations: Designation[];
    initialRoles: Role[];
    initialUsers: any[];
}

const Employees = ({
    initialEmployees,
    initialDesignations,
    initialRoles,
    initialUsers,
}: EmployeesProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { flash } = usePage<any>().props;

    const [employees, setEmployees] = useState<Employee[]>(
        initialEmployees || [],
    );
    const [designations, setDesignations] = useState<Designation[]>(
        initialDesignations || [],
    );
    const [roles, setRoles] = useState<Role[]>(initialRoles || []);
    const [isLoading, setIsLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterDesignation, setFilterDesignation] = useState("");
    const [filterUserRole, setFilterUserRole] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAssignSupervisorDialogOpen, setIsAssignSupervisorDialogOpen] =
        useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null,
    );
    const [selectedSupervisorId, setSelectedSupervisorId] = useState<
        number | undefined
    >(undefined);

    const [formData, setFormData] = useState({
        designationId: "",
        designation: "",
        name: "",
        email: "",
        password: "",
        phone: "",
        nationalId: "",
        bloodGroup: "",
        territory: "",
        district: "",
        image: "",
        userRole: "",
        loginAllowed: true,
        status: "Active",
        employeeId: "",
        creditLimit: "",
    });

    // Sync state with props and handle flash messages
    useEffect(() => {
        if (initialEmployees) setEmployees(initialEmployees);
        if (initialDesignations) setDesignations(initialDesignations);
        if (initialRoles) setRoles(initialRoles);
    }, [initialEmployees, initialDesignations, initialRoles]);

    useEffect(() => {
        if (flash?.success) {
            toast({
                title: "Success",
                description: flash.success,
            });
        }
        if (flash?.error) {
            toast({
                title: "Error",
                description: flash.error,
                variant: "destructive",
            });
        }
        if (flash?.message) {
            toast({
                title: "Info",
                description: flash.message,
            });
        }
    }, [flash]);

    const filteredEmployees = employees.filter((employee) => {
        const matchesSearch =
            employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDesignation =
            !filterDesignation ||
            filterDesignation === "all" ||
            employee.designationId === filterDesignation;
        const matchesUserRole =
            !filterUserRole ||
            filterUserRole === "all" ||
            employee.userRole === filterUserRole;
        const matchesStatus =
            !filterStatus ||
            filterStatus === "all" ||
            employee.status === filterStatus;

        return (
            matchesSearch &&
            matchesDesignation &&
            matchesUserRole &&
            matchesStatus
        );
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const handleFilterChange =
        (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (value: string) => {
            setter(value);
            setCurrentPage(1);
        };

    const resetForm = () => {
        setFormData({
            designationId: "",
            designation: "",
            name: "",
            email: "",
            password: "",
            phone: "",
            nationalId: "",
            bloodGroup: "",
            territory: "",
            district: "",
            image: "",
            userRole: "",
            loginAllowed: true,
            status: "Active",
            employeeId: "",
            creditLimit: "",
        });
    };

    const handleAdd = async () => {
        if (
            !formData.designationId ||
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.userRole ||
            !formData.employeeId
        ) {
            toast({
                title: "Error",
                description:
                    "Please fill in all required fields (Designation, Name, Email, Password, Role, Employee ID)",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const role = roles.find((r) => r.name === formData.userRole);
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            designationId: parseInt(formData.designationId),
            roleId: role ? role.id : null,
            phone: formData.phone,
            nationalId: formData.nationalId,
            bloodGroup: formData.bloodGroup,
            territory: formData.territory,
            district: formData.district,
            status: formData.status.toLowerCase(),
            loginAllowed: formData.loginAllowed,
            parentId: null,
            image: formData.image || null,
            employeeId: formData.employeeId || null,
            creditLimit: formData.creditLimit || null,
        };

        router.post("/employees", payload, {
            onSuccess: () => {
                setIsAddDialogOpen(false);
                resetForm();
                toast({
                    title: "Success",
                    description: "Employee added successfully",
                });
            },
            onError: (errors: any) => {
                toast({
                    title: "Error",
                    description:
                        (Object.values(errors)[0] as string) ||
                        "Failed to add employee",
                    variant: "destructive",
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const openEditDialog = (employee: Employee) => {
        setSelectedEmployee(employee);
        setFormData({
            designationId: employee.designationId,
            designation: employee.designation,
            name: employee.name,
            email: employee.email,
            password: "",
            phone: employee.phone,
            nationalId: employee.nationalId,
            bloodGroup: employee.bloodGroup,
            territory: employee.territory,
            district: employee.district,
            image: employee.image || "",
            userRole: employee.userRole,
            loginAllowed: employee.loginAllowed,
            status: employee.status,
            employeeId: employee.employeeId,
            creditLimit: employee.creditLimit,
        });
        setIsEditDialogOpen(true);
    };

    const handleEdit = async () => {
        if (!selectedEmployee) return;

        if (
            !formData.designationId ||
            !formData.name ||
            !formData.email ||
            !formData.userRole ||
            !formData.employeeId
        ) {
            toast({
                title: "Error",
                description:
                    "Please fill in all required fields (Designation, Name, Email, Role, Employee ID)",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const role = roles.find((r) => r.name === formData.userRole);
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password || undefined,
            designationId: parseInt(formData.designationId),
            roleId: role ? role.id : null,
            phone: formData.phone,
            nationalId: formData.nationalId,
            bloodGroup: formData.bloodGroup,
            territory: formData.territory,
            district: formData.district,
            status: formData.status.toLowerCase(),
            loginAllowed: formData.loginAllowed,
            image: formData.image || null,
            employeeId: formData.employeeId || null,
            creditLimit: formData.creditLimit || null,
        };

        router.put(`/employees/${selectedEmployee.id}`, payload, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedEmployee(null);
                toast({
                    title: "Success",
                    description: "Employee updated successfully",
                });
            },
            onError: (errors: any) => {
                toast({
                    title: "Error",
                    description:
                        (Object.values(errors)[0] as string) ||
                        "Failed to update employee",
                    variant: "destructive",
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const openDeleteDialog = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedEmployee) return;

        setIsLoading(true);
        router.delete(`/employees/${selectedEmployee.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedEmployee(null);
                toast({
                    title: "Success",
                    description: "Employee deleted successfully",
                });
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to delete employee",
                    variant: "destructive",
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const openAssignSupervisorDialog = (employee: Employee) => {
        setSelectedEmployee(employee);
        setSelectedSupervisorId(employee.supervisorId);
        setIsAssignSupervisorDialogOpen(true);
    };

    const handleAssignSupervisor = async () => {
        if (!selectedEmployee) return;

        setIsLoading(true);
        const payload = {
            supervisorId: selectedSupervisorId || null,
        };

        router.post(
            `/employees/${selectedEmployee.id}/assign-supervisor`,
            payload,
            {
                onSuccess: () => {
                    setIsAssignSupervisorDialogOpen(false);
                    setSelectedEmployee(null);
                    setSelectedSupervisorId(undefined);
                    toast({
                        title: "Success",
                        description: "Supervisor assigned successfully",
                    });
                },
                onError: (errors: any) => {
                    toast({
                        title: "Error",
                        description:
                            (Object.values(errors)[0] as string) ||
                            "Failed to assign supervisor",
                        variant: "destructive",
                    });
                },
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const getSupervisorName = (supervisorId?: number) => {
        if (!supervisorId) return "No supervisor";
        const supervisor = employees.find((emp) => emp.id === supervisorId);
        return supervisor?.name || "Unknown";
    };

    // Get eligible supervisors based on role hierarchy
    const getEligibleSupervisors = (employeeRole: string) => {
        const roleHierarchy: { [key: string]: string[] } = {
            officer: ["manager", "rsm", "admin", "super-admin"],
            manager: ["rsm", "admin", "super-admin"],
            rsm: ["admin", "super-admin"],
            admin: ["super-admin"],
        };

        const eligibleRoles = roleHierarchy[employeeRole] || [];

        if (eligibleRoles.length === 0) {
            return employees.filter(
                (emp) =>
                    emp.id !== selectedEmployee?.id &&
                    emp.userRole !== employeeRole,
            );
        }

        return employees.filter(
            (emp) =>
                emp.id !== selectedEmployee?.id &&
                eligibleRoles.includes(emp.userRole),
        );
    };
    return (
        <DashboardLayout>
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            Employees
                        </h1>
                        <p className="text-sm text-muted-foreground md:text-base">
                            Manage your sales team and their roles
                        </p>
                    </div>
                    {user?.permissions?.includes("employee.create") && (
                        <Button
                            className="w-full shadow-sm sm:w-auto"
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Employee
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <CardTitle className="text-lg md:text-xl">
                                    Employee List
                                </CardTitle>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search employees..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Select
                                    value={filterDesignation}
                                    onValueChange={handleFilterChange(
                                        setFilterDesignation,
                                    )}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Designations" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Designations
                                        </SelectItem>
                                        {designations.map((desig) => (
                                            <SelectItem
                                                key={desig.id}
                                                value={desig.id.toString()}
                                            >
                                                {desig.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filterUserRole}
                                    onValueChange={handleFilterChange(
                                        setFilterUserRole,
                                    )}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All User Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All User Roles
                                        </SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.name}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filterStatus}
                                    onValueChange={handleFilterChange(
                                        setFilterStatus,
                                    )}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Statuses
                                        </SelectItem>
                                        <SelectItem value="Active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="Inactive">
                                            Inactive
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile Card View */}
                        <div className="md:hidden">
                            {filteredEmployees.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">
                                    No employees found
                                </p>
                            ) : (
                                paginatedEmployees.map((employee) => (
                                    <EmployeeCard
                                        key={employee.id}
                                        employee={employee as any}
                                        onView={(id) =>
                                            router.visit(`/employees/${id}`)
                                        }
                                        onEdit={openEditDialog as any}
                                        onDelete={openDeleteDialog as any}
                                        onAssignSupervisor={
                                            openAssignSupervisorDialog as any
                                        }
                                    />
                                ))
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-hidden">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background z-10 block">
                                            <TableRow className="flex w-full">
                                                <TableHead className="flex-1 bg-background flex items-center">
                                                    Name
                                                </TableHead>
                                                <TableHead className="w-24 bg-background flex items-center">
                                                    Emp ID
                                                </TableHead>
                                                <TableHead className="flex-1 bg-background flex items-center">
                                                    Designation
                                                </TableHead>
                                                <TableHead className="flex-1 bg-background flex items-center">
                                                    Email
                                                </TableHead>
                                                <TableHead className="flex-1 bg-background flex items-center">
                                                    Phone
                                                </TableHead>
                                                <TableHead className="w-24 bg-background flex items-center">
                                                    Credit
                                                </TableHead>
                                                <TableHead className="w-28 bg-background flex items-center">
                                                    User Role
                                                </TableHead>
                                                <TableHead className="w-28 bg-background flex items-center">
                                                    Login
                                                </TableHead>
                                                <TableHead className="w-24 bg-background flex items-center">
                                                    Status
                                                </TableHead>
                                                <TableHead className="w-40 text-right bg-background flex items-center justify-end">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="block max-h-[500px] overflow-y-auto">
                                            {filteredEmployees.length === 0 ? (
                                                <TableRow className="flex w-full">
                                                    <TableCell
                                                        colSpan={10}
                                                        className="flex-1 text-center py-8 text-muted-foreground"
                                                    >
                                                        No employees found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedEmployees.map(
                                                    (employee) => (
                                                        <TableRow
                                                            key={employee.id}
                                                            className="flex w-full"
                                                        >
                                                            <TableCell className="flex-1 font-medium">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar>
                                                                        <AvatarImage
                                                                            src={getStorageUrl(
                                                                                employee.image,
                                                                            )}
                                                                            alt={
                                                                                employee.name
                                                                            }
                                                                        />
                                                                        <AvatarFallback>
                                                                            {employee.name
                                                                                .split(
                                                                                    " ",
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        n,
                                                                                    ) =>
                                                                                        n[0],
                                                                                )
                                                                                .join(
                                                                                    "",
                                                                                )
                                                                                .toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="truncate">
                                                                        {
                                                                            employee.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="w-24 truncate">
                                                                {
                                                                    employee.employeeId
                                                                }
                                                            </TableCell>
                                                            <TableCell className="flex-1 truncate">
                                                                {
                                                                    employee.designation
                                                                }
                                                            </TableCell>
                                                            <TableCell className="flex-1 truncate">
                                                                {employee.email}
                                                            </TableCell>
                                                            <TableCell className="flex-1 truncate">
                                                                {employee.phone}
                                                            </TableCell>
                                                            <TableCell className="w-24 truncate">
                                                                {
                                                                    employee.creditLimit
                                                                }
                                                            </TableCell>
                                                            <TableCell className="w-28">
                                                                <Badge variant="outline">
                                                                    {
                                                                        employee.userRole
                                                                    }
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="w-28">
                                                                <Badge
                                                                    variant={
                                                                        employee.loginAllowed
                                                                            ? "default"
                                                                            : "secondary"
                                                                    }
                                                                >
                                                                    {employee.loginAllowed
                                                                        ? "Yes"
                                                                        : "No"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="w-24">
                                                                <Badge
                                                                    variant={
                                                                        employee.status ===
                                                                        "Active"
                                                                            ? "default"
                                                                            : "secondary"
                                                                    }
                                                                >
                                                                    {
                                                                        employee.status
                                                                    }
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="w-40 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() =>
                                                                            router.visit(
                                                                                `/employees/${employee.id}`,
                                                                            )
                                                                        }
                                                                        aria-label="View employee"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                    {[
                                                                        "manager",
                                                                        "officer",
                                                                    ].includes(
                                                                        employee.userRole,
                                                                    ) && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                openAssignSupervisorDialog(
                                                                                    employee,
                                                                                )
                                                                            }
                                                                            aria-label="Assign supervisor"
                                                                        >
                                                                            <UserPlus className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                    {user?.permissions?.includes(
                                                                        "employee.update",
                                                                    ) && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                openEditDialog(
                                                                                    employee,
                                                                                )
                                                                            }
                                                                            aria-label="Edit employee"
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                    {user?.permissions?.includes(
                                                                        "employee.delete",
                                                                    ) && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                openDeleteDialog(
                                                                                    employee,
                                                                                )
                                                                            }
                                                                            aria-label="Delete employee"
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
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
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
                                        {filteredEmployees.length === 0
                                            ? "No results"
                                            : `${startIndex + 1}-${Math.min(endIndex, filteredEmployees.length)} of ${filteredEmployees.length}`}
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
            </div>

            {/* Add Employee Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>
                            Enter the employee details below
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid gap-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Select
                                value={formData.designationId}
                                onValueChange={(value: string) => {
                                    const desig = designations.find(
                                        (d) => d.id.toString() === value,
                                    );
                                    setFormData({
                                        ...formData,
                                        designationId: value,
                                        designation: desig?.name || "",
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select designation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {designations.map((desig) => (
                                        <SelectItem
                                            key={desig.id}
                                            value={desig.id.toString()}
                                        >
                                            {desig.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Enter employee name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="Enter email address"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                placeholder="Enter password"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="nationalId">National ID</Label>
                            <Input
                                id="nationalId"
                                value={formData.nationalId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        nationalId: e.target.value,
                                    })
                                }
                                placeholder="Enter national ID"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input
                                id="employeeId"
                                value={formData.employeeId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        employeeId: e.target.value,
                                    })
                                }
                                placeholder="Enter employee ID"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="creditLimit">Credit Limit</Label>
                            <Input
                                id="creditLimit"
                                type="number"
                                value={formData.creditLimit}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        creditLimit: e.target.value,
                                    })
                                }
                                placeholder="Enter credit limit"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bloodGroup">Blood Group</Label>
                            <Select
                                value={formData.bloodGroup}
                                onValueChange={(value: string) =>
                                    setFormData({
                                        ...formData,
                                        bloodGroup: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="territory">Territory</Label>
                            <Input
                                id="territory"
                                value={formData.territory}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        territory: e.target.value,
                                    })
                                }
                                placeholder="Enter territory"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="district">District</Label>
                            <Input
                                id="district"
                                value={formData.district}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        district: e.target.value,
                                    })
                                }
                                placeholder="Enter district"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="image">Profile Image</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({
                                                ...formData,
                                                image: reader.result as string,
                                            });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="userRole">User Role</Label>
                            <Select
                                value={formData.userRole}
                                onValueChange={(value: string) =>
                                    setFormData({
                                        ...formData,
                                        userRole: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem
                                            key={role.id}
                                            value={role.name}
                                        >
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="loginAllowed">
                                    Login Allowed
                                </Label>
                                <Switch
                                    id="loginAllowed"
                                    checked={formData.loginAllowed}
                                    onCheckedChange={(checked: boolean) =>
                                        setFormData({
                                            ...formData,
                                            loginAllowed: checked,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: string) =>
                                    setFormData({ ...formData, status: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="Inactive">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            className="w-full sm:w-auto"
                        >
                            Add Employee
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Employee Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>
                            Update the employee details below
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-designation">
                                Designation
                            </Label>
                            <Select
                                value={formData.designationId}
                                onValueChange={(value: string) => {
                                    const desig = designations.find(
                                        (d) => d.id.toString() === value,
                                    );
                                    setFormData({
                                        ...formData,
                                        designationId: value,
                                        designation: desig?.name || "",
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select designation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {designations.map((desig) => (
                                        <SelectItem
                                            key={desig.id}
                                            value={desig.id.toString()}
                                        >
                                            {desig.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Enter employee name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="Enter email address"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-password">Password</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                placeholder="Enter password"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input
                                id="edit-phone"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-nationalId">National ID</Label>
                            <Input
                                id="edit-nationalId"
                                value={formData.nationalId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        nationalId: e.target.value,
                                    })
                                }
                                placeholder="Enter national ID"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-employeeId">Employee ID</Label>
                            <Input
                                id="edit-employeeId"
                                value={formData.employeeId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        employeeId: e.target.value,
                                    })
                                }
                                placeholder="Enter employee ID"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-creditLimit">
                                Credit Limit
                            </Label>
                            <Input
                                id="edit-creditLimit"
                                type="number"
                                value={formData.creditLimit}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        creditLimit: e.target.value,
                                    })
                                }
                                placeholder="Enter credit limit"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-bloodGroup">Blood Group</Label>
                            <Select
                                value={formData.bloodGroup}
                                onValueChange={(value: string) =>
                                    setFormData({
                                        ...formData,
                                        bloodGroup: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-territory">Territory</Label>
                            <Input
                                id="edit-territory"
                                value={formData.territory}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        territory: e.target.value,
                                    })
                                }
                                placeholder="Enter territory"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-district">District</Label>
                            <Input
                                id="edit-district"
                                value={formData.district}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        district: e.target.value,
                                    })
                                }
                                placeholder="Enter district"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-image">Profile Image</Label>
                            <Input
                                id="edit-image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({
                                                ...formData,
                                                image: reader.result as string,
                                            });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-userRole">User Role</Label>
                            <Select
                                value={formData.userRole}
                                onValueChange={(value: string) =>
                                    setFormData({
                                        ...formData,
                                        userRole: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem
                                            key={role.id}
                                            value={role.name}
                                        >
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="edit-loginAllowed">
                                    Login Allowed
                                </Label>
                                <Switch
                                    id="edit-loginAllowed"
                                    checked={formData.loginAllowed}
                                    onCheckedChange={(checked: boolean) =>
                                        setFormData({
                                            ...formData,
                                            loginAllowed: checked,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: string) =>
                                    setFormData({ ...formData, status: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="Inactive">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEdit}
                            className="w-full sm:w-auto"
                        >
                            Update Employee
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete{" "}
                            {selectedEmployee?.name}. This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="w-full sm:w-auto"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Assign Supervisor Dialog */}
            <Dialog
                open={isAssignSupervisorDialogOpen}
                onOpenChange={setIsAssignSupervisorDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Assign Supervisor</DialogTitle>
                        <DialogDescription>
                            Select a supervisor for {selectedEmployee?.name}.
                            The system will prevent self-assignment and circular
                            reporting structures.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="supervisor">Supervisor</Label>
                            <Select
                                value={
                                    selectedSupervisorId?.toString() || "none"
                                }
                                onValueChange={(value: string) =>
                                    setSelectedSupervisorId(
                                        value === "none"
                                            ? undefined
                                            : parseInt(value),
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select supervisor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        No supervisor
                                    </SelectItem>
                                    {getEligibleSupervisors(
                                        selectedEmployee?.userRole || "",
                                    ).map((emp) => (
                                        <SelectItem
                                            key={emp.id}
                                            value={emp.id.toString()}
                                        >
                                            {emp.name} - {emp.designation} (
                                            {emp.userRole})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedEmployee && (
                                <p className="text-xs text-muted-foreground">
                                    Showing eligible supervisors for{" "}
                                    {selectedEmployee.userRole} role
                                </p>
                            )}
                            {selectedEmployee?.supervisorId && (
                                <p className="text-sm text-muted-foreground">
                                    Current supervisor:{" "}
                                    {getSupervisorName(
                                        selectedEmployee.supervisorId,
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setIsAssignSupervisorDialogOpen(false)
                            }
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignSupervisor}
                            className="w-full sm:w-auto"
                        >
                            Assign Supervisor
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default Employees;
