import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react";
import { fetchAllSupportTickets, deleteSupportTicket } from "@/services/adminService";
import { getErrorMessage } from "@/lib/api";
import type { SupportTicket } from "@/types";

const TOPIC_LABELS: Record<number, string> = {
    1: "Report a problem",
    2: "Question",
    3: "Suggestion",
    4: "Other",
};

const STATE_LABELS: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    1: { label: "Open", variant: "default" },
    2: { label: "In Progress", variant: "outline" },
    3: { label: "Closed", variant: "secondary" },
};

export default function AdminSupport() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
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

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this support ticket?")) return;
        
        try {
            setDeleting(id);
            await deleteSupportTicket(id);
            setTickets(prev => prev.filter(t => t.id !== id));
            if (selectedTicket?.id === id) {
                setSelectedTicket(null);
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setDeleting(null);
        }
    };

    const totalPages = Math.ceil(tickets.length / itemsPerPage);
    const currentTickets = tickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                Error loading tickets: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Support Tickets</h2>
                <p className="text-muted-foreground">Management of user reports and issues. ({tickets.length} tickets)</p>
            </div>

            {selectedTicket && (
                <div className="border rounded-md bg-white shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{TOPIC_LABELS[selectedTicket.topic] || `Topic ${selectedTicket.topic}`}</Badge>
                                <Badge variant={STATE_LABELS[selectedTicket.state]?.variant || "secondary"}>
                                    {STATE_LABELS[selectedTicket.state]?.label || `State ${selectedTicket.state}`}
                                </Badge>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                            Close
                        </Button>
                    </div>
                    <div className="space-y-3 text-sm">
                        <p><strong>User ID:</strong> {selectedTicket.userid}</p>
                        <p><strong>Created:</strong> {new Date(selectedTicket.timestamp).toLocaleString("hu-HU")}</p>
                        <div>
                            <strong>Description:</strong>
                            <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">{selectedTicket.description}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
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
                                <TableCell colSpan={7} className="text-center h-24 text-gray-500">
                                    No support tickets found.
                                </TableCell>
                            </TableRow>
                        ) : currentTickets.map((ticket) => (
                            <TableRow key={ticket.id} className={selectedTicket?.id === ticket.id ? "bg-blue-50" : ""}>
                                <TableCell className="font-medium">#{ticket.id}</TableCell>
                                <TableCell>{TOPIC_LABELS[ticket.topic] || ticket.topic}</TableCell>
                                <TableCell className="max-w-50 truncate font-medium">{ticket.subject}</TableCell>
                                <TableCell>{ticket.userid}</TableCell>
                                <TableCell className="text-sm">{new Date(ticket.timestamp).toLocaleDateString("hu-HU")}</TableCell>
                                <TableCell>
                                    <Badge variant={STATE_LABELS[ticket.state]?.variant || "secondary"}>
                                        {STATE_LABELS[ticket.state]?.label || ticket.state}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                                        title="Details"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        onClick={() => handleDelete(ticket.id)}
                                        disabled={deleting === ticket.id}
                                    >
                                        {deleting === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="text-sm text-gray-600 font-medium px-2">
                        {currentPage} / {totalPages}. page
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                        disabled={currentPage === totalPages}
                    >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}