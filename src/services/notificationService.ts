import type { ApiNotification } from '@/types';
import * as api from '@/lib/api';

// Fetches current user's notifications sorted by newest first
export const fetchNotifications = async (): Promise<ApiNotification[]> => {
    const res = await api.apiGet<ApiNotification[]>('/notifications');
    return res.data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Marks a single notification as read
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
    await api.apiPatch(`/notifications/read/${notificationId}`);
};

// Creates a notification for a specific user (admin only)
export const createNotification = async (userId: number, title: string, message: string, type: string): Promise<void> => {
    await api.apiPost('/notifications', { user_id: userId, title, message, type });
};

// Deletes a notification
export const deleteNotification = async (notificationId: number): Promise<void> => {
    await api.apiDelete(`/notifications/${notificationId}`);
};