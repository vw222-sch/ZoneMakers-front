/**
 * Admin restricted API hívások
 */

import type { SupportTicket, ZoneFull } from '@/types';
import * as api from '@/lib/api';

// --- SUPPORT KEZELÉS ---

export const fetchAllSupportTickets = async (): Promise<SupportTicket[]> => {
    const res = await api.apiGet<SupportTicket[]>('/admin/support/all');
    return res.data;
};

export const deleteSupportTicket = async (ticketId: number): Promise<void> => {
    await api.apiDelete(`/admin/support/${ticketId}`);
};

// --- ZÓNA KÉRELMEK KEZELÉSE ---

export const fetchZoneRequests = async (): Promise<ZoneFull[]> => {
    const res = await api.apiGet<ZoneFull[]>('/admin/zones/requests');
    return res.data;
};

export const acceptZoneRequest = async (zoneId: number): Promise<void> => {
    await api.apiPost(`/admin/zones/${zoneId}/accept`);
};

export const rejectZoneRequest = async (zoneId: number): Promise<void> => {
    await api.apiPost(`/admin/zones/${zoneId}/reject`);
};

// --- BADGE KEZELÉS ---

export interface CreateBadgePayload {
    image: string;
    title: string;
}

export const createBadge = async (payload: CreateBadgePayload): Promise<void> => {
    await api.apiPost('/badge', payload);
};

export const deleteBadge = async (badgeId: number): Promise<void> => {
    await api.apiDelete(`/badge/${badgeId}`);
};