import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye, Loader2, Gavel } from "lucide-react";
import {
    fetchAllSupportTickets,
    deleteSupportTicket,
    sendAdminNotification,
    updateUserReputation,
} from "@/services/adminService";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SupportTicket } from "@/types";
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

const TOPIC_LABELS: Record<number, string> = {
    1: "Report a problem",
    2: "Question",
    3: "Suggestion",
    4: "Other",
};

const STATE_LABELS: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    1: { label: "Open", variant: "default", className: "bg-destructive/20 text-destructive border-none" },
    2: { label: "In Progress", variant: "outline", className: "border-yellow-500/30 text-yellow-500 bg-yellow-500/10" },
    3: { label: "Closed", variant: "secondary", className: "bg-secondary text-secondary-foreground border-none" },
};

export default function AdminSupport() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    // Review sheet state
    const [reviewTicket, setReviewTicket] = useState<SupportTicket | null>(null);
    const [reviewDecision, setReviewDecision] = useState<"valid" | "invalid">("valid");
    const [repAmount, setRepAmount] = useState<string>("10");
    const [notifMessage, setNotifMessage] = useState<string>("");
    const [reviewing, setReviewing] = useState(false);

    const itemsPerPage = 8;

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await fetchAllSupportTickets();
            setTickets(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    const openReviewSheet = (ticket: SupportTicket) => {
        setReviewTicket(ticket);
        setReviewDecision("valid");
        setRepAmount("10");
        setNotifMessage(
            `Your support ticket #${ticket.id} ("${ticket.subject}") has been reviewed and found to be valid. Thank you for your report!`
        );
    };

    const handleDecisionChange = (decision: "valid" | "invalid") => {
        setReviewDecision(decision);
        if (reviewTicket) {
            if (decision === "valid") {
                setRepAmount("10");
                setNotifMessage(
                    `Your support ticket #${reviewTicket.id} ("${reviewTicket.subject}") has been reviewed and found to be valid. Thank you for your report!`
                );
            } else {
                setRepAmount("-5");
                setNotifMessage(
                    `Your support ticket #${reviewTicket.id} ("${reviewTicket.subject}") has been reviewed. Unfortunately, it was found to be invalid.`
                );
            }
        }
    };

    const handleReviewSubmit = async () => {
        if (!reviewTicket) return;

        const rep = parseInt(repAmount, 10);
        if (isNaN(rep) || rep === 0) {
            alert("Please enter a valid reputation amount (non-zero integer).");
            return;
        }

        try {
            setReviewing(true);

            // 1. Delete the support ticket
            await deleteSupportTicket(reviewTicket.id);

            // 2. Send notification to user
            await sendAdminNotification(
                reviewTicket.userid,
                "Support ticket reviewed",
                notifMessage,
                reviewDecision === "valid" ? "success" : "warning"
            );

            // 3. Update reputation
            await updateUserReputation(reviewTicket.userid, rep);

            // Update local state
            setTickets((prev) => prev.filter((t) => t.id !== reviewTicket.id));
            if (selectedTicket?.id === reviewTicket.id) {
                setSelectedTicket(null);
            }
            setReviewTicket(null);
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setReviewing(false);
        }
    };

    const totalPages = Math.ceil(tickets.length / itemsPerPage);
    const currentTickets = tickets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                Error loading tickets: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Support Tickets</h2>
                <p className="text-muted-foreground">
                    Management of user reports and issues. ({tickets.length} tickets)
                </p>
            </div>

            {/* Quick-view inline panel */}
            {selectedTicket && (
                <div className="border border-border rounded-xl bg-card p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="border-none">
                                    {TOPIC_LABELS[selectedTicket.topic] || `Topic ${selectedTicket.topic}`}
                                </Badge>
                                <Badge
                                    variant={STATE_LABELS[selectedTicket.state]?.variant || "secondary"}
                                    className={STATE_LABELS[selectedTicket.state]?.className || ""}
                                >
                                    {STATE_LABELS[selectedTicket.state]?.label || `State ${selectedTicket.state}`}
                                </Badge>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                            Close
                        </Button>
                    </div>
                    <div className="space-y-3 text-sm">
                        <p className="text-muted-foreground">
                            <strong className="text-foreground">User ID:</strong> {selectedTicket.userid}
                        </p>
                        <p className="text-muted-foreground">
                            <strong className="text-foreground">Created:</strong>{" "}
                            {new Date(selectedTicket.timestamp).toLocaleString("hu-HU")}
                        </p>
                        <div>
                            <strong className="text-foreground">Description:</strong>
                            <p className="mt-1 p-3 bg-background rounded-xl border border-border whitespace-pre-wrap text-muted-foreground">
                                {selectedTicket.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-20">ID</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentTickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No support tickets found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentTickets.map((ticket) => (
                                <TableRow
                                    key={ticket.id}
                                    className={selectedTicket?.id === ticket.id ? "bg-muted/50" : ""}
                                >
                                    <TableCell className="font-medium">#{ticket.id}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {TOPIC_LABELS[ticket.topic] || ticket.topic}
                                    </TableCell>
                                    <TableCell className="max-w-50 truncate font-medium">
                                        {ticket.subject}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{ticket.userid}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(ticket.timestamp).toLocaleDateString("hu-HU")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={STATE_LABELS[ticket.state]?.variant || "secondary"}
                                            className={STATE_LABELS[ticket.state]?.className || ""}
                                        >
                                            {STATE_LABELS[ticket.state]?.label || ticket.state}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                setSelectedTicket(
                                                    selectedTicket?.id === ticket.id ? null : ticket
                                                )
                                            }
                                            title="Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => openReviewSheet(ticket)}
                                            title="Review ticket"
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
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* Review Sheet */}
            <Sheet open={!!reviewTicket} onOpenChange={(open) => !open && setReviewTicket(null)}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Review Support Ticket</SheetTitle>
                        <SheetDescription>
                            Decide whether the report is valid or invalid. This will delete the ticket,
                            notify the user, and adjust their reputation.
                        </SheetDescription>
                    </SheetHeader>

                    {reviewTicket && (
                        <div className="space-y-6 py-4">
                            {/* Ticket Info */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Ticket Details</h4>
                                <div className="rounded-xl border border-border p-4 space-y-2.5 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">ID</span>
                                        <span className="font-mono">#{reviewTicket.id}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Subject</span>
                                        <span className="font-medium text-right max-w-[60%] truncate">
                                            {reviewTicket.subject}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Topic</span>
                                        <span>
                                            {TOPIC_LABELS[reviewTicket.topic] || reviewTicket.topic}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">User ID</span>
                                        <span className="font-mono">{reviewTicket.userid}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Date</span>
                                        <span>
                                            {new Date(reviewTicket.timestamp).toLocaleString("hu-HU")}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge
                                            variant={
                                                STATE_LABELS[reviewTicket.state]?.variant || "secondary"
                                            }
                                            className={
                                                STATE_LABELS[reviewTicket.state]?.className || ""
                                            }
                                        >
                                            {STATE_LABELS[reviewTicket.state]?.label ||
                                                reviewTicket.state}
                                        </Badge>
                                    </div>
                                    <Separator />
                                    <div>
                                        <span className="text-muted-foreground">Description</span>
                                        <p className="mt-1.5 p-3 bg-background rounded-lg border border-border whitespace-pre-wrap text-xs leading-relaxed">
                                            {reviewTicket.description}
                                        </p>
                                    </div>
                                </div>
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
                                        <span className="text-xs opacity-70">Grant reputation</span>
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
                                        <span className="text-xs opacity-70">Deduct reputation</span>
                                    </button>
                                </div>
                            </div>

                            {/* Rep Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="rep-amount" className="text-sm font-semibold">
                                    Reputation Change
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="rep-amount"
                                        type="number"
                                        value={repAmount}
                                        onChange={(e) => setRepAmount(e.target.value)}
                                        className="w-32"
                                    />
                                    <span className="text-sm text-muted-foreground">points</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {reviewDecision === "valid"
                                        ? "Use a positive number to reward the user."
                                        : "Use a negative number to penalize the user."}
                                </p>
                            </div>

                            {/* Notification Message */}
                            <div className="space-y-2">
                                <Label htmlFor="notif-message" className="text-sm font-semibold">
                                    Notification Message
                                </Label>
                                <Textarea
                                    id="notif-message"
                                    value={notifMessage}
                                    onChange={(e) => setNotifMessage(e.target.value)}
                                    rows={3}
                                    className="text-sm resize-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    This message will be sent to the user as a notification.
                                </p>
                            </div>
                        </div>
                    )}

                    <SheetFooter className="flex-row gap-2 sm:justify-end pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setReviewTicket(null)}
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
                                    {" & Delete"}
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}