
import { Link } from "react-router";
import { useState } from 'react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from "@/components/ui/button";

import { Map, MapPinned, MailWarning, MessagesSquare, CircleUser, CalendarDays, PanelLeft, Bell, UserIcon, SettingsIcon, LogOutIcon, Shield } from "lucide-react";

export default function Navbar() {
    const navItems = [
        { icon: Map, title: 'Map', href: '/map' },
        { icon: MessagesSquare, title: 'Chat', href: '/chat' },
        { icon: CalendarDays, title: 'News', href: '/news' },
        { icon: MailWarning, title: 'Support', href: '/support' },
    ];

    const listItems = [
        { icon: UserIcon, property: 'Profile' },
        { icon: SettingsIcon, property: 'Settings' },
        { icon: LogOutIcon, property: 'Sign Out' }
    ];

    // Simulate login logic
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    return (
        <>
            {/* Desktop view */}
            <nav className="hidden md:flex flex-col h-screen w-20 items-center py-4 border-r-2 overflow-y-auto">
                <Link to="/" className="mb-16">
                    <MapPinned size={35} />
                </Link>

                <div className="flex flex-1 flex-col gap-6">
                    {navItems.map((item) => (
                        <a key={item.title} href={item.href} className="flex flex-col items-center gap-1">
                            <item.icon size={30} />
                            <span className="text-[13px] font-bold tracking-wide">{item.title}</span>
                        </a>
                    ))}
                </div>

                {isLoggedIn ? (
                    <>
                        <Link to="/notifications" className="mt-8">
                            <Bell size={35} />
                        </Link>

                        <Link to="/admin" className="mt-8">
                            <Shield size={35} />
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='secondary' size='icon' className='overflow-hidden rounded-full mt-6'>
                                    <img src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png' alt='Hallie Richards' className="border-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-56'>
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    {listItems.map((item, index) => (
                                        <DropdownMenuItem
                                            key={index}
                                            onClick={() => {
                                                if (item.property === 'Sign Out') setIsLoggedIn(false);
                                            }}
                                        >
                                            <item.icon />
                                            <span className='text-popover-foreground'>{item.property}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <Link to="/login" className="mt-8">
                        <CircleUser size={35} />
                    </Link>
                )}
            </nav>

            {/** Mobile view */}
            <nav className="flex h-20 border-b-2 px-4">
                <div className="flex w-full items-center justify-between">
                    <a href="#">
                        <MapPinned size={35} />
                    </a>

                    <Sheet>
                        <SheetTrigger asChild>
                            <PanelLeft size={25} />
                        </SheetTrigger>
                        <SheetContent side='right'>
                            <SheetHeader>
                                <SheetTitle>
                                    <MapPinned size={35} />
                                </SheetTitle>
                            </SheetHeader>

                            <div className="flex flex-1 flex-col gap-8 pt-8 pl-4">
                                {navItems.map((item) => (
                                    <a key={item.title} href={item.href} className="flex items-center gap-2">
                                        <item.icon size={30} />
                                        <span className="text-lg font-bold tracking-wide">{item.title}</span>
                                    </a>
                                ))}
                            </div>

                            <SheetFooter>
                                <Button type='button' onClick={() => setIsLoggedIn(true)} className="font-bold text-base">Login</Button>
                                <SheetClose asChild>
                                    <Button variant='outline' className="font-bold text-base">Sign up</Button>
                                </SheetClose>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </>
    );
}