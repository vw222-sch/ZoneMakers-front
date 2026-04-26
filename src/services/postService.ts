/**
 * Post (ChatRoom) API hívások
 * Központi hely az összes post/chatroom endpoint-hoz
 */

import type { ApiPost } from '@/types';
import * as api from '@/lib/api';

/**
 * Posztok lekérése egy régióban
 */
export const fetchPosts = async (regionId: number, page: number = 1): Promise<ApiPost[]> => {
    const res = await api.apiGet<ApiPost[]>(`/posts/${regionId}/${page}`);
    return res.data;
};

/**
 * Egy poszt válaszainak lekérése
 */
export const fetchPostReplies = async (postId: string): Promise<ApiPost[]> => {
    const res = await api.apiGet<ApiPost[]>(`/posts/${postId}/replies`);
    return res.data;
};

/**
 * Új poszt létrehozása
 */
export interface CreatePostPayload {
    content: string;
    region: number;
    image?: string;
    reply_id?: string; // Ha válasz egy poszthoz
}

export const createPost = async (payload: CreatePostPayload): Promise<ApiPost> => {
    const res = await api.apiPost<ApiPost>('/posts', payload);
    return res.data;
};

/**
 * Poszt módosítása
 */
export const updatePost = async (postId: string, content: string): Promise<ApiPost> => {
    const res = await api.apiPatch<ApiPost>(`/posts/${postId}`, { content });
    return res.data;
};

/**
 * Poszt törlése
 */
export const deletePost = async (postId: string): Promise<void> => {
    await api.apiDelete(`/posts/${postId}`);
};