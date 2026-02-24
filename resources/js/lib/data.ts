import {
    LayoutDashboard,
    Users,
    UserCog,
    Package,
    ShoppingCart,
    TrendingUp,
    Building2,
    Tag,
    FolderTree,
    Briefcase,
} from "lucide-react";

// ==========================================
// Types & Interfaces
// ==========================================

export interface Customer {
    id: number;
    name: string;
    proprietorName?: string;
    phone?: string;
    address?: string;
    employeeId?: number;
    employeeName: string;
    status?: "active" | "inactive";
    image?: string;
}

export interface Product {
    id: number;
    categoryId?: number;
    brandId?: number;
    name: string;
    packSize: string;
    purchasePrice?: number;
    salePrice: number;
    flatPrice: number;
    quantity?: number;
    expirationDate?: Date | null;
    image?: string;
    priceType?: "tp" | "flat";
}

// ... more interfaces can be added as needed

export const navigationItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Employees", href: "/employees", icon: UserCog },
    { name: "Designations", href: "/designations", icon: Briefcase },  
    { name: "Suppliers", href: "/suppliers", icon: Building2 },
    { name: "Brands", href: "/brands", icon: Tag },
    { name: "Categories", href: "/categories", icon: FolderTree },
    { name: "Products", href: "/products", icon: Package },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Sales", href: "/sales", icon: TrendingUp },
];

export const salesReportsItems = [
    { name: "Customer Report", href: "/sales-reports?view=customer" },
    { name: "Category Report", href: "/sales-reports?view=category" },
    { name: "Product Report", href: "/sales-reports?view=product" },
    { name: "Cash Sale Report", href: "/sales-reports?view=cash" },
    { name: "Credit Sale Report", href: "/sales-reports?view=credit" },
    { name: "Sales Reports", href: "/sales-reports?view=reports" },
];
