import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { OrderItemRow, OrderItem, Product } from "./OrderItemRow";
import { toast } from "sonner";

export interface Customer {
  id: number;
  name: string;
  employeeName: string;
  employeeId?: number; // Added employeeId
}

export interface Order {
  id: string;
  internalId?: number;
  type: "sales" | "service";
  customerId: number;
  customerName: string;
  employeeName: string;
  employeeId?: number;
  technicianId?: number | null;
  technicianName?: string;
  date: Date;
  paymentMethod: "cash" | "credit";
  discount: number;
  discountType: "percentage" | "fixed";
  serviceCharge: number;
  serviceNotes?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  status: "pending" | "approved" | "delivered" | "cancelled";
}

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  customers: Customer[];
  products: Product[];
  technicians?: any[];
  services?: any[];
  onSave: (order: Omit<Order, "id"> & { id?: string }) => void;
  mode: "create" | "edit";
}

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "credit", label: "Credit" } 
];

export const OrderFormDialog = ({
  open,
  onOpenChange,
  order,
  customers,
  products,
  technicians = [],
  services = [],
  onSave,
  mode,
}: OrderFormDialogProps) => {
  const [type, setType] = useState<Order["type"]>("sales");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<Order["paymentMethod"]>("cash");
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [status, setStatus] = useState<Order["status"]>("pending");
  const [technicianId, setTechnicianId] = useState<number | null>(null);
  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [serviceNotes, setServiceNotes] = useState<string>("");

  useEffect(() => {
    if (order && mode === "edit") {
      setType(order.type || "sales");
      setCustomerId(order.customerId);
      setDate(new Date(order.date));
      setPaymentMethod(order.paymentMethod);
      setDiscount(order.discount);
      setDiscountType(order.discountType);
      setItems(order.items);
      setStatus(order.status);
      setTechnicianId(order.technicianId || null);
      setServiceCharge(order.serviceCharge || 0);
      setServiceNotes(order.serviceNotes || "");
    } else {
      resetForm();
    }
  }, [order, mode, open]);

  const resetForm = () => {
    setType("sales");
    setCustomerId(null);
    setDate(new Date());
    setPaymentMethod("cash");
    setDiscount(0);
    setDiscountType("percentage");
    setItems([]);
    setStatus("pending");
    setTechnicianId(null);
    setServiceCharge(0);
    setServiceNotes("");
  };

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const addItem = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      productId: null,
      productName: "",
      packSize: "",
      priceType: "tp",
      price: 0,
      quantity: 1,
      bonusQuantity: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<OrderItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount =
    discountType === "percentage" ? (subtotal * discount) / 100 : discount;
  const total = (subtotal + serviceCharge) - discountAmount;

  const handleSave = () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    if (items.some((item) => !item.productId && !item.customItemName)) {
      toast.error("Please select a product or enter a name for all items");
      return;
    }

    const customer = customers.find((c) => c.id === customerId)!;

    onSave({
      id: order?.id,
      type,
      customerId,
      customerName: customer.name,
      employeeName: customer.employeeName,
      employeeId: customer.employeeId,
      technicianId,
      date,
      paymentMethod,
      discount,
      discountType,
      serviceCharge,
      serviceNotes,
      items,
      subtotal,
      discountAmount,
      total,
      status,
    });

    onOpenChange(false);
    resetForm();
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === parseInt(serviceId));
    if (service) {
        setServiceCharge(parseFloat(service.standard_charge as any));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Order" : "Edit Order"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Fill in the order details below." : "Update the order details."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Order Type Toggle */}
          <div className="flex gap-4 p-1 bg-muted rounded-lg w-fit">
            <Button 
                variant={type === "sales" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setType("sales")}
            >
                Sales
            </Button>
            <Button 
                variant={type === "service" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setType("service")}
            >
                Service
            </Button>
          </div>

          {/* Customer & Employee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Customer *</Label>
              <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerOpen}
                    className="justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedCustomer ? selectedCustomer.name : "Select customer"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={customer.name}
                            onSelect={() => {
                              setCustomerId(customer.id);
                              setCustomerOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                customerId === customer.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {customer.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Employee</Label>
              <Input
                value={selectedCustomer?.employeeName || ""}
                readOnly
                className="bg-muted"
                placeholder="Auto-filled from customer"
              />
            </div>
          </div>

          {/* Service Fields (if type is service) */}
          {type === "service" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="grid gap-2">
                    <Label>Technician</Label>
                    <Select value={technicianId?.toString() || ""} onValueChange={(v) => setTechnicianId(parseInt(v))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Technician" />
                        </SelectTrigger>
                        <SelectContent>
                            {technicians.map(tech => (
                                <SelectItem key={tech.id} value={tech.id.toString()}>{tech.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Select Service (to set charge)</Label>
                    <Select onValueChange={handleServiceSelect}>
                        <SelectTrigger>
                            <SelectValue placeholder="Quick select service" />
                        </SelectTrigger>
                        <SelectContent>
                            {services.map(s => (
                                <SelectItem key={s.id} value={s.id.toString()}>{s.name} (৳{s.standard_charge})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                    <Label>Service Charge</Label>
                    <Input 
                        type="number" 
                        value={serviceCharge} 
                        onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)} 
                    />
                </div>
                <div className="grid gap-2 md:col-span-2">
                    <Label>Service Notes</Label>
                    <Input 
                        value={serviceNotes} 
                        onChange={(e) => setServiceNotes(e.target.value)} 
                        placeholder="Diagnosis, repairs done, etc."
                    />
                </div>
            </div>
          )}

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Payment Method *</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as Order["paymentMethod"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Order Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="border rounded-lg p-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
                <div className="col-span-3">Product</div>
                <div className="col-span-1 text-center">Pack</div>
                <div className="col-span-2">Price Type</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-1">Bonus</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              {items.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No items added. Click "Add Item" to start.
                </div>
              ) : (
                items.map((item) => (
                  <OrderItemRow
                    key={item.id}
                    item={item}
                    products={products}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))
              )}
            </div>
          </div>

          {/* Discount & Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Discount</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={discount || ""}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="flex-1"
                  min={0}
                />
                <Select
                  value={discountType}
                  onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed">৳</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {mode === "edit" && (
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Order["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Parts Subtotal:</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            {type === "service" && (
                <div className="flex justify-between text-sm">
                    <span>Service Charge:</span>
                    <span>৳{serviceCharge.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Discount ({discountType === "percentage" ? `${discount}%` : `৳${discount}`}):</span>
              <span>-৳{discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>৳{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === "create" ? "Create Order" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
