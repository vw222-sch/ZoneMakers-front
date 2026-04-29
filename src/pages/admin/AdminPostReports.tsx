import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, MessageSquare, ChevronLeft, ChevronRight, Gavel } from "lucide-react";
import { fetchPostReports, deletePostReport } from "@/services/reportService";
import { deletePost, fetchPostReplies } from "@/services/postService";
import { sendAdminNotification, updateUserReputation } from "@/services/adminService";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ZoneReport, ApiPost } from "@/types";
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

export default function AdminPostReports() {
    const [reports, setReports] = useState<ZoneReport[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Quick-view inline state
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [postData, setPostData] = useState<ApiPost | null>(null);
    const [replies, setReplies] = useState<ApiPost[]>([]);
    const [loadingPost, setLoadingPost] = useState(false);

    // Review sheet state
    const [reviewReport, setReviewReport] = useState<ZoneReport | null>(null);
    const [reviewPostData, setReviewPostData] = useState<ApiPost | null>(null);
    const [reviewReplies, setReviewReplies] = useState<ApiPost[]>([]);
    const [reviewDecision, setReviewDecision] = useState<"valid" | "invalid">("valid");
    const [repAmount, setRepAmount] = useState<string>("10");
    const [notifMessage, setNotifMessage] = useState<string>("");
    const [reviewing, setReviewing] = useState(false);
    const [loadingReviewPost, setLoadingReviewPost] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await fetchPostReports(page);
            setReports(data);
            setTotalPages(data.length < 10 ? page : page + 1);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleViewPost = async (postId: string) => {
        if (selectedPostId === postId) {
            setSelectedPostId(null);
            setPostData(null);
            setReplies([]);
            return;
        }

        try {
            setLoadingPost(true);
            setSelectedPostId(postId);
            const replyData = await fetchPostReplies(postId);
            setReplies(replyData);
            setPostData(replyData.length > 0 ? replyData[0] : null);
        } catch (err) {
            console.error("Error loading post:", err);
        } finally {
            setLoadingPost(false);
        }
    };

    const openReviewSheet = async (report: ZoneReport) => {
        setReviewReport(report);
        setReviewDecision("valid");
        setRepAmount("10");
        setReviewError(null);
        setNotifMessage(
            `Your post report #${report.id} has been reviewed and found to be valid. The reported post has been removed. Thank you for your report!`
        );
        setReviewPostData(null);
        setReviewReplies([]);

        try {
            setLoadingReviewPost(true);
            const replyData = await fetchPostReplies(report.report_id);
            setReviewReplies(replyData);
            setReviewPostData(replyData.length > 0 ? replyData[0] : null);
        } catch (err) {
            const msg = getErrorMessage(err);
            console.error("Failed to load post for review:", err);
            setReviewError(msg);
            setReviewPostData(null);
            setReviewReplies([]);
        } finally {
            setLoadingReviewPost(false);
        }
    };

    const handleDecisionChange = (decision: "valid" | "invalid") => {
        setReviewDecision(decision);
        if (reviewReport) {
            if (decision === "valid") {
                setRepAmount("10");
                setNotifMessage(
                    `Your post report #${reviewReport.id} has been reviewed and found to be valid. The reported post has been removed. Thank you for your report!`
                );
            } else {
                setRepAmount("-5");
                setNotifMessage(
                    `Your post report #${reviewReport.id} has been reviewed. Unfortunately, the report was found to be invalid and no action was taken against the post.`
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

        // If valid but post couldn't be loaded, confirm before proceeding
        if (reviewDecision === "valid" && !reviewPostData) {
            const proceed = window.confirm(
                "The post data could not be loaded. If you proceed, the report will be deleted and the reporter notified, but the post deletion may fail.\n\nDo you want to continue?"
            );
            if (!proceed) return;
        }

        try {
            setReviewing(true);

            // 1. Delete the post report
            await deletePostReport(reviewReport.id);

            // 2. If valid, also delete the post itself
            if (reviewDecision === "valid" && reviewPostData) {
                await deletePost(reviewReport.report_id);
            }

            // 3. Send notification to the reporter
            await sendAdminNotification(
                reviewReport.user_id,
                "Post report reviewed",
                notifMessage,
                reviewDecision === "valid" ? "success" : "warning"
            );

            // 4. Update reporter's reputation
            await updateUserReputation(reviewReport.user_id, rep);

            // Update local state
            setReports((prev) => prev.filter((r) => r.id !== reviewReport.id));
            if (selectedPostId === reviewReport.report_id) {
                setSelectedPostId(null);
                setPostData(null);
                setReplies([]);
            }
            setReviewReport(null);
            setReviewPostData(null);
            setReviewReplies([]);
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
                <h2 className="text-2xl font-extrabold tracking-tight">Post Reports</h2>
                <p className="text-muted-foreground">Review reported posts and comments.</p>
            </div>

            {/* Quick-view inline panel */}
            {selectedPostId && (
                <div className="border border-border rounded-xl bg-card p-6">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                            Post details: {selectedPostId}
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedPostId(null); setPostData(null); setReplies([]); }}
                        >
                            Close
                        </Button>
                    </div>

                    {loadingPost ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {postData ? (
                                <div className="p-4 bg-background rounded-xl border border-border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium text-foreground">{postData.username}</span>
                                        <span className="text-muted-foreground">@{postData.handle}</span>
                                        <span className="text-xs text-muted-foreground/70">
                                            {new Date(postData.created_at).toLocaleString("hu-HU")}
                                        </span>
                                    </div>
                                    <p className="whitespace-pre-wrap">{postData.content}</p>
                                    {postData.image && (
                                        <img src={postData.image} alt="Post image" className="mt-2 max-w-md rounded-md border border-border" />
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-xl border border-border">
                                    Could not load post content.
                                </p>
                            )}

                            {replies.length > 1 && (
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                        Replies ({replies.length - 1}):
                                    </h4>
                                    <div className="space-y-2">
                                        {replies.slice(1).map((reply) => (
                                            <div key={reply.id} className="p-3 bg-background rounded-xl border border-border text-sm">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium">{reply.username}</span>
                                                    <span className="text-muted-foreground text-xs">
                                                        {new Date(reply.created_at).toLocaleString("hu-HU")}
                                                    </span>
                                                </div>
                                                <p className="whitespace-pre-wrap text-muted-foreground">{reply.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-24">Ticket ID</TableHead>
                            <TableHead>Post ID</TableHead>
                            <TableHead>Reporter ID</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No post reports found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow
                                    key={report.id}
                                    className={selectedPostId === report.report_id ? "bg-muted/50" : ""}
                                >
                                    <TableCell className="font-medium">#{report.id}</TableCell>
                                    <TableCell className="font-semibold font-mono">{report.report_id}</TableCell>
                                    <TableCell className="text-muted-foreground">{report.user_id}</TableCell>
                                    <TableCell className="max-w-md truncate text-muted-foreground">{report.reason}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleViewPost(report.report_id)}
                                            title="View Post"
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
            <Sheet
                open={!!reviewReport}
                onOpenChange={(open) => {
                    if (!open) {
                        setReviewReport(null);
                        setReviewPostData(null);
                        setReviewReplies([]);
                        setReviewError(null);
                    }
                }}
            >
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Review Post Report</SheetTitle>
                        <SheetDescription>
                            Decide whether the report is valid or invalid. This will delete the report,
                            optionally delete the post, notify the reporter, and adjust their reputation.
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
                                        <span className="text-muted-foreground">Post ID</span>
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

                            {/* Post Info */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                    Reported Post
                                </h4>
                                {loadingReviewPost ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : reviewError ? (
                                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm space-y-1">
                                        <p className="text-destructive font-medium">Failed to load post data</p>
                                        <p className="text-destructive/80 text-xs font-mono">{reviewError}</p>
                                        <p className="text-destructive/60 text-xs mt-2">
                                            You can still reject the report. If you choose to accept, the post deletion will be skipped.
                                        </p>
                                    </div>
                                ) : reviewPostData ? (
                                    <div className="rounded-xl border border-border p-4 space-y-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{reviewPostData.username}</span>
                                            <span className="text-muted-foreground">@{reviewPostData.handle}</span>
                                            {reviewPostData.verified === 1 && (
                                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-none text-xs">
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>Author ID: {reviewPostData.author_id}</span>
                                            <span>
                                                {new Date(reviewPostData.created_at).toLocaleString("hu-HU")}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-background rounded-lg border border-border whitespace-pre-wrap leading-relaxed">
                                            {reviewPostData.content}
                                        </div>
                                        {reviewPostData.image && (
                                            <img
                                                src={reviewPostData.image}
                                                alt="Post image"
                                                className="max-w-xs rounded-md border border-border"
                                            />
                                        )}

                                        {reviewReplies.length > 1 && (
                                            <div className="pt-2 border-t border-border">
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    Replies ({reviewReplies.length - 1}):
                                                </span>
                                                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                                    {reviewReplies.slice(1).map((reply) => (
                                                        <div
                                                            key={reply.id}
                                                            className="p-2.5 bg-background rounded-lg border border-border"
                                                        >
                                                            <div className="flex items-center gap-2 mb-1 text-xs">
                                                                <span className="font-medium">{reply.username}</span>
                                                                <span className="text-muted-foreground">
                                                                    {new Date(reply.created_at).toLocaleString("hu-HU")}
                                                                </span>
                                                            </div>
                                                            <p className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed">
                                                                {reply.content}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                                        No post data was returned by the API.
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
                                        <span className="text-xs opacity-70">
                                            {reviewError ? "Skip post delete + reward" : "Delete post + reward reporter"}
                                        </span>
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
                                        <span className="text-xs opacity-70">Keep post + penalize reporter</span>
                                    </button>
                                </div>
                            </div>

                            {/* Rep Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="post-rep-amount" className="text-sm font-semibold">
                                    Reputation Change
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="post-rep-amount"
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
                                <Label htmlFor="post-notif-message" className="text-sm font-semibold">
                                    Notification Message
                                </Label>
                                <Textarea
                                    id="post-notif-message"
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
                            onClick={() => {
                                setReviewReport(null);
                                setReviewPostData(null);
                                setReviewReplies([]);
                                setReviewError(null);
                            }}
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