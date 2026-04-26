/**
 * User-rel kapcsolatos API hívások
 */

import type { User, BadgeData } from '@/types';
import * as api from '@/lib/api';

export const fetchUser = async (userId: number | string): Promise<User> => {
    const res = await api.apiGet<User>(`/user/${userId}`);
    return res.data;
};

/**
 * HIÁNYZOTT: Felhasználó keresese handle alapján
 */
export const fetchUserByHandle = async (handle: string): Promise<User> => {
    const res = await api.apiGet<User>(`/user/handle/${handle}`);
    return res.data;
};

// --- MÓDOSÍTÁSOK (A token-t az interceptor küldi, nem a body!) ---

export const updateUserName = async (targetId: number, newName: string): Promise<void> => {
    await api.apiPatch('/user/name', { target_id: targetId, new_name: newName });
};

export const updateUserHandle = async (targetId: number, newHandle: string): Promise<void> => {
    await api.apiPatch('/user/handle', { target_id: targetId, new_handle: newHandle });
};

export const updateUserEmail = async (targetId: number, newEmail: string): Promise<void> => {
    await api.apiPatch('/user/email', { target_id: targetId, new_email: newEmail });
};

export const updateUserBio = async (targetId: number, newBio: string): Promise<void> => {
    await api.apiPatch('/user/bio', { target_id: targetId, new_bio: newBio });
};

export const updateUserAvatar = async (targetId: number, newAvatar: string): Promise<void> => {
    await api.apiPatch('/user/avatar', { target_id: targetId, new_avatar: newAvatar });
};

/**
 * HIÁNYZOTT: Banner módosítása
 */
export const updateUserBanner = async (targetId: number, newBanner: string): Promise<void> => {
    await api.apiPatch('/user/banner', { target_id: targetId, new_banner: newBanner });
};

export const updateUserTheme = async (targetId: number, newTheme: number): Promise<void> => {
    await api.apiPatch('/user/theme', { target_id: targetId, new_theme: String(newTheme) });
};

export const updateUserPassword = async (targetId: number, newPassword: string): Promise<void> => {
    await api.apiPatch('/user/password', { target_id: targetId, new_password: newPassword });
};

export const updateUserPinnedBadges = async (targetId: number, pinnedBadges: number[]): Promise<void> => {
    await api.apiPatch('/user/pinned_badges', { target_id: targetId, new_pinned_badges: JSON.stringify(pinnedBadges) });
};

/**
 * JAVÍTVA: A végpont /user/{id}, a token a header-ben megy!
 */
export const deleteUser = async (targetId: number): Promise<void> => {
    await api.apiDelete(`/user/${targetId}`);
};

// --- BADGE LEKÉRDEZÉSEK (Ezek jók maradnak) ---

export const fetchBadge = async (badgeId: number): Promise<BadgeData> => {
    const res = await api.apiGet<BadgeData>(`/badge/${badgeId}`);
    return res.data;
};

export const fetchBadges = async (badgeIds: number[]): Promise<BadgeData[]> => {
    const requests = badgeIds.map(id => fetchBadge(id));
    return Promise.all(requests);
};

export const fetchUserWithBadges = async (userId: number | string): Promise<{ user: User; badges: BadgeData[] }> => {
    const user = await fetchUser(userId);
    
    let badges: BadgeData[] = [];
    if (user.badges) {
        const badgeIds: number[] = typeof user.badges === 'string'
            ? JSON.parse(user.badges)
            : user.badges;
        
        if (badgeIds.length > 0) {
            badges = await fetchBadges(badgeIds);
        }
    }
    
    return { user, badges };
};