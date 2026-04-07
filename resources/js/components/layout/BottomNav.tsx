import React, { useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
    Home,
    Layers,
    Zap,
    ShoppingCart,
    User,
    ChevronRight,
    ChevronDown,
    ArrowLeft,
    X,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Category[];
}

interface BottomNavProps {
    className?: string;
}

export function BottomNav({ className = "" }: BottomNavProps) {
    const { url } = usePage();
    const { cart, categories = [] } = usePage().props as any;
    const [isOpen, setIsOpen] = useState(false);
    
    // Level tracking for category drawer
    const [currentPath, setCurrentPath] = useState<Category[]>([]);
    const [activeLevel, setActiveLevel] = useState<Category[]>(categories);

    const handleCategoryClick = (cat: Category) => {
        if (cat.children && cat.children.length > 0) {
            setCurrentPath([...currentPath, cat]);
            setActiveLevel(cat.children);
        } else {
            // Navigate to category page
            router.visit(route("shop.category", cat.slug));
            setIsOpen(false);
        }
    };

    const handleBack = () => {
        const newPath = [...currentPath];
        newPath.pop();
        setCurrentPath(newPath);
        
        if (newPath.length === 0) {
            setActiveLevel(categories);
        } else {
            setActiveLevel(newPath[newPath.length - 1].children || []);
        }
    };

    const resetDrawer = () => {
        setCurrentPath([]);
        setActiveLevel(categories);
    };

    const navItems = [
        {
            label: "Home",
            icon: Home,
            href: "/",
            active: url === "/",
        },
        {
            label: "Category",
            icon: Layers,
            href: "#", // Trigger drawer
            active: url.includes("/category") || url.includes("/all-brands"),
            isTrigger: true,
        },
        {
            label: "Offer",
            icon: Zap,
            href: route("shop.flash-sales"),
            active: url.includes("/flash-sales") || url.includes("/offers"),
        },
        {
            label: "Cart",
            icon: ShoppingCart,
            href: route("cart.index"),
            active: url.includes("/cart"),
            count: cart?.count || 0,
        },
        {
            label: "Profile",
            icon: User,
            href: route("account.index"),
            active: url.includes("/my-account") || url.includes("/profile"),
        },
    ];

    return (
        <>
            <nav
                className={`fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-2 py-1 pb-[env(safe-area-inset-bottom)] flex items-center justify-around md:hidden h-[calc(60px+env(safe-area-inset-bottom))] transform-gpu translate-z-0 ${className}`}
            >
                {navItems.map((item) => {
                    const Icon = item.icon;
                    
                    if (item.isTrigger) {
                        return (
                            <Sheet key={item.label} open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) resetDrawer(); }}>
                                <SheetTrigger asChild>
                                    <button
                                        className={`flex flex-col items-center justify-center p-2 relative group transition-all ${
                                            item.active
                                                ? "text-primary"
                                                : "text-muted-foreground hover:text-primary"
                                        }`}
                                    >
                                        <div className="relative">
                                            <Icon
                                                className={`h-5 w-5 ${item.active ? "stroke-[2.5px]" : "stroke-[2px]"}`}
                                            />
                                        </div>
                                        <span
                                            className={`text-[10px] mt-1 font-bold tracking-tight ${item.active ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}
                                        >
                                            {item.label}
                                        </span>
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px] p-0 flex flex-col [&>button]:hidden">
                                    <SheetHeader className="p-4 border-b bg-primary text-white space-y-0">
                                        <div className="flex items-center justify-between">
                                            <SheetTitle className="text-white font-black italic flex items-center gap-2">
                                                {currentPath.length > 0 && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white p-0 mr-1" onClick={handleBack}>
                                                        <ArrowLeft className="h-5 w-5" />
                                                    </Button>
                                                )}
                                                {currentPath.length > 0 ? currentPath[currentPath.length - 1].name : "ALL CATEGORIES"}
                                            </SheetTitle>
                                            <SheetClose className="text-white/80 hover:text-white transition-colors">
                                                <X className="h-6 w-6" />
                                            </SheetClose>
                                        </div>
                                    </SheetHeader>
                                    
                                    <ScrollArea className="flex-1">
                                        <div className="p-2">
                                            {activeLevel.map((cat) => (
                                                <div 
                                                    key={cat.id} 
                                                    onClick={() => handleCategoryClick(cat)}
                                                    className="flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-all cursor-pointer group border-b border-border/50 last:border-0"
                                                >
                                                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                                                        {cat.name}
                                                    </span>
                                                    {cat.children && cat.children.length > 0 && (
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all" />
                                                    )}
                                                </div>
                                            ))}
                                            
                                            {currentPath.length > 0 && (
                                                <div className="p-4 mt-4">
                                                    <Link 
                                                        href={route("shop.category", currentPath[currentPath.length - 1].slug)}
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center justify-center gap-2 w-full py-3 bg-primary/10 text-primary font-black rounded-xl text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                                                    >
                                                        View all {currentPath[currentPath.length - 1].name}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>

                                    <div className="p-4 border-t bg-muted/30">
                                        <Link 
                                            href="/"
                                            onClick={() => setIsOpen(false)}
                                            className="block text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-primary transition-colors"
                                        >
                                            Back to Home
                                        </Link>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center justify-center p-2 relative group transition-all ${
                                item.active
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-primary"
                            }`}
                        >
                            <div className="relative">
                                <Icon
                                    className={`h-5 w-5 ${item.active ? "stroke-[2.5px]" : "stroke-[2px]"}`}
                                />
                                {item.count > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                                        {item.count}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`text-[10px] mt-1 font-bold tracking-tight ${item.active ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}
                            >
                                {item.label}
                            </span>
                            {item.active && (
                                <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
