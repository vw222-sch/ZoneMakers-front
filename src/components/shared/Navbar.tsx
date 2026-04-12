import { useState } from 'react';
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Map, MessagesSquare, CalendarDays, HelpCircle, MapPinned, CircleUser, Bell, Shield, BadgeCheck, SettingsIcon, LogOut, PanelLeft } from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const NAV_ITEMS = [
    { icon: Map, title: 'Map', href: '/map' },
    { icon: MessagesSquare, title: 'Chat', href: '/chat' },
    { icon: CalendarDays, title: 'News', href: '/news' },
    { icon: HelpCircle, title: 'Support', href: '/support' },
];

const USER_DATA = {
    name: "John Doe",
    email: "johndoe@example.com",
    avatar: "https://github.com/shadcn.png",
};

export default function Navbar({ isOpen = true }: { isOpen?: boolean }) {
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    return (
        <TooltipProvider>
            {/* Desktop view */}
            <nav className={`hidden md:flex fixed top-0 left-0 h-screen w-16 flex-col items-center py-4 border-r-2 bg-background z-40 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Link to="/" className="mb-16">
                    <MapPinned size={30} />
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
                    {isLoggedIn ? (
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link to="/notifications"><Bell size={30} /></Link>
                                </TooltipTrigger>
                                <TooltipContent side="right"><p className="font-bold text-sm">Notifications</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link to="/admin"><Shield size={30} /></Link>
                                </TooltipTrigger>
                                <TooltipContent side="right"><p className="font-bold text-sm">Admin</p></TooltipContent>
                            </Tooltip>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='ghost' size='icon' className='rounded-full border-2 cursor-pointer'>
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={USER_DATA.avatar} alt={USER_DATA.name} />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 rounded-lg" side="right" align="end" sideOffset={4}>
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 p-1 text-left text-sm">
                                            <Avatar className="h-8 w-8 rounded-full">
                                                <AvatarImage src={USER_DATA.avatar} alt={USER_DATA.name} />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-medium">{USER_DATA.name}</span>
                                                <span className="truncate text-xs">{USER_DATA.email}</span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem className='cursor-pointer'><BadgeCheck className="mr-2 h-4 w-4" /> Account</DropdownMenuItem>

                                        <Dialog>
                                            <form>
                                                <DialogTrigger asChild>
                                                    <DropdownMenuItem className='cursor-pointer' onSelect={(e) => e.preventDefault()}><SettingsIcon className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                                                </DialogTrigger>
                                                <DialogContent className='top-0 mt-6 translate-y-0 sm:max-w-[425px]'>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit profile</DialogTitle>
                                                        <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
                                                    </DialogHeader>
                                                    <div className='grid gap-4'>
                                                        <div className='grid gap-3'>
                                                            <Label htmlFor='name-1'>Name</Label>
                                                            <Input id='name-1' name='name' defaultValue={USER_DATA.name} />
                                                        </div>
                                                        <div className='grid gap-3'>
                                                            <Label htmlFor='email-1'>Email</Label>
                                                            <Input id='email-1' name='username' defaultValue={USER_DATA.email} />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant='outline'>Cancel</Button>
                                                        </DialogClose>
                                                        <Button type='submit'>Save changes</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </form>
                                        </Dialog>

                                        <DropdownMenuItem className='cursor-pointer'><Bell className="mr-2 h-4 w-4" /> Notifications</DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant='destructive' className='cursor-pointer' onClick={() => setIsLoggedIn(false)}>
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
                    <MapPinned size={35} />
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
                                <MapPinned size={35} />
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
                        </div>

                        <SheetFooter className="mt-auto">
                            {isLoggedIn ? (
                                <Button variant='destructive' onClick={() => setIsLoggedIn(false)} className="w-full font-bold text-base">
                                    Log out
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-2 w-full">
                                    <Button type='button' onClick={() => setIsLoggedIn(true)} className="w-full font-bold text-base">Login</Button>
                                    <SheetClose asChild>
                                        <Button variant='outline' className="w-full font-bold text-base">Sign up</Button>
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