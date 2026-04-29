import { useState } from 'react';
import { Outlet } from "react-router";

import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="bg-background text-foreground min-h-screen w-full flex flex-col overflow-x-hidden">
            <Navbar isOpen={isSidebarOpen} />

            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`hidden md:flex fixed top-4 z-50 rounded-full shadow-md bg-background transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'left-16 ml-4' : 'left-4'}`}
            >
                <PanelLeft size={20} className='text-foreground' />
            </Button>

            <main
                className={`flex-1 transition-all duration-300 ease-in-out flex flex-col
                pt-20 md:pt-0 
                ${isSidebarOpen ? 'md:ml-16' : 'md:ml-0'}
                `}
            >
                <Outlet />
                <Footer />
            </main>
        </div>
    );
}