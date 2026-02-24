import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, ArrowUp, Calendar as CalendarIcon, FilterX } from "lucide-react";
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
import { useState, useEffect, useCallback } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { router, usePage } from "@inertiajs/react";

interface ExpenseCategory {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  expense_category_id: number;
  amount: number;
  date: string;
  description: string;
  category?: {
    name: string;
  };
  creator?: {
    name: string;
  };
}

interface PageProps {
  initialExpenses: {
    data: Expense[];
    links: any[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      path: string;
      per_page: number;
      to: number;
      total: number;
    };
  };
  categories: ExpenseCategory[];
  filters: {
    search?: string;
    per_page?: string;
    expense_category_id?: string;
    start_date?: string;
    end_date?: string;
  };
  flash?: { success?: string; error?: string };
}

const Expenses = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { initialExpenses, categories, filters, flash } = usePage<{ props: PageProps }>().props as unknown as PageProps;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<number | null>(null);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState<string>(filters.expense_category_id || "all");
  const [startDate, setStartDate] = useState<Date | undefined>(filters.start_date ? new Date(filters.start_date) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(filters.end_date ? new Date(filters.end_date) : undefined);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const [formData, setFormData] = useState({
    expense_category_id: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: ""
  });

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (flash?.success) {
      toast({ title: "Success", description: flash.success });
    }
    if (flash?.error) {
      toast({ title: "Error", description: flash.error, variant: "destructive" });
    }
  }, [flash]);

  // Reload data when filters change
  const reloadData = useCallback((overrides: Record<string, any> = {}) => {
    const params: Record<string, any> = {
      search: searchTerm || undefined,
      expense_category_id: filterCategory !== "all" ? filterCategory : undefined,
      start_date: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      end_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      per_page: filters.per_page,
      ...overrides,
    };

    // Remove undefined keys
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    router.get('/expenses', params, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  }, [searchTerm, filterCategory, startDate, endDate, filters.per_page]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      reloadData();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // React to filter changes (category, dates)
  useEffect(() => {
    reloadData();
  }, [filterCategory, startDate, endDate]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilterCategory("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchTerm("");
    router.get('/expenses', {}, { preserveState: true, preserveScroll: true, replace: true });
  };

  const expenses = initialExpenses.data;
  const meta = initialExpenses.meta;

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        expense_category_id: expense.expense_category_id.toString(),
        amount: expense.amount.toString(),
        date: expense.date,
        description: expense.description || ""
      });
    } else {
      setEditingExpense(null);
      setFormData({
        expense_category_id: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        description: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = () => {
    if (!formData.expense_category_id || !formData.amount || !formData.date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingExpense) {
      router.put(`/expenses/${editingExpense.id}`, formData, {
        onSuccess: () => handleCloseDialog(),
        onError: (errors) => {
          toast({
            title: "Error",
            description: Object.values(errors).flat().join(', ') || "Failed to update expense",
            variant: "destructive",
          });
        },
      });
    } else {
      router.post('/expenses', formData, {
        onSuccess: () => handleCloseDialog(),
        onError: (errors) => {
          toast({
            title: "Error",
            description: Object.values(errors).flat().join(', ') || "Failed to record expense",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleDelete = () => {
    if (deleteExpenseId) {
      router.delete(`/expenses/${deleteExpenseId}`, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setDeleteExpenseId(null);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete expense",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handlePageChange = (url: string | null) => {
    if (url) {
      router.get(url, {}, { preserveState: true, preserveScroll: true });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Expenses</h1>
            <p className="text-sm md:text-base text-muted-foreground">Track and record office costs</p>
          </div>
          {user?.permissions?.includes('expense.create') && (
          <Button className="w-full sm:w-auto" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Record Expense
          </Button>
          )}
        </div>

        {/* Filters Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search description..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
                  <FilterX className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Expense Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No expenses found
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{format(new Date(expense.date), "MMM dd, yyyy")}</TableCell>
                          <TableCell className="font-medium">{expense.category?.name || "N/A"}</TableCell>
                          <TableCell className="max-w-[300px] truncate">{expense.description || "-"}</TableCell>
                          <TableCell className="font-bold text-primary">৳{Number(expense.amount).toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{expense.creator?.name || "Unknown"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {user?.permissions?.includes('expense.update') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDialog(expense)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              )}
                              {user?.permissions?.includes('expense.delete') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteExpenseId(expense.id);
                                  setIsDeleteDialogOpen(true);
                                }}
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {meta.from || 0} to {meta.to || 0} of {meta.total} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(initialExpenses.links.find((l: any) => l.label.includes('Previous'))?.url)}
                  disabled={meta.current_page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(initialExpenses.links.find((l: any) => l.label.includes('Next'))?.url)}
                  disabled={meta.current_page === meta.last_page || meta.last_page === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingExpense ? "Edit Expense" : "Record New Expense"}</DialogTitle>
              <DialogDescription>
                Fill in the details for the office expense.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.expense_category_id} 
                  onValueChange={(v) => setFormData({ ...formData, expense_category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    className="pl-7"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What was this expense for?"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingExpense ? "Update" : "Record"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the expense record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteExpenseId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Scroll to top */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-6 right-6 rounded-full shadow-lg"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Expenses;
