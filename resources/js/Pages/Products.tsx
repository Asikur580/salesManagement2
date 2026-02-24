import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { router, usePage } from "@inertiajs/react";
import { Plus, Search, Pencil, Trash2, CalendarIcon, PackagePlus, PackageMinus, History, AlertTriangle, Settings, Download, Upload, Printer, Eye, ChevronLeft, ChevronRight, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ProductCard } from "@/components/products/ProductCard";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL, getStorageUrl } from "@/lib/config";

interface Product {
  id: number;
  categoryId: number;
  brandId: number;
  name: string;
  packSize: string | null;
  purchasePrice: number;
  salePrice: number;
  flatPrice: number;
  quantity: number;
  expirationDate: Date | null;
  image: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  company_name: string;
}

interface StockTransaction {
  id: number;
  productId: number;
  type: "in" | "out";
  quantity: number;
  date: Date;
  supplierId?: number;
  buyPrice?: number;
  expireDate?: Date | null;
  whoTake?: string;
  reason?: string;
}

interface ProductsProps {
  initialProducts: any[];
  initialCategories: any[];
  initialBrands: any[];
  initialSuppliers: any[];
  filters: any;
}

const Products = ({ initialProducts, initialCategories, initialBrands, initialSuppliers, filters }: ProductsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>(() => 
    (initialProducts || []).map((p: any) => ({
      ...p,
      expirationDate: p.expirationDate ? new Date(p.expirationDate) : null
    }))
  );
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [brands, setBrands] = useState<Brand[]>(initialBrands || []);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers || []);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]); // For history dialog
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isThresholdDialogOpen, setIsThresholdDialogOpen] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(20);
  const [tempThreshold, setTempThreshold] = useState("20");
  const [isAlertExpanded, setIsAlertExpanded] = useState(true);
  const [historyProductId, setHistoryProductId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [stockProductId, setStockProductId] = useState<number | null>(null);
  const [stockType, setStockType] = useState<"in" | "out">("in");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stockInData, setStockInData] = useState({
    supplierId: "",
    buyPrice: "",
    quantity: "",
    expireDate: null as Date | null,
    stockInDate: new Date(),
    reason: "",
    remarks: ""
  });
  const [stockOutData, setStockOutData] = useState({
    quantity: "",
    whoTake: "", // mapped to 'remarks' or 'reason' based on API needs, but API asked for 'reason' and 'remarks'
    reason: "",
    stockOutDate: new Date(),
    remarks: ""
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split('?')[1] || "");

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

  // Form state
  const [formData, setFormData] = useState({
    categoryId: "",
    brandId: "",
    name: "",
    packSize: "",
    purchasePrice: "",
    salePrice: "",
    flatPrice: "",
    expirationDate: null as Date | null,
    image: "",
  });

  // ... inside Products component

  // Server-side filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter && categoryFilter !== "all") params.category_id = categoryFilter;
      if (brandFilter && brandFilter !== "all") params.brand_id = brandFilter;

      // Only visit if params differ from current props/url (optimization)
      // For now, simpler implementation:
      router.get('/products', params, { preserveState: true, replace: true, preserveScroll: true });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter, brandFilter]);

  /*
  const fetchData = async () => {
      // ... removed
  }
  */

  useEffect(() => {
    if (initialProducts) {
        setProducts(initialProducts.map((p: any) => ({
            ...p,
            expirationDate: p.expirationDate ? new Date(p.expirationDate) : null
        })));
    }
  }, [initialProducts]);

  const reloadData = () => {
      setIsLoading(true);
      router.reload({ only: ['initialProducts'], onSuccess: () => setIsLoading(false) });
  };

  /*
  const filteredProducts = products.filter((product) => {
    // ... removed
  });
  */
  const filteredProducts = products; // Server-side filtered

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const hasActiveFilters = searchTerm || categoryFilter !== "all" || brandFilter !== "all";

  const clearAllFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setBrandFilter("all");
    setCurrentPage(1);
    router.get('/products');
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const getSelectedProductsData = () => {
    return products.filter((p) => selectedProducts.includes(p.id));
  };

  const handleViewPdf = () => {
    if (selectedProducts.length === 0) {
      toast({ title: "Error", description: "Please select at least one product", variant: "destructive" });
      return;
    }
    setIsPdfDialogOpen(true);
  };

  const handlePrintSelectedProducts = () => {
    const productsToPrint = getSelectedProductsData();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Error", description: "Please allow popups to print", variant: "destructive" });
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Product List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #333; padding: 8px 12px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .print-date { text-align: right; margin-bottom: 10px; font-size: 12px; color: #666; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="print-date">Printed on: ${format(new Date(), "MMM dd, yyyy HH:mm")}</div>
        <h1>Product List</h1>
        <table>
          <thead>
            <tr>
              <th>SI No.</th>
              <th>Name</th>
              <th>Expire Date</th>
              <th>Sale Price</th>
            </tr>
          </thead>
          <tbody>
            ${productsToPrint.map((product, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${product.name}</td>
                <td>${product.expirationDate ? format(product.expirationDate, "MMM dd, yyyy") : "-"}</td>
                <td>৳${product.salePrice.toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    setIsPdfDialogOpen(false);
  };

  const getCategoryName = (id: number) => categories.find((c) => c.id === id)?.name || "-";
  const getBrandName = (id: number) => brands.find((b) => b.id === id)?.name || "-";
  const getSupplierName = (id: number) => suppliers.find((s) => s.id === id)?.company_name || "-";
  const getProductName = (id: number) => products.find((p) => p.id === id)?.name || "-";

  const resetForm = () => {
    setFormData({
      categoryId: "",
      brandId: "",
      name: "",
      packSize: "",
      purchasePrice: "",
      salePrice: "",
      flatPrice: "",
      expirationDate: null,
      image: "",
    });
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        categoryId: product.categoryId.toString(),
        brandId: product.brandId.toString(),
        name: product.name,
        packSize: product.packSize || "",
        purchasePrice: product.purchasePrice.toString(),
        salePrice: product.salePrice.toString(),
        flatPrice: product.flatPrice.toString(),
        expirationDate: product.expirationDate,
        image: product.image || "",
      });
    } else {
      setEditingId(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.categoryId || !formData.brandId) {
      toast({ title: "Error", description: "Please fill in required fields (Name, Category, Brand)", variant: "destructive" });
      return;
    }

    const payload = {
        category_id: parseInt(formData.categoryId),
        brand_id: parseInt(formData.brandId),
        name: formData.name.trim(),
        pack_size: formData.packSize.trim(),
        purchase_price: parseFloat(formData.purchasePrice) || 0,
        sale_price: parseFloat(formData.salePrice) || 0,
        flat_price: parseFloat(formData.flatPrice) || 0,
        // For new products, quantity is 0, stock in should be used
        quantity: editingId ? products.find(p => p.id === editingId)?.quantity : 0, 
        expiration_date: formData.expirationDate ? format(formData.expirationDate, "yyyy-MM-dd") : null,
        image: formData.image
    };

    try {
        const url = editingId ? `${API_BASE_URL}/products/${editingId}` : `${API_BASE_URL}/products`;
        const method = editingId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ""
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            toast({ 
                title: "Success", 
                description: editingId ? "Product updated successfully" : "Product added successfully" 
            });
            reloadData(); // Refresh list
            handleCloseDialog();
        } else {
            toast({ title: "Error", description: result.message || "Failed to save product", variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
       try {
           const response = await fetch(`${API_BASE_URL}/products/${deletingId}`, {
               method: 'DELETE',
               headers: {
                   'Accept': 'application/json',
                   'X-Requested-With': 'XMLHttpRequest',
                   'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ""
               },
               credentials: 'include'
           });
           
           if (response.ok) {
               toast({ title: "Success", description: "Product deleted successfully" });
               reloadData();
               setIsDeleteDialogOpen(false);
               setDeletingId(null);
           } else {
               toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
           }
       } catch (error) {
           toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
       }
    }
  };

  const openStockDialog = (productId: number, type: "in" | "out") => {
    setStockProductId(productId);
    setStockType(type);
    if (type === "in") {
      setStockInData({
        supplierId: "",
        buyPrice: "",
        quantity: "",
        expireDate: null,
        stockInDate: new Date(),
        reason: "New Purchase",
        remarks: ""
      });
    } else {
      setStockOutData({
        quantity: "",
        whoTake: "",
        reason: "Sales",
        stockOutDate: new Date(),
        remarks: ""
      });
    }
    setIsStockDialogOpen(true);
  };

  const handleStockUpdate = () => {
    const amount = parseInt(stockType === "in" ? stockInData.quantity : stockOutData.quantity);
    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid quantity", variant: "destructive" });
      return;
    }

    if (stockType === "in" && !stockInData.reason.trim()) {
      toast({ title: "Error", description: "Please enter a reason", variant: "destructive" });
      return;
    }

    if (stockType === "out" && !stockOutData.reason.trim()) {
      toast({ title: "Error", description: "Please enter a reason", variant: "destructive" });
      return;
    }

    const route = stockType === "in" ? "/stocks/in" : "/stocks/out";

    let payload: any = {
      product_id: stockProductId,
      quantity: amount,
    };

    if (stockType === "in") {
      if (stockInData.supplierId) {
        payload.supplier_id = parseInt(stockInData.supplierId);
      }
      payload.reason = stockInData.reason || "New Purchase";
      payload.date = format(stockInData.stockInDate, "yyyy-MM-dd");
      payload.remarks = stockInData.remarks || "";
    } else {
      payload.reason = stockOutData.reason || "Sales";
      payload.date = format(stockOutData.stockOutDate, "yyyy-MM-dd");
      payload.remarks = stockOutData.whoTake;
    }

    setIsLoading(true);
    router.post(route, payload, {
      onSuccess: () => {
        toast({ title: "Success", description: `Stock ${stockType === "in" ? "added" : "removed"} successfully` });
        setIsStockDialogOpen(false);
        setStockProductId(null);
      },
      onError: (errors: any) => {
        toast({
          title: "Error",
          description: Object.values(errors)[0] as string || "Failed to update stock",
          variant: "destructive",
        });
      },
      onFinish: () => setIsLoading(false),
    });
  };

  const openHistoryDialog = async (productId: number) => {
    setHistoryProductId(productId);
    setIsHistoryDialogOpen(true);
    setTransactions([]);

    try {
      const response = await fetch(`/products/${productId}/stock-history`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        if (Array.isArray(data)) {
          const mappedTransactions: StockTransaction[] = data.map((t: any, index: number) => ({
            id: t.id || index,
            productId: productId,
            type: t.type ? t.type : (t.quantity > 0 ? 'in' : 'out'),
            quantity: Math.abs(t.quantity),
            date: new Date(t.date || t.created_at),
            supplierId: t.supplier_id,
            reason: t.reason,
            whoTake: t.remarks,
          }));
          setTransactions(mappedTransactions);
        }
      } else {
        toast({ title: "Error", description: "Failed to load stock history", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to fetch history");
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const getProductTransactions = () => {
    return transactions; // Now fetched from API
  };

  const lowStockProducts = products.filter((p) => p.quantity <= lowStockThreshold);

  const handleThresholdUpdate = () => {
    const newThreshold = parseInt(tempThreshold);
    if (isNaN(newThreshold) || newThreshold < 0) {
      toast({ title: "Error", description: "Please enter a valid threshold", variant: "destructive" });
      return;
    }
    setLowStockThreshold(newThreshold);
    setIsThresholdDialogOpen(false);
    toast({ title: "Success", description: "Low stock threshold updated" });
  };

  const openThresholdDialog = () => {
    setTempThreshold(lowStockThreshold.toString());
    setIsThresholdDialogOpen(true);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Category", "Brand", "Pack Size", "Purchase Price", "Sale Price", "Flat Price", "Quantity", "Expiration Date"];
    const csvData = products.map((p) => [
      p.id,
      `"${p.name}"`,
      `"${getCategoryName(p.categoryId)}"`,
      `"${getBrandName(p.brandId)}"`,
      `"${p.packSize}"`,
      p.purchasePrice,
      p.salePrice,
      p.flatPrice,
      p.quantity,
      p.expirationDate ? format(p.expirationDate, "yyyy-MM-dd") : "",
    ]);

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `products_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast({ title: "Success", description: "Products exported successfully" });
  };

  const exportSelectedToCSV = () => {
    if (selectedProducts.length === 0) {
      toast({ title: "Error", description: "Please select at least one product", variant: "destructive" });
      return;
    }
    const selectedData = getSelectedProductsData();
    const headers = ["SI No.", "Name", "Expire Date", "Sale Price"];
    const csvData = selectedData.map((p, index) => [
      index + 1,
      `"${p.name}"`,
      p.expirationDate ? format(p.expirationDate, "yyyy-MM-dd") : "",
      p.salePrice,
    ]);

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `selected_products_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast({ title: "Success", description: `${selectedProducts.length} products exported successfully` });
  };

  const importFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Mock import logic preservation, simplified
      toast({ title: "Info", description: "CSV Import not fully wired to API yet" });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout>
       {/* ... (Layout remains largely the same, just utilizing new state/funcs) ... */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage your product catalog</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="icon" onClick={openThresholdDialog} title="Stock Alert Settings">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={exportToCSV} title="Export CSV">
              <Download className="h-4 w-4" />
            </Button>
            {/*
            <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} title="Import CSV">
              <Upload className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={importFromCSV}
              className="hidden"
            />
            */}
            {user?.permissions?.includes('product.create') && (
            <Button className="w-full sm:w-auto" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Collapsible open={isAlertExpanded} onOpenChange={setIsAlertExpanded}>
            <Card className="border-destructive/50 bg-destructive/5">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <CardTitle className="text-base text-destructive">
                        Low Stock Alert ({lowStockProducts.length} items below {lowStockThreshold} units)
                      </CardTitle>
                    </div>
                    {isAlertExpanded ? (
                      <ChevronUp className="h-5 w-5 text-destructive" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {lowStockProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-lg border border-destructive/20 bg-background p-3"
                      >
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{getCategoryName(product.categoryId)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{product.quantity} left</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openStockDialog(product.id, "in")}
                            title="Stock In"
                          >
                            <PackagePlus className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg md:text-xl">Product List</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={categoryFilter} onValueChange={(v: string) => { setCategoryFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={brandFilter} onValueChange={(v: string) => { setBrandFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                )}
                {selectedProducts.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleViewPdf}>
                      <Eye className="mr-2 h-4 w-4" />
                      View & Print ({selectedProducts.length})
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportSelectedToCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Selected
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {isLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading products...</p>
              ) : paginatedProducts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No products found</p>
              ) : (
                paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product as any}
                    categoryName={getCategoryName(product.categoryId)}
                    brandName={getBrandName(product.brandId)}
                    isSelected={selectedProducts.includes(product.id)}
                    onToggleSelect={toggleProductSelection}
                    onEdit={handleOpenDialog}
                    onDelete={openDeleteDialog}
                    onStockIn={(id) => openStockDialog(id, "in")}
                    onStockOut={(id) => openStockDialog(id, "out")}
                    onHistory={openHistoryDialog}
                    lowStockThreshold={lowStockThreshold}
                  />
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <Table className="min-w-[950px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Pack Size</TableHead>
                    <TableHead>Purchase</TableHead>
                    <TableHead>Sale</TableHead>
                    <TableHead>Flat</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     <TableRow>
                        <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                            Loading products...
                        </TableCell>
                     </TableRow>
                  ) : paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {product.image ? (
                          <img 
                            src={product.image.startsWith('data:') ? product.image : getStorageUrl(product.image)} 
                            alt={product.name} 
                            className="h-10 w-10 rounded object-cover" 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            No img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryName(product.categoryId)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getBrandName(product.brandId)}</Badge>
                      </TableCell>
                      <TableCell>{product.packSize || "-"}</TableCell>
                      <TableCell>৳{product.purchasePrice}</TableCell>
                      <TableCell>৳{product.salePrice}</TableCell>
                      <TableCell>৳{product.flatPrice}</TableCell>
                      <TableCell>
                        <Badge variant={product.quantity > 50 ? "default" : product.quantity > 20 ? "secondary" : "destructive"}>
                          {product.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.expirationDate ? format(product.expirationDate, "MMM dd, yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {user?.permissions?.includes('product.update') && (
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        )}
                        {user?.permissions?.includes('product.delete') && (
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(product.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openStockDialog(product.id, "in")} title="Stock In">
                          <PackagePlus className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openStockDialog(product.id, "out")} title="Stock Out">
                          <PackageMinus className="h-4 w-4 text-orange-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openHistoryDialog(product.id)} title="History">
                          <History className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && paginatedProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls ... (kept similar) */}
             {filteredProducts.length > 0 && (
               <div className="sticky bottom-0 bg-background border-t mt-4 pt-4 pb-2 z-10">
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <span>Show</span>
                     <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
                     <span>per page</span>
                   </div>

                   <div className="text-sm text-muted-foreground">
                     Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                   </div>

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
                     <span className="px-3 text-sm">
                       Page {currentPage} of {totalPages}
                     </span>
                     <Button
                       variant="outline"
                       size="icon"
                       className="h-8 w-8"
                       onClick={() => setCurrentPage(currentPage + 1)}
                       disabled={currentPage === totalPages}
                     >
                       <ChevronRight className="h-4 w-4" />
                     </Button>
                     <Button
                       variant="outline"
                       size="icon"
                       className="h-8 w-8"
                       onClick={() => setCurrentPage(totalPages)}
                       disabled={currentPage === totalPages}
                     >
                       <ChevronRight className="h-4 w-4" />
                       <ChevronRight className="h-4 w-4 -ml-2" />
                     </Button>
                   </div>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(v: string) => setFormData({ ...formData, categoryId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Brand *</Label>
                  <Select value={formData.brandId} onValueChange={(v: string) => setFormData({ ...formData, brandId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pack Size</Label>
                  <Input
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    placeholder="e.g., 10 pcs, 1 kg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Price</Label>
                  <Input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sale Price</Label>
                  <Input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Flat Price</Label>
                  <Input
                    type="number"
                    value={formData.flatPrice}
                    onChange={(e) => setFormData({ ...formData, flatPrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.expirationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expirationDate ? format(formData.expirationDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.expirationDate || undefined}
                        onSelect={(date: Date | undefined) => setFormData({ ...formData, expirationDate: date || null })}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <Input type="file" accept="image/*" onChange={handleImageChange} />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="h-20 w-20 rounded object-cover mt-2" />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>{editingId ? "Update" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Stock In/Out Dialog */}
        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{stockType === "in" ? "Stock In" : "Stock Out"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {stockType === "in" ? (
                <>
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Select value={stockInData.supplierId} onValueChange={(v: string) => setStockInData({ ...stockInData, supplierId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       {/* Buy price could also be inputs if API supported it */}
                    </div>
                    <div className="space-y-2 w-full col-span-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        value={stockInData.quantity}
                        onChange={(e) => setStockInData({ ...stockInData, quantity: e.target.value })}
                        placeholder="Enter quantity"
                        min="1"
                      />
                    </div>
                  </div>
                   <div className="space-y-2">
                      <Label>Reason</Label>
                      <Input
                        value={stockInData.reason}
                        onChange={(e) => setStockInData({ ...stockInData, reason: e.target.value })}
                        placeholder="Reason (Optional)"
                      />
                  </div>
                   <div className="space-y-2">
                      <Label>Remarks</Label>
                      <Input
                        value={stockInData.remarks}
                        onChange={(e) => setStockInData({ ...stockInData, remarks: e.target.value })}
                        placeholder="Remarks (Optional)"
                      />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock In Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !stockInData.stockInDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {stockInData.stockInDate ? format(stockInData.stockInDate, "PPP") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={stockInData.stockInDate || undefined}
                          onSelect={(date: Date | undefined) => setStockInData({ ...stockInData, stockInDate: date || new Date() })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={stockOutData.quantity}
                      onChange={(e) => setStockOutData({ ...stockOutData, quantity: e.target.value })}
                      placeholder="Enter quantity"
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Who Take / Remarks *</Label>
                    <Input
                      value={stockOutData.whoTake}
                      onChange={(e) => setStockOutData({ ...stockOutData, whoTake: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input
                      value={stockOutData.reason}
                      onChange={(e) => setStockOutData({ ...stockOutData, reason: e.target.value })}
                      placeholder="Enter reason"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock Out Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !stockOutData.stockOutDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {stockOutData.stockOutDate ? format(stockOutData.stockOutDate, "PPP") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={stockOutData.stockOutDate || undefined}
                          onSelect={(date: Date | undefined) => setStockOutData({ ...stockOutData, stockOutDate: date || new Date() })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStockUpdate}>
                {stockType === "in" ? "Add Stock" : "Remove Stock"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stock History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Stock Transaction History - {historyProductId ? getProductName(historyProductId) : ""}</DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier / Who</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getProductTransactions().map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Badge variant={t.type === "in" ? "default" : "destructive"}>
                          {t.type === "in" ? "Stock In" : "Stock Out"}
                        </Badge>
                      </TableCell>
                      <TableCell className={t.type === "in" ? "text-green-600" : "text-red-600"}>
                        {t.type === "in" ? "+" : "-"}{t.quantity}
                      </TableCell>
                      <TableCell>{format(t.date, "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        {t.type === "in" ? (t.supplierId ? getSupplierName(t.supplierId) : "-") : t.whoTake}
                      </TableCell>
                      <TableCell>
                        {t.reason || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {getProductTransactions().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Threshold Settings Dialog */}
        <Dialog open={isThresholdDialogOpen} onOpenChange={setIsThresholdDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Low Stock Threshold Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Alert when quantity is at or below:</Label>
                <Input
                  type="number"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(e.target.value)}
                  placeholder="Enter threshold"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Products with quantity ≤ this value will appear in low stock alerts
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsThresholdDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleThresholdUpdate}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

         {/* PDF View Dialog */}
        <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Product List Preview ({selectedProducts.length} selected)</DialogTitle>
            </DialogHeader>
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="text-right text-xs text-muted-foreground mb-2">
                Preview Date: {format(new Date(), "MMM dd, yyyy HH:mm")}
              </div>
              <h2 className="text-xl font-bold text-center mb-4">Product List</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SI No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Expire Date</TableHead>
                    <TableHead>Sale Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSelectedProductsData().map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        {product.expirationDate ? format(product.expirationDate, "MMM dd, yyyy") : "-"}
                      </TableCell>
                      <TableCell>৳{product.salePrice.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPdfDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={handlePrintSelectedProducts}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
};

export default Products;
