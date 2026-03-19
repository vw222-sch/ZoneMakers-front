import { MapPin } from "lucide-react"

export default function Notifications() {
    return (
        <div className="container mx-auto max-w-6xl px-4 min-h-screen space-y-6">
            <h1 className="fl-text-4xl/6xl font-bold tracking-wide text-center my-16">Notifications</h1>

            <div className="flex gap-4 p-6 rounded-2xl border-2">
                <div className="p-3 bg-blue-500/80 rounded-2xl h-fit border border-blue-400/70">
                    <MapPin className="text-blue-200 w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-extrabold tracking-wider text-lg">Checked in at Budapest</h3>
                        <span className="text-xs text-white font-bold bg-black/20 px-4 py-2 rounded-lg">2 hours ago</span>
                    </div>
                    <p className="mt-1 font-semibold tracking-wide">Visiting the Parliament building. The architecture is absolutely stunning! 🏛️</p>
                </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl border-2">
                <div className="p-3 bg-blue-500/80 rounded-2xl h-fit border border-blue-400/70">
                    <MapPin className="text-blue-200 w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-extrabold tracking-wider text-lg">Checked in at Budapest</h3>
                        <span className="text-xs text-white font-bold bg-black/20 px-4 py-2 rounded-lg">2 hours ago</span>
                    </div>
                    <p className="mt-1 font-semibold tracking-wide">Visiting the Parliament building. The architecture is absolutely stunning! 🏛️</p>
                </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl border-2">
                <div className="p-3 bg-blue-500/80 rounded-2xl h-fit border border-blue-400/70">
                    <MapPin className="text-blue-200 w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-extrabold tracking-wider text-lg">Checked in at Budapest</h3>
                        <span className="text-xs text-white font-bold bg-black/20 px-4 py-2 rounded-lg">2 hours ago</span>
                    </div>
                    <p className="mt-1 font-semibold tracking-wide">Visiting the Parliament building. The architecture is absolutely stunning! 🏛️</p>
                </div>
            </div>
        </div>
    )
}
