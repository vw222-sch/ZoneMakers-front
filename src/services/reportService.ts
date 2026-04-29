import type { ZoneReport, CreateReportPayload } from '@/types';
import * as api from '@/lib/api';

// Submits a report for a post
export const reportPost = async (payload: CreateReportPayload): Promise<void> => {
    await api.apiPost('/report/post', payload);
};

// Submits a report for a user
export const reportUser = async (payload: CreateReportPayload): Promise<void> => {
    await api.apiPost('/report/user', payload);
};

// Submits a report for a zone
export const reportZone = async (payload: CreateReportPayload): Promise<void> => {
    await api.apiPost('/report/zone', payload);
};

// Fetches paginated post reports (admin only)
export const fetchPostReports = async (page: number = 1): Promise<ZoneReport[]> => {
    const res = await api.apiGet<ZoneReport[]>(`/report/posts/${page}`);
    return res.data;
};

// Deletes a post report (admin only)
export const deletePostReport = async (reportId: number): Promise<void> => {
    await api.apiDelete(`/report/post/${reportId}`);
};

// Fetches paginated user reports (admin only)
export const fetchUserReports = async (page: number = 1): Promise<ZoneReport[]> => {
    const res = await api.apiGet<ZoneReport[]>(`/report/users/${page}`);
    return res.data;
};

// Deletes a user report (admin only)
export const deleteUserReport = async (reportId: number): Promise<void> => {
    await api.apiDelete(`/report/user/${reportId}`);
};

// Fetches paginated zone reports (admin only)
export const fetchZoneReports = async (page: number = 1): Promise<ZoneReport[]> => {
    const res = await api.apiGet<ZoneReport[]>(`/report/zones/${page}`);
    return res.data;
};

// Deletes a zone report (admin only)
export const deleteZoneReport = async (reportId: number): Promise<void> => {
    await api.apiDelete(`/report/zone/${reportId}`);
};