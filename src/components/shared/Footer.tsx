import { Link } from "react-router";

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { MapPinned, Compass, Radio, BookOpen, RadioTower } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
              <MapPinned className="w-8 h-8" />
              ZoneMakers
            </Link>
            <div className="flex flex-wrap justify-center items-center gap-2">
              <Button asChild className="text-white font-extrabold tracking-widest rounded-2xl">
                <Link to="#">
                  <Compass />
                  Explore
                </Link>
              </Button>
              <Button asChild className="font-extrabold tracking-widest rounded-2xl">
                <Link to="#">
                  <Radio />
                  Feed
                </Link>
              </Button>
              <Button asChild className="font-extrabold tracking-widest rounded-2xl">
                <Link to="#">
                  <BookOpen />
                  Guides
                </Link>
              </Button>
              <Button asChild className="font-extrabold tracking-widest rounded-2xl">
                <Link to="#">
                  <RadioTower />
                  Live Report
                </Link>
              </Button>
            </div>
          </div>

          <Separator className='my-8' />

          <p className="font-bold tracking-widest text-sm/6 text-center sm:text-start text-balance">&copy; {new Date().getFullYear()} ZoneMakers. All rights reserved.</p>
        </div>
      </footer>
    );
}