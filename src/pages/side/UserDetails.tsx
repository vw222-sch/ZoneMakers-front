"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {BadgeCheck, MapPin, Camera, Plane, Star,Award, Quote, Footprints, Trophy, Settings,} from "lucide-react"

const ACCENT_COLORS = [
    { name: "Red",     hex: "#ff4444", glow: "#ff000066", dark: "#1a0000" },
    { name: "Blue",    hex: "#4444ff", glow: "#0000ff66", dark: "#00001a" },
    { name: "Green",   hex: "#44ff44", glow: "#00ff0066", dark: "#001a00" },
    { name: "Magenta", hex: "#ff44ff", glow: "#ff00ff66", dark: "#1a001a" },
    { name: "Cyan",    hex: "#44ffff", glow: "#00ffff66", dark: "#001a1a" },
    { name: "Yellow",  hex: "#ffff44", glow: "#ffff0066", dark: "#1a1a00" },
]

const USER = {
    name:       "John Doe",
    handle:     "@johndoe",
    avatarSrc:  "https://github.com/shadcn.png",
    level:      12,
    reputation: 850,
    bio:        "Digital nomad & coffee addict. ☕\nI love discovering hidden gems and local food. Currently exploring Central Europe.",
    tags:       ["Backpacker", "Foodie", "History"],
}

const TRAVEL_LOG: Array<{
    icon:      React.ElementType
    iconColor: string
    title:     string
    time:      string
    body:      string
    tags?:     string[]
    stars?:    number
}> = [
    {
        icon:      MapPin,
        iconColor: "accent",
        title:     "Checked in at Budapest",
        time:      "2 hours ago",
        body:      "Visiting the Parliament building. The architecture is absolutely stunning! 🏛️",
        tags:      ["#architecture", "#hungary"],
    },
    {
        icon:      Star,
        iconColor: "#ffee44",
        title:     'Reviewed "Gelarto Rosa"',
        time:      "Yesterday",
        body:      "Best ice cream in town! You have to try the pistachio flavor. 🍦",
        stars:     5,
    },
    {
        icon:      Camera,
        iconColor: "accent",
        title:     "Uploaded 12 new photos",
        time:      "3 days ago",
        body:      'Album: "Hiking in the High Tatras" 🏔️',
    },
]

const ACHIEVEMENTS: Array<{
    icon:   React.ElementType
    label:  string
    locked: boolean
}> = [
    { icon: Award,  label: "Top Reviewer",   locked: false },
    { icon: Plane,  label: "Frequent Flyer", locked: false },
    { icon: MapPin, label: "Local Guide",    locked: false },
    { icon: Camera, label: "Photographer",   locked: true  },
]

function Card({
    a, children, className = "", style = {},
}: {
    a: string; children: React.ReactNode; className?: string; style?: React.CSSProperties
}) {
    return (
        <div
            className={className}
            style={{
                background:   "linear-gradient(160deg, #111 0%, #0d0d0d 100%)",
                border:       `1px solid ${a}22`,
                borderRadius: "1.5rem",
                ...style,
            }}
        >
            {children}
        </div>
    )
}

function IconCircle({
    Icon, a, g, size = 64, iconSize = 28, locked = false,
}: {
    Icon: React.ElementType; a: string; g: string
    size?: number; iconSize?: number; locked?: boolean
}) {
    return (
        <div style={{
            width:      size, height: size,
            borderRadius: "50%",
            background: locked ? "#0d0d0d" : `${a}12`,
            border:     locked ? "2px dashed #222" : `2px solid ${a}66`,
            boxShadow:  locked ? "none" : `0 0 16px ${g}`,
            display:    "flex", alignItems: "center", justifyContent: "center",
        }}>
            <Icon style={{ color: locked ? "#333" : a, width: iconSize, height: iconSize }} />
        </div>
    )
}

function AccentBadge({ label, a }: { label: string; a: string }) {
    return (
        <Badge
            className="rounded-xl px-3 py-1 border-none font-semibold"
            style={{ background: `${a}18`, color: a, border: `1px solid ${a}44` }}
        >
            {label}
        </Badge>
    )
}

