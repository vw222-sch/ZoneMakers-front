import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Shield, Mail, UserCircle, Trash2, Bell, Loader2, Award, X, Save } from "lucide-react";
import { fetchUserByHandle, deleteUser } from "@/services/userService";
import { grantBadge, removeBadge, updateUserRep } from "@/services/adminService";
import { fetchAllBadges } from "@/services/badgeService";
import { createNotification } from "@/services/notificationService";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/AuthContext";
import type { User, BadgeData } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminUserSearch() {
    const [searchHandle, setsearchHandle] = useState("");
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [sendingNotif, setSendingNotif] = useState(false);
    const { state: authState } = useAuth();

    const [notifTitle, setNotifTitle] = useState("");
    const [notifMessage, setNotifMessage] = useState("");
    const [notifType, setNotifType] = useState("info");
    const [notifDialogOpen, setNotifDialogOpen] = useState(false);

    const [allBadges, setAllBadges] = useState<BadgeData[]>([]);
    const [badgesLoading, setBadgesLoading] = useState(false);
    const [badgeActionLoading, setBadgeActionLoading] = useState<number | null>(null);

    const [newRep, setNewRep] = useState("");
    const [repUpdating, setRepUpdating] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchHandle) return;

        setLoading(true);
        setError("");
        setUserData(null);
        setAllBadges([]);
        setNewRep("");

        try {
            const data = await fetchUserByHandle(searchHandle);
            setUserData(data);

            if (data.id === authState.userId) {
                setError("⚠️ This is your own profile!");
            }

            setBadgesLoading(true);
            try {
                const badges = await fetchAllBadges();
                setAllBadges(badges);
            } catch (badgeErr) {
                console.error("Failed to fetch badges:", badgeErr);
            } finally {
                setBadgesLoading(false);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userData) return;
        if (userData.id === authState.userId) {
            alert("You cannot delete your own account!");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete user "${userData.username}"? This action is irreversible!`)) return;

        try {
            setDeleting(true);
            await deleteUser(userData.id);
            setUserData(null);
            setAllBadges([]);
            alert("User deleted successfully!");
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setDeleting(false);
        }
    };

    const handleSendNotification = async () => {
        if (!userData || !notifTitle.trim() || !notifMessage.trim()) return;

        try {
            setSendingNotif(true);
            await createNotification(
                userData.id,
                notifTitle.trim(),
                notifMessage.trim(),
                notifType
            );
            setNotifDialogOpen(false);
            setNotifTitle("");
            setNotifMessage("");
            setNotifType("info");
            alert("Notification sent successfully!");
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setSendingNotif(false);
        }
    };

    const openNotifDialog = () => {
        setNotifTitle("");
        setNotifMessage("");
        setNotifType("info");
        setNotifDialogOpen(true);
    };

    const handleGrantBadge = async (badgeId: number) => {
        if (!userData) return;
        try {
            setBadgeActionLoading(badgeId);
            await grantBadge(userData.id, badgeId);
            const updated = await fetchUserByHandle(userData.handle);
            setUserData(updated);
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setBadgeActionLoading(null);
        }
    };

    const handleRemoveBadge = async (badgeId: number) => {
        if (!userData) return;
        if (!window.confirm("Remove this badge from the user?")) return;

        try {
            setBadgeActionLoading(badgeId);
            await removeBadge(userData.id, badgeId);
            const updated = await fetchUserByHandle(userData.handle);
            setUserData(updated);
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setBadgeActionLoading(null);
        }
    };

    const handleUpdateRep = async () => {
        if (!userData) return;
        const repNum = parseInt(newRep, 10);

        if (isNaN(repNum)) {
            alert("Please enter a valid number for reputation.");
            return;
        }

        try {
            setRepUpdating(true);
            await updateUserRep({ user_id: userData.id, rep: repNum });

            const updated = await fetchUserByHandle(userData.handle);
            setUserData(updated);

            setNewRep("");
            alert("Reputation updated successfully!");
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setRepUpdating(false);
        }
    };

    const getUserBadgeIds = (): number[] => {
        if (!userData?.badges) return [];
        return typeof userData.badges === 'string' ? JSON.parse(userData.badges) : userData.badges;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight">User Search</h2>
                <p className="text-muted-foreground">Search for users by handle.</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
                <Input
                    type="text"
                    placeholder="Enter user handle (e.g. johndoe)"
                    value={searchHandle}
                    onChange={(e) => setsearchHandle(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit" disabled={loading} className="font-bold tracking-wider">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-2" /> Search</>}
                </Button>
            </form>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {userData && (
                <>
                    <Card className="max-w-2xl">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={userData.avatar || undefined} />
                                <AvatarFallback className="bg-secondary"><UserCircle className="w-10 h-10 text-muted-foreground" /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    {userData.username}
                                    {userData.verified === 1 && <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-none">Verified</Badge>}
                                    {userData.admin === 1 && <Badge variant="secondary" className="bg-destructive/20 text-destructive border-none"><Shield className="w-3 h-3 mr-1" />Admin</Badge>}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">@{userData.handle}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span>{userData.email}</span>
                                    </div>
                                    <div>
                                        <strong className="text-foreground">Bio:</strong>
                                        <p className="text-muted-foreground mt-1">{userData.bio || "Nincs bio megadva."}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 border-l border-border pl-4">
                                    <div className="text-muted-foreground"><strong className="text-foreground">ID:</strong> {userData.id}</div>
                                    <div>
                                        <strong className="text-foreground">Reputation:</strong> <span className="text-muted-foreground">{userData.reputation}</span>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Input
                                                type="number"
                                                placeholder="New rep..."
                                                value={newRep}
                                                onChange={(e) => setNewRep(e.target.value)}
                                                className="w-32 h-8 text-sm"
                                                min="0"
                                            />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleUpdateRep}
                                                disabled={repUpdating || !newRep.trim()}
                                                className="h-8 px-3"
                                            >
                                                {repUpdating ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Save className="w-3 h-3 mr-1" />
                                                )}
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground"><strong className="text-foreground">Theme:</strong> {userData.theme}</div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-border">
                                <Dialog open={notifDialogOpen} onOpenChange={setNotifDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Bell className="w-4 h-4 mr-2" />
                                            Send Notification
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Send Notification - {userData.username}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Type</Label>
                                                <select
                                                    className="w-full rounded-md border border-border bg-background p-2 text-sm text-foreground focus:ring-2 focus:ring-ring"
                                                    value={notifType}
                                                    onChange={(e) => setNotifType(e.target.value)}
                                                >
                                                    <option value="info">Information</option>
                                                    <option value="warning">Warning</option>
                                                    <option value="error">Error</option>
                                                    <option value="success">Success</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input
                                                    value={notifTitle}
                                                    onChange={(e) => setNotifTitle(e.target.value)}
                                                    placeholder="Notification title..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Message</Label>
                                                <Textarea
                                                    value={notifMessage}
                                                    onChange={(e) => setNotifMessage(e.target.value)}
                                                    placeholder="Notification message..."
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button
                                                onClick={handleSendNotification}
                                                disabled={sendingNotif || !notifTitle.trim() || !notifMessage.trim()}
                                                className="font-bold tracking-wider"
                                            >
                                                {sendingNotif ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                                                Send
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteUser}
                                    disabled={deleting || userData.id === authState.userId}
                                >
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                    Delete User
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Badge Management
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Grant or remove badges from {userData.username}. Currently has {getUserBadgeIds().length} badge(s).
                            </p>
                        </CardHeader>
                        <CardContent>
                            {badgesLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : allBadges.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {allBadges.map(badge => {
                                        const hasBadge = getUserBadgeIds().includes(badge.id);
                                        const isLoading = badgeActionLoading === badge.id;

                                        return (
                                            <div key={badge.id} className="flex flex-col items-center gap-2 p-2 rounded-xl border border-transparent hover:border-border transition-colors">
                                                <img
                                                    src={badge.image}
                                                    alt={badge.title}
                                                    title={badge.title}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                    style={{ opacity: hasBadge ? 1 : 0.4 }}
                                                />
                                                <span className="text-xs text-muted-foreground truncate w-full text-center">{badge.title}</span>
                                                {isLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                                ) : hasBadge ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleRemoveBadge(badge.id)}
                                                    >
                                                        <X className="w-3 h-3 mr-1" /> Remove
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 px-2 text-xs text-green-500 hover:text-green-500 hover:bg-green-500/10"
                                                        onClick={() => handleGrantBadge(badge.id)}
                                                    >
                                                        <Award className="w-3 h-3 mr-1" /> Grant
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No badges available in the system.</p>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}