/**
 * Zone (Térkép) API hívások
 */

import type { ZoneSummary, ZoneFull, CreateReportPayload } from '@/types';
import * as api from '@/lib/api';

export const fetchZoneSummaries = async (): Promise<ZoneSummary[]> => {
    const res = await api.apiGet<ZoneSummary[]>('/zones');
    return res.data.map((z: any) => ({
        id: z.id,
        name: z.name,
        hazard_level: z.hazard_level,
        coordinates: safeParse(z.coordinates, []),
    }));
};

export const searchZones = async (query: string): Promise<ZoneSummary[]> => {
    const res = await api.apiGet<ZoneSummary[]>(`/zones/search/${query}`);
    return res.data.map((z: any) => ({
        id: z.id,
        name: z.name,
        hazard_level: z.hazard_level,
        coordinates: safeParse(z.coordinates, []),
    }));
};

export const fetchZoneDetails = async (zoneId: number): Promise<ZoneFull> => {
    const res = await api.apiGet<ZoneFull>(`/zones/${zoneId}`);
    return res.data;
};

export interface CreateZonePayload {
    name: string;
    coordinates: string; 
    hazard_level: string;
    description: string;
    hazards: string; 
    images: string; 
}

export const createZoneRequest = async (payload: CreateZonePayload): Promise<void> => {
    await api.apiPost('/zones/requests', payload);
};

/**
 * HIÁNYZOTT: Zóna módosítása (PUT)
 */
export const updateZone = async (zoneId: number, payload: Partial<CreateZonePayload>): Promise<void> => {
    await api.apiPut(`/zones/${zoneId}`, payload);
};

/**
 * HIÁNYZOTT: Zóna törlése
 */
export const deleteZone = async (zoneId: number): Promise<void> => {
    await api.apiDelete(`/zones/${zoneId}`);
};

export const reportZone = async (payload: CreateReportPayload): Promise<void> => {
    await api.apiPost('/report/zone', payload);
};

const safeParse = (data: any, fallback: any) => {
    if (typeof data === 'string') {
        try { return JSON.parse(data); } catch { return fallback; }
    }
    return data || fallback;
};