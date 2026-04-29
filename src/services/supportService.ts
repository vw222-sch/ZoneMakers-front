import type { CreateSupportPayload } from '@/types';
import * as api from '@/lib/api';

// Creates a new support ticket
export const createSupportTicket = async (payload: CreateSupportPayload): Promise<void> => {
    await api.apiPost('/support', payload);
};