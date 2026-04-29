import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, UserCircle, ChevronLeft, ChevronRight, Gavel } from "lucide-react";
import { fetchUserReports, deleteUserReport } from "@/services/reportService";
import { fetchUser } from "@/services/userService";
import { sendAdminNotification, updateUserReputation, grantBadge } from "@/services/adminService";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ZoneReport, User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

const REPORTED_BADGE_ID = 15; 

export default function AdminUserReports() {
    const [reports, setReports] = useState<ZoneReport[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Quick-view inline card state
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);

    // Review sheet state
    const [reviewReport, setReviewReport] = useState<ZoneReport | null>(null);
    const [reviewUserData, setReviewUserData] = useState<User | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [reviewDecision, setReviewDecision] = useState<"valid" | "invalid">("valid");
    const [repAmount, setRepAmount] = useState<string>("10");
    const [notifMessage, setNotifMessage] = useState<string>("");
    const [reviewing, setReviewing] = useState(false);
    const [loadingReviewUser, setLoadingReviewUser] = useState(false);

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await fetchUserReports(page);
            setReports(data);
            setTotalPages(data.length < 10 ? page : page + 1);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleViewUser = async (userId: string) => {
        const userIdNum = parseInt(userId, 10);

        if (selectedUserId === userIdNum) {
            setSelectedUserId(null);
            setUserData(null);
            return;
        }

        try {
            setLoadingUser(true);
            setSelectedUserId(userIdNum);
            const data = await fetchUser(userIdNum);
            setUserData(data);
        } catch (err) {
            alert(getErrorMessage(err));
            setSelectedUserId(null);
        } finally {
            setLoadingUser(false);
        }
    };

    const openReviewSheet = async (report: ZoneReport) => {
        setReviewReport(report);
        setReviewDecision("valid");
        setReviewError(null);
        setRepAmount("10");
        setNotifMessage(
            `Your user report #${report.id} has been reviewed and found to be valid. The "Reported" badge has been applied to the user, and appropriate action will be taken. Thank you for your report!`
        );
        setReviewUserData(null);

        try {
            setLoadingReviewUser(true);
            const data = await fetchUser(report.report_id);
            setReviewUserData(data);
        } catch (err) {
            const msg = getErrorMessage(err);
            console.error("Failed to load user for review:", err);
            setReviewError(msg);
            setReviewUserData(null);
        } finally {
            setLoadingReviewUser(false);
        }
    };

    const handleDecisionChange = (decision: "valid" | "invalid") => {
        setReviewDecision(decision);
        if (reviewReport) {
            if (decision === "valid") {
                setRepAmount("10");
                setNotifMessage(
                    `Your user report #${reviewReport.id} has been reviewed and found to be valid. The "Reported" badge has been applied to the user, and appropriate action will be taken. Thank you for your report!`
                );
            } else {
                setRepAmount("-5");
                setNotifMessage(
                    `Your user report #${reviewReport.id} has been reviewed. Unfortunately, the report was found to be invalid and no action will be taken against the reported user.`
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

            // 1. Delete the user report
            await deleteUserReport(reviewReport.id);

            // 2. If valid, grant the "Reported" badge to the reported user
            if (reviewDecision === "valid") {
                const reportedUserId = parseInt(reviewReport.report_id, 10);
                await grantBadge(reportedUserId, REPORTED_BADGE_ID);
            }

            // 3. Send notification to the reporter
            await sendAdminNotification(
                reviewReport.user_id,
                "User report reviewed",
                notifMessage,
                reviewDecision === "valid" ? "success" : "warning"
            );

            // 4. Update reporter's reputation
            await updateUserReputation(reviewReport.user_id, rep);

            // Update local state
            setReports((prev) => prev.filter((r) => r.id !== reviewReport.id));
            if (selectedUserId === parseInt(reviewReport.report_id, 10)) {
                setSelectedUserId(null);
                setUserData(null);
            }
            setReviewReport(null);
            setReviewUserData(null);
            setReviewError(null);
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
                <h2 className="text-2xl font-extrabold tracking-tight">User Reports</h2>
                <p className="text-muted-foreground">Management of toxic or rule-breaking users reported by other users.</p>
            </div>

            {/* Quick-view inline card */}
            {selectedUserId && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <UserCircle className="h-5 w-5 text-muted-foreground" />
                                Reported User Details: #{selectedUserId}
                            </h3>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedUserId(null); setUserData(null); }}>
                                Close
                            </Button>
                        </div>

                        {loadingUser ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : userData ? (
                            <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={userData.avatar || undefined} />
                                    <AvatarFallback className="bg-secondary"><UserCircle className="w-10 h-10 text-muted-foreground" /></AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-lg">{userData.username}</span>
                                        {userData.verified === 1 && <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-none">Verified</Badge>}
                                    </div>
                                    <p className="text-muted-foreground">@{userData.handle}</p>
                                    <p className="text-sm text-muted-foreground"><strong className="text-foreground">Email:</strong> {userData.email}</p>
                                    <p className="text-sm text-muted-foreground"><strong className="text-foreground">ID:</strong> {userData.id} | <strong className="text-foreground">Reputation:</strong> {userData.reputation}</p>
                                    <p className="text-sm text-muted-foreground"><strong className="text-foreground">Bio:</strong> {userData.bio || "No bio available"}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Failed to load user data.</p>
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
                            <TableHead>Reported ID</TableHead>
                            <TableHead>Reporter ID</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No user reports found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow
                                    key={report.id}
                                    className={selectedUserId === parseInt(report.report_id, 10) ? "bg-muted/50" : ""}
                                >
                                    <TableCell className="font-medium">#{report.id}</TableCell>
                                    <TableCell className="font-semibold text-destructive">{report.report_id}</TableCell>
                                    <TableCell className="text-muted-foreground">{report.user_id}</TableCell>
                                    <TableCell className="max-w-md truncate text-muted-foreground">{report.reason}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleViewUser(report.report_id)}
                                            title="View User"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => openReviewSheet(report)}
                                            title="Review report"
                                        >
                                            <Gavel className="h-4 h-4" />
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
            <Sheet open={!!reviewReport} onOpenChange={(open) => { if (!open) { setReviewReport(null); setReviewUserData(null); setReviewError(null); } }}>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Review User Report</SheetTitle>
                        <SheetDescription>
                            Decide whether the report is valid or invalid. This will delete the report,
                            optionally grant a badge to the user, notify the reporter, and adjust their reputation.
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
                                        <span className="text-muted-foreground">Reported User ID</span>
                                        <span className="font-mono">{reviewReport.report_id}</span>
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

                            {/* User Info */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                                    Reported User
                                </h4>
                                {loadingReviewUser ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : reviewError ? (
                                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm space-y-1">
                                        <p className="text-destructive font-medium">Failed to load user data</p>
                                        <p className="text-destructive/80 text-xs font-mono">{reviewError}</p>
                                        <p className="text-destructive/60 text-xs mt-2">
                                            The user may have already been deleted. You can still process the report.
                                        </p>
                                    </div>
                                ) : reviewUserData ? (
                                    <div className="rounded-xl border border-border p-4 space-y-3 text-sm">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-14 w-14">
                                                <AvatarImage src={reviewUserData.avatar || undefined} />
                                                <AvatarFallback className="bg-secondary">
                                                    <UserCircle className="w-7 h-7 text-muted-foreground" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{reviewUserData.username}</span>
                                                    {reviewUserData.verified === 1 && (
                                                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-none text-xs">Verified</Badge>
                                                    )}
                                                    {reviewUserData.admin === 1 && (
                                                        <Badge variant="secondary" className="bg-destructive/20 text-destructive border-none text-xs">Admin</Badge>
                                                    )}
                                                </div>
                                                <span className="text-muted-foreground text-xs">@{reviewUserData.handle}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <span className="text-muted-foreground">Email</span>
                                                <p className="font-medium">{reviewUserData.email}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Reputation</span>
                                                <p className="font-mono font-medium">{reviewUserData.reputation}</p>
                                            </div>
                                        </div>
                                        {reviewUserData.bio && (
                                            <div className="pt-2 border-t border-border">
                                                <span className="text-xs text-muted-foreground">Bio</span>
                                                <p className="mt-1 text-xs leading-relaxed">{reviewUserData.bio}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                                        No user data was returned by the API.
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
                                        <span className="text-xs opacity-70">Give "Reported" badge + reward reporter</span>
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
                                        <span className="text-xs opacity-70">No action + penalize reporter</span>
                                    </button>
                                </div>
                            </div>

                            {/* Rep Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="user-rep-amount" className="text-sm font-semibold">
                                    Reputation Change (Reporter)
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="user-rep-amount"
                                        type="number"
                                        value={repAmount}
                                        onChange={(e) => setRepAmount(e.target.value)}
                                        className="w-32"
                                    />
                                    <span className="text-sm text-muted-foreground">points</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {reviewDecision === "valid"
                                        ? "Use a positive number to reward the reporter for a valid report."
                                        : "Use a negative number to penalize the reporter for an invalid report."}
                                </p>
                            </div>

                            {/* Notification Message */}
                            <div className="space-y-2">
                                <Label htmlFor="user-notif-message" className="text-sm font-semibold">
                                    Notification Message (To Reporter)
                                </Label>
                                <Textarea
                                    id="user-notif-message"
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
                            onClick={() => { setReviewReport(null); setReviewUserData(null); setReviewError(null); }}
                            disabled={reviewing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={reviewDecision === "valid" ? "default" : "destructive"}
                            onClick={handleReviewSubmit}
                            disabled={reviewing}
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