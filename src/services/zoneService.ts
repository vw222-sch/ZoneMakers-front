import type { ZoneSummary, ZoneFull, CreateZonePayload } from '@/types';
import * as api from '@/lib/api';

// Safely parses JSON data with fallback
const safeParse = (data: any, fallback: any) => {
    if (typeof data === 'string') {
        try { return JSON.parse(data); } catch { return fallback; }
    }
    return data || fallback;
};

// Fetches all zone summaries for map display
export const fetchZoneSummaries = async (): Promise<ZoneSummary[]> => {
    const res = await api.apiGet<ZoneSummary[]>('/zones');
    return res.data.map((z: any) => ({
        id: z.id,
        name: z.name,
        hazard_level: z.hazard_level,
        coordinates: safeParse(z.coordinates, []),
    }));
};

// Searches zones by query string
export const searchZones = async (query: string): Promise<ZoneSummary[]> => {
    const res = await api.apiGet<ZoneSummary[]>(`/zones/search/${query}`);
    return res.data.map((z: any) => ({
        id: z.id,
        name: z.name,
        hazard_level: z.hazard_level,
        coordinates: safeParse(z.coordinates, []),
    }));
};

// Fetches full zone details by ID
export const fetchZoneDetails = async (zoneId: number): Promise<ZoneFull> => {
    const res = await api.apiGet<ZoneFull>(`/zones/${zoneId}`);
    return res.data;
};

// Submits a new zone creation request
export const createZoneRequest = async (payload: CreateZonePayload): Promise<void> => {
    await api.apiPost('/zones/requests', payload);
};

// Updates an existing zone (sets to request status)
export const updateZone = async (zoneId: number, payload: Partial<CreateZonePayload>): Promise<void> => {
    await api.apiPut(`/zones/${zoneId}`, payload);
};

// Deletes a zone
export const deleteZone = async (zoneId: number): Promise<void> => {
    await api.apiDelete(`/zones/${zoneId}`);
};