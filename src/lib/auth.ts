import type { User } from '@/types';

const AUTH_TOKEN_KEY = 'authToken';
const USER_ID_KEY = 'userId';
const USER_DATA_KEY = 'userData';

export const getToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getUserId = (): number | null => {
    const id = localStorage.getItem(USER_ID_KEY);
    return id ? parseInt(id, 10) : null;
};

export const getUser = (): User | null => {
    const stored = localStorage.getItem(USER_DATA_KEY);
    if (!stored) return null;

    try {
        return JSON.parse(stored) as User;
    } catch (e) {
        console.error('Error reading userData:', e);
        return null;
    }
};

export const isAdmin = (): boolean => {
    const user = getUser();
    if (!user) return false;
    return Boolean(user.admin);
};

export const isLoggedIn = (): boolean => {
    return !!getToken();
};

export const canEditUser = (userId: number | string): boolean => {
    const currentUserId = getUserId();
    if (!currentUserId) return false;

    const userId_num = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return currentUserId === userId_num || isAdmin();
};

export const setAuth = (token: string, userId: number, userData: User): void => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_ID_KEY, userId.toString());
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

export const logout = (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_DATA_KEY);
};

export const updateUserData = (updates: Partial<User>): void => {
    const user = getUser();
    if (!user) return;

    const updated = { ...user, ...updates };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updated));
};
