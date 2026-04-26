/**
 * Reporting (Jelentések) API hívások
 */

import type { ZoneReport } from '@/types';
import * as api from '@/lib/api';

export interface CreateReportPayload {
    reason: string;
    report_id: string;
}

// --- JELNTÉS KÜLDÉSE ---

export const reportPost = async (payload: CreateReportPayload): Promise<void> => {
    await api.apiPost('/report/post', payload);
};

export const reportUser = async (payload: CreateReportPayload): Promise<void> => {
    await api.apiPost('/report/user', payload);
};

export const reportZone = async (payload: CreateReportPayload): Promise<void> => {
    await api.apiPost('/report/zone', payload);
};

// --- ADMIN JELENTÉS KEZELÉS ---

export const fetchPostReports = async (page: number = 1): Promise<ZoneReport[]> => {
    const res = await api.apiGet<ZoneReport[]>(`/report/posts/${page}`);
    return res.data;
};

export const deletePostReport = async (reportId: number): Promise<void> => {
    await api.apiDelete(`/report/post/${reportId}`);
};

export const fetchUserReports = async (page: number = 1): Promise<ZoneReport[]> => {
    const res = await api.apiGet<ZoneReport[]>(`/report/users/${page}`);
    return res.data;
};

export const deleteUserReport = async (reportId: number): Promise<void> => {
    await api.apiDelete(`/report/user/${reportId}`);
};

export const fetchZoneReports = async (page: number = 1): Promise<ZoneReport[]> => {
    const res = await api.apiGet<ZoneReport[]>(`/report/zones/${page}`);
    return res.data;
};

export const deleteZoneReport = async (reportId: number): Promise<void> => {
    await api.apiDelete(`/report/zone/${reportId}`);
};