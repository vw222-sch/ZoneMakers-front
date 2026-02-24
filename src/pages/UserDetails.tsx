import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BadgeCheck, MessageCircle, Plus, MapPin, Camera, Plane, Star, Award, Quote, Footprints, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UserDetails() {
    return (
        <div className="bg-[url(/profile-bg.jpg)] bg-cover bg-center">
            <div className="container mx-auto px-4 sm:px-8 h-fit max-w-7xl">
                <div className="flex flex-col w-full gap-4 bg-linear-to-bl from-teal-500/75 to-emerald-500/75 rounded-4xl pb-4 shadow-2xl backdrop-blur-sm">

                    <div className="flex items-center gap-8 p-8 bg-[url(/banner.png)] bg-cover bg-center rounded-t-4xl relative after:absolute after:inset-0 after:bg-black/40 after:rounded-t-4xl">
                        <Avatar className="sm:w-50 sm:h-50 w-35 h-35 z-10 border-4 border-white/30 shadow-xl">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col gap-2 z-10 text-white">
                            <div className="flex items-center gap-2">
                                <h1 className="font-extrabold text-4xl tracking-wide drop-shadow-md">John Doe</h1>
                                <BadgeCheck size={30} className="text-white" />
                            </div>
                            <p className="font-semibold tracking-wider opacity-90">@johndoe</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <Button variant="secondary" className="p-5 font-bold border-2 text-sm rounded-4xl cursor-pointer hover:bg-white/90 shadow-lg transition-all">
                                    Follow
                                    <Plus className="w-4 h-4" />
                                </Button>
                                <Button className="p-5 text-white font-bold border-2 border-white/25 bg-black/20 hover:bg-black/40 text-sm rounded-4xl cursor-pointer backdrop-blur-md transition-all">
                                    Message
                                    <MessageCircle className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="hidden lg:flex flex-col items-end ml-auto self-start z-12 gap-4">
                            <h1 className="text-xl font-bold text-white tracking-widest border-2 border-white/20 rounded-2xl bg-black/40 backdrop-blur-md p-2 w-fit">
                                Explorer Lvl. 12
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-300 shadow-lg group-hover:scale-110 transition-transform">
                                    <Award className="text-amber-600 w-8 h-8" />
                                </div>
                                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center border-4 border-sky-300 shadow-lg group-hover:scale-110 transition-transform">
                                    <Plane className="text-sky-600 w-8 h-8" />
                                </div>
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-300 shadow-lg group-hover:scale-110 transition-transform">
                                    <MapPin className="text-emerald-600 w-8 h-8" />
                                </div>
                            </div>
                            <h1 className="text-lg font-bold text-white tracking-widest w-fit drop-shadow-sm">
                                Reputation: 850
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4">

                        <div className="flex-1">
                            <div className="border-2 border-white/20 bg-white/10 h-full min-h-125 rounded-4xl p-8 shadow-inner backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-8 border-b-2 border-white/10 pb-4">
                                    <Footprints className="text-white w-8 h-8" />
                                    <h1 className="font-bold text-3xl text-white tracking-wider">Travel Log</h1>
                                </div>

                                <div className="space-y-6">

                                    <div className="flex gap-4 p-6 bg-black/20 hover:bg-black/30 transition-colors rounded-3xl border border-white/5">
                                        <div className="p-3 bg-blue-500/20 rounded-2xl h-fit border border-blue-400/30">
                                            <MapPin className="text-blue-200 w-6 h-6" />
                                        </div>
                                        <div className="text-white flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg">Checked in at Budapest</h3>
                                                <span className="text-xs text-white/60 bg-black/20 px-2 py-1 rounded-lg">2 hours ago</span>
                                            </div>
                                            <p className="text-white/80 mt-1">Visiting the Parliament building. The architecture is absolutely stunning! 🏛️</p>
                                            <div className="flex gap-2 mt-3">
                                                <Badge variant="outline" className="text-white border-white/20 rounded-lg hover:bg-white/10">#architecture</Badge>
                                                <Badge variant="outline" className="text-white border-white/20 rounded-lg hover:bg-white/10">#hungary</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 p-6 bg-black/20 hover:bg-black/30 transition-colors rounded-3xl border border-white/5">
                                        <div className="p-3 bg-yellow-500/20 rounded-2xl h-fit border border-yellow-400/30">
                                            <Star className="text-yellow-200 w-6 h-6" />
                                        </div>
                                        <div className="text-white flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg">Reviewed "Gelarto Rosa"</h3>
                                                <span className="text-xs text-white/60 bg-black/20 px-2 py-1 rounded-lg">Yesterday</span>
                                            </div>
                                            <p className="text-white/80 mt-1">Best ice cream in town! You have to try the pistachio flavor. 🍦</p>
                                            <div className="flex gap-1 mt-2 text-yellow-400">
                                                <Star className="w-4 h-4 fill-yellow-400" />
                                                <Star className="w-4 h-4 fill-yellow-400" />
                                                <Star className="w-4 h-4 fill-yellow-400" />
                                                <Star className="w-4 h-4 fill-yellow-400" />
                                                <Star className="w-4 h-4 fill-yellow-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 p-6 bg-black/20 hover:bg-black/30 transition-colors rounded-3xl border border-white/5">
                                        <div className="p-3 bg-emerald-500/20 rounded-2xl h-fit border border-emerald-400/30">
                                            <Camera className="text-emerald-200 w-6 h-6" />
                                        </div>
                                        <div className="text-white flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg">Uploaded 12 new photos</h3>
                                                <span className="text-xs text-white/60 bg-black/20 px-2 py-1 rounded-lg">3 days ago</span>
                                            </div>
                                            <p className="text-white/80 mt-1">Album: "Hiking in the High Tatras" 🏔️</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:w-100 gap-4">

                            <div className="border-2 border-white/20 bg-white/10 rounded-4xl p-6 h-fit shadow-lg backdrop-blur-sm">
                                <h1 className="text-center font-bold text-2xl text-white tracking-wider mb-4 flex items-center justify-center gap-2">
                                    <Quote className="w-5 h-5 fill-white/50 text-transparent" /> About Me
                                </h1>
                                <p className="font-medium text-lg text-white/90 text-center text-balance leading-relaxed">
                                    Digital nomad & coffee addict. ☕ <br />
                                    I love discovering hidden gems and local food. Currently exploring Central Europe.
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-xl px-3 py-1">Backpacker</Badge>
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-xl px-3 py-1">Foodie</Badge>
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-xl px-3 py-1">History</Badge>
                                </div>
                            </div>

                            <div className="border-2 border-white/20 bg-black/20 rounded-4xl p-8 h-full flex flex-col">
                                <h1 className="text-center font-bold text-2xl text-white tracking-wider mb-6 flex items-center justify-center gap-2">
                                    <Trophy className="w-6 h-6" /> Achievements
                                </h1>

                                <div className="grid grid-cols-3 gap-4 place-items-center">

                                    <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-300 shadow-lg group-hover:scale-110 transition-transform">
                                            <Award className="text-amber-600 w-8 h-8" />
                                        </div>
                                        <span className="text-xs font-bold text-white/80 text-center">Top Reviewer</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center border-4 border-sky-300 shadow-lg group-hover:scale-110 transition-transform">
                                            <Plane className="text-sky-600 w-8 h-8" />
                                        </div>
                                        <span className="text-xs font-bold text-white/80 text-center">Frequent Flyer</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-300 shadow-lg group-hover:scale-110 transition-transform">
                                            <MapPin className="text-emerald-600 w-8 h-8" />
                                        </div>
                                        <span className="text-xs font-bold text-white/80 text-center">Local Guide</span>
                                    </div>

                                    {/* Locked Badge */}
                                    <div className="flex flex-col items-center gap-2 opacity-50 cursor-not-allowed grayscale">
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/10 border-dashed">
                                            <Camera className="text-white/50 w-8 h-8" />
                                        </div>
                                        <span className="text-xs font-bold text-white/50 text-center">Photographer</span>
                                    </div>
                                </div>

                                <Button variant="link" className="mt-auto text-white/70 hover:text-white pt-6">
                                    View All 12 Stamps
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}