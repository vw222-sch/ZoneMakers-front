import { Globe } from "@/components/ui/globe";

import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { BadgeAlert, ShieldCheck, ArrowRight, Navigation } from 'lucide-react';

export default function Home() {
  return (
    <>
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 min-h-screen flex justify-center items-center flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 mt-16 lg:mt-0">
          <h1 className="fl-text-4xl/7xl flex flex-col leading-tight font-extrabold">
            <span className="tracking-wide">TRAVEL THE</span>
            <span className="tracking-widest">SAFEST ROUTES</span>
          </h1>
          <p className="fl-text-xl/3xl tracking-wider my-4 text-balance">Secure zones, verified paths, and fearless adventures in one seamless platform.</p>

          <div className="flex items-center gap-2 max-w-xl mt-8">
            <Button className="flex flex-1 text-base font-bold tracking-widest cursor-pointer" size={"lg"}>Get Started</Button>
            <Button variant="outline" className="flex flex-1 text-base font-bold tracking-widest border-black border-2 cursor-pointer" size={"lg"}>Learn More</Button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <Globe />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 flex flex-col gap-40 my-16">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4 border border-blue-100">
              <ShieldCheck className="size-4" /> Safety First
            </div>
            <h2 className="fl-text-4xl/6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Explore with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                zero anxiety.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed text-balance">
              Stop worrying about "wrong turns". Our platform filters the noise so you can focus on the memories.
            </p>

            <div className="flex items-center gap-2">
              <div className="flex flex-col flex-1 pl-4 border-l-4 border-blue-200 hover:border-blue-500 transition-colors">
                <h4 className="font-bold text-lg">Safe Routes</h4>
                <p className="text-sm text-muted-foreground">Verified paths only</p>
              </div>

              <div className="flex flex-col flex-1 pl-4 border-l-4 border-blue-200 hover:border-blue-500 transition-colors">
                <h4 className="font-bold text-lg">Tourist Zones</h4>
                <p className="text-sm text-muted-foreground">Highlighted friendly areas</p>
              </div>
            </div>
          </div>

          {/* Kép - Kompozíció, nem sima téglalap */}
          <div className="lg:w-1/2">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1000&auto=format&fit=crop"
                alt="Happy tourist"
                className="w-full h-auto object-cover aspect-4/3"
              />
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <Navigation className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Current Status</p>
                  <p className="font-bold text-sm">Safe Zone • 100% Secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Kép - Kompozíció, nem sima téglalap */}
          <div className="lg:w-1/2">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1580689088179-339427f85410?q=80&w=1000&auto=format&fit=crop"
                alt="Map interface showing black zones"
                className="w-full h-auto object-cover aspect-4/3"
              />
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                  <BadgeAlert className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Alert</p>
                  <p className="font-bold text-sm">High pickpocket activity detected in District 5.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-semibold mb-4 border border-red-100">
              <ShieldCheck className="size-4" /> Safety First
            </div>
            <h2 className="fl-text-4xl/6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              See the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
                invisible dangers.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed text-balance">
              Locals know where not to go. Now you do too. Our interactive map marks "Black Zones" based on crime stats, poor lighting, and scam reports. Visualizing danger makes it easy to avoid.
            </p>

            <div className="flex items-center gap-2">
              <div className="flex flex-col flex-1 pl-4 border-l-4 border-red-200 hover:border-red-500 transition-colors">
                <h4 className="font-bold text-lg">Safe Routes</h4>
                <p className="text-sm text-muted-foreground">Verified paths only</p>
              </div>

              <div className="flex flex-col flex-1 pl-4 border-l-4 border-red-200 hover:border-red-500 transition-colors">
                <h4 className="font-bold text-lg">Tourist Zones</h4>
                <p className="text-sm text-muted-foreground">Highlighted friendly areas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-600 text-sm font-semibold mb-4 border border-green-100">
              <ShieldCheck className="size-4" /> Safety First
            </div>
            <h2 className="fl-text-4xl/6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Powered by travelers, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-lime-500">
                for travelers.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed text-balance">
              Stop worrying about "wrong turns". Our platform filters the noise so you can focus on the memories.
            </p>

            <div className="flex items-center gap-2">
              <div className="flex flex-col flex-1 pl-4 border-l-4 border-green-200 hover:border-green-500 transition-colors">
                <h4 className="font-bold text-lg">Safe Routes</h4>
                <p className="text-sm text-muted-foreground">Verified paths only</p>
              </div>

              <div className="flex flex-col flex-1 pl-4 border-l-4 border-green-200 hover:border-green-500 transition-colors">
                <h4 className="font-bold text-lg">Tourist Zones</h4>
                <p className="text-sm text-muted-foreground">Highlighted friendly areas</p>
              </div>
            </div>
          </div>

          {/* Kép - Kompozíció, nem sima téglalap */}
          <div className="lg:w-1/2">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop"
                alt="Happy tourist"
                className="w-full h-auto object-cover aspect-4/3"
              />
            </div>
          </div>
        </div>
      </div>


      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-center fl-text-4xl/6xl leading-snug font-extrabold tracking-normal text-balance">
              Frequently Asked Questions
            </h2>
            <p className="text-center fl-text-2xl/4xl leading-snug font-semibold tracking-wider text-balance">
              Everything you need to know about the Black Zone map.
            </p>
          </div>

          <Accordion type='single' collapsible className='w-full space-y-2' defaultValue='item-1'>
            <AccordionItem value={`item-1`} className='rounded-xl border-2! border-primary'>
              <AccordionTrigger className='fl-text-base/lg font-bold tracking-widest px-4 no-underline! cursor-pointer'>Is this service completely free?</AccordionTrigger>
              <AccordionContent className='fl-text-base/lg px-4 text-balance'>Yes! The core map features, searching for cities, and viewing safety scores are 100% free. We believe safety is a fundamental right for every traveler. We may introduce premium features later for advanced route planning, but the map will always remain open.</AccordionContent>
            </AccordionItem>

            <AccordionItem value={`item-2`} className='rounded-xl border-2! border-primary'>
              <AccordionTrigger className='fl-text-base/lg font-bold tracking-widest px-4 no-underline! cursor-pointer'>Where does the safety data come from?</AccordionTrigger>
              <AccordionContent className='fl-text-base/lg px-4 text-balance'>We use a hybrid system. First, we aggregate official police crime statistics and government travel advisories. Second, and most importantly, we rely on real-time reports from our community of users who flag incidents, scams, and dangerous streets on the spot.</AccordionContent>
            </AccordionItem>

            <AccordionItem value={`item-3`} className='rounded-xl border-2! border-primary'>
              <AccordionTrigger className='fl-text-base/lg font-bold tracking-widest px-4 no-underline! cursor-pointer'>Does it work offline?</AccordionTrigger>
              <AccordionContent className='fl-text-base/lg px-4 text-balance'>Since this is a web application, you need an internet connection to load new cities. However, the app automatically caches (saves) the map of your current location. If you lose signal while walking, you can still view the danger zones in that area.</AccordionContent>
            </AccordionItem>

            <AccordionItem value={`item-4`} className='rounded-xl border-2! border-primary'>
              <AccordionTrigger className='fl-text-base/lg font-bold tracking-widest px-4 no-underline! cursor-pointer'>How do I report a "Black Zone"?</AccordionTrigger>
              <AccordionContent className='fl-text-base/lg px-4 text-balance'>It's simple. Once you launch the map, click the "Report" button in the bottom corner. You can select the type of incident (pickpocketing, harassment, poor lighting, scam) and drop a pin on the map. Other users will verify your report.</AccordionContent>
            </AccordionItem>

            <AccordionItem value={`item-5`} className='rounded-xl border-2! border-primary'>
              <AccordionTrigger className='fl-text-base/lg font-bold tracking-widest px-4 no-underline! cursor-pointer'>Is my location data private?</AccordionTrigger>
              <AccordionContent className='fl-text-base/lg px-4 text-balance'>Absolutely. We do not track your history or store your movements. Your location is only used locally on your device to show you relevant alerts nearby.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </>
  )
}
