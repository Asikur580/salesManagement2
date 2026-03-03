import { useState, useMemo, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { useAuth } from "@/hooks/useAuth";

import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, ChevronLeft, ChevronRight, Filter, X, ArrowUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { format, startOfDay, endOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { ReportCard } from "@/components/reports/ReportCard";

type DatePreset = "today" | "this-week" | "this-month" | "last-30-days" | "custom";



type ReportType = "customer" | "category" | "product" | "officer" | "manager" | "rsm" | "other" | "payment-method";

interface AggregatedReport {
  id: number | string;
  name: string;
  totalSales: number;
  totalQuantity: number;
  orderCount: number;
}



// ... existing imports

interface SalesReportsProps {
  initialData: any[];
  filters: {
    view: string;
    start_date?: string;
    end_date?: string;
  };
}

export default function SalesReports({ initialData, filters }: SalesReportsProps) {
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split('?')[1] || "");
  const viewParam = searchParams.get("view");
  
  const mapReportData = (data: any[]): AggregatedReport[] => {
    if (!data) return [];
    return data.map((item: any) => ({
      id: item.id || item.name,
      name: item.name,
      totalSales: parseFloat(item.total_spent || 0),
      totalQuantity: parseInt(item.total_quantity || "0"),
      orderCount: item.total_orders || 0
    }));
  };

  const initialMappedData = mapReportData(initialData);

  const [activeTab, setActiveTab] = useState<ReportType>((filters?.view as ReportType) || "officer");
  
  // Initialize reportType based on URL param or filters
  const [reportType, setReportType] = useState<"customer" | "category" | "product" | "payment-method" | "reports">
    (filters?.view === "customer" ? "customer" :
      filters?.view === "category" ? "category" :
        filters?.view === "product" ? "product" :
          filters?.view === "payment-method" ? "payment-method" : "reports");

  const [startDate, setStartDate] = useState<Date | undefined>(
    filters?.start_date ? new Date(filters.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters?.end_date ? new Date(filters.end_date) : undefined
  );
  const [datePreset, setDatePreset] = useState<DatePreset>("custom");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Update state when URL param changes
  useEffect(() => {
    if (viewParam === "customer") {
      setReportType("customer");
      setActiveTab("customer");
    } else if (viewParam === "category") {
      setReportType("category");
      setActiveTab("category");
    } else if (viewParam === "product") {
      setReportType("product");
      setActiveTab("product");
    } else if (viewParam === "payment-method") {
      setReportType("payment-method");
      setActiveTab("payment-method");
    } else if (viewParam) {
      // For officer, manager, rsm, others
       setReportType("reports");
       setActiveTab(viewParam as ReportType);
    }
  }, [viewParam]);

  const handleFilterChange = (newView?: string, newStart?: Date, newEnd?: Date) => {
    setIsLoading(true);
    const params: any = {
      view: newView || activeTab,
    };
    
    if (newStart || (newStart === undefined && startDate)) {
      params.start_date = format(newStart || startDate!, "yyyy-MM-dd");
    }
    if (newEnd || (newEnd === undefined && endDate)) {
      params.end_date = format(newEnd || endDate!, "yyyy-MM-dd");
    }

    router.get('/sales-reports', params, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setIsLoading(false)
    });
  };



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

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = new Date();
    let start: Date | undefined;
    let end: Date | undefined = endOfDay(today);

    switch (preset) {
      case "today":
        start = startOfDay(today);
        break;
      case "this-week":
        start = startOfWeek(today, { weekStartsOn: 1 });
        break;
      case "this-month":
        start = startOfMonth(today);
        break;
      case "last-30-days":
        start = startOfDay(subDays(today, 30));
        break;
      case "custom":
        return;
    }
    
    setStartDate(start);
    setEndDate(end);
    handleFilterChange(activeTab, start, end);
    setCurrentPage(1);
  };


  // Aggregate data based on report type
  const aggregatedData = useMemo((): AggregatedReport[] => {
    return initialMappedData;
  }, [initialData]);

  // Pagination
  const totalPages = Math.ceil(aggregatedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = aggregatedData.slice(startIndex, endIndex);

  // Calculate totals
  const totalSales = aggregatedData.reduce((sum: number, item: AggregatedReport) => sum + item.totalSales, 0);
  const totalQuantity = aggregatedData.reduce((sum: number, item: AggregatedReport) => sum + item.totalQuantity, 0);
  const totalOrders = aggregatedData.reduce((sum: number, item: AggregatedReport) => sum + item.orderCount, 0);

  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setDatePreset("custom");
    handleFilterChange(activeTab, undefined, undefined);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as ReportType);
    handleFilterChange(value);
    setCurrentPage(1);
  };

  const getReportTitle = () => {
    switch (activeTab) {
      case "customer":
        return "Customer";
      case "category":
        return "Category";
      case "product":
        return "Product";
      case "officer":
        return "Sales Officer";
      case "manager":
        return "Sales Manager";
      case "rsm":
        return "Regional Sales Manager (RSM)";
      case "other":
        return "Other Employees";
      case "payment-method":
        return "Payment Method";
      default:
        return "";
    }
  };

  const getReportHeader = () => {
    switch (activeTab) {
      case "customer": return "Customer Name";
      case "category": return "Category Name";
      case "product": return "Product Name";
      case "officer": return "Officer Name";
      case "manager": return "Manager Name";
      case "rsm": return "RSM Name";
      case "other": return "Employee Name";
      case "payment-method": return "Payment Method";
      default: return "Name";
    }
  };

  const exportToCSV = () => {
    const headers = [getReportTitle(), "Total Sales", "Total Quantity", "Order Count"];
    const rows = aggregatedData.map((item: AggregatedReport) => [
      item.name,
      item.totalSales.toFixed(2),
      item.totalQuantity.toString(),
      item.orderCount.toString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-sales-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
            <p className="text-muted-foreground">
              Analyze sales performance across different dimensions
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Date Range Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Date Range Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={datePreset === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetChange("today")}
              >
                Today
              </Button>
              <Button
                variant={datePreset === "this-week" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetChange("this-week")}
              >
                This Week
              </Button>
              <Button
                variant={datePreset === "this-month" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetChange("this-month")}
              >
                This Month
              </Button>
              <Button
                variant={datePreset === "last-30-days" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetChange("last-30-days")}
              >
                Last 30 Days
              </Button>
              <Button
                variant={datePreset === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetChange("custom")}
              >
                Custom
              </Button>
            </div>

            {/* Custom Date Pickers */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date: Date | undefined) => {
                        setStartDate(date);
                        setDatePreset("custom");
                        handleFilterChange(activeTab, date, endDate);
                        setCurrentPage(1);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date: Date | undefined) => {
                        setEndDate(date);
                        setDatePreset("custom");
                        handleFilterChange(activeTab, startDate, date);
                        setCurrentPage(1);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {(startDate || endDate) && (
                <Button variant="ghost" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Filters Indicator */}
        {(startDate || endDate) && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Active Filters:</span>
            <div className="flex flex-wrap gap-2">
              {startDate && (
                <Badge variant="secondary" className="gap-1">
                  From: {format(startDate, "MMM dd, yyyy")}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => {
                      setStartDate(undefined);
                      setDatePreset("custom");
                    }}
                  />
                </Badge>
              )}
              {endDate && (
                <Badge variant="secondary" className="gap-1">
                  To: {format(endDate, "MMM dd, yyyy")}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => {
                      setEndDate(undefined);
                      setDatePreset("custom");
                    }}
                  />
                </Badge>
              )}
              {datePreset !== "custom" && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {datePreset === "today" && "Today"}
                  {datePreset === "this-week" && "This Week"}
                  {datePreset === "this-month" && "This Month"}
                  {datePreset === "last-30-days" && "Last 30 Days"}
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="ml-auto">
              Showing {aggregatedData.length} records
            </Badge>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className={cn(
            "transition-all duration-300",
            (startDate || endDate) && "ring-2 ring-primary/20 shadow-lg shadow-primary/5"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Total Sales
                {(startDate || endDate) && (
                  <Badge variant="outline" className="text-xs font-normal">Filtered</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">৳{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
          <Card className={cn(
            "transition-all duration-300",
            (startDate || endDate) && "ring-2 ring-primary/20 shadow-lg shadow-primary/5"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Total Quantity
                {(startDate || endDate) && (
                  <Badge variant="outline" className="text-xs font-normal">Filtered</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuantity.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className={cn(
            "transition-all duration-300",
            (startDate || endDate) && "ring-2 ring-primary/20 shadow-lg shadow-primary/5"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Total Orders
                {(startDate || endDate) && (
                  <Badge variant="outline" className="text-xs font-normal">Filtered</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Report Tabs */}
        <Card className="overflow-hidden relative">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="text-xl font-semibold">Detailed Reports</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              View sales performance by different categories
            </p>
          </CardHeader>
          <CardContent className="p-0 relative max-h-[800px] overflow-y-auto">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              {/* Tabs Navigation */}
              <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">


                {reportType === "reports" && (
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-transparent">
                    <TabsTrigger value="officer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Officer
                    </TabsTrigger>
                    <TabsTrigger value="manager" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Manager
                    </TabsTrigger>
                    <TabsTrigger value="rsm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      RSM
                    </TabsTrigger>
                    <TabsTrigger value="other" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Other
                    </TabsTrigger>
                  </TabsList>
                )}
              </div>

              {/* Tab Content */}
              {reportType === "customer" || reportType === "category" || reportType === "product" || reportType === "payment-method" || reportType === "reports" ? (
                <TabsContent value={activeTab} className="mt-0">
                  <div className="p-4 sm:p-6">
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                          <ReportCard
                            key={item.id}
                            index={startIndex + index + 1}
                            name={item.name}
                            totalSales={item.totalSales}
                            totalQuantity={item.totalQuantity}
                            orderCount={item.orderCount}
                          />
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No data found for the selected filters.</p>
                          <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your date range or filters</p>
                        </div>
                      )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-lg border shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table className="min-w-[600px]">
                          <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                              <TableHead className="w-[60px] font-semibold">#</TableHead>
                              <TableHead className="font-semibold">{getReportTitle()}</TableHead>
                              <TableHead className="text-right font-semibold">Total Sales</TableHead>
                              <TableHead className="text-right font-semibold">Total Quantity</TableHead>
                              <TableHead className="text-right font-semibold">Order Count</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedData.length > 0 ? (
                              paginatedData.map((item: AggregatedReport, index: number) => (
                                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                  <TableCell className="font-medium text-muted-foreground">
                                    {startIndex + index + 1}
                                  </TableCell>
                                  <TableCell className="font-semibold">{item.name}</TableCell>
                                  <TableCell className="text-right font-medium text-primary">
                                    ৳{item.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.totalQuantity.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.orderCount}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                  <div className="flex flex-col items-center justify-center">
                                    <p className="text-muted-foreground">No data found for the selected filters.</p>
                                    <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your date range or filters</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Pagination */}
                  {aggregatedData.length > 0 && (
                    <div className="sticky bottom-0 bg-background border-t px-4 sm:px-6 py-3 z-10">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                          <span className="text-xs sm:text-sm text-muted-foreground">Rows per page:</span>
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
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {startIndex + 1}-{Math.min(endIndex, aggregatedData.length)} of {aggregatedData.length}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setCurrentPage(1)}
                              disabled={currentPage === 1}
                              title="First page"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <ChevronLeft className="h-4 w-4 -ml-2" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              title="Previous page"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              title="Next page"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={currentPage === totalPages}
                              title="Last page"
                            >
                              <ChevronRight className="h-4 w-4" />
                              <ChevronRight className="h-4 w-4 -ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              ) : (
                ["category", "product", "officer", "manager", "rsm", "cash", "credit"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-0">
                    <div className="p-4 sm:p-6">
                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-3">
                        {paginatedData.length > 0 ? (
                          paginatedData.map((item: AggregatedReport, index: number) => (
                            <ReportCard
                              key={item.id}
                              index={startIndex + index + 1}
                              name={item.name}
                              totalSales={item.totalSales}
                              totalQuantity={item.totalQuantity}
                              orderCount={item.orderCount}
                            />
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No data found for the selected filters.</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your date range or filters</p>
                          </div>
                        )}
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden md:block rounded-lg border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <Table className="min-w-[600px]">
                            <TableHeader>
                              <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-[60px] font-semibold">#</TableHead>
                                <TableHead className="font-semibold">{getReportTitle()}</TableHead>
                                <TableHead className="text-right font-semibold">Total Sales</TableHead>
                                <TableHead className="text-right font-semibold">Total Quantity</TableHead>
                                <TableHead className="text-right font-semibold">Order Count</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedData.length > 0 ? (
                                paginatedData.map((item: AggregatedReport, index: number) => (
                                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium text-muted-foreground">
                                      {startIndex + index + 1}
                                    </TableCell>
                                    <TableCell className="font-semibold">{item.name}</TableCell>
                                    <TableCell className="text-right font-medium text-primary">
                                      ৳{item.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {item.totalQuantity.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {item.orderCount}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                      <p className="text-muted-foreground">No data found for the selected filters.</p>
                                      <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your date range or filters</p>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>

                    {/* Sticky Pagination */}
                    {aggregatedData.length > 0 && (
                      <div className="sticky bottom-0 bg-background border-t px-4 sm:px-6 py-3 z-10">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                            <span className="text-xs sm:text-sm text-muted-foreground">Rows per page:</span>
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
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {startIndex + 1}-{Math.min(endIndex, aggregatedData.length)} of {aggregatedData.length}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                title="First page"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <ChevronLeft className="h-4 w-4 -ml-2" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                title="Previous page"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                title="Next page"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                title="Last page"
                              >
                                <ChevronRight className="h-4 w-4" />
                                <ChevronRight className="h-4 w-4 -ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

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
}
