import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getToken, logout } from './auth';
import type { ApiError } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'https://zonemakers.vw222.org/';

// Creates configured axios instance with base URL and timeout
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
});

// Attaches token header to all requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Token = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handles 401 responses by logging out
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            logout();
        }
        return Promise.reject(error);
    }
);

// Extracts human-readable error message from various error types
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiError | undefined;
        return data?.message || data?.error || `Error: ${error.response?.status || 'Unknown'}`;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error has occurred.';
};

// Performs GET request
export const apiGet = async <T = any>(url: string, config?: AxiosRequestConfig) => {
    return axiosInstance.get<T>(url, config);
};

// Performs POST request
export const apiPost = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.post<T>(url, data, config);
};

// Performs PATCH request
export const apiPatch = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.patch<T>(url, data, config);
};

// Performs PUT request
export const apiPut = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.put<T>(url, data, config);
};

// Performs DELETE request
export const apiDelete = async <T = any>(url: string, config?: AxiosRequestConfig) => {
    return axiosInstance.delete<T>(url, config);
};

export default axiosInstance;