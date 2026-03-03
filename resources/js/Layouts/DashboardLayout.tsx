import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen w-full">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex flex-1 flex-col lg:pl-64">
                <Topbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-6 bg-muted/30">
                    {children}
                </main>
            </div>
        </div>
    );
}
