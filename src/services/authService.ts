import type { User, LoginResponse, SignupResponse } from '@/types';
import * as api from '@/lib/api';

// Authenticates user with username and password
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const res = await api.apiPost<LoginResponse>('/login', {
        handle: username,
        password,
    });
    return res.data;
};

// Registers new user account
export const signup = async (username: string, email: string, password: string, region: number): Promise<SignupResponse> => {
    const res = await api.apiPost<SignupResponse>('/register', {
        username,
        email,
        password,
        region,
    });
    return res.data;
};

// Fetches user data by ID (typically after login/signup)
export const fetchUserData = async (userId: number): Promise<User> => {
    const res = await api.apiGet<User>(`/user/${userId}`);
    return res.data;
};