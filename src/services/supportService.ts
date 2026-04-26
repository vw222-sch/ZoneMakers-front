/**
 * Support (Támogatás) API hívások
 */

import type { CreateSupportPayload } from '@/types';
import * as api from '@/lib/api';

export const createSupportTicket = async (payload: CreateSupportPayload): Promise<void> => {
    await api.apiPost('/support', payload);
};