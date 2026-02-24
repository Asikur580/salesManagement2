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
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Employees", href: "/employees", icon: UserCog },
  { name: "Designations", href: "/designations", icon: Briefcase },


  { name: "Suppliers", href: "/suppliers", icon: Building2 },
  { name: "Brands", href: "/brands", icon: Tag },
  { name: "Categories", href: "/categories", icon: FolderTree },
  { name: "Products", href: "/products", icon: Package },
  { name: "Technicians", href: "/technicians", icon: Users },
  { name: "Services", href: "/services", icon: Briefcase },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Sales", href: "/sales", icon: TrendingUp },
];

const salesReportsItems = [
  { name: "Customer Report", href: "/sales-reports?view=customer" },
  { name: "Category Report", href: "/sales-reports?view=category" },
  { name: "Product Report", href: "/sales-reports?view=product" },
  { name: "Payment Method Report", href: "/sales-reports?view=payment-method" },
  { name: "Sales Reports", href: "/sales-reports?view=reports" },
];

const rolePermissionItems = [
  { name: "Users", href: "/users" },
  { name: "Manage Roles", href: "/roles" },
  { name: "Manage Permissions", href: "/permissions" },
];

const othersItems = [
  { name: "Expense Categories", href: "/expense-categories", icon: Layers },
  { name: "Expenses", href: "/expenses", icon: DollarSign },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const isMobile = useIsMobile();
  const { url: pathname } = usePage();
  const [rolesOpen, setRolesOpen] = useState(
    pathname.startsWith("/users") || 
    pathname.startsWith("/roles") || 
    pathname.startsWith("/permissions")
  );
  const [salesReportsOpen, setSalesReportsOpen] = useState(
    pathname.startsWith("/sales-reports")
  );
  const [othersOpen, setOthersOpen] = useState(
    pathname.startsWith("/expense-categories") || 
    pathname.startsWith("/expenses")
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
          isOpen ? "translate-x-0" : "-translate-x-full"
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
                if (item.name === "Customers") return hasPermission('customer.view');
                if (item.name === "Employees") return hasPermission('employee.view');
                if (item.name === "Designations") return hasPermission('designation.view');
                if (item.name === "Suppliers") return hasPermission('supplier.view');
                if (item.name === "Brands") return hasPermission('brand.view');
                if (item.name === "Categories") return hasPermission('category.view');
                if (item.name === "Products") return hasPermission('product.view');
                if (item.name === "Technicians") return hasPermission('technician.view');
                if (item.name === "Services") return hasPermission('service.view');
                if (item.name === "Orders") return hasPermission('order.view');
                if (item.name === "Sales") return hasPermission('sale.view');
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
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}

            {hasPermission('report.sales') && (
              <Collapsible
                open={salesReportsOpen}
                onOpenChange={setSalesReportsOpen}
              >
                <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <BarChart3 className="h-5 w-5" />
                  <span className="flex-1 text-left">Sales Reports</span>
                  {salesReportsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-8 pt-1">
                  {salesReportsItems.map((item) => {
                    const isLinkActive =
                      location.pathname === "/sales-reports" &&
                        location.search === item.href.split("?")[1]
                        ? "?" + item.href.split("?")[1]
                        : "";

                    // Better check: Exact match of full path + search
                    const isActive =
                      location.pathname + location.search === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          pathname + window.location.search === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}

            {(hasPermission("user.view") ||
              hasPermission("role.view") ||
              hasPermission("permission.view")) && (
                <Collapsible open={rolesOpen} onOpenChange={setRolesOpen}>
                  <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Shield className="h-5 w-5" />
                    <span className="flex-1 text-left">Roles & Permissions</span>
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
                          return hasPermission("user.view");
                        // Show "Manage Roles" only if user has role.view
                        if (item.href === "/roles")
                          return hasPermission("role.view");
                        // Show "Manage Permissions" only if user has permission.view
                        if (item.href === "/permissions")
                          return hasPermission("permission.view");
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
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

            {(hasPermission("expense_category.view") ||
              hasPermission("expense.view")) && (
                <Collapsible open={othersOpen} onOpenChange={setOthersOpen}>
                  <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <ClipboardList className="h-5 w-5" />
                    <span className="flex-1 text-left">Others</span>
                    {othersOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-8 pt-1">
                    {othersItems
                      .filter((item) => {
                        if (item.href === "/expense-categories")
                          return hasPermission("expense_category.view");
                        if (item.href === "/expenses")
                          return hasPermission("expense.view");
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
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
