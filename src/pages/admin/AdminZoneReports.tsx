import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Loader2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchZoneReports, deleteZoneReport } from "@/services/reportService";
import { fetchZoneDetails, deleteZone } from "@/services/zoneService";
import { getErrorMessage } from "@/lib/api";
import type { ZoneReport, ZoneFull } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminZoneReports() {
    const [reports, setReports] = useState<ZoneReport[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingReport, setDeletingReport] = useState<number | null>(null);
    const [deletingZone, setDeletingZone] = useState<number | null>(null);
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
    const [zoneData, setZoneData] = useState<ZoneFull | null>(null);
    const [loadingZone, setLoadingZone] = useState(false);

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await fetchZoneReports(page);
            setReports(data);
            setTotalPages(data.length < 10 ? page : page + 1);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleViewZone = async (zoneId: string) => {
        const zoneIdNum = parseInt(zoneId, 10);
        
        if (selectedZoneId === zoneIdNum) {
            setSelectedZoneId(null);
            setZoneData(null);
            return;
        }

        try {
            setLoadingZone(true);
            setSelectedZoneId(zoneIdNum);
            const data = await fetchZoneDetails(zoneIdNum);
            setZoneData(data);
        } catch (err) {
            alert(getErrorMessage(err));
            setSelectedZoneId(null);
        } finally {
            setLoadingZone(false);
        }
    };

    const handleDeleteReport = async (reportId: number) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        
        try {
            setDeletingReport(reportId);
            await deleteZoneReport(reportId);
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setDeletingReport(null);
        }
    };

    const handleDeleteZone = async (zoneId: number) => {
        if (!window.confirm("Are you sure you want to delete this zone? This action is irreversible!")) return;
        
        try {
            setDeletingZone(zoneId);
            await deleteZone(zoneId);
            setReports(prev => prev.filter(r => r.report_id !== zoneId.toString()));
            setSelectedZoneId(null);
            setZoneData(null);
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setDeletingZone(null);
        }
    };

    const getHazardBadgeColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'bg-red-500 hover:bg-red-600';
            case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'low': return 'bg-green-500 hover:bg-green-600';
            default: return 'bg-gray-500';
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
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                Error loading reports: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Zone Reports</h2>
                <p className="text-muted-foreground">Management of problematic zones reported by users.</p>
            </div>

            {selectedZoneId && (
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Zone Details: #{selectedZoneId}
                            </CardTitle>
                            <div className="space-x-2">
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => handleDeleteZone(selectedZoneId)}
                                    disabled={deletingZone === selectedZoneId}
                                >
                                    {deletingZone === selectedZoneId ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                                    Delete Zone
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setSelectedZoneId(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingZone ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : zoneData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm text-gray-500">Name:</span>
                                        <p className="font-semibold">{zoneData.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Hazard Level:</span>
                                        <div className="mt-1">
                                            <Badge className={getHazardBadgeColor(zoneData.hazard_level)}>
                                                {zoneData.hazard_level?.toUpperCase() || 'UNKNOWN'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Description:</span>
                                        <p className="mt-1 text-sm">{zoneData.description || "No description available"}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Author ID:</span>
                                        <p className="font-medium">{zoneData.author}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm text-gray-500">Hazards:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {(safeParse(zoneData.hazards, []) as string[]).map((h, i) => (
                                                <Badge key={i} variant="outline">{h}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Images:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {(safeParse(zoneData.images, []) as string[]).map((img, i) => (
                                                <img 
                                                    key={i} 
                                                    src={img} 
                                                    alt={`Zone image ${i + 1}`}
                                                    className="w-20 h-20 object-cover rounded-md border"
                                                />
                                            ))}
                                            {(safeParse(zoneData.images, []) as string[]).length === 0 && (
                                                <span className="text-sm text-gray-400">No images available</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Request Status:</span>
                                        <p className="mt-1">
                                            <Badge variant={zoneData.is_request === 1 ? "default" : "secondary"}>
                                                {zoneData.is_request === 1 ? "Pending" : "Accepted"}
                                            </Badge>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">Failed to load zone data.</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-20">Ticket ID</TableHead>
                            <TableHead>Zone ID</TableHead>
                            <TableHead>Reporter ID</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                                    No zone reports available.
                                </TableCell>
                            </TableRow>
                        ) : reports.map((report) => (
                            <TableRow key={report.id} className={selectedZoneId === parseInt(report.report_id, 10) ? "bg-blue-50" : ""}>
                                <TableCell className="font-medium">#{report.id}</TableCell>
                                <TableCell className="font-semibold">{report.report_id}</TableCell>
                                <TableCell>{report.user_id}</TableCell>
                                <TableCell className="max-w-md truncate">{report.reason}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => handleViewZone(report.report_id)}
                                        title="View Zone"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        onClick={() => handleDeleteReport(report.id)}
                                        disabled={deletingReport === report.id}
                                        title="Delete Report"
                                    >
                                        {deletingReport === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="text-sm text-gray-600 font-medium px-2">{page}. page</div>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}