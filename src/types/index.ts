export interface User {
    id: number;
    username: string;
    handle: string;
    bio: string | null;
    email: string;
    level: number;
    badges: number[];
    banner_img: string | null;
    theme: number;
    reputation: number;
    pinned_badges: number[];
    avatar: string | null;
    verified: number;
    admin: number;
}

export interface BadgeData {
    id: number;
    image: string;
    title: string;
}

export interface ApiPost {
    id: string;
    author_id: number;
    content: string;
    image: string | null;
    replies_count: number;
    created_at: string;
    region: number;
    reply_id: string | null;
    username: string;
    handle: string;
    avatar: string | null;
    verified: number;
}

export interface ZoneSummary {
    id: number;
    name: string;
    coordinates: number[][];
    hazard_level: string;
}

export interface ZoneFull extends ZoneSummary {
    description: string;
    hazards: string[];
    images?: string[];
    is_request?: number;
    author: number;
}

export interface ZoneReport {
    id: number;
    reason: string;
    type: number;
    user_id: number;
    report_id: string;
}

export interface CreateReportPayload {
    reason: string;
    report_id: string;
}

export interface SupportTicket {
    id: number;
    subject: string;
    topic: number;
    description: string;
    userid: number;
    timestamp: string;
    state: number;
}

export interface CreateSupportPayload {
    subject: string;
    topic: number;
    description: string;
}

export interface ApiNotification {
    id: number;
    title: string;
    type: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface ApiError {
    message?: string;
    error?: string;
    status?: number;
}