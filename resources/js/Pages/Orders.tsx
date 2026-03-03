import { useState, useEffect } from "react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { router, usePage } from "@inertiajs/react";
import { Plus, Search, Eye, Pencil, Trash2, Check, FileText, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { OrderFormDialog, Order, Customer } from "@/components/orders/OrderFormDialog";
import { Product } from "@/components/orders/OrderItemRow";
import { InvoiceDialog } from "@/components/orders/InvoiceDialog";
import { OrderCard } from "@/components/orders/OrderCard";
import { useAuth } from "@/hooks/useAuth";



interface OrdersProps {
  initialOrders: Order[];
  customers: Customer[];
  products: Product[];
  employees: any[];
  technicians: any[];
  services: any[];
  filters: any;
}

const Orders = ({ initialOrders, customers: initialCustomers, products: initialProducts, employees: initialEmployees, technicians: initialTechnicians, services: initialServices, filters }: OrdersProps) => {
  const { flash } = usePage<any>().props;
  const { user } = useAuth();
  // Initialize state from props
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers || []);
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [technicians, setTechnicians] = useState<any[]>(initialTechnicians || []);
  const [services, setServices] = useState<any[]>(initialServices || []);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  // Effect to update state when props change (e.g., after search or reload)
  useEffect(() => {
    setOrders(initialOrders || []);
    setCustomers(initialCustomers || []);
    setProducts(initialProducts || []);
    setTechnicians(initialTechnicians || []);
    setServices(initialServices || []);

    // Set current employee based on initialEmployees prop
    if (user?.email && initialEmployees) {
        const empList = Array.isArray(initialEmployees) ? initialEmployees : ((initialEmployees as any).data || []);
        const matchedEmployee = empList.find((e: any) => e.user?.email === user.email);
        if (matchedEmployee) {
            setCurrentEmployeeId(matchedEmployee.id);
        }
    }
  }, [initialOrders, initialCustomers, initialProducts, initialEmployees, user]);

  // Handle Search with Inertia
  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
          if (searchTerm !== (filters.search || "")) {
              router.get(
                  '/orders',
                  { search: searchTerm },
                  { preserveState: true, replace: true }
              );
          }
      }, 300);

      return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const reloadData = () => {
      router.reload({ only: ['initialOrders'] });
  };

  useEffect(() => {
    const viewId = searchParams.get("view");
    if (viewId && orders.length > 0) {
      const orderToView = orders.find(o => o.id === viewId);
      if (orderToView) {
        setSelectedOrder(orderToView);
        setIsViewDialogOpen(true);
      }
    }
  }, [url, orders]);


  const filteredOrders = orders.filter(
    (order) =>
      // order.status === "pending" && // Removed status filter to show all orders by default or handle filter UI separately if needed
      (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // Debounced router.get handled in useEffect
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleSave = (orderData: Omit<Order, "id"> & { id?: string }) => {
    const payload = {
      type:           orderData.type,
      customer_id:    orderData.customerId,
      employee_id:    (orderData as any).employeeId || currentEmployeeId,
      technician_id:  orderData.technicianId,
      order_date:     format(orderData.date, 'yyyy-MM-dd'),
      payment_method: orderData.paymentMethod,
      discount:       orderData.discount,
      discount_type:  orderData.discountType,
      service_charge: orderData.serviceCharge,
      service_notes:  orderData.serviceNotes,
      note:           "",
      items: orderData.items.map(item => ({
        id:               item.dbId,
        product_id:       item.productId,
        custom_item_name: (item as any).customItemName,
        quantity:         item.quantity,
        unit_price:       item.price,
        price_type:       item.priceType,
        bonus_quantity:   item.bonusQuantity,
      })),
    };

    setIsLoading(true);
    if (formMode === "create") {
      router.post('/orders', payload, {
        onSuccess: () => {
          toast.success("Order created successfully");
          setIsFormDialogOpen(false);
          setFormMode("create");
        },
        onError: (errors: any) => toast.error(Object.values(errors)[0] as string || "Failed to create order"),
        onFinish: () => setIsLoading(false),
      });
    } else {
      const numericId = orderData.id && orders.find(o => o.id === orderData.id)?.internalId;
      if (!numericId) { toast.error("Cannot identify order to update"); setIsLoading(false); return; }
      router.put(`/orders/${numericId}`, payload, {
        onSuccess: () => {
          toast.success("Order updated successfully");
          setIsFormDialogOpen(false);
          setFormMode("create");
        },
        onError: (errors: any) => toast.error(Object.values(errors)[0] as string || "Failed to update order"),
        onFinish: () => setIsLoading(false),
      });
    }
  };

  const handleDelete = () => {
    if (!selectedOrder) return;
    setIsLoading(true);
    router.delete(`/orders/${selectedOrder.internalId}`, {
      onSuccess: () => {
        toast.success("Order deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedOrder(null);
      },
      onError: () => toast.error("Failed to delete order"),
      onFinish: () => setIsLoading(false),
    });
  };

  const openCreateDialog = () => {
    setSelectedOrder(null);
    setFormMode("create");
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setFormMode("edit");
    setIsFormDialogOpen(true);
  };

  const openViewDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleApprove = (order: Order) => {
    setIsLoading(true);
    router.post(`/orders/${order.internalId}/approve`, {}, {
      onSuccess: () => toast.success(`Order ${order.id} approved`),
      onError: () => toast.error("Failed to approve order"),
      onFinish: () => setIsLoading(false),
    });
  };

  const openInvoiceDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsInvoiceDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: Order["status"]) => {
    switch (status) {
      case "approved":
        return "default";
      case "delivered":
        return "secondary";
      case "pending":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
            <p className="text-sm md:text-base text-muted-foreground">Track and manage all orders</p>
          </div>
          {user?.permissions?.includes('order.create') && (
          <Button className="w-full sm:w-auto" onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg md:text-xl">Order List</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                  <div className="text-center py-8">Loading orders...</div>
              ) : (
                <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {paginatedOrders.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No orders found</p>
                  ) : (
                    paginatedOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onView={openViewDialog}
                        onInvoice={openInvoiceDialog}
                        onApprove={handleApprove}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
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
                      {paginatedOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.employeeName}</TableCell>
                          <TableCell>৳{order.total.toFixed(2)}</TableCell>
                          <TableCell>{format(new Date(order.date), "PPP")}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openViewDialog(order)} title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user?.permissions?.includes('order.print') && (
                              <Button variant="ghost" size="icon" onClick={() => openInvoiceDialog(order)} title="Invoice">
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            {order.status === "pending" && user?.permissions?.includes('order.approve') && (
                              <Button variant="ghost" size="icon" onClick={() => handleApprove(order)} title="Approve">
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {user?.permissions?.includes('order.update') && order.status === "pending" && ( // Only show edit for pending? Allowed all for now in logic but UI might restrain.
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(order)} title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            )}
                            {user?.permissions?.includes('order.delete') && (
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(order)} title="Delete">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No orders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                </>
             )}

            {/* Pagination */}
            {filteredOrders.length > 0 && (
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
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
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
      </div>

      {/* Create/Edit Order Dialog */}
      <OrderFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        order={selectedOrder}
        customers={customers}
        products={products}
        technicians={technicians}
        services={services}
        onSave={handleSave}
        mode={formMode}
      />

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">Order Type:</span>
                <Badge variant="secondary" className="w-fit capitalize">{selectedOrder.type}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">Customer:</span>
                <span>{selectedOrder.customerName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">Employee:</span>
                <span>{selectedOrder.employeeName}</span>
              </div>
              {selectedOrder.technicianName && (
                <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-muted-foreground">Technician:</span>
                    <span>{selectedOrder.technicianName}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">Date:</span>
                <span>{format(new Date(selectedOrder.date), "PPP")}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">Payment Method:</span>
                <span className="capitalize">{selectedOrder.paymentMethod.replace("_", " ")}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">Status:</span>
                <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                  {selectedOrder.status}
                </Badge>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium mb-3">Parts / Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
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
                  <span>Parts Subtotal:</span>
                  <span>৳{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.serviceCharge > 0 && (
                    <div className="flex justify-between text-sm">
                        <span>Service Charge:</span>
                        <span>৳{selectedOrder.serviceCharge.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Discount ({selectedOrder.discountType === "percentage" ? `${selectedOrder.discount}%` : `৳${selectedOrder.discount}`}):</span>
                  <span>-৳{selectedOrder.discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>৳{selectedOrder.total.toFixed(2)}</span>
                </div>
                {selectedOrder.serviceNotes && (
                    <div className="mt-2 pt-2 border-t text-sm">
                        <span className="font-medium text-muted-foreground block mb-1">Service Notes:</span>
                        <p className="text-balance">{selectedOrder.serviceNotes}</p>
                    </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order {selectedOrder?.id}? This action cannot be undone.
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

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        order={selectedOrder}
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

export default Orders;
