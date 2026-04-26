/**
 * Notification API hívások
 */

import type { ApiNotification } from '@/types';
import * as api from '@/lib/api';

export const fetchNotifications = async (): Promise<ApiNotification[]> => {
    const res = await api.apiGet<ApiNotification[]>('/notifications');
    return res.data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

/**
 * JAVÍTVA: Az endpoint /notifications/read/{id}
 */
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
    await api.apiPatch(`/notifications/read/${notificationId}`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    await api.apiPatch('/notifications/mark-all-read', {});
};

/**
 * HIÁNYZOTT: Értesítés létrehozása (Admin)
 */
export const createNotification = async (userId: number, title: string, message: string, type: string): Promise<void> => {
    await api.apiPost('/notifications', { user_id: userId, title, message, type });
};

/**
 * HIÁNYZOTT: Értesítés törlése
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
    await api.apiDelete(`/notifications/${notificationId}`);
};