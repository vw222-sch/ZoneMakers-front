import { Map, MapPinned, MailWarning, MessagesSquare, CircleUser, CalendarDays, MapPinHouse, PanelLeft } from "lucide-react";

import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from "@/components/ui/button"

import { Link } from "react-router";

export default function Navbar() {
    const navItems = [
        { icon: Map, title: 'Map', href: '/map' },
        { icon: MessagesSquare, title: 'Chat', href: '/chat' },
        { icon: MapPinHouse, title: 'Reserve', href: '/reserve' },
        { icon: CalendarDays, title: 'News', href: '/news' },
        { icon: MailWarning, title: 'Support', href: '/support' },
    ];

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

                <Link to="/login" className="mt-8">
                    <CircleUser size={35} />
                </Link>
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
                                <Button type='submit' className="font-bold text-base">Login</Button>
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