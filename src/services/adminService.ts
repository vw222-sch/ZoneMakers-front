import type { SupportTicket, ZoneFull, CreateBadgePayload, UpdateRepPayload } from '@/types';
import * as api from '@/lib/api';

// Fetches all support tickets (admin only)
export const fetchAllSupportTickets = async (): Promise<SupportTicket[]> => {
    const res = await api.apiGet<SupportTicket[]>('/admin/support/all');
    return res.data;
};

// Deletes a support ticket (admin only)
export const deleteSupportTicket = async (ticketId: number): Promise<void> => {
    await api.apiDelete(`/admin/support/${ticketId}`);
};

// Fetches pending zone requests (admin only)
export const fetchZoneRequests = async (): Promise<ZoneFull[]> => {
    const res = await api.apiGet<ZoneFull[]>('/admin/zones/requests');
    return res.data;
};

// Accepts a zone request (admin only)
export const acceptZoneRequest = async (zoneId: number): Promise<void> => {
    await api.apiPost(`/admin/zones/${zoneId}/accept`);
};

// Rejects and deletes a zone request (admin only)
export const rejectZoneRequest = async (zoneId: number): Promise<void> => {
    await api.apiPost(`/admin/zones/${zoneId}/reject`);
};

// Creates a new badge (admin only)
export const createBadge = async (payload: CreateBadgePayload): Promise<void> => {
    await api.apiPost('/badge', payload);
};

// Deletes a badge (admin only)
export const deleteBadge = async (badgeId: number): Promise<void> => {
    await api.apiDelete(`/badge/${badgeId}`);
};

// Grants a badge to a user (admin only)
export const grantBadge = async (userId: number, badgeId: number): Promise<void> => {
    await api.apiPost(`/admin/badge/grant/${userId}/${badgeId}`);
};

// Removes a badge from a user (admin only)
export const removeBadge = async (userId: number, badgeId: number): Promise<void> => {
    await api.apiPost(`/admin/badge/remove/${userId}/${badgeId}`);
};

// Updates a user's reputation points (admin only)
export const updateUserRep = async (payload: UpdateRepPayload): Promise<void> => {
    await api.apiPost('/admin/user/rep', payload);
};

// Send notification as admin
export const sendAdminNotification = async (
    userId: number,
    title: string,
    message: string,
    type: string
): Promise<void> => {
    await api.apiPost('/notifications', { user_id: userId, title, message, type });
};

// Update user reputation (admin only)
export const updateUserReputation = async (userId: number, rep: number): Promise<void> => {
    await api.apiPost('/admin/user/rep', { user_id: userId, rep });
};