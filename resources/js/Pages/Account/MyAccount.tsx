import { useState } from "react";
import { Link, router, useForm } from "@inertiajs/react";
import {
    User,
    Lock,
    MapPin,
    Package,
    Heart,
    LogOut,
    ChevronRight,
    Edit3,
    ShieldCheck,
    Bell,
    ArrowRight,
    Home,
    Phone,
    AlertCircle,
} from "lucide-react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

interface OrderItem {
    // Define properties for an order item if needed, e.g.,
    // id: number;
    // product_name: string;
    // quantity: number;
    // price: number;
}

interface Order {
    id: number;
    status: string;
    payment_status: string;
    cancel_reason: string | null;
    cancelled_by: number | null;
    canceller: any | null;
    items: OrderItem[];
    // Add other order properties as they exist in your application
}

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string | null;
            phone: string | null;
        };
    };
    orders: Order[]; // Changed from any[] to Order[]
    addresses: any[];
    has_password: boolean;
}

const MENU_ITEMS = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "password", label: "Change Password", icon: Lock },
    { id: "address", label: "Address Book", icon: MapPin },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart, href: "/wishlist" },
];

export default function MyAccount(props: Props) {
    const { auth, orders = [], addresses = [], has_password } = props;
    const [activeSection, setActiveSection] = useState("orders");
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const { logout } = useAuth();
    const { toast } = useToast();
    const user = auth.user;

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "delivered":
            case "completed":
                return "bg-green-100 text-green-700 border-green-200";
            case "shipped":
            case "processing":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "pending":
                return "bg-orange-100 text-orange-700 border-orange-200";
            case "cancelled":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-muted/80 text-card-foreground border-border";
        }
    };

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    const profileForm = useForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
    });

    const passwordForm = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const addressForm = useForm({
        type: "shipping",
        full_name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        area: "",
        postal_code: "",
        is_default: false,
    });

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAddress) {
            addressForm.patch(
                route("account.addresses.update", editingAddress.id),
                {
                    onSuccess: () => {
                        setIsAddressModalOpen(false);
                        setEditingAddress(null);
                        addressForm.reset();
                        toast({ title: "Address updated!" });
                    },
                },
            );
        } else {
            addressForm.post(route("account.addresses.store"), {
                onSuccess: () => {
                    setIsAddressModalOpen(false);
                    addressForm.reset();
                    toast({ title: "Address added!" });
                },
            });
        }
    };

    const handleDeleteAddress = (id: number) => {
        if (confirm("Are you sure you want to delete this address?")) {
            router.delete(route("account.addresses.delete", id), {
                onSuccess: () => toast({ title: "Address deleted!" }),
            });
        }
    };

    const openEditModal = (address: any) => {
        setEditingAddress(address);
        addressForm.setData({
            type: address.type,
            full_name: address.full_name,
            phone: address.phone,
            email: address.email || "",
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2 || "",
            city: address.city,
            area: address.area || "",
            postal_code: address.postal_code || "",
            is_default: address.is_default,
        });
        setIsAddressModalOpen(true);
    };

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch(route("account.profile.update"), {
            onSuccess: () =>
                toast({
                    title: "Profile updated!",
                    description: "Your information has been saved.",
                }),
            onError: () =>
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not update profile.",
                }),
        });
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(route("account.password.update"), {
            onSuccess: () => {
                toast({
                    title: "Password changed!",
                    description: "Your password has been updated.",
                });
                passwordForm.reset();
            },
            onError: () =>
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not update password.",
                }),
        });
    };

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(
        null,
    );
    const [cancelReason, setCancelReason] = useState("");

    const handleLogout = () => {
        router.post(route("logout"));
    };

    const handleCancelOrder = (orderId: number) => {
        setCancellingOrderId(orderId);
        setCancelModalOpen(true);
    };

    const submitCancellation = () => {
        if (!cancelReason.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please provide a reason for cancellation.",
            });
            return;
        }

        router.post(
            route("account.orders.cancel", cancellingOrderId!),
            {
                reason: cancelReason,
            },
            {
                onSuccess: () => {
                    setCancelModalOpen(false);
                    setCancelReason("");
                    toast({
                        title: "Success",
                        description: "Order cancelled successfully.",
                    });
                },
                onError: (errors) => {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: errors.reason || "Could not cancel order.",
                    });
                },
            },
        );
    };

    return (
        <ShopLayout>
            <div className="min-h-screen bg-muted py-8 px-4 md:px-8">
                {/* Breadcrumb */}
                <div className="max-w-7xl mx-auto mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link
                        href="/"
                        className="hover:text-primary transition-colors"
                    >
                        <Home className="h-4 w-4" />
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="font-semibold text-foreground">
                        My Account
                    </span>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
                    {/* ── Sidebar ── */}
                    <aside className="space-y-4">
                        {/* Profile Card */}
                        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border text-center">
                            <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-primary/20">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-black">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="font-black text-lg text-foreground">
                                {user.name}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {user.email || user.phone}
                            </p>
                            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100">
                                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-xs font-bold text-green-600">
                                    Verified Account
                                </span>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                            {MENU_ITEMS.map((item, idx) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;

                                if (item.href) {
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-5 py-4 group transition-all ${
                                                idx !== 0
                                                    ? "border-t border-gray-50"
                                                    : ""
                                            } hover:bg-orange-50`}
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-muted/80 group-hover:bg-card flex items-center justify-center transition-colors">
                                                <Icon className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <span className="font-bold text-sm text-card-foreground group-hover:text-primary transition-colors">
                                                {item.label}
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                                        </Link>
                                    );
                                }

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() =>
                                            setActiveSection(item.id)
                                        }
                                        className={`w-full flex items-center gap-3 px-5 py-4 group transition-all ${
                                            idx !== 0
                                                ? "border-t border-gray-50"
                                                : ""
                                        } ${isActive ? "bg-orange-50" : "hover:bg-orange-50"}`}
                                    >
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                                isActive
                                                    ? "bg-primary"
                                                    : "bg-muted/80 group-hover:bg-card"
                                            }`}
                                        >
                                            <Icon
                                                className={`h-[18px] w-[18px] transition-colors ${
                                                    isActive
                                                        ? "text-white"
                                                        : "text-muted-foreground group-hover:text-primary"
                                                }`}
                                            />
                                        </div>
                                        <span
                                            className={`font-bold text-sm transition-colors ${
                                                isActive
                                                    ? "text-primary"
                                                    : "text-card-foreground group-hover:text-primary"
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                        <ChevronRight
                                            className={`h-4 w-4 ml-auto transition-colors ${
                                                isActive
                                                    ? "text-primary"
                                                    : "text-muted-foreground group-hover:text-primary"
                                            }`}
                                        />
                                    </button>
                                );
                            })}

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-5 py-4 border-t border-gray-50 group hover:bg-red-50 transition-all"
                            >
                                <div className="w-9 h-9 rounded-xl bg-muted/80 group-hover:bg-card flex items-center justify-center transition-colors">
                                    <LogOut className="h-[18px] w-[18px] text-muted-foreground group-hover:text-red-500 transition-colors" />
                                </div>
                                <span className="font-bold text-sm text-card-foreground group-hover:text-red-500 transition-colors">
                                    Logout
                                </span>
                            </button>
                        </nav>
                    </aside>

                    {/* ── Main Content ── */}
                    <main>
                        {/* Profile Information */}
                        {activeSection === "profile" && (
                            <div className="bg-card rounded-3xl shadow-sm border border-border p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-foreground uppercase italic">
                                            Profile Information
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Update your personal details
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                        <Edit3 className="h-5 w-5 text-primary" />
                                    </div>
                                </div>

                                <form
                                    onSubmit={handleProfileUpdate}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                Full Name
                                            </Label>
                                            <Input
                                                value={profileForm.data.name}
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-12 rounded-xl border-border focus:border-primary focus:ring-[#FF4E00]/20 font-semibold"
                                                placeholder="Your name"
                                            />
                                            {profileForm.errors.name && (
                                                <p className="text-xs text-red-500">
                                                    {profileForm.errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                Email Address
                                            </Label>
                                            <Input
                                                type="email"
                                                value={profileForm.data.email}
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        "email",
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-12 rounded-xl border-border focus:border-primary focus:ring-[#FF4E00]/20 font-semibold"
                                                placeholder="you@email.com"
                                            />
                                            {profileForm.errors.email && (
                                                <p className="text-xs text-red-500">
                                                    {profileForm.errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                Phone Number
                                            </Label>
                                            <Input
                                                value={profileForm.data.phone}
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        "phone",
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-12 rounded-xl border-border focus:border-primary focus:ring-[#FF4E00]/20 font-semibold"
                                                placeholder="01XXXXXXXXX"
                                            />
                                            {profileForm.errors.phone && (
                                                <p className="text-xs text-red-500">
                                                    {profileForm.errors.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={profileForm.processing}
                                            className="h-12 px-8 bg-primary hover:bg-black text-white rounded-xl font-black gap-2 transition-all"
                                        >
                                            Save Changes{" "}
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Password Section */}
                        {activeSection === "password" && (
                            <div className="bg-card rounded-3xl shadow-sm border border-border p-8">
                                <div className="mb-8">
                                    <h3 className="text-xl font-black text-foreground uppercase italic">
                                        {has_password
                                            ? "Change Password"
                                            : "Set Password"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {has_password
                                            ? "Update your password to keep your account secure"
                                            : "Create a password for your account to login without OTP"}
                                    </p>
                                </div>

                                <form
                                    onSubmit={handlePasswordUpdate}
                                    className="space-y-6 max-w-md"
                                >
                                    {has_password && (
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="current_password"
                                                className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                                            >
                                                Current Password
                                            </Label>
                                            <Input
                                                id="current_password"
                                                type="password"
                                                className="h-12 border-border rounded-xl focus:ring-[#FF4E00] focus:border-primary"
                                                value={
                                                    passwordForm.data
                                                        .current_password
                                                }
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        "current_password",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="password"
                                            className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                                        >
                                            New Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            className="h-12 border-border rounded-xl focus:ring-[#FF4E00] focus:border-primary"
                                            value={passwordForm.data.password}
                                            onChange={(e) =>
                                                passwordForm.setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                                        >
                                            Confirm New Password
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            className="h-12 border-border rounded-xl focus:ring-[#FF4E00] focus:border-primary"
                                            value={
                                                passwordForm.data
                                                    .password_confirmation
                                            }
                                            onChange={(e) =>
                                                passwordForm.setData(
                                                    "password_confirmation",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <Button
                                        disabled={passwordForm.processing}
                                        className="w-full h-12 bg-black hover:bg-primary text-white rounded-xl font-black transition-all"
                                    >
                                        {has_password
                                            ? "Update Password"
                                            : "Set Password"}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Address Book */}
                        {activeSection === "address" && (
                            <div className="bg-card rounded-3xl shadow-sm border border-border p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-foreground uppercase italic">
                                            Address Book
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Manage your delivery addresses
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setEditingAddress(null);
                                            addressForm.reset();
                                            setIsAddressModalOpen(true);
                                        }}
                                        className="h-10 px-5 bg-primary hover:bg-black text-white rounded-xl font-black gap-2 transition-all text-sm"
                                    >
                                        + Add New Address
                                    </Button>
                                </div>

                                {addresses.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-muted/80 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                            <MapPin className="h-9 w-9 text-muted-foreground" />
                                        </div>
                                        <h4 className="font-black text-foreground text-lg">
                                            No addresses saved
                                        </h4>
                                        <p className="text-muted-foreground text-sm mt-2">
                                            Save your addresses for a faster
                                            checkout.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((address) => (
                                            <div
                                                key={address.id}
                                                className={`p-6 rounded-[2rem] border-2 transition-all ${
                                                    address.is_default
                                                        ? "border-primary bg-orange-50/30"
                                                        : "border-gray-50 hover:border-border bg-muted/30"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                            address.is_default
                                                                ? "bg-primary text-white"
                                                                : "bg-muted/80 text-muted-foreground"
                                                        }`}
                                                    >
                                                        {address.type}{" "}
                                                        {address.is_default &&
                                                            "(Default)"}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    address,
                                                                )
                                                            }
                                                            className="p-2 bg-card rounded-lg hover:text-primary transition-colors shadow-sm"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteAddress(
                                                                    address.id,
                                                                )
                                                            }
                                                            className="p-2 bg-card rounded-lg hover:text-red-500 transition-colors shadow-sm"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h4 className="font-black text-foreground text-sm italic uppercase mb-2">
                                                    {address.full_name}
                                                </h4>
                                                <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-3 italic">
                                                    {address.address_line_1}
                                                    <br />
                                                    {address.address_line_2 && (
                                                        <>
                                                            {
                                                                address.address_line_2
                                                            }
                                                            <br />
                                                        </>
                                                    )}
                                                    {address.city},{" "}
                                                    {address.area && (
                                                        <>{address.area}, </>
                                                    )}
                                                    {address.postal_code}
                                                </p>
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground italic">
                                                    <Phone className="h-3 w-3 text-primary" />{" "}
                                                    {address.phone}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Orders */}
                        {activeSection === "orders" && (
                            <div className="bg-card rounded-3xl shadow-sm border border-border p-6 md:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-foreground uppercase italic">
                                            My Orders
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Track and manage your orders
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-muted/80 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                            <Package className="h-9 w-9 text-muted-foreground" />
                                        </div>
                                        <h4 className="font-black text-foreground text-lg">
                                            No orders yet
                                        </h4>
                                        <p className="text-muted-foreground text-sm mt-2">
                                            Your order history will appear here.
                                        </p>
                                        <Link href="/">
                                            <Button className="mt-6 h-12 px-8 bg-primary hover:bg-black text-white rounded-xl font-black gap-2 transition-all">
                                                Start Shopping{" "}
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="group border border-border rounded-[2rem] p-5 md:p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-orange-50/50 transition-all duration-300"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <Link
                                                        href={route(
                                                            "account.orders.show",
                                                            order.id,
                                                        )}
                                                        className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                                                    >
                                                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-colors italic">
                                                            #
                                                            {order.order_number.slice(
                                                                -4,
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-foreground text-sm uppercase tracking-tight">
                                                                Order{" "}
                                                                {
                                                                    order.order_number
                                                                }
                                                            </h4>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                                {new Date(
                                                                    order.created_at,
                                                                ).toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    },
                                                                )}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                                Total
                                                            </p>
                                                            <p className="text-lg font-black text-foreground">
                                                                ৳
                                                                {parseFloat(
                                                                    order.total_amount,
                                                                ).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {order.status.toLowerCase() ===
                                                    "cancelled" &&
                                                    order.cancel_reason && (
                                                        <div className="mb-4 px-4 py-3 bg-red-50/50 border border-red-100/50 rounded-2xl flex items-center gap-3">
                                                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                                            <p className="text-[11px] font-medium text-red-700 leading-tight">
                                                                <span className="font-black uppercase italic mr-1 text-[10px]">
                                                                    Cancelled
                                                                    {order.canceller
                                                                        ? ` by ${order.canceller.name}`
                                                                        : ""}
                                                                    :
                                                                </span>
                                                                {
                                                                    order.cancel_reason
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                <Link
                                                    href={route(
                                                        "account.orders.show",
                                                        order.id,
                                                    )}
                                                    className="bg-muted/50 rounded-2xl p-4 flex flex-wrap gap-4 items-center hover:bg-muted transition-all active:scale-[0.99] w-full"
                                                >
                                                    <div className="flex -space-x-3 overflow-hidden">
                                                        {order.items
                                                            .slice(0, 3)
                                                            .map(
                                                                (
                                                                    item: any,
                                                                    i: number,
                                                                ) => (
                                                                    <div
                                                                        key={i}
                                                                        className="inline-block h-10 w-10 rounded-xl ring-2 ring-white bg-card overflow-hidden border border-border shadow-sm"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                (item.product?.primary_image?.image_path || item.image)
                                                                                    ? (item.product?.primary_image?.image_path || item.image).startsWith("http") || (item.product?.primary_image?.image_path || item.image).startsWith("/storage/")
                                                                                        ? (item.product?.primary_image?.image_path || item.image)
                                                                                        : `/storage/${(item.product?.primary_image?.image_path || item.image)}`
                                                                                    : `https://placehold.co/100x100?text=${item.product_name[0]}`
                                                                            }
                                                                            alt={
                                                                                item.product_name
                                                                            }
                                                                            className="h-full w-full object-contain p-1"
                                                                        />
                                                                    </div>
                                                                ),
                                                            )}
                                                        {order.items.length >
                                                            3 && (
                                                            <div className="flex items-center justify-center h-10 w-10 rounded-xl ring-2 ring-white bg-primary text-white text-[10px] font-black">
                                                                +
                                                                {order.items
                                                                    .length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-bold text-muted-foreground">
                                                        {order.items
                                                            .map(
                                                                (it: any) =>
                                                                    it.product_name,
                                                            )
                                                            .join(", ")
                                                            .slice(0, 60)}
                                                        {order.items
                                                            .map(
                                                                (it: any) =>
                                                                    it.product_name,
                                                            )
                                                            .join(", ").length >
                                                        60
                                                            ? "..."
                                                            : ""}
                                                    </p>
                                                </Link>
                                                <div className="ml-auto flex items-center gap-3">
                                                        {order.status.toLowerCase() ===
                                                            "pending" && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleCancelOrder(
                                                                        order.id,
                                                                    )
                                                                }
                                                                className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-[10px] uppercase tracking-wider transition-all"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        )}
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            className="text-xs font-black text-primary hover:text-black hover:bg-transparent group/btn p-0"
                                                        >
                                                            <Link
                                                                href={route(
                                                                    "account.orders.show",
                                                                    order.id,
                                                                )}
                                                                className="flex items-center gap-1"
                                                            >
                                                                VIEW DETAILS{" "}
                                                                <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover/btn:translate-x-1" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Address Modal */}
            <Dialog
                open={isAddressModalOpen}
                onOpenChange={setIsAddressModalOpen}
            >
                <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-muted/50">
                        <DialogTitle className="text-2xl font-black italic uppercase italic">
                            {editingAddress ? "Edit" : "Add"}{" "}
                            <span className="text-primary">Address</span>
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={handleAddressSubmit}
                        className="p-8 space-y-5"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Address Type
                                </Label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl border border-border focus:ring-2 focus:ring-[#FF4E00]/20 focus:border-primary outline-none font-bold text-sm bg-card"
                                    value={addressForm.data.type}
                                    onChange={(e) =>
                                        addressForm.setData(
                                            "type",
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="home">Home</option>
                                    <option value="office">Office</option>
                                    <option value="shipping">Shipping</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Full Name
                                </Label>
                                <Input
                                    className="h-12 rounded-xl"
                                    value={addressForm.data.full_name}
                                    onChange={(e) =>
                                        addressForm.setData(
                                            "full_name",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Phone
                                </Label>
                                <Input
                                    className="h-12 rounded-xl"
                                    value={addressForm.data.phone}
                                    onChange={(e) =>
                                        addressForm.setData(
                                            "phone",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Email (Optional)
                                </Label>
                                <Input
                                    className="h-12 rounded-xl"
                                    type="email"
                                    value={addressForm.data.email}
                                    onChange={(e) =>
                                        addressForm.setData(
                                            "email",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Address Line 1
                            </Label>
                            <Input
                                className="h-12 rounded-xl"
                                value={addressForm.data.address_line_1}
                                onChange={(e) =>
                                    addressForm.setData(
                                        "address_line_1",
                                        e.target.value,
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    City
                                </Label>
                                <Input
                                    className="h-12 rounded-xl"
                                    value={addressForm.data.city}
                                    onChange={(e) =>
                                        addressForm.setData(
                                            "city",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Postal Code
                                </Label>
                                <Input
                                    className="h-12 rounded-xl"
                                    value={addressForm.data.postal_code}
                                    onChange={(e) =>
                                        addressForm.setData(
                                            "postal_code",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_default"
                                className="w-4 h-4 rounded border-border text-primary focus:ring-[#FF4E00]"
                                checked={addressForm.data.is_default}
                                onChange={(e) =>
                                    addressForm.setData(
                                        "is_default",
                                        e.target.checked,
                                    )
                                }
                            />
                            <Label
                                htmlFor="is_default"
                                className="text-xs font-bold text-muted-foreground cursor-pointer"
                            >
                                Set as default address
                            </Label>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border flex-row gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsAddressModalOpen(false)}
                                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={addressForm.processing}
                                className="flex-1 h-12 bg-black hover:bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all"
                            >
                                {editingAddress ? "Update" : "Save"} Address
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic uppercase">
                            Cancel <span className="text-primary">Order</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label
                            htmlFor="reason"
                            className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block"
                        >
                            Reason for Cancellation
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Please tell us why you want to cancel..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="h-32 rounded-2xl border-border focus:border-primary focus:ring-[#FF4E00]/10 transition-all font-medium text-sm"
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setCancelModalOpen(false)}
                            className="font-bold text-xs uppercase tracking-widest rounded-xl h-12"
                        >
                            Wait, Keep it
                        </Button>
                        <Button
                            onClick={submitCancellation}
                            className="bg-black hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl h-12 transition-all px-8"
                        >
                            Cancel Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ShopLayout>
    );
}
