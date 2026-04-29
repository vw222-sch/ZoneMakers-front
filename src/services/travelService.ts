import type { TravelLog } from '@/types';
import * as api from '@/lib/api';

// Fetches paginated travel logs
export const fetchTravelLogs = async (page: number = 1): Promise<TravelLog[]> => {
    const res = await api.apiGet<TravelLog[]>(`/travel/page/${page}`);
    return res.data;
};

// Creates a new travel log entry
export const createTravelLog = async (title: string, message: string, type: string): Promise<void> => {
    await api.apiPost('/travel', { title, message, type });
};

// Deletes a travel log entry
export const deleteTravelLog = async (id: number): Promise<void> => {
    await api.apiDelete(`/travel/${id}`);
};