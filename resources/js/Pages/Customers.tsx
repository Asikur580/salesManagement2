import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, Upload, X, Eye, Download, CheckSquare, Square, FilterX, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { CustomerCard } from "@/components/customers/CustomerCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { API_BASE_URL, getStorageUrl } from "@/lib/config";
import { Customer } from "@/lib/customerData";

interface CustomersProps {
  initialCustomers: any[];
  initialEmployees: any[];
  filters: any;
}

const Customers = ({ initialCustomers, initialEmployees, filters }: CustomersProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>(initialCustomers || []);
  const [employees, setEmployees] = useState<any[]>(initialEmployees || []);
  const [allEmployees, setAllEmployees] = useState<any[]>(initialEmployees || []); // Full list for nested filtering
  const [subEmployees, setSubEmployees] = useState<any[]>([]); // Current level subordinates
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState(filters?.employee_id || "all");
  const [selectedSubEmployee, setSelectedSubEmployee] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync state with props
  useEffect(() => {
    setCustomers(initialCustomers || []);
    setEmployees(initialEmployees || []);
    setAllEmployees(initialEmployees || []);
  }, [initialCustomers, initialEmployees]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: "",
    proprietorName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    employeeId: "",
    status: "active" as "active" | "inactive" | "blocked",
    creditLimit: "",
    image: null as File | null,
  });

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        proprietorName: customer.proprietorName,
        phone: customer.contact.phone,
        email: customer.contact.email,
        address: customer.address.street,
        city: customer.address.city,
        state: customer.address.state || "",
        zipCode: customer.address.zipCode || "",
        employeeId: customer.employeeId?.toString() || "",
        status: customer.status,
        creditLimit: customer.creditLimit?.toString() || "0",
        image: null,
      });
      setImagePreview(customer.image || null);
    } else {
      setEditingCustomer(null);
      setFormData({
        name: "",
        proprietorName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        employeeId: user?.employee_detail?.id?.toString() || "",
        status: "active",
        creditLimit: "",
        image: null,
      });
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    setFormData({
      name: "",
      proprietorName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      employeeId: "",
      status: "active",
      creditLimit: "",
      image: null,
    });
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.proprietorName || !formData.phone || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const payload: any = {
      name: formData.name,
      proprietor_name: formData.proprietorName,
      phone: formData.phone,
      email: formData.email,
      address_street: formData.address,
      address_city: formData.city,
      address_state: formData.state,
      address_zip_code: formData.zipCode,
      employee_id: formData.employeeId ? parseInt(formData.employeeId) : null,
      status: formData.status,
      credit_limit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
    };

    if (imagePreview && imagePreview.startsWith('data:')) {
      payload.image = imagePreview;
    }

    if (editingCustomer) {
      router.put(`/customers/${editingCustomer.id}`, payload, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Customer updated successfully",
          });
          handleCloseDialog();
        },
        onError: (errors: any) => {
          toast({
            title: "Error",
            description: Object.values(errors)[0] as string || "Failed to update customer",
            variant: "destructive"
          });
        },
        onFinish: () => setIsLoading(false)
      });
    } else {
      router.post('/customers', payload, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Customer created successfully",
          });
          handleCloseDialog();
        },
        onError: (errors: any) => {
          toast({
            title: "Error",
            description: Object.values(errors)[0] as string || "Failed to create customer",
            variant: "destructive"
          });
        },
        onFinish: () => setIsLoading(false)
      });
    }
  };

  const handleDelete = async () => {
    if (deleteCustomerId) {
      setIsLoading(true);
      router.delete(`/customers/${deleteCustomerId}`, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Customer deleted successfully",
          });
          setIsDeleteDialogOpen(false);
          setDeleteCustomerId(null);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete customer",
            variant: "destructive"
          });
        },
        onFinish: () => setIsLoading(false)
      });
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeleteCustomerId(id);
    setIsDeleteDialogOpen(true);
  };

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      customer.name.toLowerCase().includes(search) ||
      customer.proprietorName.toLowerCase().includes(search) ||
      customer.employeeName.toLowerCase().includes(search);
    
    // Prioritize sub-employee filter if active
    const effectiveEmployeeId = selectedSubEmployee !== "all" ? selectedSubEmployee : selectedEmployee;
    const matchesEmployee = effectiveEmployeeId === "all" || customer.employeeId?.toString() === effectiveEmployeeId;
    
    return matchesSearch && matchesEmployee;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    router.get('/customers', { search: value, employee_id: selectedEmployee }, { preserveState: true, replace: true });
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleEmployeeFilterChange = (value: string) => {
    setSelectedEmployee(value);
    setSelectedSubEmployee("all");
    setCurrentPage(1);
    
    router.get('/customers', { search: searchTerm, employee_id: value }, { preserveState: true, replace: true });

    if (value === "all") {
      setSubEmployees([]);
    } else {
      // Find subordinates for the selected employee
      const subs = allEmployees.filter(emp => emp.parent_id === parseInt(value));
      setSubEmployees(subs);
    }
  };

  const handleSubEmployeeFilterChange = (value: string) => {
    setSelectedSubEmployee(value);
    setCurrentPage(1);
    
    // Send the correct ID to the backend: the sub-employee if selected, else the main employee
    const filterId = value === "all" ? selectedEmployee : value;
    router.get('/customers', { search: searchTerm, employee_id: filterId }, { preserveState: true, replace: true });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCustomers.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedEmployee("all");
    setSelectedSubEmployee("all");
    setSubEmployees([]);
    setCurrentPage(1);
    
    // Refresh backend data by clearing query parameters
    router.get('/customers', {}, { preserveState: true, replace: true });
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds(filteredCustomers.map((c) => c.id));
  };

  const handleUnselectAll = () => {
    setSelectedIds([]);
  };

  const handleExport = () => {
    const dataToExport = selectedIds.length > 0
      ? filteredCustomers.filter((c) => selectedIds.includes(c.id))
      : filteredCustomers;

    if (dataToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "Please select customers or adjust filters",
        variant: "destructive",
      });
      return;
    }

    const headers = ["ID", "Customer Name", "Proprietor", "Phone", "Email", "Address", "City", "Officer", "Status"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map((c) =>
        [
          c.id,
          `"${c.name}"`,
          `"${c.proprietorName}"`,
          `"${c.contact.phone}"`,
          `"${c.contact.email}"`,
          `"${c.address.street.replace(/"/g, '""')}"`,
          `"${c.address.city}"`,
          `"${c.employeeName}"`,
          c.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "Export successful",
      description: `Exported ${dataToExport.length} customer(s)`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage your customer database</p>
          </div>
          {user?.permissions?.includes('customer.create') && (
            <Button className="w-full sm:w-auto" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg md:text-xl">Customer List</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllFiltered}
                    disabled={filteredCustomers.length === 0}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnselectAll}
                    disabled={selectedIds.length === 0}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Unselect All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export {selectedIds.length > 0 ? `(${selectedIds.length})` : "All"}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                {(user?.role?.toLowerCase() !== "officer" && user?.roles?.[0]?.name?.toLowerCase() !== "officer") && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={selectedEmployee} onValueChange={handleEmployeeFilterChange}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.user?.name || employee.name} {employee.designation?.name ? `(${employee.designation.name})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {subEmployees.length > 0 && (
                      <Select value={selectedSubEmployee} onValueChange={handleSubEmployeeFilterChange}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by coordinator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Coordinators</SelectItem>
                          {subEmployees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                              {employee.user?.name || employee.name} {employee.designation?.name ? `(${employee.designation.name})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
                {(searchTerm || selectedEmployee !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="w-full sm:w-auto"
                  >
                    <FilterX className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile Card View */}
            <div className="md:hidden">
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading customers...</p>
              ) : filteredCustomers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No customers found</p>
              ) : (
                paginatedCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    // Casting to match CustomerCard props if strictly typed
                    customer={customer as any}
                    isSelected={selectedIds.includes(customer.id)}
                    onSelect={handleSelectOne}
                    onView={(id) => router.visit(`/customers/${id}`)}
                    onEdit={handleOpenDialog}
                    onDelete={openDeleteDialog}
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
                        <TableHead className="w-12 bg-background flex items-center">
                          <Checkbox
                            checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="flex-1 bg-background flex items-center">Customer Name</TableHead>
                        <TableHead className="flex-1 bg-background flex items-center">Proprietor</TableHead>
                        <TableHead className="flex-1 bg-background flex items-center">Phone</TableHead>
                        <TableHead className="flex-1 bg-background flex items-center">Address</TableHead>
                        <TableHead className="flex-1 bg-background flex items-center">Officer</TableHead>
                        <TableHead className="w-24 bg-background flex items-center">Status</TableHead>
                        <TableHead className="w-32 text-right bg-background flex items-center justify-end">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="block max-h-[500px] overflow-y-auto">
                      {isLoading ? (
                        <TableRow className="flex w-full">
                          <TableCell colSpan={8} className="flex-1 text-center py-8 text-muted-foreground">
                            Loading customers...
                          </TableCell>
                        </TableRow>
                      ) : filteredCustomers.length === 0 ? (
                        <TableRow className="flex w-full">
                          <TableCell colSpan={8} className="flex-1 text-center py-8 text-muted-foreground">
                            No customers found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedCustomers.map((customer) => (
                          <TableRow key={customer.id} className="flex w-full">
                            <TableCell className="w-12 flex items-center">
                              <Checkbox
                                checked={selectedIds.includes(customer.id)}
                                onCheckedChange={(checked: boolean) => handleSelectOne(customer.id, checked)}
                              />
                            </TableCell>
                            <TableCell className="flex-1">
                              <div className="flex items-center gap-3">
                                {customer.image && (
                                  <img
                                    src={getStorageUrl(customer.image)}
                                    alt={customer.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                )}
                                <span className="font-medium truncate">{customer.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="flex-1 truncate">{customer.proprietorName}</TableCell>
                            <TableCell className="flex-1 truncate">{customer.contact.phone}</TableCell>
                            <TableCell className="flex-1 truncate" title={`${customer.address.street}, ${customer.address.city}`}>
                              {customer.address.street}
                            </TableCell>
                            <TableCell className="flex-1 truncate">{customer.employeeName}</TableCell>
                            <TableCell className="w-24">
                              <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                                {customer.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="w-32 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.visit(`/customers/${customer.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {user?.permissions?.includes('customer.update') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDialog(customer)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog(customer.id)}
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
            </div>

            {/* Pagination */}
            <div className="sticky bottom-0 bg-background border-t mt-4 pt-4 pb-2 z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="text-xs sm:text-sm text-muted-foreground">Rows per page:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value: string) => {
                      setItemsPerPage(parseInt(value, 10));
                      setCurrentPage(1);
                    }}>
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
                  <span className="text-sm text-muted-foreground">
                    {filteredCustomers.length === 0
                      ? "No results"
                      : `${startIndex + 1}-${Math.min(endIndex, filteredCustomers.length)} of ${filteredCustomers.length}`}
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
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages || totalPages === 0}
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

        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
              <DialogDescription>
                {editingCustomer ? "Update customer information" : "Enter customer details"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proprietor">Proprietor Name *</Label>
                <Input
                  id="proprietor"
                  value={formData.proprietorName}
                  onChange={(e) => setFormData({ ...formData, proprietorName: e.target.value })}
                  placeholder="Enter proprietor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee">Assigned Employee *</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value: string) => setFormData({ ...formData, employeeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.user?.name || employee.name} {employee.designation?.name ? `(${employee.designation.name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Enter state"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="Enter zip code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  placeholder="Enter credit limit"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter street address"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image">Customer Image</Label>
                <div className="space-y-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-32 rounded-lg object-cover border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Label
                        htmlFor="image"
                        className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingCustomer ? "Update Customer" : "Add Customer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the customer record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
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

export default Customers;
