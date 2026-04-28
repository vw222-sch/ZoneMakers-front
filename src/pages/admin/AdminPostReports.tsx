import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Loader2, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchPostReports, deletePostReport } from "@/services/reportService";
import { deletePost, fetchPostReplies } from "@/services/postService";
import { getErrorMessage } from "@/lib/api";
import type { ZoneReport, ApiPost } from "@/types";

export default function AdminPostReports() {
    const [reports, setReports] = useState<ZoneReport[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingReport, setDeletingReport] = useState<number | null>(null);
    const [deletingPost, setDeletingPost] = useState<string | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [postData, setPostData] = useState<ApiPost | null>(null);
    const [replies, setReplies] = useState<ApiPost[]>([]);
    const [loadingPost, setLoadingPost] = useState(false);

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

    const handleDeleteReport = async (reportId: number) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        
        try {
            setDeletingReport(reportId);
            await deletePostReport(reportId);
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setDeletingReport(null);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone!")) return;
        
        try {
            setDeletingPost(postId);
            await deletePost(postId);
            setReports(prev => prev.filter(r => r.report_id !== postId));
            if (selectedPostId === postId) {
                setSelectedPostId(null);
                setPostData(null);
                setReplies([]);
            }
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setDeletingPost(null);
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

            {selectedPostId && (
                <div className="border border-border rounded-xl bg-card p-6">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                            Post details: {selectedPostId}
                        </h3>
                        <div className="space-x-2">
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDeletePost(selectedPostId)}
                                disabled={deletingPost === selectedPostId}
                            >
                                {deletingPost === selectedPostId ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                                Delete Post
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPostId(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                    
                    {loadingPost ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {postData && (
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
                                        <img src={postData.image} alt="Poszt kép" className="mt-2 max-w-md rounded-md border border-border" />
                                    )}
                                </div>
                            )}
                            
                            {replies.length > 1 && (
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Replies ({replies.length - 1}):</h4>
                                    <div className="space-y-2">
                                        {replies.slice(1).map(reply => (
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

            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-20">Ticket ID</TableHead>
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
                        ) : reports.map((report) => (
                            <TableRow key={report.id} className={`${selectedPostId === report.report_id ? "bg-muted/50" : ""}`}>
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
                    <div className="text-sm text-muted-foreground font-medium px-2">{page}. page</div>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}