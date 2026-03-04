import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Search,
    ShoppingCart,
    User,
    ChevronDown,
    ChevronRight,
    Menu,
    Headphones,
    X,
    Zap,
    Star,
    ShieldCheck,
    Clock,
    Car,
    Sparkles,
    Layers,
    Wind,
    Cpu,
    Droplets,
    Key,
    Activity,
    Lightbulb,
    Wrench,
    Shirt,
    Smartphone,
    ArrowRight,
    Loader2,
    Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { OTPLoginModal } from "@/components/shop/OTPLoginModal";

// ─── 3-Level Category Data ────────────────────────────────────────────────────
// ... (CATEGORIES constant remains the same, I will skip it in replace_file_content if possible but I'll include enough context)

// ─── 3-Level Category Data ────────────────────────────────────────────────────
// Categories are now fetched from Inertia shared props

// ─── Mega Dropdown ────────────────────────────────────────────────────────────
interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    children?: Category[];
}

function MegaDropdown({
    onClose,
    categories,
}: {
    onClose: () => void;
    categories: Category[];
}) {
    const [activeCategory, setActiveCategory] = useState<Category | null>(
        categories[0] || null,
    );
    const [activeSub, setActiveSub] = useState<Category | null>(null);

    const handleCategoryEnter = (cat: Category) => {
        setActiveCategory(cat);
        setActiveSub(null);
    };

    return (
        <div
            className="absolute left-0 top-full z-50 flex bg-white shadow-2xl border-t-2 border-[#FF4E00]"
            style={{ width: "900px", maxHeight: "520px" }}
            onMouseLeave={onClose}
        >
            {!activeCategory && (
                <div className="p-8 text-center w-full">No Categories</div>
            )}
            {/* Column 1: Main Categories */}
            <div className="w-[220px] shrink-0 bg-gray-50 border-r overflow-y-auto">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        onMouseEnter={() => handleCategoryEnter(cat)}
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all group ${
                            activeCategory?.id === cat.id
                                ? "bg-white border-l-4 border-[#FF4E00]"
                                : "hover:bg-white border-l-4 border-transparent"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <span
                                className={`transition-colors ${activeCategory?.id === cat.id ? "text-[#FF4E00]" : "text-gray-400 group-hover:text-[#FF4E00]"}`}
                            >
                                <Layers className="h-4 w-4" />
                            </span>
                            <span
                                className={`text-[13px] font-bold transition-colors ${activeCategory?.id === cat.id ? "text-[#FF4E00]" : "text-gray-700 group-hover:text-[#FF4E00]"}`}
                            >
                                {cat.name}
                            </span>
                        </div>
                        <ChevronRight
                            className={`h-3.5 w-3.5 shrink-0 transition-colors ${activeCategory?.id === cat.id ? "text-[#FF4E00]" : "text-gray-300"}`}
                        />
                    </div>
                ))}
            </div>

            {/* Column 2: Subcategories */}
            <div className="w-[230px] shrink-0 border-r overflow-y-auto bg-white">
                <div className="px-4 pt-4 pb-2 border-b">
                    <p className="text-[10px] font-black text-[#FF4E00] uppercase tracking-[0.25em]">
                        {activeCategory?.name}
                    </p>
                </div>
                {activeCategory?.children?.map((sub) => (
                    <div
                        key={sub.id}
                        onMouseEnter={() => setActiveSub(sub)}
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all group ${
                            activeSub?.id === sub.id
                                ? "bg-orange-50 border-l-4 border-[#FF4E00]"
                                : "hover:bg-gray-50 border-l-4 border-transparent"
                        }`}
                    >
                        <span
                            className={`text-[13px] font-bold transition-colors ${
                                activeSub?.id === sub.id
                                    ? "text-[#FF4E00]"
                                    : "text-gray-700 group-hover:text-[#FF4E00]"
                            }`}
                        >
                            {sub.name}
                        </span>
                        <ChevronRight
                            className={`h-3.5 w-3.5 shrink-0 ${activeSub?.id === sub.id ? "text-[#FF4E00]" : "text-gray-300"}`}
                        />
                    </div>
                ))}
            </div>

            {/* Column 3: Sub-subcategories */}
            <div className="flex-1 overflow-y-auto bg-white">
                {activeSub ? (
                    <div className="p-6">
                        <div className="mb-4 border-b pb-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                                {activeCategory?.name}
                            </p>
                            <p className="text-[15px] font-black text-[#FF4E00] mt-0.5">
                                {activeSub.name}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {activeSub.children?.map((child, i) => (
                                <Link
                                    key={child.id}
                                    href={route("shop.category", child.slug)}
                                    className="group flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#FF4E00] transition-all"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E00] group-hover:bg-white shrink-0 transition-colors" />
                                    <span className="text-[13px] font-bold text-gray-700 group-hover:text-white transition-colors">
                                        {child.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                        <Link
                            href={route("shop.category", activeSub.slug)}
                            className="mt-5 inline-flex items-center gap-1 text-[#FF4E00] font-black text-xs hover:underline"
                        >
                            View all in {activeSub.name}{" "}
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                ) : (
                    <div className="p-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4">
                            Hover a subcategory to explore →
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {activeCategory?.children?.map((sub, i) => (
                                <div
                                    key={sub.id}
                                    onMouseEnter={() => setActiveSub(sub)}
                                    className="group px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-[#FF4E00] hover:border-[#FF4E00] transition-all cursor-pointer"
                                >
                                    <p className="text-[13px] font-bold text-gray-700 group-hover:text-white transition-colors">
                                        {sub.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400 group-hover:text-white/80 transition-colors mt-0.5">
                                        {sub.children?.length || 0} items
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { usePage } from "@inertiajs/react";

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export function ShopNavbar() {
    const { categories } = usePage().props as any;
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMegaOpen, setIsMegaOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [loginRedirect, setLoginRedirect] = useState("/");

    /** Navigate if logged in, otherwise open OTP login modal */
    const handleAuthNav = (href: string) => {
        if (user) {
            router.visit(href);
        } else {
            setLoginRedirect(href);
            setLoginModalOpen(true);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.get(route("shop.search"), { q: query });
            setIsSearchOpen(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const isAdmin = user?.roles?.some((r: any) =>
        ["super-admin", "admin", "sales", "accountant"].includes(
            typeof r === "string" ? r : r.name,
        ),
    );

    return (
        <header className="w-full sticky top-0 z-50 shadow-md transition-all duration-300">
            {/* Main Orange Header */}
            <div className="bg-[#FF4E00] text-white py-3 px-4 md:px-6 lg:px-12 flex items-center justify-between gap-4 md:gap-8 lg:gap-12">
                {/* Mobile: Hamburger & Search */}
                <div className="flex items-center gap-3 lg:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                    >
                        <Search className="h-6 w-6" />
                    </button>
                </div>

                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 group shrink-0"
                >
                    <div className="w-8 h-8 md:w-10 md:h-10 border-[2.5px] border-white rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-[2px] border-white relative flex items-center justify-center">
                            <div className="w-[1.5px] h-full bg-white absolute" />
                            <div className="w-full h-[1.5px] bg-white absolute" />
                            <div className="w-2 h-2 rounded-full bg-white z-10" />
                        </div>
                    </div>
                    <span className="text-xl md:text-2xl lg:text-3xl font-black italic tracking-tighter">
                        CarMart
                    </span>
                </Link>

                {/* Search Bar (Desktop) */}
                <form
                    onSubmit={handleSearch}
                    className="hidden lg:flex flex-1 max-w-2xl relative items-center"
                >
                    <Input
                        type="search"
                        placeholder="Search products, categories..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-6 pr-4 h-11 border-0 focus-visible:ring-0 rounded-l-full text-gray-800 placeholder:text-gray-400 font-medium bg-white ring-0 focus:ring-0 focus-visible:outline-none shadow-none"
                    />
                    <button
                        type="submit"
                        className="h-11 px-7 bg-black text-white rounded-r-full hover:bg-gray-800 transition-colors flex items-center justify-center shrink-0"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                </form>

                {/* Actions */}
                <div className="flex items-center gap-4 md:gap-6 shrink-0">
                    {/* Wishlist – guarded */}
                    <button
                        onClick={() => handleAuthNav(route("wishlist.index"))}
                        className="hover:scale-110 transition-transform relative"
                    >
                        <Heart className="h-6 w-6 stroke-[2.5px]" />
                        {(usePage().props as any).wishlist_count > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-white text-[#FF4E00] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm">
                                {(usePage().props as any).wishlist_count}
                            </span>
                        )}
                    </button>

                    {/* Cart – guarded */}
                    <button
                        onClick={() => handleAuthNav(route("cart.index"))}
                        className="hover:scale-110 transition-transform relative"
                    >
                        <ShoppingCart className="h-6 w-6 stroke-[2.5px]" />
                        {(usePage().props as any).cart?.count > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-white text-[#FF4E00] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm">
                                {(usePage().props as any).cart.count}
                            </span>
                        )}
                    </button>

                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center group focus:outline-none">
                                    <Avatar className="h-9 w-9 border-2 border-white/20 group-hover:border-white/60 transition-colors cursor-pointer">
                                        <AvatarFallback className="bg-white text-[#FF4E00] font-black text-xs">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56 rounded-2xl p-2 shadow-2xl border-gray-100 mt-2"
                            >
                                <DropdownMenuLabel className="font-black text-gray-900 px-3 py-2">
                                    {user.name}
                                    <p className="text-xs font-medium text-gray-400 truncate">
                                        {user.email || user.phone}
                                    </p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => router.visit("/my-account")}
                                    className="flex items-center gap-2 cursor-pointer font-bold rounded-xl px-3 py-2 data-[highlighted]:bg-orange-50 data-[highlighted]:text-[#FF4E00]"
                                >
                                    <User className="h-4 w-4" /> My Account
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => router.visit("/wishlist")}
                                    className="flex items-center gap-2 cursor-pointer font-bold rounded-xl px-3 py-2 data-[highlighted]:bg-orange-50 data-[highlighted]:text-[#FF4E00]"
                                >
                                    <Heart className="h-4 w-4" /> Wishlist
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.visit("/dashboard")
                                        }
                                        className="flex items-center gap-2 cursor-pointer font-bold rounded-xl px-3 py-2 data-[highlighted]:bg-orange-50 data-[highlighted]:text-[#FF4E00]"
                                    >
                                        <Settings className="h-4 w-4" /> Admin
                                        Panel
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={logout}
                                    className="flex items-center gap-2 cursor-pointer font-bold rounded-xl px-3 py-2 hover:bg-red-50 hover:text-red-500 text-red-400"
                                >
                                    <LogOut className="h-4 w-4" /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {!user && (
                        <button
                            onClick={() => {
                                setLoginRedirect("/");
                                setLoginModalOpen(true);
                            }}
                            className="hover:scale-110 transition-transform"
                        >
                            <User className="h-6 w-6 stroke-[2.5px]" />
                        </button>
                    )}
                </div>
            </div>

            {/* Global OTP Login Modal */}
            <OTPLoginModal
                open={loginModalOpen}
                onOpenChange={setLoginModalOpen}
                onSuccess={() => router.visit(loginRedirect)}
            />

            {/* Mobile Search (Collapsible) */}
            {isSearchOpen && (
                <div className="lg:hidden bg-[#FF4E00] px-4 pb-3 animate-in slide-in-from-top duration-200">
                    <form onSubmit={handleSearch} className="flex items-center">
                        <Input
                            type="search"
                            placeholder="Search products..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-11 pl-5 border-0 focus-visible:ring-0 rounded-l-full text-gray-800 bg-white ring-0 focus:ring-0 focus-visible:outline-none shadow-none"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="h-11 px-5 bg-black text-white rounded-r-full"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            )}

            {/* Sub Navigation Bar (Desktop) */}
            <div className="hidden lg:flex bg-white border-b py-2 px-12 justify-between items-center shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative">
                <div className="flex items-center gap-10">
                    {/* All Categories trigger with Mega Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsMegaOpen(true)}
                        onMouseLeave={() => setIsMegaOpen(false)}
                    >
                        <button className="flex items-center gap-2 group py-1">
                            <Menu
                                className={`h-5 w-5 transition-colors ${isMegaOpen ? "text-[#FF4E00]" : "text-gray-600 group-hover:text-[#FF4E00]"}`}
                            />
                            <span
                                className={`text-[15px] font-black transition-colors ${isMegaOpen ? "text-[#FF4E00]" : "text-gray-800 group-hover:text-[#FF4E00]"}`}
                            >
                                All Categories
                            </span>
                            <ChevronDown
                                className={`h-4 w-4 transition-all duration-300 ${isMegaOpen ? "text-[#FF4E00] rotate-180" : "text-gray-400 group-hover:text-[#FF4E00]"}`}
                            />
                        </button>

                        {isMegaOpen && (
                            <MegaDropdown
                                onClose={() => setIsMegaOpen(false)}
                                categories={categories || []}
                            />
                        )}
                    </div>

                    <div className="h-4 w-[1px] bg-gray-200" />

                    <div className="flex items-center gap-6">
                        <Link
                            href={route("shop.all-brands")}
                            className="text-[14px] font-black text-gray-800 hover:text-[#FF4E00] transition-colors"
                        >
                            Brands
                        </Link>
                        <Link
                            href="/offers"
                            className="text-[14px] font-black text-gray-800 hover:text-[#FF4E00] transition-colors"
                        >
                            Offers
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <Link
                        href="/help"
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="bg-gray-100 p-1 rounded-full group-hover:bg-orange-50 transition-colors">
                            <Headphones className="h-4 w-4 text-gray-600 group-hover:text-[#FF4E00]" />
                        </div>
                        <span className="text-[14px] font-black text-gray-800 group-hover:text-[#FF4E00] transition-colors">
                            Help
                        </span>
                    </Link>
                    <button className="flex items-center gap-2 group">
                        <span className="text-[14px] font-black text-gray-800 group-hover:text-[#FF4E00] transition-colors">
                            Download App
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-[#FF4E00] group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-[100%] left-0 w-full bg-white shadow-xl animate-in slide-in-from-left duration-300 z-50 max-h-[80vh] overflow-y-auto">
                    <div className="flex flex-col">
                        <div className="px-4 py-3 bg-gray-50 border-b">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                All Categories
                            </p>
                            {categories?.map((cat: any) => (
                                <Link
                                    key={cat.id}
                                    href={route("shop.category", cat.slug)}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-[#FF4E00]">
                                        <Layers className="h-4 w-4" />
                                    </span>
                                    <span className="font-bold text-gray-800">
                                        {cat.name}
                                    </span>
                                    <span className="ml-auto text-xs text-gray-400">
                                        {cat.children?.length || 0} sub
                                    </span>
                                </Link>
                            ))}
                        </div>
                        <div className="flex flex-col p-4 gap-4">
                            <Link
                                href={route("shop.all-brands")}
                                onClick={() => setIsMenuOpen(false)}
                                className="font-bold text-gray-800 border-b pb-2"
                            >
                                Brands
                            </Link>
                            <Link
                                href="/offers"
                                className="font-bold text-gray-800 border-b pb-2"
                            >
                                Offers
                            </Link>
                            <Link
                                href="/help"
                                className="flex items-center gap-2 font-bold text-gray-800 border-b pb-2"
                            >
                                <Headphones className="h-4 w-4 text-[#FF4E00]" />{" "}
                                Help
                            </Link>
                            <Link
                                href="/login"
                                className="flex items-center gap-2 font-bold text-gray-800"
                            >
                                <User className="h-4 w-4 text-[#FF4E00]" /> Sign
                                In
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
