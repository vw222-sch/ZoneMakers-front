import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Loader2, UserCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchUserReports, deleteUserReport } from "@/services/reportService";
import { fetchUser, deleteUser } from "@/services/userService";
import { getErrorMessage } from "@/lib/api";
import type { ZoneReport, User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminUserReports() {
    const [reports, setReports] = useState<ZoneReport[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingReport, setDeletingReport] = useState<number | null>(null);
    const [deletingUser, setDeletingUser] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);

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

    const handleDeleteReport = async (reportId: number) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        
        try {
            setDeletingReport(reportId);
            await deleteUserReport(reportId);
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setDeletingReport(null);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm("Are you sure you want to DELETE this user? This is irreversible!")) return;
        
        try {
            setDeletingUser(userId);
            await deleteUser(userId);

            setReports(prev => prev.filter(r => r.report_id !== userId.toString()));
            setSelectedUserId(null);
            setUserData(null);
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setDeletingUser(null);
        }
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
                <h2 className="text-2xl font-bold tracking-tight">User Reports</h2>
                <p className="text-muted-foreground">Management of toxic or rule-breaking users reported by other users.</p>
            </div>

            {selectedUserId && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold">Reported User Details</h3>
                            <div className="space-x-2">
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => handleDeleteUser(selectedUserId)}
                                    disabled={deletingUser === selectedUserId}
                                >
                                    {deletingUser === selectedUserId ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                                    Delete User
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUserId(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                        
                        {loadingUser ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : userData ? (
                            <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={userData.avatar || undefined} />
                                    <AvatarFallback><UserCircle className="w-10 h-10 text-gray-400" /></AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-lg">{userData.username}</span>
                                        {userData.verified === 1 && <Badge variant="secondary" className="bg-blue-100 text-blue-700">Verified</Badge>}
                                    </div>
                                    <p className="text-gray-500">@{userData.handle}</p>
                                    <p className="text-sm"><strong>Email:</strong> {userData.email}</p>
                                    <p className="text-sm"><strong>ID:</strong> {userData.id} | <strong>Level:</strong> {userData.level} | <strong>Reputation:</strong> {userData.reputation}</p>
                                    <p className="text-sm"><strong>Bio:</strong> {userData.bio || "No bio available"}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">Failed to load user data.</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-20">Ticket ID</TableHead>
                            <TableHead>Reported ID</TableHead>
                            <TableHead>Reporter ID</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                                    No user reports found.
                                </TableCell>
                            </TableRow>
                        ) : reports.map((report) => (
                            <TableRow key={report.id} className={selectedUserId === parseInt(report.report_id, 10) ? "bg-blue-50" : ""}>
                                <TableCell className="font-medium">#{report.id}</TableCell>
                                <TableCell className="font-semibold text-red-600">{report.report_id}</TableCell>
                                <TableCell>{report.user_id}</TableCell>
                                <TableCell className="max-w-md truncate">{report.reason}</TableCell>
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