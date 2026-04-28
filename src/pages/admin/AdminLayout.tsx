import { Outlet, Navigate } from "react-router";
import AdminSidebar from "@/components/shared/AdminSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/AuthContext";

export default function AdminLayout() {
    const { state } = useAuth();

    if (!state.isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (!state.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <header className="bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h1 className="font-bold text-base tracking-wide">Dashboard</h1>
                    </div>
                </header>
                
                <main className="p-4 md:p-6 bg-background flex-1 h-full overflow-auto">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}