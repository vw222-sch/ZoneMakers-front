import { Link } from "react-router";

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { Map, MessagesSquare, CalendarDays, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-16 bg-background border-t border-border">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <img src="/ZM-Official-Light.png" alt="ZM" className="w-10 h-10" />
            ZoneMakers
          </Link>
          <div className="flex flex-wrap justify-center items-center gap-2">
            <Button asChild className="font-extrabold tracking-widest rounded-2xl">
              <Link to="/map">
                <Map />
                Map
              </Link>
            </Button>
            <Button asChild className="font-extrabold tracking-widest rounded-2xl">
              <Link to="/chat">
                <MessagesSquare />
                Chat
              </Link>
            </Button>
            <Button asChild className="font-extrabold tracking-widest rounded-2xl">
              <Link to="/news">
                <CalendarDays />
                News
              </Link>
            </Button>
            <Button asChild className="font-extrabold tracking-widest rounded-2xl">
              <Link to="/support">
                <HelpCircle />
                Support
              </Link>
            </Button>
          </div>
        </div>

        <Separator className='my-8' />

        <p className="font-bold tracking-widest text-sm/6 text-center sm:text-start text-balance text-muted-foreground">
          &copy; {new Date().getFullYear()} ZoneMakers. All rights reserved.
        </p>
      </div>
    </footer>
  );
}