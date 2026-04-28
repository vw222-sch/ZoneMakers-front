import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, Loader2, MapPin } from "lucide-react";
import { fetchZoneRequests, acceptZoneRequest, rejectZoneRequest } from "@/services/adminService";
import { createNotification } from "@/services/notificationService";
import { getErrorMessage } from "@/lib/api";
import type { ZoneFull } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminZones() {
    const [zones, setZones] = useState<ZoneFull[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
    const itemsPerPage = 8;

    const fetchZones = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await fetchZoneRequests();
            setZones(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchZones(); }, [fetchZones]);

    const handleAction = async (zone: ZoneFull, action: 'accept' | 'reject') => {
        const confirmMsg = action === 'accept'
            ? `Are you sure you want to ACCEPT the zone "${zone.name}"?`
            : `Are you sure you want to REJECT the zone "${zone.name}"?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            setActionLoading(zone.id);

            if (action === 'accept') {
                await acceptZoneRequest(zone.id);
                try {
                    await createNotification(
                        zone.author,
                        "Zone accepted",
                        `Your request for the zone "${zone.name}" has been accepted!`,
                        "success"
                    );
                } catch (notifErr) {
                    console.error("Error sending notification:", notifErr);
                }
            } else {
                await rejectZoneRequest(zone.id);
                try {
                    await createNotification(
                        zone.author,
                        "Zone rejected",
                        `Your request for the zone "${zone.name}" has been rejected.`,
                        "error"
                    );
                } catch (notifErr) {
                    console.error("Error sending notification:", notifErr);
                }
            }

            setZones(prev => prev.filter(z => z.id !== zone.id));
            if (selectedZoneId === zone.id) {
                setSelectedZoneId(null);
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(zones.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentZones = zones.slice(startIndex, startIndex + itemsPerPage);

    const getHazardBadgeColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'bg-red-500/20 text-red-500 border-none';
            case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-none';
            case 'low': return 'bg-green-500/20 text-green-500 border-none';
            default: return 'bg-secondary text-foreground border-none';
        }
    };

    const safeParse = (data: unknown, fallback: unknown) => {
        if (typeof data === 'string') {
            try { return JSON.parse(data); } catch { return fallback; }
        }
        return data || fallback;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl">
                Error loading zone requests: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Zone Requests</h2>
                <p className="text-muted-foreground">Approve or reject zones submitted by users. ({zones.length} requests)</p>
            </div>

            {selectedZoneId && (
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                Zone Details
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setSelectedZoneId(null)}>
                                Close
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const zone = zones.find(z => z.id === selectedZoneId);
                            if (!zone) return null;

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Name:</span>
                                            <p className="font-semibold text-lg">{zone.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Hazard Level:</span>
                                            <div className="mt-1">
                                                <Badge className={getHazardBadgeColor(zone.hazard_level)}>
                                                    {zone.hazard_level?.toUpperCase() || 'UNKNOWN'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Description:</span>
                                            <p className="mt-1">{zone.description || "No description available"}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Author ID:</span>
                                            <p className="font-medium">{zone.author}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Hazards:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {(safeParse(zone.hazards, []) as string[]).map((h, i) => (
                                                    <Badge key={i} variant="outline">{h}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Images:</span>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {(safeParse(zone.images, []) as string[]).map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img}
                                                        alt={`Zone image ${i + 1}`}
                                                        className="w-24 h-24 object-cover rounded-md border border-border"
                                                    />
                                                ))}
                                                {(safeParse(zone.images, []) as string[]).length === 0 && (
                                                    <span className="text-sm text-muted-foreground">No images available</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Coordinates:</span>
                                            <p className="text-xs font-mono mt-1 text-muted-foreground">
                                                {(safeParse(zone.coordinates, []) as number[][]).length} points
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>
            )}

            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-20">ID</TableHead>
                            <TableHead>Name & Description</TableHead>
                            <TableHead>Hazards</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Creator</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentZones.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No new zone requests available.
                                </TableCell>
                            </TableRow>
                        ) : currentZones.map((zone) => (
                            <TableRow key={zone.id} className={`${selectedZoneId === zone.id ? "bg-muted/50" : ""}`}>
                                <TableCell className="font-medium">#{zone.id}</TableCell>
                                <TableCell>
                                    <div className="font-semibold">{zone.name}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-xs">{zone.description}</div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    <div className="flex flex-wrap gap-1">
                                        {(safeParse(zone.hazards, []) as string[]).slice(0, 2).map((h, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">{h}</Badge>
                                        ))}
                                        {(safeParse(zone.hazards, []) as string[]).length > 2 && (
                                            <span className="text-xs text-muted-foreground">+{(safeParse(zone.hazards, []) as string[]).length - 2}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getHazardBadgeColor(zone.hazard_level)}>
                                        {zone.hazard_level?.toUpperCase() || 'UNKNOWN'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{zone.author}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setSelectedZoneId(selectedZoneId === zone.id ? null : zone.id)}
                                        title="Details"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-500"
                                        size="sm"
                                        onClick={() => handleAction(zone, 'accept')}
                                        disabled={actionLoading === zone.id}
                                    >
                                        {actionLoading === zone.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                        Accept
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-red-500/50 text-red-500 hover:bg-destructive/10 hover:text-red-500"
                                        size="sm"
                                        onClick={() => handleAction(zone, 'reject')}
                                        disabled={actionLoading === zone.id}
                                    >
                                        {actionLoading === zone.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                                        Reject
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="text-sm text-muted-foreground font-medium px-2">
                        {currentPage} / {totalPages}. page
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}