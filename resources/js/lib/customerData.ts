// ==========================================
// Customer Types & Interfaces
// ==========================================

export interface CustomerSettings {
    allowCredit: boolean;
    creditLimit: number;
    maxCreditDays: number;
    discountTier: "none" | "silver" | "gold" | "platinum";
    notificationsEnabled: boolean;
    preferredPaymentMethod: "cash" | "credit" | "bank_transfer" | "cheque";
}

export interface CustomerContact {
    phone: string;
    email: string;
    whatsapp?: string;
    alternativePhone?: string;
}

export interface CustomerAddress {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface Customer {
    id: number;
    name: string;
    proprietorName: string;
    // Contact Info
    contact: CustomerContact;
    // Address Info
    address: CustomerAddress;
    // System Info
    employeeId: number | null;
    employeeName: string;
    status: "active" | "inactive" | "blocked";
    joinDate: string;
    image?: string;
    // Configuration
    settings: CustomerSettings;
    // Metrics (readonly)
    totalOrders: number;
    totalSpent: number;
    outstandingBalance: number;
    // Additional Props
    creditLimit?: number;
}

// ==========================================
// Mock Customer Data
// ==========================================

export const mockCustomers: Customer[] = [
    {
        id: 1,
        name: "Acme Corp",
        proprietorName: "John Doe",
        contact: {
            phone: "+1234567890",
            email: "contact@acmecorp.com",
            whatsapp: "+1234567890",
        },
        address: {
            street: "123 Business St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
        },
        employeeId: 1,
        employeeName: "Sarah Johnson",
        status: "active",
        joinDate: "2023-01-15",
        settings: {
            allowCredit: true,
            creditLimit: 50000,
            maxCreditDays: 30,
            discountTier: "gold",
            notificationsEnabled: true,
            preferredPaymentMethod: "bank_transfer",
        },
        totalOrders: 156,
        totalSpent: 450000,
        outstandingBalance: 12500,
    },
    {
        id: 2,
        name: "TechStart Inc",
        proprietorName: "Jane Smith",
        contact: {
            phone: "+1987654321",
            email: "procurement@techstart.io",
        },
        address: {
            street: "456 Innovation Dr",
            city: "San Francisco",
            state: "CA",
            zipCode: "94105",
            country: "USA",
        },
        employeeId: 2,
        employeeName: "Mike Davis",
        status: "active",
        joinDate: "2023-03-22",
        settings: {
            allowCredit: true,
            creditLimit: 100000,
            maxCreditDays: 45,
            discountTier: "platinum",
            notificationsEnabled: true,
            preferredPaymentMethod: "credit",
        },
        totalOrders: 89,
        totalSpent: 890000,
        outstandingBalance: 0,
    },
    // ... truncated for brevity in this step, I'll add more if needed later
];
