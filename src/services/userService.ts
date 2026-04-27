import type { User, BadgeData } from '@/types';
import * as api from '@/lib/api';
import { fetchBadges } from '@/services/badgeService';

// Fetches user data by ID
export const fetchUser = async (userId: number | string): Promise<User> => {
    const res = await api.apiGet<User>(`/user/${userId}`);
    return res.data;
};

// Fetches user data by handle
export const fetchUserByHandle = async (handle: string): Promise<User> => {
    const res = await api.apiGet<User>(`/user/handle/${handle}`);
    return res.data;
};

// Updates current user's display name
export const updateUserName = async (targetId: number, newName: string): Promise<void> => {
    await api.apiPatch('/user/name', { target_id: targetId, new_name: newName });
};

// Updates current user's handle
export const updateUserHandle = async (targetId: number, newHandle: string): Promise<void> => {
    await api.apiPatch('/user/handle', { target_id: targetId, new_handle: newHandle });
};

// Updates current user's email
export const updateUserEmail = async (targetId: number, newEmail: string): Promise<void> => {
    await api.apiPatch('/user/email', { target_id: targetId, new_email: newEmail });
};

// Updates current user's bio
export const updateUserBio = async (targetId: number, newBio: string): Promise<void> => {
    await api.apiPatch('/user/bio', { target_id: targetId, new_bio: newBio });
};

// Updates current user's avatar
export const updateUserAvatar = async (targetId: number, newAvatar: string): Promise<void> => {
    await api.apiPatch('/user/avatar', { target_id: targetId, new_avatar: newAvatar });
};

// Updates current user's theme preference
export const updateUserTheme = async (targetId: number, newTheme: number): Promise<void> => {
    await api.apiPatch('/user/theme', { target_id: targetId, new_theme: String(newTheme) });
};

// Updates current user's password
export const updateUserPassword = async (targetId: number, newPassword: string): Promise<void> => {
    await api.apiPatch('/user/password', { target_id: targetId, new_password: newPassword });
};

// Updates current user's pinned badges
export const updateUserPinnedBadges = async (targetId: number, pinnedBadges: number[]): Promise<void> => {
    await api.apiPatch('/user/pinned_badges', { target_id: targetId, new_pinned_badges: JSON.stringify(pinnedBadges) });
};

// Updates current user's region
export const updateUserRegion = async (targetId: number, newRegion: number): Promise<void> => {
    await api.apiPatch('/user/region', { target_id: targetId, new_region: newRegion });
};

// Deletes current user's account
export const deleteUser = async (targetId: number): Promise<void> => {
    await api.apiDelete(`/user/${targetId}`);
};

// Fetches user with their badges resolved
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