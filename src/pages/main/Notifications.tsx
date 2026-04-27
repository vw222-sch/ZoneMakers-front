import { useState, useEffect } from "react";
import { MapPin, Bell, Info, CheckCircle, Trash2, Check, Loader2 } from "lucide-react";

import type { ApiNotification } from "@/types";
import * as notificationService from "@/services/notificationService";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/AuthContext";

export default function Notifications() {
    const { state } = useAuth();
    const isLoggedIn = state.isLoggedIn;

    const [notifications, setNotifications] = useState<ApiNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await notificationService.fetchNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Error retrieving notifications:", getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [isLoggedIn]);

    const handleMarkAsRead = async (id: number) => {
        setActionError(null);
        try {
            await notificationService.markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Error marking notification as read:", getErrorMessage(error));
            setActionError(getErrorMessage(error));
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this notification?")) return;
        setActionError(null);
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error("Error deleting notification:", getErrorMessage(error));
            setActionError(getErrorMessage(error));
        }
    };

    const getIcon = (type: string, isRead: boolean) => {
        const props = { className: `w-6 h-6 ${isRead ? 'text-gray-400' : 'text-blue-200'}` };
        switch (type?.toLowerCase()) {
            case 'location':
            case 'checkin':
                return <MapPin {...props} />;
            case 'info':
                return <Info {...props} />;
            case 'success':
                return <CheckCircle {...props} />;
            default:
                return <Bell {...props} />;
        }
    };

    const timeAgo = (timestamp: string) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMs < 0) return "Just now";
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;

        return `${Math.floor(diffHours / 24)} days ago`;
    };

    return (
        <div className="container mx-auto max-w-6xl px-4 min-h-screen space-y-6">
            <div className="flex items-center justify-between mb-16">
                <h1 className="fl-text-4xl/6xl font-bold tracking-wide text-center flex-1">Notifications</h1>
            </div>

            {actionError && (
                <div className="p-4 rounded-xl font-bold text-center border bg-red-500/10 text-red-400 border-red-500/30">
                    {actionError}
                    <button onClick={() => setActionError(null)} className="ml-4 underline text-sm">Close</button>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            )}

            {!loading && notifications.length === 0 && (
                <div className="text-center text-gray-500 py-12 font-medium">
                    {isLoggedIn ? "No notifications to display." : "Please log in to view notifications."}
                </div>
            )}

            {!loading && notifications.map((notif) => {
                const isRead = notif.read;

                return (
                    <div
                        key={notif.id}
                        className={`flex gap-4 p-6 rounded-2xl border-2 transition-all duration-300 ${isRead
                                ? 'bg-white border-gray-200 opacity-75'
                                : 'bg-blue-500/10 border-blue-300 shadow-md'
                            }`}
                    >
                        <div className={`p-3 rounded-2xl h-fit border ${isRead
                                ? 'bg-gray-100 border-gray-200'
                                : 'bg-blue-500/80 border-blue-400/70'
                            }`}>
                            {getIcon(notif.type, isRead)}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start gap-4">
                                <h3 className={`font-extrabold tracking-wider text-lg ${isRead ? 'text-gray-600' : 'text-black'}`}>
                                    {notif.title}
                                </h3>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-white font-bold bg-black/20 px-4 py-2 rounded-lg whitespace-nowrap">
                                        {timeAgo(notif.timestamp)}
                                    </span>

                                    {!isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                                            title="Mark as Read"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(notif.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <p className={`mt-1 font-semibold tracking-wide ${isRead ? 'text-gray-500' : 'text-gray-800'}`}>
                                {notif.message}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}