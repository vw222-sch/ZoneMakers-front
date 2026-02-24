import { Globe } from "@/components/ui/globe";

import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { BadgeAlert, ShieldCheck, ArrowRight, Navigation } from 'lucide-react';

export default function Home() {
  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          <div className="mx-auto text-center lg:ml-0 lg:max-w-lg lg:text-left [&>p]:mx-auto [&>p]:max-w-xl">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              ZoneMakers - Your Safe Travel Companion
            </h1>
            <p className="text-muted-foreground mt-8 text-lg/8">
              Travel confidently with our platform that highlights safe zones and verified routes for a worry-free journey.
            </p>

            <div className="grid gap-4 mt-12 sm:flex sm:justify-center lg:justify-start">
              <Button className="flex flex-1 bg-primary text-primary-foreground font-bold tracking-wider hover:bg-primary/90">
                Get Started <ArrowRight />
              </Button>
              <Button variant="outline" className="flex flex-1 font-semibold tracking-wider">
                Learn More <ArrowRight />
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 sm:justify-start lg:justify-start">
              <div className="text-center flex-1">
                <div className="font-bold text-2xl">500k+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center flex-1">
                <div className="font-bold text-2xl">1M+</div>
                <div className="text-sm text-muted-foreground">Safe Trips Planned</div>
              </div>
              <div className="text-center flex-1">
                <div className="font-bold text-2xl">150+</div>
                <div className="text-sm text-muted-foreground">Cities Covered</div>
              </div>
            </div>
          </div>

          <div className='relative w-full overflow-hidden min-w-0 flex items-center justify-center'>
            <Globe></Globe>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0">

        {/* --- SECTION 1: FREEDOM (Emotional) - Floating & Gradient --- */}
        <section className="pb-12 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">

            <div className="flex flex-col lg:flex-row gap-16 items-center min-h-screen">
              {/* Szöveg - Minimalista, nagy tipográfia */}
              <div className="lg:w-1/2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6 border border-blue-100">
                  <ShieldCheck className="size-4" /> Safety First
                </div>
                <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                  Explore with <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                    zero anxiety.
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Stop worrying about "wrong turns". Our platform filters the noise so you can focus on the memories.
                </p>

                <div className="grid max-sm:grid-cols-1 grid-cols-2 gap-8">
                  {[
                    { title: "Safe Routes", desc: "Verified paths only" },
                    { title: "Tourist Zones", desc: "Highlighted friendly areas" }
                  ].map((item, i) => (
                    <div key={i} className="pl-4 border-l-4 border-blue-200 hover:border-blue-500 transition-colors">
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kép - Kompozíció, nem sima téglalap */}
              <div className="lg:w-1/2 relative">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
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
                {/* Decorative elements under image */}
                <div className="absolute -bottom-10 -right-10 w-full h-full border-2 border-dashed border-slate-200 rounded-3xl -z-10 hidden lg:block" />
              </div>
            </div>



            <div className="flex flex-col lg:flex-row gap-16 items-center min-h-screen">
              {/* Kép - Kompozíció, nem sima téglalap */}
              <div className="lg:w-1/2 relative">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
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
                {/* Decorative elements under image */}
                <div className="absolute -bottom-10 -right-10 w-full h-full border-2 border-dashed border-slate-200 rounded-3xl -z-10 hidden lg:block" />
              </div>

              {/* Szöveg - Minimalista, nagy tipográfia */}
              <div className="lg:w-1/2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-semibold mb-6 border border-red-100">
                  <ShieldCheck className="size-4" /> Safety First
                </div>
                <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                  See the <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
                    invisible dangers.
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Locals know where not to go. Now you do too. Our interactive map marks "Black Zones" based on crime stats, poor lighting, and scam reports. Visualizing danger makes it easy to avoid.
                </p>

                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-6">
                  {[
                    { title: "Safe Routes", desc: "Verified paths only" },
                    { title: "Tourist Zones", desc: "Highlighted friendly areas" }
                  ].map((item, i) => (
                    <div key={i} className="pl-4 border-l-4 border-blue-200 hover:border-blue-500 transition-colors">
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-16 items-center min-h-screen">

              {/* Szöveg - Minimalista, nagy tipográfia */}
              <div className="lg:w-1/2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-sm font-semibold mb-6 border border-green-100">
                  <ShieldCheck className="size-4" /> Safety First
                </div>
                <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                  Powered by travelers, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-lime-500">
                    for travelers.
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Stop worrying about "wrong turns". Our platform filters the noise so you can focus on the memories.
                </p>

                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-6">
                  {[
                    { title: "Safe Routes", desc: "Verified paths only" },
                    { title: "Tourist Zones", desc: "Highlighted friendly areas" }
                  ].map((item, i) => (
                    <div key={i} className="pl-4 border-l-4 border-blue-200 hover:border-blue-500 transition-colors">
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kép - Kompozíció, nem sima téglalap */}
              <div className="lg:w-1/2 relative">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop"
                    alt="Happy tourist"
                    className="w-full h-auto object-cover aspect-4/3"
                  />
                </div>
                {/* Decorative elements under image */}
                <div className="absolute -bottom-10 -right-10 w-full h-full border-2 border-dashed border-slate-200 rounded-3xl -z-10 hidden lg:block" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-center text-3xl leading-snug font-extrabold tracking-normal text-balance sm:text-4xl md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="lg:text-4x text-center text-xl leading-snug font-semibold tracking-wider text-balance sm:text-2xl md:text-3xl">
              Everything you need to know about the Black Zone map.
            </p>
          </div>

          <Accordion type='single' collapsible className='w-full space-y-2' defaultValue='item-1'>
            <AccordionItem value={`item-1`} className='rounded-xl border-2! border-primary'>
              <AccordionTrigger className='text-base font-bold tracking-widest px-4 no-underline! cursor-pointer'>Is this service completely free?</AccordionTrigger>
              <AccordionContent className='text-base px-4'>Yes! The core map features, searching for cities, and viewing safety scores are 100% free. We believe safety is a fundamental right for every traveler. We may introduce premium features later for advanced route planning, but the map will always remain open.</AccordionContent>
            </AccordionItem>

            <AccordionItem value={`item-2`} className='rounded-xl border-2! border-primary'>
              <AccordionTrigger className='text-base font-bold tracking-widest px-4 no-underline! cursor-pointer'>Where does the safety data come from?</AccordionTrigger>
              <AccordionContent className='text-base px-4'>We use a hybrid system. First, we aggregate official police crime statistics and government travel advisories. Second, and most importantly, we rely on real-time reports from our community of users who flag incidents, scams, and dangerous streets on the spot.</AccordionContent>
            </AccordionItem>

            <AccordionItem value={`item-3`} className='rounded-xl border-2! border-primary'>
              <AccordionTrigger className='text-base font-bold tracking-widest px-4 no-underline! cursor-pointer'>Does it work offline?</AccordionTrigger>
              <AccordionContent className='text-base px-4'>Since this is a web application, you need an internet connection to load new cities. However, the app automatically caches (saves) the map of your current location. If you lose signal while walking, you can still view the danger zones in that area.</AccordionContent>
            </AccordionItem>

            <AccordionItem value={`item-4`} className='rounded-xl border-2! border-primary'>
              <AccordionTrigger className='text-base font-bold tracking-widest px-4 no-underline! cursor-pointer'>How do I report a "Black Zone"?</AccordionTrigger>
              <AccordionContent className='text-base px-4'>It's simple. Once you launch the map, click the "Report" button in the bottom corner. You can select the type of incident (pickpocketing, harassment, poor lighting, scam) and drop a pin on the map. Other users will verify your report.</AccordionContent>
            </AccordionItem>

            <AccordionItem value={`item-5`} className='rounded-xl border-2! border-primary'>
              <AccordionTrigger className='text-base font-bold tracking-widest px-4 no-underline! cursor-pointer'>Is my location data private?</AccordionTrigger>
              <AccordionContent className='text-base px-4'>Absolutely. We do not track your history or store your movements. Your location is only used locally on your device to show you relevant alerts nearby.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </>
  )
}
