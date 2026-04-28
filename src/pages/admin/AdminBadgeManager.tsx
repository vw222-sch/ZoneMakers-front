import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2, ImageIcon } from "lucide-react";
import { createBadge, deleteBadge } from "@/services/adminService";
import { fetchAllBadges } from "@/services/badgeService";
import { getErrorMessage } from "@/lib/api";
import type { BadgeData } from "@/types";

export default function AdminBadgeManager() {
    const [badges, setBadges] = useState<BadgeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [newImage, setNewImage] = useState("");
    const [newTitle, setNewTitle] = useState("");

    const loadBadges = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAllBadges();
            setBadges(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBadges();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newImage.trim() || !newTitle.trim()) return;

        try {
            setCreating(true);
            setError(null);
            await createBadge({ image: newImage.trim(), title: newTitle.trim() });
            
            setNewImage("");
            setNewTitle("");
            loadBadges();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number, title: string) => {
        if (!window.confirm(`Are you sure you want to delete the badge "${title}"?`)) return;

        try {
            setDeletingId(id);
            setError(null);
            await deleteBadge(id);
            loadBadges();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Badge Manager</h2>
                <p className="text-muted-foreground">Create and manage system badges.</p>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create New Badge
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full space-y-2">
                            <Label htmlFor="badge-title">Title</Label>
                            <Input
                                id="badge-title"
                                placeholder="e.g. Early Adopter"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-[2] w-full space-y-2">
                            <Label htmlFor="badge-image">Image URL</Label>
                            <Input
                                id="badge-image"
                                placeholder="https://example.com/badge.png"
                                value={newImage}
                                onChange={(e) => setNewImage(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={creating} variant="default" className="w-full sm:w-auto font-bold tracking-wider">
                            {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Create Badge
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Existing Badges ({badges.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : badges.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {badges.map((badge) => (
                                <div key={badge.id} className="group relative flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-foreground/50 transition-colors bg-background">
                                    <img
                                        src={badge.image}
                                        alt={badge.title}
                                        className="w-16 h-16 rounded-md object-cover bg-secondary"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2264%22%20height%3D%2264%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23555%22%20stroke-width%3D%222%22%3E%3Crect%20x%3D%223%22%20y%3D%223%22%20width%3D%2218%22%20height%3D%2218%22%20rx%3D%222%22%20ry%3D%222%2F%3E%3Ccircle%20cx%3D%228.5%22%20cy%3D%228.5%22%20r%3D%221.5%22%2F%3E%3Cpolyline%20points%3D%2221%2015%2016%2010%205%2021%22%2F%3E%3C%2Fsvg%3E';
                                        }}
                                    />
                                    <span className="text-xs text-center font-medium text-foreground w-full truncate" title={badge.title}>
                                        {badge.title}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">ID: {badge.id}</span>
                                    
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(badge.id, badge.title)}
                                        disabled={deletingId === badge.id}
                                    >
                                        {deletingId === badge.id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3 h-3" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                            <p className="text-sm">No badges found in the system.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}