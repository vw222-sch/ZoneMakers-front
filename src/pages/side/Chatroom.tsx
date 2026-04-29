import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { BadgeCheckIcon, SendIcon, Trash2, Edit2, ImageIcon, Flag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import type { ApiPost } from "@/types";
import * as postService from "@/services/postService";
import * as reportService from "@/services/reportService";
import * as userService from "@/services/userService";
import * as notificationService from "@/services/notificationService";
import { useAuth } from "@/hooks/AuthContext";
import { getErrorMessage } from "@/lib/api";

const REPORT_REASONS = [
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "hate_speech", label: "Hate Speech" },
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "false_info", label: "False Information" },
    { value: "other", label: "Other" },
] as const;

export default function Chatroom() {
    const navigate = useNavigate();
    const { regionId } = useParams<{ regionId: string }>();
    const region = regionId ? parseInt(regionId, 10) : 1;

    const { state: authState } = useAuth();
    const currentToken = authState.token;
    const loggedInUserId = authState.userId;
    const loggedInHandle = authState.user?.handle || "";
    const isAdmin = authState.isAdmin;

    const [posts, setPosts] = useState<ApiPost[]>([]);
    const [postText, setPostText] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [replyText, setReplyText] = useState<Record<string, string>>({});

    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
    const [repliesData, setRepliesData] = useState<Record<string, ApiPost[]>>({});

    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [reportPostId, setReportPostId] = useState<string | null>(null);
    const [reportReason, setReportReason] = useState("");
    const [reportCustomReason, setReportCustomReason] = useState("");
    const [isReporting, setIsReporting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);

    const fetchPosts = async () => {
        try {
            const data = await postService.fetchPosts(region);
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts:", getErrorMessage(error));
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [region]);

    const sendTagNotifications = async (content: string) => {
        const mentionRegex = /@([a-zA-Z0-9_]+)/g;
        const matches = [...content.matchAll(mentionRegex)];

        for (const match of matches) {
            const mentionedHandle = match[1];

            if (mentionedHandle === loggedInHandle) continue;

            try {
                const mentionedUser = await userService.fetchUserByHandle(mentionedHandle);

                await notificationService.createNotification(
                    mentionedUser.id,
                    "You have been mentioned in a post",
                    `Someone mentioned you in a post: @${mentionedHandle}`,
                    "mention"
                );
            } catch (err) {
                console.warn(`Failed to send notification to @${mentionedHandle}.`, err);
            }
        }
    };

    const handlePostSubmit = async () => {
        if (!postText.trim() || !currentToken) return;
        try {
            await postService.createPost({
                content: postText,
                region,
                image: imageUrl.trim() ? imageUrl.trim() : undefined
            });

            if (postText.includes("@")) {
                sendTagNotifications(postText);
            }

            setPostText("");
            setImageUrl("");
            fetchPosts();
        } catch (error) {
            console.error("Error creating post:", getErrorMessage(error));
            alert("Failed to create post.");
        }
    };

    const toggleReplies = async (postId: string) => {
        const isExpanded = expandedReplies[postId];
        if (!isExpanded) {
            try {
                const data = await postService.fetchPostReplies(postId);
                setRepliesData(prev => ({ ...prev, [postId]: data }));
            } catch (error) {
                console.error("Error fetching replies:", getErrorMessage(error));
            }
        }
        setExpandedReplies(prev => ({ ...prev, [postId]: !isExpanded }));
    };

    const handleReplySubmit = async (postId: string) => {
        const text = replyText[postId]?.trim();
        if (!text || !currentToken) return;

        try {
            await postService.createPost({
                content: text,
                region,
                reply_id: postId
            });

            if (text.includes("@")) {
                sendTagNotifications(text);
            }

            setReplyText(prev => ({ ...prev, [postId]: "" }));

            const replies = await postService.fetchPostReplies(postId);
            setRepliesData(prev => ({ ...prev, [postId]: replies }));

            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, replies_count: (p.replies_count || 0) + 1 } : p
            ));
        } catch (error) {
            console.error("Error creating reply:", getErrorMessage(error));
            alert("Failed to create reply.");
        }
    };

    const handleDelete = async (postId: string, parentId?: string) => {
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
        try {
            await postService.deletePost(postId);

            if (parentId) {
                setRepliesData(prev => ({
                    ...prev,
                    [parentId]: prev[parentId].filter(r => r.id !== postId)
                }));
                setPosts(prev => prev.map(p =>
                    p.id === parentId ? { ...p, replies_count: Math.max((p.replies_count || 1) - 1, 0) } : p
                ));
            } else {
                setPosts(prev => prev.filter(p => p.id !== postId));
            }
        } catch (error) {
            console.error("Error deleting post:", getErrorMessage(error));
            alert("Error occurred while deleting the post.");
        }
    };

    const handleEditSave = async (postId: string, parentId?: string) => {
        if (!editContent.trim()) return;
        try {
            await postService.updatePost(postId, editContent);

            setEditingPostId(null);

            if (parentId) {
                setRepliesData(prev => ({
                    ...prev,
                    [parentId]: prev[parentId].map(r => r.id === postId ? { ...r, content: editContent } : r)
                }));
            } else {
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editContent } : p));
            }
        } catch (error) {
            console.error("Error editing post:", getErrorMessage(error));
            alert("Error occurred while editing the post.");
        }
    };

    const startEditing = (post: ApiPost) => {
        setEditingPostId(post.id);
        setEditContent(post.content);
    };

    const canEditOrDelete = (authorId: number) => {
        return authState.isLoggedIn && (loggedInUserId === authorId || isAdmin);
    };

    const openReportDialog = (postId: string) => {
        if (!currentToken) {
            alert("You need to be logged in to report a post!");
            return;
        }
        setReportPostId(postId);
        setReportReason("");
        setReportCustomReason("");
        setReportSuccess(false);
        setReportDialogOpen(true);
    };

    const handleReportSubmit = async () => {
        if (!reportPostId) return;

        const finalReason = reportReason === "other"
            ? reportCustomReason.trim()
            : REPORT_REASONS.find(r => r.value === reportReason)?.label || reportReason;

        if (!finalReason) {
            alert("Please select or enter a reason for the report!");
            return;
        }

        setIsReporting(true);
        try {
            await reportService.reportPost({
                reason: finalReason,
                report_id: reportPostId
            });

            setReportSuccess(true);
            setTimeout(() => {
                setReportDialogOpen(false);
                setReportPostId(null);
            }, 2000);
        } catch (error) {
            console.error("Error reporting post:", getErrorMessage(error));
            alert("An error occurred while reporting the post.");
        } finally {
            setIsReporting(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return "Most";
            if (diffMins < 60) return `${diffMins} minutes ago`;
            if (diffHours < 24) return `${diffHours} hours ago`;
            if (diffDays < 7) return `${diffDays} days ago`;

            return date.toLocaleDateString("hu-HU", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        } catch {
            return "";
        }
    };

    return (
        <>
            <div className="bg-background text-foreground min-h-screen">
                <div className="container mx-auto max-w-4xl space-y-2 mt-8 px-4">
                    <h1 className="text-4xl font-bold tracking-widest text-center my-8">Chat</h1>

                    {currentToken ? (
                        <Card className="shadow-lg mb-8">
                            <CardContent className="pt-6 space-y-3">
                                <Textarea
                                    placeholder="Share your thoughts with us... (mention users with @handle)"
                                    value={postText}
                                    onChange={(e) => setPostText(e.target.value)}
                                    className="resize-none"
                                    rows={3}
                                />
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Image URL (Optional)"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Button
                                        onClick={handlePostSubmit}
                                        disabled={!postText.trim()}
                                        className="w-32 font-bold"
                                        variant="default"
                                    >
                                        <SendIcon className="w-4 h-4 mr-2" />
                                        Post
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center p-6 bg-card rounded-xl text-muted-foreground font-medium mb-8 border border-border">
                            You need to be logged in to participate in the chat!
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-8 items-center px-4 pb-12">
                    {posts.map((post) => (
                        <Card key={post.id} className="max-w-4xl w-full shadow-lg hover:shadow-xl transition-shadow relative">
                            <div className="absolute top-4 right-4 flex gap-2 z-10">
                                {canEditOrDelete(post.author_id) && (
                                    <>
                                        <button onClick={() => startEditing(post)} className="text-muted-foreground hover:text-primary transition p-1" title="Szerkesztés">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(post.id)} className="text-muted-foreground hover:text-destructive transition p-1" title="Törlés">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                {!canEditOrDelete(post.author_id) && (
                                    <button onClick={() => openReportDialog(post.id)} className="text-muted-foreground hover:text-orange-500 transition p-1" title="Jelentés">
                                        <Flag className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <CardHeader className="flex items-center justify-between gap-3 pb-4 pt-6">
                                <div className="flex items-center gap-3 flex-1">
                                    <button
                                        onClick={() => navigate(`/user-details/${post.author_id}`)}
                                        className="flex items-center gap-3 hover:opacity-80 transition group cursor-pointer"
                                    >
                                        <Avatar className="ring-2 ring-border w-12 h-12">
                                            <AvatarImage src={post.avatar || undefined} alt={post.username} />
                                            <AvatarFallback>{post.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="text-left">
                                            <div className="flex items-center gap-1">
                                                <CardTitle className="flex items-center gap-1 text-base group-hover:text-primary transition">
                                                    {post.username}
                                                    {post.verified === 1 && (
                                                        <BadgeCheckIcon className="size-4 fill-sky-500 stroke-background" />
                                                    )}
                                                </CardTitle>
                                            </div>
                                            <CardDescription className="flex items-center gap-2">
                                                @{post.handle}
                                                <span className="text-muted-foreground/50">·</span>
                                                <span className="text-muted-foreground">{formatDate(post.created_at)}</span>
                                            </CardDescription>
                                        </div>
                                    </button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {post.image && (
                                    <img src={post.image} alt="Post image" className="aspect-video w-full rounded-md object-cover bg-secondary" />
                                )}

                                {editingPostId === post.id ? (
                                    <div className="space-y-2 mt-2 p-3 bg-secondary rounded-lg border border-border relative z-20">
                                        <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full" rows={4} />
                                        <div className="flex gap-2 justify-end">
                                            <Button onClick={() => setEditingPostId(null)} variant="ghost" size="sm">Cancel</Button>
                                            <Button onClick={() => handleEditSave(post.id)} size="sm" variant="default">Save</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-lg font-semibold tracking-wide whitespace-pre-wrap">{post.content}</p>
                                )}

                                <div className="border-t border-border pt-4 space-y-4">
                                    <button
                                        onClick={() => toggleReplies(post.id)}
                                        className="text-sm font-medium text-primary hover:text-primary/80 transition"
                                    >
                                        {post.replies_count === 0
                                            ? "Be the first to comment!"
                                            : `${post.replies_count} ${post.replies_count === 1 ? "reply" : "replies"} view`}
                                    </button>

                                    {expandedReplies[post.id] && (
                                        <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                            {repliesData[post.id]?.map((reply) => {
                                                const isTagged = loggedInHandle && reply.content.includes(`@${loggedInHandle}`);

                                                return (
                                                    <div key={reply.id} className={`group p-4 rounded-lg border-l-4 transition relative ${isTagged ? "bg-yellow-500/10 border-yellow-500" : "bg-secondary/50 border-border"}`}>
                                                        <div className="absolute top-3 right-3 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition z-10">
                                                            {canEditOrDelete(reply.author_id) && (
                                                                <>
                                                                    <button onClick={() => startEditing(reply)} className="text-muted-foreground hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                                                                    <button onClick={() => handleDelete(reply.id, post.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                </>
                                                            )}
                                                            {!canEditOrDelete(reply.author_id) && (
                                                                <button onClick={() => openReportDialog(reply.id)} className="text-muted-foreground hover:text-orange-500"><Flag className="w-3.5 h-3.5" /></button>
                                                            )}
                                                        </div>

                                                        <button onClick={() => navigate(`/user-details/${reply.author_id}`)} className="flex items-center gap-2 mb-2 hover:opacity-80 transition cursor-pointer">
                                                            <Avatar className="w-8 h-8 ring-1 ring-border">
                                                                <AvatarImage src={reply.avatar || undefined} alt={reply.username} />
                                                                <AvatarFallback className="text-xs">{reply.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col items-start">
                                                                <span className="font-semibold text-sm flex items-center gap-1 text-foreground">
                                                                    {reply.username}
                                                                    {reply.verified === 1 && (<BadgeCheckIcon className="size-3 fill-sky-500 stroke-background" />)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">@{reply.handle}<span className="text-muted-foreground/50 mx-1">·</span>{formatDate(reply.created_at)}</span>
                                                            </div>
                                                        </button>

                                                        {editingPostId === reply.id ? (
                                                            <div className="space-y-2 mt-2 relative z-20">
                                                                <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full text-sm" rows={2} />
                                                                <div className="flex gap-2 justify-end">
                                                                    <Button onClick={() => setEditingPostId(null)} variant="ghost" size="sm" className="h-7 text-xs">Cancel</Button>
                                                                    <Button onClick={() => handleEditSave(reply.id, post.id)} size="sm" variant="default" className="h-7 text-xs">Save</Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {currentToken && (
                                                <div className="flex flex-col gap-3 mt-4">
                                                    <Textarea
                                                        placeholder="Write a reply... (Mention users with @handle)"
                                                        value={replyText[post.id] || ""}
                                                        onChange={(e) => setReplyText({ ...replyText, [post.id]: e.target.value })}
                                                        className="resize-none"
                                                        rows={2}
                                                    />
                                                    <Button onClick={() => handleReplySubmit(post.id)} disabled={!replyText[post.id]?.trim()} variant="secondary" className="w-full sm:w-auto self-end cursor-pointer">
                                                        <SendIcon className="w-4 h-4 mr-2" /> Send Reply
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-muted-foreground text-lg py-12 flex flex-col items-center gap-2">
                            <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                            There are no posts in this region yet.
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Flag className="w-5 h-5 text-orange-500" /> Report Post
                        </DialogTitle>
                        <DialogDescription>Please select a reason for the report. Inappropriate reports may be ignored.</DialogDescription>
                    </DialogHeader>

                    {reportSuccess ? (
                        <div className="py-6 text-center">
                            <div className="text-green-500 text-4xl mb-3">✓</div>
                            <p className="text-green-500 font-medium">The report has been submitted successfully!</p>
                            <p className="text-muted-foreground text-sm mt-1">Thank you for your help.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="report-reason">Report Reason</Label>
                                <Select value={reportReason} onValueChange={setReportReason}>
                                    <SelectTrigger id="report-reason">
                                        <SelectValue placeholder="Choose a reason..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {REPORT_REASONS.map((reason) => (<SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {reportReason === "other" && (
                                <div className="space-y-2">
                                    <Label htmlFor="custom-reason">Detailed Description</Label>
                                    <Textarea id="custom-reason" placeholder="Please describe..." value={reportCustomReason} onChange={(e) => setReportCustomReason(e.target.value)} rows={3} className="resize-none" />
                                </div>
                            )}
                        </div>
                    )}

                    {!reportSuccess && (
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setReportDialogOpen(false)} disabled={isReporting}>Cancel</Button>
                            <Button onClick={handleReportSubmit} disabled={!reportReason || (reportReason === "other" && !reportCustomReason.trim()) || isReporting} variant="destructive">Submit Report</Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}