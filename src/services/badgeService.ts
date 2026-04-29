import type { BadgeData } from '@/types';
import * as api from '@/lib/api';

// Fetches all available badges
export const fetchAllBadges = async (): Promise<BadgeData[]> => {
    const res = await api.apiGet<BadgeData[]>('/badge/all');
    return res.data;
};

// Fetches a single badge by ID
export const fetchBadge = async (badgeId: number): Promise<BadgeData> => {
    const res = await api.apiGet<BadgeData>(`/badge/${badgeId}`);
    return res.data;
};

// Fetches multiple badges by IDs
export const fetchBadges = async (badgeIds: number[]): Promise<BadgeData[]> => {
    const requests = badgeIds.map(id => fetchBadge(id));
    return Promise.all(requests);
};