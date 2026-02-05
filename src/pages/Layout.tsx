import { useState } from 'react'
import { Outlet } from "react-router";

import Navbar from '@/components/shared/Navbar'
import { PanelLeft } from 'lucide-react'

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <>
            <div className="flex flex-col md:flex-row h-screen">
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-full md:w-20' : 'w-0'}`}>
                    <Navbar />
                </div>

                <div className="relative flex-1 overflow-y-auto pt-18 pl-8">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`transition-all duration-300 ease-in-out hidden md:flex fixed top-4 ${isSidebarOpen ? 'left-24' : 'left-4'} p-2 opacity-60 hover:opacity-100 cursor-pointer`}>
                        <PanelLeft size={25} />
                    </button>

                    <Outlet />
                </div>
            </div>
        </>
    );
}