function TravelLogEntry({
    entry, a,
}: {
    entry: (typeof TRAVEL_LOG)[number]; a: string; g: string
}) {
    const iconColor = entry.iconColor === "accent" ? a : entry.iconColor
    return (
        <div className="flex gap-4 p-6 rounded-3xl" style={{ background: "#0d0d0d", border: `1px solid ${a}1a` }}>
            <div className="p-3 rounded-2xl h-fit" style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}33` }}>
                <entry.icon style={{ color: iconColor, width: 24, height: 24 }} />
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg" style={{ color: "#e8e8e8" }}>{entry.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#555", background: "#080808" }}>
                        {entry.time}
                    </span>
                </div>

                <p className="mt-1" style={{ color: "#777" }}>{entry.body}</p>

                {entry.tags && (
                    <div className="flex gap-2 mt-3">
                        {entry.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="rounded-lg" style={{ color: a, borderColor: `${a}44` }}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {entry.stars && (
                    <div className="flex gap-1 mt-2">
                        {Array.from({ length: entry.stars }).map((_, i) => (
                            <Star key={i} className="w-4 h-4" style={{ color: "#ffee44", fill: "#ffee44" }} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function TravelLog({ a, g }: { a: string; g: string }) {
    return (
        <Card a={a} className="h-full min-h-125 p-8">
            <div className="flex items-center gap-3 mb-8 pb-4" style={{ borderBottom: `1px solid ${a}22` }}>
                <Footprints style={{ color: a, width: 32, height: 32, filter: `drop-shadow(0 0 6px ${a})` }} />
                <h2 className="font-bold text-3xl tracking-wider" style={{ color: "#e8e8e8" }}>Travel Log</h2>
            </div>
            <div className="space-y-6">
                {TRAVEL_LOG.map(entry => (
                    <TravelLogEntry key={entry.title} entry={entry} a={a} g={g} />
                ))}
            </div>
        </Card>
    )
}

function AboutMe({ a }: { a: string }) {
    return (
        <Card a={a} className="p-6 h-fit">
            <h2 className="text-center font-bold text-2xl tracking-wider mb-4 flex items-center justify-center gap-2" style={{ color: "#e8e8e8" }}>
                <Quote className="w-5 h-5" style={{ fill: `${a}50`, color: "transparent" }} />
                About Me
            </h2>
            <p className="font-medium text-lg text-center text-balance leading-relaxed whitespace-pre-line" style={{ color: "#777" }}>
                {USER.bio}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {USER.tags.map(tag => <AccentBadge key={tag} label={tag} a={a} />)}
            </div>
        </Card>
    )
}

function Achievements({ a, g }: { a: string; g: string }) {
    return (
        <Card a={a} className="p-8 h-full flex flex-col">
            <h2 className="text-center font-bold text-2xl tracking-wider mb-6 flex items-center justify-center gap-2" style={{ color: "#e8e8e8" }}>
                <Trophy className="w-6 h-6" style={{ color: a }} /> Achievements
            </h2>

            <div className="grid grid-cols-3 gap-4 place-items-center">
                {ACHIEVEMENTS.map(({ icon: Icon, label, locked }) => (
                    <div
                        key={label}
                        className={`flex flex-col items-center gap-2 group cursor-pointer ${locked ? "opacity-40 grayscale" : ""}`}
                    >
                        <div className="group-hover:scale-110 transition-transform duration-200">
                            <IconCircle Icon={Icon} a={a} g={g} locked={locked} />
                        </div>
                        <span className="text-xs font-bold text-center" style={{ color: locked ? "#333" : "#aaa" }}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            <Button variant="link" className="mt-auto pt-6" style={{ color: `${a}88` }}>
                View All 12 Stamps
            </Button>
        </Card>
    )
}

export default function UserDetails() {
    const [colorIndex, setColorIndex] = useState(1)
    const { hex: a, glow: g, dark: d } = ACCENT_COLORS[colorIndex]

    return (
        <div style={{ background: `radial-gradient(ellipse at 60% 0%, ${d} 0%, #101010 55%, #000 100%)`, minHeight: "100vh" }}>

            <div style={{ background: "#050505", borderBottom: "1px solid #1a1a1a", padding: "10px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", gap: 6 }}>
                    {ACCENT_COLORS.map((c, i) => (
                        <button
                            key={c.name}
                            onClick={() => setColorIndex(i)}
                            title={c.name}
                            style={{
                                width: 18, height: 18, borderRadius: "50%",
                                background: c.hex,
                                border:     colorIndex === i ? "2px solid #fff" : "2px solid #222",
                                boxShadow:  colorIndex === i ? `0 0 8px ${c.glow}` : "none",
                                cursor: "pointer", padding: 0,
                            }}
                        />
                    ))}
                </div>
                <span style={{ color: a, fontSize: 12, fontWeight: 700, minWidth: 56, textAlign: "right", textShadow: `0 0 8px ${g}` }}>
                    {ACCENT_COLORS[colorIndex].name}
                </span>
            </div>

            <div className="container mx-auto px-4 sm:px-8 h-fit max-w-7xl">
                <div className="flex flex-col w-full gap-4 rounded-4xl pb-4">

                    <div
                        className="flex items-center gap-8 p-8 rounded-t-4xl relative"
                        style={{
                            background:   `linear-gradient(135deg, #111 0%, ${d} 60%, #0d0d0d 100%)`,
                            borderBottom: `1px solid ${a}33`,
                        }}
                    >
                        <div style={{
                            position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
                            backgroundImage: `linear-gradient(${a}08 1px, transparent 1px), linear-gradient(90deg, ${a}08 1px, transparent 1px)`,
                            backgroundSize: "40px 40px",
                        }} />

                        <Avatar
                            className="sm:w-50 sm:h-50 w-35 h-35 z-10"
                            style={{ border: `3px solid ${a}66`, boxShadow: `0 0 32px ${g}` }}
                        >
                            <AvatarImage src={USER.avatarSrc} />
                            <AvatarFallback style={{ background: "#111", color: a }}>
                                {USER.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col gap-1 z-10 text-white">
                            <div className="flex items-center gap-2">
                                <h1 className="font-extrabold text-4xl tracking-wide drop-shadow-md" style={{ color: "#e8e8e8" }}>
                                    {USER.name}
                                </h1>
                                <BadgeCheck size={30} style={{ color: a, filter: `drop-shadow(0 0 6px ${a})` }} />
                            </div>
                            <p className="font-semibold tracking-wider" style={{ color: "#555" }}>{USER.handle}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <Button
                                    className="p-5 font-bold border-2 text-sm rounded-4xl cursor-pointer shadow-lg transition-all"
                                    style={{ background: a, color: "#000", border: "none", boxShadow: `0 0 18px ${g}` }}
                                >
                                    Settings <Settings className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="hidden lg:flex flex-col items-center ml-auto z-10 gap-4">
                            {[`Explorer Lvl. ${USER.level}`, `Reputation: ${USER.reputation}`].map(label => (
                                <h2
                                    key={label}
                                    className="text-xl font-bold tracking-widest rounded-2xl p-2 w-full text-center"
                                    style={{ color: a, border: `1px solid ${a}33`, background: `${a}12`, textShadow: `0 0 10px ${g}` }}
                                >
                                    {label}
                                </h2>
                            ))}
                            <div className="flex items-center gap-2">
                                {[Award, Plane, MapPin].map((Icon, i) => (
                                    <IconCircle key={i} Icon={Icon} a={a} g={g} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4">
                        <div className="flex-1">
                            <TravelLog a={a} g={g} />
                        </div>
                        <div className="flex flex-col lg:w-100 gap-4">
                            <AboutMe a={a} />
                            <Achievements a={a} g={g} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}