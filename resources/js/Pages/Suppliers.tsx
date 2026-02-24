import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, Upload, X, Eye, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
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
import { SupplierCard } from "@/components/suppliers/SupplierCard";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL, getStorageUrl } from "@/lib/config";

interface Supplier {
  id: number;
  companyName: string;
  proprietorName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  country: string;
  image?: string;
  status: "active" | "inactive";
}

interface SuppliersProps {
  initialSuppliers: {
    data: any[];
    links: any[];
    meta: any;
  };
  filters: {
    search?: string;
    per_page?: string | number;
  };
}

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France",
  "China", "Japan", "India", "Australia", "Brazil", "Mexico", "Spain",
  "Italy", "South Korea", "Netherlands", "Singapore", "UAE", "Saudi Arabia"
];

const Suppliers = ({ initialSuppliers, filters }: SuppliersProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    if (initialSuppliers?.data) {
        setSuppliers(
            initialSuppliers.data.map((item: any) => ({
                id: item.id,
                companyName: item.companyName,
                proprietorName: item.proprietorName,
                phone: item.phone,
                whatsapp: item.whatsapp || "",
                email: item.email || "",
                address: item.address,
                country: item.country,
                image: item.image,
                status: item.status
            }))
        );
    }
  }, [initialSuppliers]);

  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    company_name: "",
    proprietor_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    country: "",
    status: "active" as "active" | "inactive",
    image: null as string | null,
  });

  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteSupplierId, setDeleteSupplierId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== (filters.search || "")) {
        router.get(
          '/suppliers',
          { search: searchTerm, per_page: filters.per_page },
          { preserveState: true, replace: true }
        );
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Scroll to top detection
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentMeta = initialSuppliers.meta;
  const paginationLinks = initialSuppliers.links;

  const handleItemsPerPageChange = (value: string) => {
    router.get('/suppliers', { search: searchTerm, per_page: value }, { preserveState: true });
  };

  const handlePageChange = (url: string | null) => {
    if (url) {
        router.get(url, {}, { preserveState: true });
    }
  };

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setData({
        company_name: supplier.companyName,
        proprietor_name: supplier.proprietorName,
        phone: supplier.phone,
        whatsapp: supplier.whatsapp,
        email: supplier.email,
        address: supplier.address,
        country: supplier.country,
        status: supplier.status,
        image: null,
      });
      setImagePreview(supplier.image ? getStorageUrl(supplier.image) : null as string | null);
    } else {
      setEditingSupplier(null);
      reset();
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null);
    reset();
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setData('image', base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setData('image', null);
    setImagePreview(null);
  };

  const handleSubmit = () => {
    if (editingSupplier) {
      put(`/suppliers/${editingSupplier.id}`, {
        onSuccess: () => {
          handleCloseDialog();
          toast({ title: "Success", description: "Supplier updated successfully" });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update supplier", variant: "destructive" });
        }
      });
    } else {
      post('/suppliers', {
        onSuccess: () => {
          handleCloseDialog();
          toast({ title: "Success", description: "Supplier created successfully" });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create supplier", variant: "destructive" });
        }
      });
    }
  };

  const handleDelete = () => {
    if (deleteSupplierId) {
        destroy(`/suppliers/${deleteSupplierId}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setDeleteSupplierId(null);
                toast({ title: "Success", description: "Supplier deleted successfully" });
            },
            onError: () => {
                toast({ title: "Error", description: "Failed to delete supplier", variant: "destructive" });
            }
        });
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeleteSupplierId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Suppliers</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage your supplier network</p>
          </div>
          {user?.permissions?.includes('supplier.create') && (
            <Button className="w-full sm:w-auto" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg md:text-xl">Supplier List</CardTitle>
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
            {/* Mobile Card View */}
            <div className="md:hidden">
              {suppliers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No suppliers found</p>
              ) : (
                suppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    onView={(id) => router.visit(`/suppliers/${id}`)}
                    onEdit={handleOpenDialog}
                    onDelete={openDeleteDialog}
                  />
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Proprietor</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No suppliers found
                          </TableCell>
                        </TableRow>
                      ) : (
                        suppliers.map((supplier) => (
                          <TableRow key={supplier.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {supplier.image && (
                                  <img
                                    src={getStorageUrl(supplier.image)}
                                    alt={supplier.companyName}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                )}
                                <span className="font-medium">{supplier.companyName}</span>
                              </div>
                            </TableCell>
                            <TableCell>{supplier.proprietorName}</TableCell>
                            <TableCell>{supplier.phone}</TableCell>
                            <TableCell>{supplier.email}</TableCell>
                            <TableCell>{supplier.country}</TableCell>
                            <TableCell>
                              <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
                                {supplier.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.visit(`/suppliers/${supplier.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {user?.permissions?.includes('supplier.update') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDialog(supplier)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {user?.permissions?.includes('supplier.delete') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteDialog(supplier.id)}
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
            </div>

            {/* Pagination */}
            <div className="sticky bottom-0 bg-background border-t mt-4 pt-4 pb-2 z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="text-xs sm:text-sm text-muted-foreground">Rows per page:</span>
                  <Select value={currentMeta.per_page.toString()} onValueChange={handleItemsPerPageChange}>
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
                    {currentMeta.total === 0
                      ? "No results"
                      : `${currentMeta.from}-${currentMeta.to} of ${currentMeta.total}`}
                  </span>
                  <div className="flex items-center gap-1">
                    {paginationLinks.map((link, idx) => {
                        const isPrev = idx === 0;
                        const isNext = idx === paginationLinks.length - 1;
                        const isActive = link.active;
                        const label = link.label
                            .replace('&laquo; Previous', '')
                            .replace('Next &raquo;', '');

                        if (isPrev) {
                            return (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handlePageChange(link.url)}
                                    disabled={!link.url}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            );
                        }

                        if (isNext) {
                            return (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handlePageChange(link.url)}
                                    disabled={!link.url}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            );
                        }

                        if (link.label === '...') {
                            return <span key={idx} className="px-2">...</span>;
                        }

                        return (
                            <Button
                                key={idx}
                                variant={isActive ? "default" : "outline"}
                                size="icon"
                                className="h-8 w-8 text-xs"
                                onClick={() => handlePageChange(link.url)}
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

        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
              <DialogDescription>
                {editingSupplier ? "Update supplier information" : "Enter supplier details"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={data.company_name}
                  onChange={(e) => setData('company_name', e.target.value)}
                  placeholder="Enter company name"
                />
                {errors.company_name && <p className="text-sm text-red-500">{errors.company_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="proprietor_name">Proprietor Name *</Label>
                <Input
                  id="proprietor_name"
                  value={data.proprietor_name}
                  onChange={(e) => setData('proprietor_name', e.target.value)}
                  placeholder="Enter proprietor name"
                />
                {errors.proprietor_name && <p className="text-sm text-red-500">{errors.proprietor_name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={data.whatsapp}
                    onChange={(e) => setData('whatsapp', e.target.value)}
                    placeholder="Enter WhatsApp number"
                  />
                  {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={data.country}
                    onValueChange={(value: string) => setData('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={data.status}
                    onValueChange={(value: "active" | "inactive") => setData('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Company Image</Label>
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
              <Button onClick={handleSubmit} disabled={processing}>
                {processing ? "Saving..." : (editingSupplier ? "Update" : "Create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the supplier.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
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

export default Suppliers;
