"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BadgeCheck, MessageCircle, Plus, MapPin, Camera, Plane, Star, Award, Quote, Footprints, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

const REPUTATION_COLORS = [
    { name: "Red",     hex: "#ff4444", glow: "#ff000066", dark: "#1a0000" },
    { name: "Blue",    hex: "#4488ff", glow: "#0044ff66", dark: "#00091a" },
    { name: "Green",   hex: "#44ff88", glow: "#00ff4466", dark: "#001a0a" },
    { name: "Magenta", hex: "#ff44ff", glow: "#ff00ff66", dark: "#1a001a" },
    { name: "Cyan",    hex: "#44ffff", glow: "#00ffff66", dark: "#001a1a" },
    { name: "Yellow",  hex: "#ffee44", glow: "#ffee0066", dark: "#1a1400" },
]

export default function UserDetails() {
    const [colorIndex, setColorIndex] = useState(1)
    const accent = REPUTATION_COLORS[colorIndex]

    const a = accent.hex
    const g = accent.glow
    const d = accent.dark

    return (
        <div style={{
            background: `radial-gradient(ellipse at 60% 0%, ${d} 0%, #101010 55%, #000 100%)`,
            minHeight: "100vh",
        }}>
            {/* Color picker strip */}
            <div style={{
                background: "#050505",
                borderBottom: "1px solid #1a1a1a",
                padding: "10px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
            }}>
                <div style={{ display: "flex", gap: 6 }}>
                    {REPUTATION_COLORS.map((c, i) => (
                        <button
                            key={c.name}
                            onClick={() => setColorIndex(i)}
                            title={c.name}
                            style={{
                                width: 18, height: 18, borderRadius: "50%",
                                background: c.hex,
                                border: colorIndex === i ? "2px solid #fff" : "2px solid #222",
                                boxShadow: colorIndex === i ? `0 0 8px ${c.glow}` : "none",
                                cursor: "pointer", padding: 0,
                            }}
                        />
                    ))}
                </div>
                <span style={{ color: a, fontSize: 12, fontWeight: 700, minWidth: 56, textAlign: "right", textShadow: `0 0 8px ${g}` }}>
                    {accent.name}
                </span>
            </div>

            <div className="container mx-auto px-4 sm:px-8 h-fit max-w-7xl">
                <div className="flex flex-col w-full gap-4 rounded-4xl pb-4">

                    {/* Banner */}
                    <div
                        className="flex items-center gap-8 p-8 rounded-t-4xl relative"
                        style={{
                            background: `linear-gradient(135deg, #111 0%, ${d} 60%, #0d0d0d 100%)`,
                            borderBottom: `1px solid ${a}33`,
                        }}
                    >
                        {/* Grid overlay */}
                        <div style={{
                            position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
                            backgroundImage: `linear-gradient(${a}08 1px, transparent 1px), linear-gradient(90deg, ${a}08 1px, transparent 1px)`,
                            backgroundSize: "40px 40px",
                        }} />

                        <Avatar
                            className="sm:w-50 sm:h-50 w-35 h-35 z-10"
                            style={{ border: `3px solid ${a}66`, boxShadow: `0 0 32px ${g}` }}
                        >
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback style={{ background: "#111", color: a }}>CN</AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col gap-1 z-10 text-white">
                            <div className="flex items-center gap-2">
                                <h1 className="font-extrabold text-4xl tracking-wide drop-shadow-md" style={{ color: "#e8e8e8" }}>
                                    John Doe
                                </h1>
                                <BadgeCheck size={30} style={{ color: a, filter: `drop-shadow(0 0 6px ${a})` }} />
                            </div>
                            <p className="font-semibold tracking-wider" style={{ color: "#555" }}>@johndoe</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <Button
                                    className="p-5 font-bold border-2 text-sm rounded-4xl cursor-pointer shadow-lg transition-all"
                                    style={{ background: a, color: "#000", border: "none", boxShadow: `0 0 18px ${g}` }}
                                >
                                    Follow <Plus className="w-4 h-4" />
                                </Button>
                                <Button
                                    className="p-5 text-sm rounded-4xl cursor-pointer transition-all font-bold"
                                    style={{ background: "#111", color: a, border: `1px solid ${a}44` }}
                                >
                                    Message <MessageCircle className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="hidden lg:flex flex-col items-center ml-auto z-10 gap-4">
                            <h1
                                className="text-xl font-bold tracking-widest rounded-2xl p-2 w-full text-center -mb-2.5"
                                style={{ color: a, border: `1px solid ${a}33`, background: `${a}12`, textShadow: `0 0 10px ${g}` }}
                            >
                                Explorer Lvl. 12
                            </h1>
                            <h1
                                className="text-xl font-bold tracking-widest rounded-2xl p-2 w-full text-center"
                                style={{ color: a, border: `1px solid ${a}33`, background: `${a}12`, textShadow: `0 0 10px ${g}` }}
                            >
                                Reputation: 850
                            </h1>
                            <div className="flex items-center gap-2">
                                {[Award, Plane, MapPin].map((Icon, i) => (
                                    <div key={i} style={{
                                        width: 64, height: 64, borderRadius: "50%",
                                        background: `${a}12`,
                                        border: `2px solid ${a}66`,
                                        boxShadow: `0 0 16px ${g}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Icon style={{ color: a, width: 28, height: 28 }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4">

                        {/* Travel Log */}
                        <div className="flex-1">
                            <div
                                className="h-full min-h-125 p-8"
                                style={{ background: "linear-gradient(160deg, #111 0%, #0d0d0d 100%)", border: `1px solid ${a}22`, borderRadius: "1.5rem" }}
                            >
                                <div className="flex items-center gap-3 mb-8 pb-4" style={{ borderBottom: `1px solid ${a}22` }}>
                                    <Footprints style={{ color: a, width: 32, height: 32, filter: `drop-shadow(0 0 6px ${a})` }} />
                                    <h1 className="font-bold text-3xl tracking-wider" style={{ color: "#e8e8e8" }}>Travel Log</h1>
                                </div>

                                <div className="space-y-6">
                                    {/* Check-in */}
                                    <div className="flex gap-4 p-6 rounded-3xl transition-colors" style={{ background: "#0d0d0d", border: `1px solid ${a}1a` }}>
                                        <div className="p-3 rounded-2xl h-fit" style={{ background: `${a}15`, border: `1px solid ${a}33` }}>
                                            <MapPin style={{ color: a, width: 24, height: 24 }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg" style={{ color: "#e8e8e8" }}>Checked in at Budapest</h3>
                                                <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#555", background: "#080808" }}>2 hours ago</span>
                                            </div>
                                            <p className="mt-1" style={{ color: "#777" }}>Visiting the Parliament building. The architecture is absolutely stunning! 🏛️</p>
                                            <div className="flex gap-2 mt-3">
                                                <Badge variant="outline" className="rounded-lg" style={{ color: a, borderColor: `${a}44` }}>#architecture</Badge>
                                                <Badge variant="outline" className="rounded-lg" style={{ color: a, borderColor: `${a}44` }}>#hungary</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review */}
                                    <div className="flex gap-4 p-6 rounded-3xl transition-colors" style={{ background: "#0d0d0d", border: `1px solid ${a}1a` }}>
                                        <div className="p-3 rounded-2xl h-fit" style={{ background: "#ffee4415", border: "1px solid #ffee4433" }}>
                                            <Star style={{ color: "#ffee44", width: 24, height: 24 }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg" style={{ color: "#e8e8e8" }}>Reviewed "Gelarto Rosa"</h3>
                                                <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#555", background: "#080808" }}>Yesterday</span>
                                            </div>
                                            <p className="mt-1" style={{ color: "#777" }}>Best ice cream in town! You have to try the pistachio flavor. 🍦</p>
                                            <div className="flex gap-1 mt-2">
                                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4" style={{ color: "#ffee44", fill: "#ffee44" }} />)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Photos */}
                                    <div className="flex gap-4 p-6 rounded-3xl transition-colors" style={{ background: "#0d0d0d", border: `1px solid ${a}1a` }}>
                                        <div className="p-3 rounded-2xl h-fit" style={{ background: `${a}15`, border: `1px solid ${a}33` }}>
                                            <Camera style={{ color: a, width: 24, height: 24 }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg" style={{ color: "#e8e8e8" }}>Uploaded 12 new photos</h3>
                                                <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#555", background: "#080808" }}>3 days ago</span>
                                            </div>
                                            <p className="mt-1" style={{ color: "#777" }}>Album: "Hiking in the High Tatras" 🏔️</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="flex flex-col lg:w-100 gap-4">

                            {/* About Me */}
                            <div
                                className="p-6 h-fit"
                                style={{ background: "linear-gradient(160deg, #111 0%, #0d0d0d 100%)", border: `1px solid ${a}22`, borderRadius: "1.5rem" }}
                            >
                                <h1 className="text-center font-bold text-2xl tracking-wider mb-4 flex items-center justify-center gap-2" style={{ color: "#e8e8e8" }}>
                                    <Quote className="w-5 h-5" style={{ fill: `${a}50`, color: "transparent" }} /> About Me
                                </h1>
                                <p className="font-medium text-lg text-center text-balance leading-relaxed" style={{ color: "#777" }}>
                                    Digital nomad & coffee addict. ☕ <br />
                                    I love discovering hidden gems and local food. Currently exploring Central Europe.
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    {["Backpacker", "Foodie", "History"].map(tag => (
                                        <Badge
                                            key={tag}
                                            className="rounded-xl px-3 py-1 border-none font-semibold"
                                            style={{ background: `${a}18`, color: a, border: `1px solid ${a}44` }}
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Achievements */}
                            <div
                                className="p-8 h-full flex flex-col"
                                style={{ background: "linear-gradient(160deg, #111 0%, #080808 100%)", border: `1px solid ${a}22`, borderRadius: "1.5rem" }}
                            >
                                <h1 className="text-center font-bold text-2xl tracking-wider mb-6 flex items-center justify-center gap-2" style={{ color: "#e8e8e8" }}>
                                    <Trophy className="w-6 h-6" style={{ color: a }} /> Achievements
                                </h1>

                                <div className="grid grid-cols-3 gap-4 place-items-center">
                                    {[
                                        { Icon: Award, label: "Top Reviewer", locked: false },
                                        { Icon: Plane, label: "Frequent Flyer", locked: false },
                                        { Icon: MapPin, label: "Local Guide", locked: false },
                                        { Icon: Camera, label: "Photographer", locked: true },
                                    ].map(({ Icon, label, locked }) => (
                                        <div key={label} className={`flex flex-col items-center gap-2 group cursor-pointer ${locked ? "opacity-40 grayscale" : ""}`}>
                                            <div style={{
                                                width: 64, height: 64, borderRadius: "50%",
                                                background: locked ? "#0d0d0d" : `${a}12`,
                                                border: locked ? "2px dashed #222" : `2px solid ${a}66`,
                                                boxShadow: locked ? "none" : `0 0 16px ${g}`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "box-shadow 0.2s, transform 0.2s",
                                            }}
                                                className="group-hover:scale-110"
                                            >
                                                <Icon style={{ color: locked ? "#333" : a, width: 28, height: 28 }} />
                                            </div>
                                            <span className="text-xs font-bold text-center" style={{ color: locked ? "#333" : "#aaa" }}>{label}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button variant="link" className="mt-auto pt-6" style={{ color: `${a}88` }}>
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
