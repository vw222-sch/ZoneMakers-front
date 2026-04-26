import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Map, MessagesSquare, CalendarDays, HelpCircle, CircleUser, Bell, Shield, BadgeCheck, LogOut, PanelLeft } from "lucide-react";

import { useAuth } from "@/hooks/AuthContext";
import { fetchNotifications } from "@/services/notificationService";

const NAV_ITEMS = [
    { icon: Map, title: 'Map', href: '/map' },
    { icon: MessagesSquare, title: 'Chat', href: '/chat' },
    { icon: CalendarDays, title: 'News', href: '/news' },
    { icon: HelpCircle, title: 'Support', href: '/support' },
];

export default function Navbar({ isOpen = true }: { isOpen?: boolean }) {
    const navigate = useNavigate();
    const { state, logout: handleContextLogout } = useAuth();

    const isLoggedIn = state.isLoggedIn;
    const user = state.user;
    const isAdmin = state.isAdmin;

    const [unreadCount, setUnreadCount] = useState<number>(0);

    useEffect(() => {
        if (!isLoggedIn) {
            setUnreadCount(0);
            return;
        }

        const loadNotifications = async () => {
            try {
                const notifs = await fetchNotifications();
                const unread = notifs.filter(n => !n.read).length;
                setUnreadCount(unread);
            } catch (err) {
                console.error("Hiba az értesítések lekérdezésekor:", err);
            }
        };

        loadNotifications();

        const interval = setInterval(loadNotifications, 60000);

        return () => clearInterval(interval);
    }, [isLoggedIn]);

    const handleLogout = () => {
        handleContextLogout();
        navigate("/");
    };

    return (
        <TooltipProvider>
            {/* Desktop view */}
            <nav className={`hidden md:flex fixed top-0 left-0 h-screen w-16 flex-col items-center py-4 border-r-2 bg-background z-40 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Link to="/" className="mb-16">
                    <img src="/ZM-Official.png" alt="ZM" className="w-10 h-10" />
                </Link>

                <div className="flex flex-1 flex-col gap-8 w-full items-center">
                    {NAV_ITEMS.map((item) => (
                        <Tooltip key={item.title}>
                            <TooltipTrigger asChild>
                                <Link to={item.href}>
                                    <item.icon size={30} />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p className="font-bold text-sm">{item.title}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-6">
                    {isLoggedIn && user ? (
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link to="/notifications" className="relative">
                                        <Bell size={30} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right"><p className="font-bold text-sm">Notifications</p></TooltipContent>
                            </Tooltip>

                            {isAdmin && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link to="/admin"><Shield size={30} /></Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p className="font-bold text-sm">Admin</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='ghost' size='icon' className='rounded-full border-2 cursor-pointer'>
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={user?.avatar || undefined} alt={user?.username} />
                                            <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 rounded-lg" side="right" align="end" sideOffset={4}>
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 p-1 text-left text-sm">
                                            <Avatar className="h-8 w-8 rounded-full">
                                                <AvatarImage src={user?.avatar || undefined} alt={user?.username} />
                                                <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-medium">{user?.username}</span>
                                                <span className="truncate text-xs">@{user?.handle}</span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem className='cursor-pointer' onClick={() => navigate(`/user-details/${user?.id}`)}>
                                            <BadgeCheck className="mr-2 h-4 w-4" /> Account
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className='cursor-pointer' onClick={() => navigate("/notifications")}>
                                            <Bell className="mr-2 h-4 w-4" /> Notifications {unreadCount > 0 && `(${unreadCount})`}
                                        </DropdownMenuItem>

                                        {isAdmin && (
                                            <DropdownMenuItem className='cursor-pointer' onClick={() => navigate("/admin")}>
                                                <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant='destructive' className='cursor-pointer' onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" /> Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link to="/login" className="mt-8 cursor-pointer"><CircleUser size={30} /></Link>
                            </TooltipTrigger>
                            <TooltipContent side="right"><p className="font-bold text-sm">Login</p></TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </nav>

            {/* Mobile view */}
            <nav className="md:hidden fixed top-0 left-0 w-full h-20 border-b-2 px-4 bg-background z-40 flex items-center justify-between shadow-sm">
                <Link to="/">
                    <img src="/ZM-Official.png" alt="ZM" className="w-10 h-10" />
                </Link>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <PanelLeft size={30} className='cursor-pointer' />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side='right' className="flex flex-col">
                        <SheetHeader>
                            <SheetTitle className="flex justify-start">
                                <img src="/ZM-Official.png" alt="ZM" className="w-10 h-10" />
                            </SheetTitle>
                        </SheetHeader>

                        <div className="flex flex-1 flex-col gap-6 pt-8 pl-4">
                            {NAV_ITEMS.map((item) => (
                                <SheetClose asChild key={item.title}>
                                    <Link to={item.href} className="flex items-center gap-4">
                                        <item.icon size={30} />
                                        <span className="text-lg font-bold tracking-wide">{item.title}</span>
                                    </Link>
                                </SheetClose>
                            ))}

                            {isLoggedIn && user ? (
                                <>
                                    <SheetClose asChild>
                                        <Link to="/notifications" className="flex items-center gap-4 relative">
                                            <Bell size={30} />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-0 left-4 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                            <span className="text-lg font-bold tracking-wide">Notifications</span>
                                        </Link>
                                    </SheetClose>

                                    {isAdmin && (
                                        <SheetClose asChild>
                                            <Link to="/admin" className="flex items-center gap-4">
                                                <Shield size={30} />
                                                <span className="text-lg font-bold tracking-wide">Admin Dashboard</span>
                                            </Link>
                                        </SheetClose>
                                    )}

                                    <SheetClose asChild>
                                        <Link to={`/user-details/${user.id}`} className="flex items-center gap-4">
                                            <BadgeCheck size={30} />
                                            <span className="text-lg font-bold tracking-wide">Account</span>
                                        </Link>
                                    </SheetClose>
                                </>
                            ) : null}
                        </div>

                        <SheetFooter className="mt-auto">
                            {isLoggedIn ? (
                                <Button variant='destructive' onClick={handleLogout} className="w-full font-bold text-base">
                                    <LogOut className="mr-2 h-5 w-5" /> Log out
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-2 w-full">
                                    <SheetClose asChild>
                                        <Button type='button' onClick={() => navigate('/login')} className="w-full font-bold text-base">Login</Button>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Button variant='outline' onClick={() => navigate('/signup')} className="w-full font-bold text-base">Sign up</Button>
                                    </SheetClose>
                                </div>
                            )}
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </nav>
        </TooltipProvider>
    );
}