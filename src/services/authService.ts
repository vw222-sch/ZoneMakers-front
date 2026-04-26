/**
 * Bejelentkezés és regisztráció API hívások
 */

import type { User } from '@/types';
import * as api from '@/lib/api';

export interface LoginResponse {
    token: string;
    id: number;
}

export interface SignupResponse {
    token: string;
    id: number;
}

/**
 * Bejelentkezés
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const res = await api.apiPost<LoginResponse>('/login', {
        handle: username,
        password,
    });
    return res.data;
};

/**
 * Regisztráció
 */
export const signup = async (username: string, email: string, password: string): Promise<SignupResponse> => {
    const res = await api.apiPost<SignupResponse>('/register', {
        username,
        email,
        password,
    });
    return res.data;
};

/**
 * Felhasználó adatok lekérése ID alapján
 * (közvetlenül a login/signup után)
 */
export const fetchUserData = async (userId: number): Promise<User> => {
    const res = await api.apiGet<User>(`/user/${userId}`);
    return res.data;
};
