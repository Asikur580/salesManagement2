import React from "react";
import { ShopNavbar } from "@/components/layout/ShopNavbar";
import { ShopFooter } from "@/components/layout/ShopFooter";

interface ShopLayoutProps {
    children: React.ReactNode;
}

export function ShopLayout({ children }: ShopLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-[#F5F5F5] font-sans antialiased text-[#333]">
            <ShopNavbar />
            <main className="flex-1">{children}</main>
            <ShopFooter />
        </div>
    );
}
