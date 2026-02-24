import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Mail, Phone, MapPin, User, Building2, CreditCard, DollarSign, Calendar, TrendingUp, X, Upload } from "lucide-react";
import { router } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL, getStorageUrl } from "@/lib/config";

// Reuse the interface from Customers.tsx or lib
interface Customer {
  id: number;
  name: string;
  proprietorName: string;
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  address: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  employeeId: number | null;
  employeeName: string;
  status: "active" | "inactive";
  joinDate: string;
  image?: string;
  settings: any;
  totalOrders: number;
  totalSpent: number;
  outstandingBalance: number;
  creditLimit?: number;
}

const CustomerView = ({ id, customer: initialCustomer, employees: initialEmployees }: { id: string, customer: Customer, employees: any[] }) => {
  const { toast } = useToast();

  const [customer, setCustomer] = useState<Customer | undefined>(initialCustomer);
  const [employees, setEmployees] = useState<any[]>(initialEmployees || []);
  const [isLoading, setIsLoading] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Sync with props
  useEffect(() => {
    setCustomer(initialCustomer);
  }, [initialCustomer]);

  useEffect(() => {
    setEmployees(initialEmployees || []);
  }, [initialEmployees]);

  // Form state parameters
  const [formData, setFormData] = useState({
    name: "",
    proprietorName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    employeeId: "",
    status: "active" as "active" | "inactive",
    creditLimit: "",
  });


  const handleEditOpen = () => {
    if (!customer) return;
    setFormData({
      name: customer.name,
      proprietorName: customer.proprietorName,
      phone: customer.contact.phone,
      email: customer.contact.email,
      address: customer.address.street,
      city: customer.address.city,
      state: customer.address.state || "",
      zipCode: customer.address.zipCode || "",
      country: customer.address.country,
      employeeId: customer.employeeId?.toString() || "",
      status: customer.status,
      creditLimit: customer.creditLimit?.toString() || "0",
    });
    setImagePreview(customer.image || null);
    setIsEditOpen(true);
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
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
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!customer) return;

    if (!formData.name || !formData.proprietorName || !formData.phone || !formData.address || !formData.employeeId) {
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
      address_country: formData.country,
      employee_id: parseInt(formData.employeeId),
      status: formData.status,
      credit_limit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
    };

    if (imagePreview && imagePreview.startsWith('data:')) {
      payload.image = imagePreview;
    }

    router.put(`/customers/${customer.id}`, payload, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Customer profile updated",
        });
        setIsEditOpen(false);
      },
      onError: (errors: any) => {
        toast({
          title: "Error",
          description: Object.values(errors)[0] as string || "Failed to update profile",
          variant: "destructive",
        });
      },
      onFinish: () => setIsLoading(false)
    });
  };

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading customer details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Customer not found</h2>
          <Button onClick={() => router.visit("/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.visit("/customers")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Customer Details</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                View detailed customer information
              </p>
            </div>
          </div>
          <Button onClick={handleEditOpen}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Customer
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Summary Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                {customer.image ? (
                  <img
                    src={getStorageUrl(customer.image)}
                    alt={customer.name}
                    className="h-32 w-32 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Building2 className="h-16 w-16 text-muted-foreground opacity-50" />
                  </div>
                )}
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <p className="text-muted-foreground">{customer.proprietorName}</p>
                <Badge
                  variant={customer.status === "active" ? "default" : "secondary"}
                  className="mt-3 uppercase tracking-wider text-[10px]"
                >
                  {customer.status}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" /> Employee
                  </span>
                  <span className="font-medium">{customer.employeeName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Joined
                  </span>
                  <span className="font-medium">{customer.joinDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <div className="md:col-span-2 space-y-6">

            {/* Contact & Address */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Phone Number</p>
                        <p className="text-sm text-muted-foreground">{customer.contact.phone}</p>
                        {customer.contact.whatsapp && (
                          <p className="text-xs text-green-600 mt-1">WhatsApp: {customer.contact.whatsapp}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email Address</p>
                        <p className="text-sm text-muted-foreground">{customer.contact.email || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Primary Address</p>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          <p>{customer.address.street}</p>
                          <p>{customer.address.city}, {customer.address.state} {customer.address.zipCode}</p>
                          <p>{customer.address.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview & Settings */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Financial Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-medium">Total Spent</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(customer.totalSpent)}</span>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-medium">Outstanding Balance</span>
                    <span className="text-lg font-bold text-destructive">{formatCurrency(customer.outstandingBalance)}</span>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-medium">Total Orders</span>
                    <span className="text-lg font-bold">{customer.totalOrders}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground">Credit Limit</span>
                    <span className="font-medium">{formatCurrency(customer.creditLimit || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground">Max Credit Days</span>
                    <span className="font-medium">{customer.settings?.maxCreditDays || 0} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground">Discount Tier</span>
                    <Badge variant="outline" className="uppercase">{customer.settings?.discountTier || "none"}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-1">
                    <span className="text-muted-foreground">Preferred Payment</span>
                    <span className="font-medium capitalize">{customer.settings?.preferredPaymentMethod?.replace('_', ' ') || "Cash"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>
                Update customer profile and contact information
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
                    {employees.map((employee: any) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.user.name}
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
                        src={imagePreview.startsWith('data:') ? imagePreview : getStorageUrl(imagePreview)}
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
              <Button variant="outline" onClick={handleEditClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CustomerView;
