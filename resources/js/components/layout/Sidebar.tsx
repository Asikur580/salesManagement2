import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    LayoutDashboard,
    Users,
    UserCog,
    Package,
    ShoppingCart,
    TrendingUp,
    Building2,
    LogOut,
    X,
    Shield,
    ChevronDown,
    ChevronRight,
    Briefcase,
    Building,
    Layers,
    Tag,
    FolderTree,
    BarChart3,
    DollarSign,
    ClipboardList,
    History,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/orders", icon: ClipboardList },
    { name: "POS", href: "/pos", icon: ShoppingCart },
    { name: "Service Invoices", href: "/services", icon: Briefcase },
    { name: "Brands", href: "/brands", icon: Tag },
    { name: "Categories", href: "/categories", icon: FolderTree },
    { name: "Products", href: "/products", icon: Package },
    { name: "Attributes", href: "/attributes", icon: Layers },
    { name: "Units", href: "/units", icon: Layers },
];

const rolePermissionItems = [
    { name: "Users", href: "/users" },
    { name: "Manage Roles", href: "/roles" },
    { name: "Manage Permissions", href: "/permissions" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const isMobile = useIsMobile();
    const { url: pathname } = usePage();
    const [inventoryOpen, setInventoryOpen] = useState(
        pathname.startsWith("/inventory") ||
            pathname.startsWith("/suppliers")
    );
    const [hrmOpen, setHrmOpen] = useState(
        pathname.startsWith("/hrm")
    );
    const [rolesOpen, setRolesOpen] = useState(
        pathname.startsWith("/users") ||
            pathname.startsWith("/roles") ||
            pathname.startsWith("/permissions"),
    );
    const [reportsOpen, setReportsOpen] = useState(
        pathname.startsWith("/reports")
    );
    const [accountingOpen, setAccountingOpen] = useState(
        pathname.startsWith("/accounting")
    );
    const { user, logout } = useAuth();

    // Permission helper function
    const hasPermission = (permission: string): boolean => {
        const result = user?.permissions?.includes(permission) || false;
        return result;
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Mobile close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <TrendingUp className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-semibold">SalesHub</span>
                    </div>

                    <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                        {navigation
                            .filter((item) => {
                                if (item.name === "Orders")
                                    return hasPermission("order.view");
                                if (item.name === "POS")
                                    return hasPermission("order.view"); // Simplified permission logic for now
                                if (item.name === "Brands")
                                    return hasPermission("brand.view");
                                if (item.name === "Categories")
                                    return hasPermission("category.view");
                                if (item.name === "Products")
                                    return hasPermission("product.view");
                                if (item.name === "Attributes")
                                    return hasPermission("product.view"); // Share permission for now
                                if (item.name === "Units")
                                    return hasPermission("unit.view");
                                return true;
                            })
                            .map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === item.href
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}

                        {/* Inventory Management Section */}
                        {(hasPermission("inventory.view_history") ||
                            hasPermission("inventory.adjust") ||
                            hasPermission("restock.view") ||
                            hasPermission("supplier.view")) && (
                        <Collapsible
                            open={inventoryOpen}
                            onOpenChange={setInventoryOpen}
                        >
                            <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                <History className="h-5 w-5" />
                                <span className="flex-1 text-left">Inventory</span>
                                {inventoryOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-1 pl-8 pt-1">
                                {hasPermission("inventory.view_history") && (
                                <Link
                                    href="/inventory/history"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/inventory/history"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Stock History
                                </Link>
                                )}
                                {hasPermission("inventory.adjust") && (
                                <Link
                                    href="/inventory/adjust"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/inventory/adjust"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Manual Adjustment
                                </Link>
                                )}
                                {hasPermission("restock.view") && (
                                <Link
                                    href="/restock-orders"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/restock-orders"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Restock Orders
                                </Link>
                                )}
                                {hasPermission("supplier.view") && (
                                <Link
                                    href="/suppliers"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/suppliers"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Suppliers
                                </Link>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                        )}

                        {/* Accounting Module Section */}
                        <Collapsible
                            open={accountingOpen}
                            onOpenChange={setAccountingOpen}
                        >
                            <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                <DollarSign className="h-5 w-5" />
                                <span className="flex-1 text-left">Accounting</span>
                                {accountingOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-1 pl-8 pt-1">
                                <Link
                                    href="/accounting/expenses"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/accounting/expenses"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Expenses
                                </Link>
                                <Link
                                    href="/accounting/expense-categories"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/accounting/expense-categories"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Expense Categories
                                </Link>
                                <Link
                                    href="/accounting/payments/customer-dues"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/accounting/payments/customer-dues"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Customer Dues
                                </Link>
                                <Link
                                    href="/accounting/payments/supplier-dues"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/accounting/payments/supplier-dues"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Supplier Dues
                                </Link>
                                <Link
                                    href="/accounting/payments"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/accounting/payments"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Payment Ledger
                                </Link>
                                <div className="my-2 border-t border-border/50 mx-2" />
                                <Link
                                    href="/accounting/reports/cashbook"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/accounting/reports/cashbook"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Cashbook
                                </Link>
                                <Link
                                    href="/accounting/reports/profit-loss"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/accounting/reports/profit-loss"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Profit & Loss
                                </Link>
                                <Link
                                    href="/accounting/reports/daily-sales"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/accounting/reports/daily-sales"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Daily Sales
                                </Link>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* HRM Management Section */}
                        {(hasPermission("hrm.employee.view") || 
                          hasPermission("hrm.attendance.view") || 
                          hasPermission("hrm.payroll.view") || 
                          hasPermission("hrm.leave.view")) && (
                        <Collapsible
                            open={hrmOpen}
                            onOpenChange={setHrmOpen}
                        >
                            <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                <Users className="h-5 w-5" />
                                <span className="flex-1 text-left">HRM</span>
                                {hrmOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-1 pl-8 pt-1">
                                {hasPermission("hrm.employee.view") && (
                                <Link
                                    href="/hrm/employees"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/hrm/employees"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Employees
                                </Link>
                                )}
                                {hasPermission("hrm.attendance.view") && (
                                <Link
                                    href="/hrm/attendance"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/hrm/attendance"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Attendance
                                </Link>
                                )}
                                {hasPermission("hrm.leave.view") && (
                                <Link
                                    href="/hrm/leaves"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/hrm/leaves"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Leave Requests
                                </Link>
                                )}
                                {hasPermission("hrm.payroll.view") && (
                                <Link
                                    href="/hrm/payroll"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/hrm/payroll"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Payroll & Salaries
                                </Link>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                        )}

                        {hasPermission("report.view") && (
                        <Collapsible
                            open={reportsOpen}
                            onOpenChange={setReportsOpen}
                        >
                            <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                <BarChart3 className="h-5 w-5" />
                                <span className="flex-1 text-left">Reports</span>
                                {reportsOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-1 pl-8 pt-1">
                                <Link
                                    href="/reports"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === "/reports"
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    Sales Reports
                                </Link>
                            </CollapsibleContent>
                        </Collapsible>
                        )}

                        {(hasPermission("user.view") ||
                            hasPermission("role.view") ||
                            hasPermission("permission.view")) && (
                            <Collapsible
                                open={rolesOpen}
                                onOpenChange={setRolesOpen}
                            >
                                <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                    <Shield className="h-5 w-5" />
                                    <span className="flex-1 text-left">
                                        Roles & Permissions
                                    </span>
                                    {rolesOpen ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-1 pl-8 pt-1">
                                    {rolePermissionItems
                                        .filter((item) => {
                                            // Show "Users" only if user has user.view
                                            if (item.href === "/users")
                                                return hasPermission(
                                                    "user.view",
                                                );
                                            // Show "Manage Roles" only if user has role.view
                                            if (item.href === "/roles")
                                                return hasPermission(
                                                    "role.view",
                                                );
                                            // Show "Manage Permissions" only if user has permission.view
                                            if (item.href === "/permissions")
                                                return hasPermission(
                                                    "permission.view",
                                                );
                                            // Show other items by default (fallback)
                                            return true;
                                        })
                                        .map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={onClose}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                    pathname === item.href
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                                )}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </nav>

                    <div className="border-t border-border p-4">
                        <button
                            onClick={() => logout()}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
