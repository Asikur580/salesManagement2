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
} from "lucide-react";
import { ShopLayout } from "@/Layouts/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string | null;
            phone: string | null;
        };
    };
}

const MENU_ITEMS = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "password", label: "Change Password", icon: Lock },
    { id: "address", label: "Address Book", icon: MapPin },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart, href: "/wishlist" },
];

export default function MyAccount({ auth }: Props) {
    const [activeSection, setActiveSection] = useState("profile");
    const { logout } = useAuth();
    const { toast } = useToast();
    const user = auth.user;

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

    const handleLogout = () => {
        router.post(route("logout"));
    };

    return (
        <ShopLayout>
            <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
                {/* Breadcrumb */}
                <div className="max-w-6xl mx-auto mb-6 flex items-center gap-2 text-sm text-gray-500">
                    <Link
                        href="/"
                        className="hover:text-[#FF4E00] transition-colors"
                    >
                        <Home className="h-4 w-4" />
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="font-semibold text-gray-900">
                        My Account
                    </span>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
                    {/* ── Sidebar ── */}
                    <aside className="space-y-4">
                        {/* Profile Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
                            <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-orange-100">
                                <AvatarFallback className="bg-gradient-to-br from-[#FF4E00] to-orange-400 text-white text-2xl font-black">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="font-black text-lg text-gray-900">
                                {user.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
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
                        <nav className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
                                            <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors">
                                                <Icon className="h-4.5 w-4.5 text-gray-500 group-hover:text-[#FF4E00] transition-colors" />
                                            </div>
                                            <span className="font-bold text-sm text-gray-700 group-hover:text-[#FF4E00] transition-colors">
                                                {item.label}
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-[#FF4E00] transition-colors" />
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
                                                    ? "bg-[#FF4E00]"
                                                    : "bg-gray-100 group-hover:bg-white"
                                            }`}
                                        >
                                            <Icon
                                                className={`h-[18px] w-[18px] transition-colors ${
                                                    isActive
                                                        ? "text-white"
                                                        : "text-gray-500 group-hover:text-[#FF4E00]"
                                                }`}
                                            />
                                        </div>
                                        <span
                                            className={`font-bold text-sm transition-colors ${
                                                isActive
                                                    ? "text-[#FF4E00]"
                                                    : "text-gray-700 group-hover:text-[#FF4E00]"
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                        <ChevronRight
                                            className={`h-4 w-4 ml-auto transition-colors ${
                                                isActive
                                                    ? "text-[#FF4E00]"
                                                    : "text-gray-300 group-hover:text-[#FF4E00]"
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
                                <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors">
                                    <LogOut className="h-[18px] w-[18px] text-gray-500 group-hover:text-red-500 transition-colors" />
                                </div>
                                <span className="font-bold text-sm text-gray-700 group-hover:text-red-500 transition-colors">
                                    Logout
                                </span>
                            </button>
                        </nav>
                    </aside>

                    {/* ── Main Content ── */}
                    <main>
                        {/* Profile Information */}
                        {activeSection === "profile" && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase italic">
                                            Profile Information
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Update your personal details
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                        <Edit3 className="h-5 w-5 text-[#FF4E00]" />
                                    </div>
                                </div>

                                <form
                                    onSubmit={handleProfileUpdate}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
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
                                                className="h-12 rounded-xl border-gray-200 focus:border-[#FF4E00] focus:ring-[#FF4E00]/20 font-semibold"
                                                placeholder="Your name"
                                            />
                                            {profileForm.errors.name && (
                                                <p className="text-xs text-red-500">
                                                    {profileForm.errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
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
                                                className="h-12 rounded-xl border-gray-200 focus:border-[#FF4E00] focus:ring-[#FF4E00]/20 font-semibold"
                                                placeholder="you@email.com"
                                            />
                                            {profileForm.errors.email && (
                                                <p className="text-xs text-red-500">
                                                    {profileForm.errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
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
                                                className="h-12 rounded-xl border-gray-200 focus:border-[#FF4E00] focus:ring-[#FF4E00]/20 font-semibold"
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
                                            className="h-12 px-8 bg-[#FF4E00] hover:bg-black text-white rounded-xl font-black gap-2 transition-all"
                                        >
                                            Save Changes{" "}
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Change Password */}
                        {activeSection === "password" && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase italic">
                                            Change Password
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Keep your account secure
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                        <Lock className="h-5 w-5 text-[#FF4E00]" />
                                    </div>
                                </div>

                                <form
                                    onSubmit={handlePasswordUpdate}
                                    className="space-y-6 max-w-md"
                                >
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                                            Current Password
                                        </Label>
                                        <Input
                                            type="password"
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
                                            className="h-12 rounded-xl border-gray-200 focus:border-[#FF4E00] focus:ring-[#FF4E00]/20 font-semibold"
                                        />
                                        {passwordForm.errors
                                            .current_password && (
                                            <p className="text-xs text-red-500">
                                                {
                                                    passwordForm.errors
                                                        .current_password
                                                }
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                                            New Password
                                        </Label>
                                        <Input
                                            type="password"
                                            value={passwordForm.data.password}
                                            onChange={(e) =>
                                                passwordForm.setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200 focus:border-[#FF4E00] focus:ring-[#FF4E00]/20 font-semibold"
                                        />
                                        {passwordForm.errors.password && (
                                            <p className="text-xs text-red-500">
                                                {passwordForm.errors.password}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                                            Confirm New Password
                                        </Label>
                                        <Input
                                            type="password"
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
                                            className="h-12 rounded-xl border-gray-200 focus:border-[#FF4E00] focus:ring-[#FF4E00]/20 font-semibold"
                                        />
                                    </div>
                                    <Separator />
                                    <Button
                                        type="submit"
                                        disabled={passwordForm.processing}
                                        className="h-12 px-8 bg-[#FF4E00] hover:bg-black text-white rounded-xl font-black gap-2 transition-all"
                                    >
                                        Update Password{" "}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Address Book */}
                        {activeSection === "address" && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase italic">
                                            Address Book
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Manage your delivery addresses
                                        </p>
                                    </div>
                                    <Button className="h-10 px-5 bg-[#FF4E00] hover:bg-black text-white rounded-xl font-black gap-2 transition-all text-sm">
                                        + Add New Address
                                    </Button>
                                </div>

                                {/* Empty State */}
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <MapPin className="h-9 w-9 text-gray-400" />
                                    </div>
                                    <h4 className="font-black text-gray-900 text-lg">
                                        No addresses saved
                                    </h4>
                                    <p className="text-gray-500 text-sm mt-2">
                                        Add a delivery address to speed up
                                        checkout.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* My Orders */}
                        {activeSection === "orders" && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase italic">
                                            My Orders
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Track and manage your orders
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-[#FF4E00]" />
                                    </div>
                                </div>

                                {/* Empty State */}
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <Package className="h-9 w-9 text-gray-400" />
                                    </div>
                                    <h4 className="font-black text-gray-900 text-lg">
                                        No orders yet
                                    </h4>
                                    <p className="text-gray-500 text-sm mt-2">
                                        Your order history will appear here.
                                    </p>
                                    <Link href="/">
                                        <Button className="mt-6 h-12 px-8 bg-[#FF4E00] hover:bg-black text-white rounded-xl font-black gap-2 transition-all">
                                            Start Shopping{" "}
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </ShopLayout>
    );
}
