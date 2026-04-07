import React from "react";
import { ShopNavbar } from "@/components/layout/ShopNavbar";
import { ShopFooter } from "@/components/layout/ShopFooter";
import { BottomNav } from "@/components/layout/BottomNav";

interface ShopLayoutProps {
    children: React.ReactNode;
}

export function ShopLayout({ children }: ShopLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-[#F5F5F5] font-sans antialiased text-[#333] pb-[60px] md:pb-0 pt-[64px] lg:pt-[115px]">
            <ShopNavbar />
            <main className="flex-1">{children}</main>
            <ShopFooter />
            <BottomNav className="md:hidden" />
        </div>
    );
}
