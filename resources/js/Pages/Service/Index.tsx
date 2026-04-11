import { Head, Link } from "@inertiajs/react";
import { 
    Briefcase, 
    Plus, 
    Search, 
    FileText, 
    User, 
    UserCog,
    Calendar,
    BadgeCheck,
    ArrowRight,
    Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { DashboardLayout } from "@/Layouts/DashboardLayout";

interface ServiceOrder {
    id: number;
    order_number: string;
    customer_name: string;
    service_type: string;
    total_amount: number;
    status: string;
    order_date: string;
    technician?: { name: string };
    creator?: { name: string };
}

interface PageProps {
    services: {
        data: ServiceOrder[];
        links: any[];
    };
}

export default function ServiceIndex({ services }: PageProps) {
    return (
        <DashboardLayout>
            <Head title="Service Management | SalesHub" />
            <div className="max-w-7xl mx-auto space-y-6">
                        
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                                    <Briefcase className="h-8 w-8 text-primary" />
                                    Service Invoices
                                </h1>
                                <p className="text-muted-foreground mt-1 font-medium">
                                    Manage maintenance, repairs, and service bookings.
                                </p>
                            </div>
                            <Button asChild className="rounded-xl px-6 h-12 shadow-xl shadow-primary/20 bg-primary hover:bg-black text-white font-bold transition-all duration-300">
                                <Link href="/services/create">
                                    <Plus className="h-5 w-5 mr-2" />
                                    New Service Invoice
                                </Link>
                            </Button>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card className="border-none shadow-sm bg-indigo-50/50">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <BadgeCheck className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-widest text-indigo-600/60">Total Services</p>
                                        <p className="text-2xl font-black text-indigo-900">{services.data.length}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* more stats can be added here */}
                        </div>

                        {/* Search & Filter */}
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="bg-card px-6 py-4 border-b border-border">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1 group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input 
                                            placeholder="Search by Invoice # or Customer..." 
                                            className="pl-10 h-11 bg-muted/50 border-transparent focus:bg-card focus:border-primary rounded-xl transition-all"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6">Invoice #</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Customer</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Service Type</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Technician</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Amount</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Date</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-right pr-6">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {services.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground italic font-medium">
                                                    No service invoices found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            services.data.map((order) => (
                                                <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors cursor-pointer">
                                                    <TableCell className="pl-6">
                                                        <span className="font-black text-sm text-primary tracking-tight">{order.order_number}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-black">
                                                                {order.customer_name[0]}
                                                            </div>
                                                            <span className="font-bold text-sm">{order.customer_name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="rounded-md font-bold text-[10px] uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
                                                            {order.service_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <UserCog className="h-3.5 w-3.5" />
                                                            <span className="text-xs font-bold">{order.technician?.name || 'N/A'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-black text-sm">৳{Number(order.total_amount).toLocaleString()}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="text-xs font-bold text-muted-foreground">
                                                            {new Date(order.order_date).toLocaleDateString()}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                                                            <a href={`/services/${order.id}/invoice`} target="_blank">
                                                                <Printer className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
        </DashboardLayout>
    );
}
