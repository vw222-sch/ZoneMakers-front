import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { BadgeCheck, MessageCircle, MapPin, Quote, Footprints, Settings, Trash2, Save, Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

import type { User, BadgeData, TravelLog } from "@/types";
import { REGIONS, REGION_COLORS, getRegionById } from "@/types";
import * as userService from "@/services/userService";
import * as travelService from "@/services/travelService";
import * as notificationService from "@/services/notificationService";
import { useAuth } from "@/hooks/AuthContext";
import { getErrorMessage } from "@/lib/api";

const THEME_COLORS = [
    { id: 1, name: "Red", hex: "#ff4444", glow: "#ff000066", dark: "#1a0000" },
    { id: 2, name: "Blue", hex: "#4488ff", glow: "#0044ff66", dark: "#00091a" },
    { id: 3, name: "Green", hex: "#44ff88", glow: "#00ff4466", dark: "#001a0a" },
    { id: 4, name: "Magenta", hex: "#ff44ff", glow: "#ff00ff66", dark: "#1a001a" },
    { id: 5, name: "Cyan", hex: "#44ffff", glow: "#00ffff66", dark: "#001a1a" },
    { id: 6, name: "Yellow", hex: "#ffee44", glow: "#ffee0066", dark: "#1a1400" },
];

const TRAVEL_TYPES = [
    { value: "check_in", label: "Check-in" },
    { value: "visit", label: "Visit" },
    { value: "note", label: "Note" },
    { value: "review", label: "Review" },
];

const safeParseJSON = <T,>(str: string | null | undefined | number[], fallback: T): T => {
    if (!str) return fallback;
    if (Array.isArray(str)) return str as T;
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
};

const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

export default function UserDetails() {
    const params = useParams();
    const userId = params.userId as string;
    const navigate = useNavigate();

    const { state: authState, logout: contextLogout } = useAuth();
    const isOwner = authState.userId?.toString() === userId;
    const isAdmin = authState.isAdmin;
    const canEdit = isOwner || isAdmin;

    const [user, setUser] = useState<User | null>(null);
    const [badgeDetails, setBadgeDetails] = useState<BadgeData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [colorIndex, setColorIndex] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Travel log állapot
    const [travelLogs, setTravelLogs] = useState<TravelLog[]>([]);
    const [travelLoading, setTravelLoading] = useState(false);
    const [travelDialogOpen, setTravelDialogOpen] = useState(false);
    const [creatingTravel, setCreatingTravel] = useState(false);
    const [deletingTravelId, setDeletingTravelId] = useState<number | null>(null);
    const [newTravel, setNewTravel] = useState({ title: "", message: "", type: "check_in" });

    const [formData, setFormData] = useState({
        username: "",
        handle: "",
        email: "",
        bio: "",
        avatar: "",
        theme: 1,
        password: "",
        pinned_badges: [] as number[],
        region: 0,
    });

    const fetchUserData = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const { user: userData, badges } = await userService.fetchUserWithBadges(userId);

            setUser(userData);
            setBadgeDetails(badges);

            const userThemeIndex = THEME_COLORS.findIndex(t => t.id === userData.theme);
            setColorIndex(userThemeIndex !== -1 ? userThemeIndex : 0);

            const parsedPinned = safeParseJSON<number[]>(userData.pinned_badges, []);
            const regionName = REGIONS[userData.region] || "";

            setFormData({
                username: userData.username || "",
                handle: userData.handle || "",
                email: userData.email || "",
                bio: userData.bio || "",
                avatar: userData.avatar || "",
                theme: userData.theme || 1,
                password: "",
                pinned_badges: parsedPinned,
                region: userData.region || 0,
            });
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const fetchTravelLogs = useCallback(async () => {
        if (!userId) return;
        try {
            setTravelLoading(true);
            const logs = await travelService.fetchTravelLogs(1);
            setTravelLogs(logs.filter(l => l.user_id === parseInt(userId, 10)));
        } catch (err) {
            console.error("Failed to fetch travel logs:", err);
        } finally {
            setTravelLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        fetchTravelLogs();
    }, [fetchTravelLogs]);

    const togglePinnedBadge = (badgeId: number) => {
        setFormData(prev => {
            const isSelected = prev.pinned_badges.includes(badgeId);
            if (isSelected) {
                return { ...prev, pinned_badges: prev.pinned_badges.filter(id => id !== badgeId) };
            } else {
                if (prev.pinned_badges.length >= 3) return prev;
                return { ...prev, pinned_badges: [...prev.pinned_badges, badgeId] };
            }
        });
    };

    const handleSaveSettings = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            const updates: Promise<any>[] = [];
            const targetId = user.id;

            if (formData.username.trim() !== (user.username || "").trim()) {
                updates.push(userService.updateUserName(targetId, formData.username.trim()));
            }

            if (formData.handle.trim() !== (user.handle || "").trim()) {
                updates.push(userService.updateUserHandle(targetId, formData.handle.trim()));
            }

            if (formData.email.trim().toLowerCase() !== (user.email || "").trim().toLowerCase()) {
                updates.push(userService.updateUserEmail(targetId, formData.email.trim()));
            }

            if (formData.bio !== (user.bio || "")) {
                updates.push(userService.updateUserBio(targetId, formData.bio));
            }

            if (formData.avatar !== (user.avatar || "")) {
                updates.push(userService.updateUserAvatar(targetId, formData.avatar));
            }

            if (Number(formData.theme) !== Number(user.theme)) {
                updates.push(userService.updateUserTheme(targetId, Number(formData.theme)));
            }

            if (formData.password && formData.password.trim() !== "") {
                updates.push(userService.updateUserPassword(targetId, formData.password));
            }

            const origPinned = safeParseJSON<number[]>(user.pinned_badges, []).sort();
            const newPinned = [...formData.pinned_badges].sort();

            if (JSON.stringify(origPinned) !== JSON.stringify(newPinned)) {
                updates.push(userService.updateUserPinnedBadges(targetId, formData.pinned_badges));
            }

            if (formData.region !== (user.region || 0)) {
                updates.push(userService.updateUserRegion(targetId, formData.region));
            }

            if (updates.length === 0) {
                setIsSettingsOpen(false);
                return;
            }

            await Promise.all(updates);

            if (!isOwner && isAdmin) {
                try {
                    await notificationService.createNotification(
                        targetId,
                        "Profile modified",
                        "An administrator has modified your profile information.",
                        "admin_action"
                    );
                } catch (notifErr) {
                    console.error("Failed to send notification:", notifErr);
                }
            }

            setIsSettingsOpen(false);
            fetchUserData();
        } catch (err) {
            console.error(err);
            alert("An error occurred while saving: " + getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateTravelLog = async () => {
        if (!newTravel.title.trim() || !newTravel.message.trim()) return;

        try {
            setCreatingTravel(true);
            await travelService.createTravelLog(newTravel.title.trim(), newTravel.message.trim(), newTravel.type);
            setTravelDialogOpen(false);
            setNewTravel({ title: "", message: "", type: "check_in" });
            fetchTravelLogs();
        } catch (err) {
            alert("Failed to create travel log: " + getErrorMessage(err));
        } finally {
            setCreatingTravel(false);
        }
    };

    const handleDeleteTravelLog = async (logId: number) => {
        if (!confirm("Delete this travel log entry?")) return;

        try {
            setDeletingTravelId(logId);
            await travelService.deleteTravelLog(logId);
            fetchTravelLogs();
        } catch (err) {
            alert("Failed to delete: " + getErrorMessage(err));
        } finally {
            setDeletingTravelId(null);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("WARNING: Are you sure you want to delete this account? This action is irreversible!")) return;

        try {
            if (!user?.id) return;

            await userService.deleteUser(user.id);

            if (isOwner) {
                contextLogout();
                navigate("/");
            } else {
                navigate("/admin");
            }
        } catch (err) {
            alert("An error occurred while deleting the account: " + getErrorMessage(err));
        }
    };

    const accent = THEME_COLORS[colorIndex] || THEME_COLORS[0];
    const a = accent.hex;
    const g = accent.glow;
    const d = accent.dark;

    const currentPinnedIds = safeParseJSON<number[]>(user?.pinned_badges, []);
    const userRegion = user ? getRegionById(user.region) : null;
    const userRegionColor = userRegion ? (REGION_COLORS[userRegion.name] || "#888") : "#888";

    if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen bg-[#050505] text-red-500 flex items-center justify-center">Error: {error}</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen pb-10" style={{ background: `radial-gradient(ellipse at 60% 0%, ${d} 0%, #101010 55%, #000 100%)` }}>
            <div className="container mx-auto px-4 sm:px-8 h-fit max-w-7xl pt-8">
                <div className="flex flex-col w-full gap-4 rounded-4xl pb-4">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 rounded-t-4xl rounded-b-xl relative overflow-hidden"
                        style={{ background: `linear-gradient(135deg, #111 0%, ${d} 60%, #0d0d0d 100%)`, borderBottom: `1px solid ${a}33` }}>

                        <div className="absolute inset-0 pointer-events-none"
                            style={{ backgroundImage: `linear-gradient(${a}08 1px, transparent 1px), linear-gradient(90deg, ${a}08 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

                        <Avatar className="sm:w-48 sm:h-48 w-32 h-32 z-10 shrink-0" style={{ border: `3px solid ${a}66`, boxShadow: `0 0 32px ${g}` }}>
                            <AvatarImage src={user.avatar || undefined} className="object-cover" />
                            <AvatarFallback className="bg-[#111] text-4xl" style={{ color: a }}>
                                {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col gap-2 z-10 text-white w-full text-center md:text-left mt-4 md:mt-0">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h1 className="font-extrabold text-4xl tracking-wide drop-shadow-md text-[#e8e8e8]">{user.username}</h1>
                                {user.verified === 1 && (
                                    <BadgeCheck size={28} style={{ color: a, filter: `drop-shadow(0 0 6px ${a})` }} />
                                )}
                                {user.admin === 1 && (
                                    <span className="text-xs px-2 py-1 rounded-md bg-red-600 font-bold ml-2">ADMIN</span>
                                )}
                            </div>
                            <p className="font-semibold tracking-wider text-[#777]">@{user.handle}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                                {canEdit ? (
                                    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="px-6 py-5 font-bold text-sm rounded-full cursor-pointer shadow-lg transition-all border-none"
                                                style={{ background: a, color: "#000", boxShadow: `0 0 15px ${g}` }}>
                                                Edit Profile <Settings className="w-4 h-4 ml-2" />
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent className="sm:max-w-125 bg-[#111] text-white border border-[#333] shadow-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl" style={{ color: a }}>
                                                    Profile Settings {isAdmin && !isOwner && <span className="text-sm font-normal text-gray-400">(Admin Edit)</span>}
                                                </DialogTitle>
                                                <DialogDescription className="text-gray-400">Modify your information. Click the save button to finalize changes.</DialogDescription>
                                            </DialogHeader>

                                            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="username">Username</Label>
                                                    <Input id="username" className="bg-[#222] border-[#444]" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="handle">Handle</Label>
                                                    <Input id="handle" className="bg-[#222] border-[#444]" value={formData.handle} onChange={(e) => setFormData({ ...formData, handle: e.target.value })} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input id="email" type="email" className="bg-[#222] border-[#444]" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="avatar">Avatar URL</Label>
                                                    <Input id="avatar" className="bg-[#222] border-[#444]" placeholder="https://..." value={formData.avatar} onChange={(e) => setFormData({ ...formData, avatar: e.target.value })} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="bio">Bio</Label>
                                                    <Textarea id="bio" className="bg-[#222] border-[#444] resize-none h-24" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
                                                </div>

                                                <div className="grid gap-2 mt-2">
                                                    <Label>Theme Color</Label>
                                                    <div className="flex gap-3 flex-wrap">
                                                        {THEME_COLORS.map((c) => (
                                                            <button key={c.id} title={c.name} type="button" onClick={() => setFormData({ ...formData, theme: c.id })}
                                                                className="w-8 h-8 rounded-full cursor-pointer transition-all"
                                                                style={{ background: c.hex, border: formData.theme === c.id ? "3px solid #fff" : "2px solid transparent", boxShadow: formData.theme === c.id ? `0 0 10px ${c.glow}` : "none" }} />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid gap-2 mt-2">
                                                    <Label>Region</Label>
                                                    <Select
                                                        value={String(formData.region)}
                                                        onValueChange={(val) => setFormData({ ...formData, region: Number(val) })}
                                                    >
                                                        <SelectTrigger className="bg-[#222] border-[#444]">
                                                            <SelectValue placeholder="Select region..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {REGIONS.map((r) => (
                                                                <SelectItem key={r.id} value={String(r.id)}>
                                                                    <span className="flex items-center gap-2">
                                                                        <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ background: REGION_COLORS[r.name] }} />
                                                                        {r.name}
                                                                    </span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid gap-2 mt-2">
                                                    <Label htmlFor="password">New Password</Label>
                                                    <Input id="password" type="password" className="bg-[#222] border-[#444]" placeholder="Leave blank if not changing..." value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                                </div>

                                                <div className="grid gap-2 mt-2">
                                                    <Label>Pinned Badges (Max 3)</Label>
                                                    <div className="flex flex-wrap gap-2 p-3 bg-[#222] rounded-lg border border-[#444] min-h-16">
                                                        {badgeDetails.length > 0 ? badgeDetails.map((badge) => {
                                                            const isSelected = formData.pinned_badges.includes(badge.id);
                                                            return (
                                                                <img key={badge.id} alt={badge.title} src={badge.image} title={badge.title} onClick={() => togglePinnedBadge(badge.id)}
                                                                    className="w-10 h-10 rounded-md cursor-pointer transition-all object-cover"
                                                                    style={{ border: isSelected ? `2px solid ${a}` : "2px solid transparent", opacity: isSelected ? 1 : 0.4, boxShadow: isSelected ? `0 0 10px ${g}` : "none" }} />
                                                            );
                                                        }) : (
                                                            <span className="text-xs text-gray-500">No pinned badges available.</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-right text-gray-400 font-mono">{formData.pinned_badges.length} / 3 selected</span>
                                                </div>
                                            </div>

                                            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mt-4 pt-4 border-t border-[#333]">
                                                <Button variant="destructive" onClick={handleDeleteAccount} className="w-full sm:w-auto flex items-center gap-2">
                                                    <Trash2 className="w-4 h-4" /> Delete Account
                                                </Button>
                                                <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full sm:w-auto bg-white text-black hover:bg-gray-200">
                                                    {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save</>}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <Button className="px-6 py-5 font-bold text-sm rounded-full cursor-pointer transition-all border-none bg-[#222] text-white hover:bg-[#333]">
                                        Message <MessageCircle className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="hidden lg:flex flex-col items-center justify-center ml-auto z-10 gap-3 min-w-50">
                            <div className="text-lg font-bold tracking-widest rounded-xl p-3 w-full text-center" style={{ color: a, border: `1px solid ${a}33`, background: `${a}12`, textShadow: `0 0 8px ${g}` }}>REP: {user.reputation}</div>
                            {userRegion && (
                                <div className="text-sm font-bold tracking-widest rounded-xl p-3 w-full text-center" style={{ color: userRegionColor, border: `1px solid ${userRegionColor}33`, background: `${userRegionColor}12`, textShadow: `0 0 8px ${userRegionColor}66` }}>
                                    {userRegion.name}
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-2 mt-2">
                                {badgeDetails
                                    .filter(b => currentPinnedIds.includes(b.id))
                                    .map(badge => (
                                        <img key={`pinned-${badge.id}`} alt={badge.title} src={badge.image} title={badge.title} className="rounded-xl w-10 h-10 object-cover" style={{ background: `${a}18`, boxShadow: `0 0 12px ${g}` }} />
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4 mt-2">
                        {/* Travel Log */}
                        <div className="flex-1">
                            <div className="h-full min-h-100 p-6 sm:p-8 rounded-3xl" style={{ background: "linear-gradient(160deg, #111 0%, #0d0d0d 100%)", border: `1px solid ${a}22` }}>
                                <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: `1px solid ${a}22` }}>
                                    <div className="flex items-center gap-3">
                                        <Footprints className="w-7 h-7" style={{ color: a, filter: `drop-shadow(0 0 6px ${a})` }} />
                                        <h2 className="font-bold text-2xl tracking-wider text-[#e8e8e8]">Travel Log</h2>
                                    </div>
                                    {isOwner && (
                                        <Dialog open={travelDialogOpen} onOpenChange={setTravelDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="rounded-full px-4 cursor-pointer" style={{ background: a, color: "#000", border: "none" }}>
                                                    <Plus className="w-4 h-4 mr-1" /> New Entry
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-[#111] text-white border border-[#333]">
                                                <DialogHeader>
                                                    <DialogTitle>New Travel Log Entry</DialogTitle>
                                                    <DialogDescription className="text-gray-400">Log your latest travel experience.</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Title</Label>
                                                        <Input className="bg-[#222] border-[#444]" placeholder="Checked in at..." value={newTravel.title} onChange={(e) => setNewTravel({ ...newTravel, title: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Type</Label>
                                                        <Select value={newTravel.type} onValueChange={(val) => setNewTravel({ ...newTravel, type: val })}>
                                                            <SelectTrigger className="bg-[#222] border-[#444]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {TRAVEL_TYPES.map(t => (
                                                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Message</Label>
                                                        <Textarea className="bg-[#222] border-[#444] resize-none h-28" placeholder="What happened?" value={newTravel.message} onChange={(e) => setNewTravel({ ...newTravel, message: e.target.value })} />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                    </DialogClose>
                                                    <Button onClick={handleCreateTravelLog} disabled={creatingTravel || !newTravel.title.trim() || !newTravel.message.trim()} style={{ background: a, color: "#000", border: "none" }}>
                                                        {creatingTravel ? "Creating..." : "Create"}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {travelLoading ? (
                                        <p className="text-sm text-gray-500 text-center py-4">Loading travel logs...</p>
                                    ) : travelLogs.length > 0 ? travelLogs.map(log => (
                                        <div key={log.id} className="flex gap-4 p-5 rounded-2xl transition-colors bg-[#151515] hover:bg-[#1a1a1a]" style={{ border: `1px solid ${a}1a` }}>
                                            <div className="p-3 rounded-xl h-fit" style={{ background: `${a}15`, border: `1px solid ${a}33` }}><MapPin className="w-5 h-5" style={{ color: a }} /></div>
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                                    <h3 className="font-bold text-md text-white">{log.title}</h3>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className="text-xs px-2 py-1 rounded-md bg-[#222] text-gray-300 w-fit capitalize">{log.type?.replace('_', ' ')}</span>
                                                        <span className="text-xs px-2 py-1 rounded-md bg-[#222] text-gray-300 w-fit">{formatTimestamp(log.timestamp)}</span>
                                                        {isOwner && (
                                                            <button
                                                                onClick={() => handleDeleteTravelLog(log.id)}
                                                                disabled={deletingTravelId === log.id}
                                                                className="p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50 cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-400">{log.message}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-500 italic text-center py-4">No travel logs yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* About Me & Badges */}
                        <div className="flex flex-col lg:w-96 gap-4">
                            <div className="p-6 h-full min-h-100 rounded-3xl bg-[linear-gradient(160deg,#111_0%,#0d0d0d_100%)] border flex flex-col" style={{ borderColor: `${a}22` }}>
                                <h2 className="text-center font-bold text-xl tracking-wider mb-4 flex items-center justify-center gap-2 text-white pb-4 border-b border-[#222]">
                                    <Quote className="w-5 h-5 text-transparent" style={{ fill: `${a}50` }} /> About Me
                                </h2>
                                <p className="font-medium text-md text-center leading-relaxed text-gray-300 flex-1">
                                    {user.bio || <span className="italic text-gray-600">No Bio yet.</span>}
                                </p>
                                <div className="mt-8 pt-4 border-t border-[#222]">
                                    <h3 className="text-center text-sm text-gray-500 font-bold mb-4 uppercase tracking-widest">Badges</h3>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {badgeDetails.length > 0 ? badgeDetails.map((badge) => (
                                            <img key={badge.id} alt={badge.title} src={badge.image} title={badge.title} className="rounded-xl border border-[#333] w-14 h-14 object-cover" style={{ background: `${a}18`, boxShadow: `0 0 10px ${a}15` }} />
                                        )) : (
                                            <span className="text-xs text-gray-600">No badges available.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}