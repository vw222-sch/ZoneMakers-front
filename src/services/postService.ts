import type { ApiPost, CreatePostPayload } from '@/types';
import * as api from '@/lib/api';

// Fetches posts for a specific region with pagination
export const fetchPosts = async (regionId: number, page: number = 1): Promise<ApiPost[]> => {
    const res = await api.apiGet<ApiPost[]>(`/posts/${regionId}/${page}`);
    return res.data;
};

// Fetches all replies to a specific post
export const fetchPostReplies = async (postId: string): Promise<ApiPost[]> => {
    const res = await api.apiGet<ApiPost[]>(`/posts/${postId}/replies`);
    return res.data;
};

// Creates a new post
export const createPost = async (payload: CreatePostPayload): Promise<ApiPost> => {
    const res = await api.apiPost<ApiPost>('/posts', payload);
    return res.data;
};

// Updates post content or image
export const updatePost = async (postId: string, content: string): Promise<ApiPost> => {
    const res = await api.apiPatch<ApiPost>(`/posts/${postId}`, { content });
    return res.data;
};

// Deletes a post
export const deletePost = async (postId: string): Promise<void> => {
    await api.apiDelete(`/posts/${postId}`);
};