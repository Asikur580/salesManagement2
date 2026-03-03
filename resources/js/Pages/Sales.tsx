import { useState, useEffect } from "react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePage, router } from "@inertiajs/react";
import { Search, Eye, FileText, Download, CalendarIcon, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Order } from "@/components/orders/OrderFormDialog";
import { InvoiceDialog } from "@/components/orders/InvoiceDialog";
import { OrderCard } from "@/components/orders/OrderCard";

interface SalesProps {
  initialSales: Order[];
  filters: any;
}

const Sales = ({ initialSales, filters }: SalesProps) => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Order[]>(initialSales || []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split('?')[1] || "");

  // Effect to update state when props change
  useEffect(() => {
    setSales(initialSales || []);
  }, [initialSales]);

  // Handle Search with Inertia (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== (filters.search || "")) {
        router.get(
          '/sales',
          { search: searchTerm },
          { preserveState: true, replace: true }
        );
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
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

  // Get unique employees and customers
  const uniqueEmployees = [...new Set(sales.map((sale) => sale.employeeName))];
  const uniqueCustomers = [...new Set(sales.map((sale) => sale.customerName))];

  // Handled via useEffect route.get
  // const clearAllFilters = () => { ... } // Re-implement if strictly needed, but Search handles basics.
  // Keeping simplified for now as per refactor plan to use server filters.
  
  const clearAllFilters = () => {
       setSearchTerm("");
       // setStatusFilter("all"); // Filter logic to be moved to server or kept client side?
       // For now, client side filtering for Status/Employee/Customer is still useful for quick sort on the loaded page
       // BUT if pagination is server side (which it isn't fully yet in Controller, just ->get()), client side filter works on the page data.
       // The plan says "Replace client-side search/filter with router.get".
       // Currently `OrderController` only handles `search`.
       // So I should keep client-side filters for Date/Status/etc OR update Controller to handle them.
       // The Prompt asked to refactor to "server-side data fetching", but complete server-side filtering for all fields was not explicitly detailed in my plan for `SaleController`, only `search`.
       // However, `SaleController` only gets `approved/delivered`.
       // I'll keep client side filtering for the other fields for now to maintain feature parity without over-engineering the controller immediately, as `initialSales` contains all sales matching the basic criteria.
       
       setStatusFilter("all");
       setEmployeeFilter("all");
       setCustomerFilter("all");
       setFromDate(undefined);
       setToDate(undefined);
       setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || employeeFilter !== "all" || customerFilter !== "all" || fromDate || toDate;

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.employeeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    const matchesEmployee = employeeFilter === "all" || sale.employeeName === employeeFilter;
    const matchesCustomer = customerFilter === "all" || sale.customerName === customerFilter;

    // Date range filter
    let matchesDateRange = true;
    const saleDate = new Date(sale.date);
    if (fromDate && toDate) {
      matchesDateRange = isWithinInterval(saleDate, {
        start: startOfDay(fromDate),
        end: endOfDay(toDate),
      });
    } else if (fromDate) {
      matchesDateRange = saleDate >= startOfDay(fromDate);
    } else if (toDate) {
      matchesDateRange = saleDate <= endOfDay(toDate);
    }

    return matchesSearch && matchesStatus && matchesEmployee && matchesCustomer && matchesDateRange;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const openViewDialog = (sale: Order) => {
    setSelectedSale(sale);
    setIsViewDialogOpen(true);
  };

  const openInvoiceDialog = (sale: Order) => {
    setSelectedSale(sale);
    setIsInvoiceDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: Order["status"]) => {
    switch (status) {
      case "approved":
        return "default";
      case "delivered":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Calculate totals
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = filteredSales.length;

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Sales</h1>
            <p className="text-sm md:text-base text-muted-foreground">View all approved orders and sales</p>
          </div>
          <Button className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{totalSales.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ৳{totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg md:text-xl">Sales List</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Filter employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {uniqueEmployees.map((employee) => (
                        <SelectItem key={employee} value={employee}>
                          {employee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={customerFilter} onValueChange={setCustomerFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Filter customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {uniqueCustomers.map((customer) => (
                        <SelectItem key={customer} value={customer}>
                          {customer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search sales..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Date Range:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[150px] justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PP") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-sm text-muted-foreground">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[150px] justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PP") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                  <div className="text-center py-8">Loading sales...</div>
              ) : (
                <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {paginatedSales.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No sales found</p>
              ) : (
                paginatedSales.map((sale) => (
                  <OrderCard
                    key={sale.id}
                    order={sale}
                    onView={openViewDialog}
                    onInvoice={openInvoiceDialog}
                    onApprove={() => { }} // No approve action for sales
                    onEdit={() => { }} // No edit action for sales
                    onDelete={() => { }} // No delete action for sales
                    getStatusBadgeVariant={getStatusBadgeVariant}
                  />
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <Table className="min-w-[768px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell>{sale.employeeName}</TableCell>
                      <TableCell>৳{sale.total.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(sale.date), "PPP")}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(sale.status)}>
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(sale)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openInvoiceDialog(sale)} title="Invoice">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No sales found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredSales.length > 0 && (
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
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredSales.length)} of {filteredSales.length} sales
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
            </>
             )}
          </CardContent>
        </Card>
      </div>

      {/* View Sale Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
            <DialogDescription>Order ID: {selectedSale?.id}</DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">Customer:</span>
                <span>{selectedSale.customerName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">Employee:</span>
                <span>{selectedSale.employeeName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">Date:</span>
                <span>{format(new Date(selectedSale.date), "PPP")}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">Payment Method:</span>
                <span className="capitalize">{selectedSale.paymentMethod.replace("_", " ")}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">Status:</span>
                <Badge variant={getStatusBadgeVariant(selectedSale.status)}>
                  {selectedSale.status}
                </Badge>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-muted-foreground ml-2">({item.packSize})</span>
                        <span className="text-muted-foreground ml-2">
                          {item.quantity} × ৳{item.price.toFixed(2)}
                          {item.bonusQuantity > 0 && ` + ${item.bonusQuantity} bonus`}
                        </span>
                      </div>
                      <span className="font-medium">৳{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>৳{selectedSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Discount ({selectedSale.discountType === "percentage" ? `${selectedSale.discount}%` : `৳${selectedSale.discount}`}):</span>
                  <span>-৳{selectedSale.discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>৳{selectedSale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        order={selectedSale}
      />

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
    </DashboardLayout>
  );
};

export default Sales;
