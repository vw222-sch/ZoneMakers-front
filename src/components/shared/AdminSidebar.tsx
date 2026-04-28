"use client"

import { Link, useLocation, useNavigate } from "react-router"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPinned, LogOut, LifeBuoy, Map, Users, MessageSquare, Search, Home, Award } from "lucide-react"
import { useAuth } from "@/hooks/AuthContext"

const navItems = [
    {
        title: "Support Tickets",
        url: "/admin/support",
        icon: LifeBuoy,
    },
    {
        title: "Zone Requests",
        url: "/admin/zones",
        icon: Map,
    },
    {
        title: "Zone Reports",
        url: "/admin/zone-reports",
        icon: MapPinned,
    },
    {
        title: "User Reports",
        url: "/admin/user-reports",
        icon: Users,
    },
    {
        title: "Post Reports",
        url: "/admin/post-reports",
        icon: MessageSquare,
    },
    {
        title: "User Search",
        url: "/admin/user-search",
        icon: Search,
    },
    {
        title: "Badge Manager",
        url: "/admin/badges",
        icon: Award,
    },
]

export default function AdminSidebar() {
    const { isMobile } = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();
    const { state, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userName = state.user?.username || "Admin";
    const userEmail = state.user?.email || "admin@zonemakers.com";
    const userAvatar = state.user?.avatar || null;
    const userInitials = userName.slice(0, 2).toUpperCase();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-white">
                                    <img src="/ZM-Official-Light.png" alt="ZM" className="size-8" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-bold">Zonemakers</span>
                                    <span className="truncate text-xs">Admin Dashboard</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Administration</SidebarGroupLabel>
                    <SidebarMenu>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.url;
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={userAvatar || undefined} alt={userName} />
                                        <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{userName}</span>
                                        <span className="truncate text-xs">{userEmail}</span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={userAvatar || undefined} />
                                            <AvatarFallback>{userInitials}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">{userName}</span>
                                            <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/')}>
                                    <Home className="mr-2 h-4 w-4" />
                                    Home
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}