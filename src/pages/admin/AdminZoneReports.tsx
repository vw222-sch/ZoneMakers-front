import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, MapPin, ChevronLeft, ChevronRight, Gavel } from "lucide-react";
import { fetchZoneReports, deleteZoneReport } from "@/services/reportService";
import { fetchZoneDetails, deleteZone } from "@/services/zoneService";
import { sendAdminNotification, updateUserReputation } from "@/services/adminService";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ZoneReport, ZoneFull } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const getHazardBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
        case "high": return "bg-red-500/20 text-red-500 border-none";
        case "medium": return "bg-yellow-500/20 text-yellow-500 border-none";
        case "low": return "bg-green-500/20 text-green-500 border-none";
        default: return "bg-secondary text-foreground border-none";
    }
};

const safeParse = (data: unknown, fallback: unknown) => {
    if (typeof data === "string") {
        try { return JSON.parse(data); } catch { return fallback; }
    }
    return data || fallback;
};

export default function AdminZoneReports() {
    const [reports, setReports] = useState<ZoneReport[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Quick-view inline card state
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
    const [zoneData, setZoneData] = useState<ZoneFull | null>(null);
    const [loadingZone, setLoadingZone] = useState(false);

    // Review sheet state
    const [reviewReport, setReviewReport] = useState<ZoneReport | null>(null);
    const [reviewZoneData, setReviewZoneData] = useState<ZoneFull | null>(null);
    const [reviewDecision, setReviewDecision] = useState<"valid" | "invalid">("valid");
    const [repAmount, setRepAmount] = useState<string>("10");
    const [notifMessage, setNotifMessage] = useState<string>("");
    const [reviewing, setReviewing] = useState(false);
    const [loadingReviewZone, setLoadingReviewZone] = useState(false);

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

    const openReviewSheet = async (report: ZoneReport) => {
        setReviewReport(report);
        setReviewDecision("valid");
        setRepAmount("10");
        setNotifMessage(
            `Your zone report #${report.id} for zone #${report.report_id} has been reviewed and found to be valid. The zone has been removed. Thank you for your report!`
        );
        setReviewZoneData(null);

        const zoneIdNum = parseInt(report.report_id, 10);
        try {
            setLoadingReviewZone(true);
            const data = await fetchZoneDetails(zoneIdNum);
            setReviewZoneData(data);
        } catch {
            setReviewZoneData(null);
        } finally {
            setLoadingReviewZone(false);
        }
    };

    const handleDecisionChange = (decision: "valid" | "invalid") => {
        setReviewDecision(decision);
        if (reviewReport) {
            if (decision === "valid") {
                setRepAmount("10");
                setNotifMessage(
                    `Your zone report #${reviewReport.id} for zone #${reviewReport.report_id} has been reviewed and found to be valid. The zone has been removed. Thank you for your report!`
                );
            } else {
                setRepAmount("-5");
                setNotifMessage(
                    `Your zone report #${reviewReport.id} for zone #${reviewReport.report_id} has been reviewed. Unfortunately, the report was found to be invalid and no action was taken against the zone.`
                );
            }
        }
    };

    const handleReviewSubmit = async () => {
        if (!reviewReport) return;

        const rep = parseInt(repAmount, 10);
        if (isNaN(rep) || rep === 0) {
            alert("Please enter a valid reputation amount (non-zero integer).");
            return;
        }

        try {
            setReviewing(true);

            // 1. Delete the zone report
            await deleteZoneReport(reviewReport.id);

            // 2. If valid, also delete the zone itself
            if (reviewDecision === "valid") {
                const zoneIdNum = parseInt(reviewReport.report_id, 10);
                await deleteZone(zoneIdNum);
            }

            // 3. Send notification to the reporter
            await sendAdminNotification(
                reviewReport.user_id,
                "Zone report reviewed",
                notifMessage,
                reviewDecision === "valid" ? "success" : "warning"
            );

            // 4. Update reporter's reputation
            await updateUserReputation(reviewReport.user_id, rep);

            // Update local state
            setReports((prev) => prev.filter((r) => r.id !== reviewReport.id));
            if (selectedZoneId === parseInt(reviewReport.report_id, 10)) {
                setSelectedZoneId(null);
                setZoneData(null);
            }
            setReviewReport(null);
            setReviewZoneData(null);
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setReviewing(false);
        }
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
                Error loading reports: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Zone Reports</h2>
                <p className="text-muted-foreground">Management of problematic zones reported by users.</p>
            </div>

            {/* Quick-view inline card */}
            {selectedZoneId && (
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                Zone Details: #{selectedZoneId}
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedZoneId(null); setZoneData(null); }}>
                                Close
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingZone ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : zoneData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Name:</span>
                                        <p className="font-semibold text-foreground">{zoneData.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Hazard Level:</span>
                                        <div className="mt-1">
                                            <Badge className={getHazardBadgeColor(zoneData.hazard_level)}>
                                                {zoneData.hazard_level?.toUpperCase() || "UNKNOWN"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Description:</span>
                                        <p className="mt-1 text-sm text-foreground">{zoneData.description || "No description available"}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Author ID:</span>
                                        <p className="font-medium text-foreground">{zoneData.author}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Hazards:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {(safeParse(zoneData.hazards, []) as string[]).map((h, i) => (
                                                <Badge key={i} variant="outline">{h}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Images:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {(safeParse(zoneData.images, []) as string[]).map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    alt={`Zone image ${i + 1}`}
                                                    className="w-20 h-20 object-cover rounded-md border border-border"
                                                />
                                            ))}
                                            {(safeParse(zoneData.images, []) as string[]).length === 0 && (
                                                <span className="text-sm text-muted-foreground">No images available</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Request Status:</span>
                                        <p className="mt-1">
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    zoneData.is_request === 1
                                                        ? "bg-yellow-500/20 text-yellow-500 border-none"
                                                        : "bg-green-500/20 text-green-500 border-none"
                                                }
                                            >
                                                {zoneData.is_request === 1 ? "Pending" : "Accepted"}
                                            </Badge>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Failed to load zone data.</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Table */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-24">Ticket ID</TableHead>
                            <TableHead>Zone ID</TableHead>
                            <TableHead>Reporter ID</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No zone reports available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow
                                    key={report.id}
                                    className={selectedZoneId === parseInt(report.report_id, 10) ? "bg-muted/50" : ""}
                                >
                                    <TableCell className="font-medium">#{report.id}</TableCell>
                                    <TableCell className="font-semibold">{report.report_id}</TableCell>
                                    <TableCell className="text-muted-foreground">{report.user_id}</TableCell>
                                    <TableCell className="max-w-md truncate text-muted-foreground">{report.reason}</TableCell>
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
                                            variant="outline"
                                            size="icon"
                                            onClick={() => openReviewSheet(report)}
                                            title="Review report"
                                        >
                                            <Gavel className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="text-sm text-muted-foreground font-medium px-2">{page}. page</div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page === totalPages}
                    >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* Review Sheet */}
            <Sheet open={!!reviewReport} onOpenChange={(open) => { if (!open) { setReviewReport(null); setReviewZoneData(null); } }}>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Review Zone Report</SheetTitle>
                        <SheetDescription>
                            Decide whether the report is valid or invalid. This will delete the report,
                            optionally delete the zone, notify the reporter, and adjust their reputation.
                        </SheetDescription>
                    </SheetHeader>

                    {reviewReport && (
                        <div className="space-y-6 py-4">
                            {/* Report Info */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Report Details</h4>
                                <div className="rounded-xl border border-border p-4 space-y-2.5 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Report ID</span>
                                        <span className="font-mono">#{reviewReport.id}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Zone ID</span>
                                        <span className="font-mono">#{reviewReport.report_id}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Reporter ID</span>
                                        <span className="font-mono">{reviewReport.user_id}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Type</span>
                                        <Badge variant="outline">{reviewReport.type}</Badge>
                                    </div>
                                    <Separator />
                                    <div>
                                        <span className="text-muted-foreground">Reason</span>
                                        <p className="mt-1.5 p-3 bg-background rounded-lg border border-border whitespace-pre-wrap text-xs leading-relaxed">
                                            {reviewReport.reason}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Zone Info */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    Reported Zone
                                </h4>
                                {loadingReviewZone ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : reviewZoneData ? (
                                    <div className="rounded-xl border border-border p-4 space-y-3 text-sm">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-muted-foreground">Name</span>
                                                <p className="font-semibold">{reviewZoneData.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Hazard Level</span>
                                                <div className="mt-1">
                                                    <Badge className={getHazardBadgeColor(reviewZoneData.hazard_level)}>
                                                        {reviewZoneData.hazard_level?.toUpperCase() || "UNKNOWN"}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Author ID</span>
                                                <p className="font-medium">{reviewZoneData.author}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Status</span>
                                                <div className="mt-1">
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            reviewZoneData.is_request === 1
                                                                ? "bg-yellow-500/20 text-yellow-500 border-none"
                                                                : "bg-green-500/20 text-green-500 border-none"
                                                        }
                                                    >
                                                        {reviewZoneData.is_request === 1 ? "Pending" : "Accepted"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Description</span>
                                            <p className="mt-1 text-xs text-foreground leading-relaxed">
                                                {reviewZoneData.description || "No description"}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Hazards</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {(safeParse(reviewZoneData.hazards, []) as string[]).map((h, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">{h}</Badge>
                                                ))}
                                                {(safeParse(reviewZoneData.hazards, []) as string[]).length === 0 && (
                                                    <span className="text-xs text-muted-foreground">None listed</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Images</span>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {(safeParse(reviewZoneData.images, []) as string[]).map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img}
                                                        alt={`Zone image ${i + 1}`}
                                                        className="w-16 h-16 object-cover rounded-md border border-border"
                                                    />
                                                ))}
                                                {(safeParse(reviewZoneData.images, []) as string[]).length === 0 && (
                                                    <span className="text-xs text-muted-foreground">No images</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                                        Could not load zone data. It may have already been deleted.
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Decision */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm">Decision</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleDecisionChange("valid")}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm cursor-pointer",
                                            reviewDecision === "valid"
                                                ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                                                : "border-border bg-background text-muted-foreground hover:border-green-500/30"
                                        )}
                                    >
                                        <span className="text-2xl">✅</span>
                                        <span className="font-semibold">Valid</span>
                                        <span className="text-xs opacity-70">Delete zone + reward reporter</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDecisionChange("invalid")}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm cursor-pointer",
                                            reviewDecision === "invalid"
                                                ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400"
                                                : "border-border bg-background text-muted-foreground hover:border-red-500/30"
                                        )}
                                    >
                                        <span className="text-2xl">❌</span>
                                        <span className="font-semibold">Invalid</span>
                                        <span className="text-xs opacity-70">Keep zone + penalize reporter</span>
                                    </button>
                                </div>
                            </div>

                            {/* Rep Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="zone-rep-amount" className="text-sm font-semibold">
                                    Reputation Change
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="zone-rep-amount"
                                        type="number"
                                        value={repAmount}
                                        onChange={(e) => setRepAmount(e.target.value)}
                                        className="w-32"
                                    />
                                    <span className="text-sm text-muted-foreground">points</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {reviewDecision === "valid"
                                        ? "Use a positive number to reward the reporter."
                                        : "Use a negative number to penalize the reporter."}
                                </p>
                            </div>

                            {/* Notification Message */}
                            <div className="space-y-2">
                                <Label htmlFor="zone-notif-message" className="text-sm font-semibold">
                                    Notification Message
                                </Label>
                                <Textarea
                                    id="zone-notif-message"
                                    value={notifMessage}
                                    onChange={(e) => setNotifMessage(e.target.value)}
                                    rows={3}
                                    className="text-sm resize-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    This message will be sent to the reporter as a notification.
                                </p>
                            </div>
                        </div>
                    )}

                    <SheetFooter className="flex-row gap-2 sm:justify-end pt-2">
                        <Button
                            variant="outline"
                            onClick={() => { setReviewReport(null); setReviewZoneData(null); }}
                            disabled={reviewing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={reviewDecision === "valid" ? "default" : "destructive"}
                            onClick={handleReviewSubmit}
                            disabled={reviewing || (reviewDecision === "valid" && !reviewZoneData)}
                        >
                            {reviewing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {reviewDecision === "valid" ? "✅ Accept" : "❌ Reject"}
                                    {" & Delete Report"}
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}