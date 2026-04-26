import axios, { AxiosError } from 'axios';
import type {AxiosInstance, AxiosRequestConfig} from 'axios';
import { getToken, logout } from './auth';
import type { ApiError } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
});

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

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            logout(); 
        }
        
        return Promise.reject(error);
    }
);

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


export const apiGet = async <T = any>(url: string, config?: AxiosRequestConfig) => {
    return axiosInstance.get<T>(url, config);
};

export const apiPost = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.post<T>(url, data, config);
};

export const apiPatch = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.patch<T>(url, data, config);
};

export const apiPut = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.put<T>(url, data, config);
};

export const apiDelete = async <T = any>(url: string, config?: AxiosRequestConfig) => {
    return axiosInstance.delete<T>(url, config);
};


export default axiosInstance;