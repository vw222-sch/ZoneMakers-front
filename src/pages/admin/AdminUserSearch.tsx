import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Shield, Mail, UserCircle, Trash2, Bell, Loader2 } from "lucide-react";
import { fetchUser, deleteUser } from "@/services/userService";
import { createNotification } from "@/services/notificationService";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/AuthContext";
import type { User } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminUserSearch() {
    const [searchId, setSearchId] = useState("");
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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId) return;

        setLoading(true);
        setError("");
        setUserData(null);

        try {
            const data = await fetchUser(searchId);
            setUserData(data);

            if (data.id === authState.userId) {
                setError("⚠️ This is your own profile!");
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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">User Search</h2>
                <p className="text-muted-foreground">Search for users by ID.</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
                <Input
                    type="number"
                    placeholder="Enter userID..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-2" /> Search</>}
                </Button>
            </form>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            {userData && (
                <Card className="max-w-2xl">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={userData.avatar || undefined} />
                            <AvatarFallback><UserCircle className="w-10 h-10 text-gray-400" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                                {userData.username}
                                {userData.verified === 1 && <Badge variant="secondary" className="bg-blue-100 text-blue-700">Verified</Badge>}
                                {userData.admin === 1 && <Badge variant="secondary" className="bg-red-100 text-red-700"><Shield className="w-3 h-3 mr-1" />Admin</Badge>}
                            </CardTitle>
                            <p className="text-sm text-gray-500">@{userData.handle}</p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span>{userData.email}</span>
                                </div>
                                <div>
                                    <strong>Bio:</strong>
                                    <p className="text-gray-600 mt-1">{userData.bio || "Nincs bio megadva."}</p>
                                </div>
                            </div>
                            <div className="space-y-2 border-l pl-4">
                                <div><strong>ID:</strong> {userData.id}</div>
                                <div><strong>Level:</strong> {userData.level}</div>
                                <div><strong>Reputation:</strong> {userData.reputation}</div>
                                <div><strong>Theme:</strong> {userData.theme}</div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <Dialog open={notifDialogOpen} onOpenChange={setNotifDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" onClick={openNotifDialog}>
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
                                                className="w-full rounded-md border p-2 text-sm"
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
            )}
        </div>
    );
}