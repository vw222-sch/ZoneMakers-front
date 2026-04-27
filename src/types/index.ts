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
    region: number;
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

export interface LoginResponse {
    token: string;
    id: number;
}

export interface SignupResponse {
    token: string;
    id: number;
}

// Creates a new badge (admin only)
export interface CreateBadgePayload {
    image: string;
    title: string;
}

// Updates user reputation points (admin only)
export interface UpdateRepPayload {
    user_id: number;
    rep: number;
}

// Creates a new post or reply
export interface CreatePostPayload {
    content: string;
    region: number;
    image?: string;
    reply_id?: string;
}

// Payload for creating a zone request
export interface CreateZonePayload {
    name: string;
    coordinates: string; 
    hazard_level: string;
    description: string;
    hazards: string; 
    images: string; 
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

export interface TravelLog {
    id: number;
    title: string;
    message: string;
    type: string;
    timestamp: string;
    user_id: number;
}

export interface Region {
    id: number;
    name: string;
}

export const REGIONS: Region[] = [
    { id: 0, name: "Nordic Region" },
    { id: 1, name: "Mediterranean Region" },
    { id: 2, name: "New World Region" },
    { id: 3, name: "Iberian Region" },
    { id: 4, name: "British Isles Region" },
    { id: 5, name: "Visegrad Region" },
    { id: 6, name: "Germanic Region" },
    { id: 7, name: "Baltic Region" },
    { id: 8, name: "French Region" },
    { id: 9, name: "Pan-Slavic Region" },
    { id: 10, name: "Black Sea Region" },
    { id: 11, name: "Ex-Yugoslavian Region" },
    { id: 12, name: "Benelux Region" },
];

export const REGION_COLORS: Record<string, string> = {
    "Nordic Region": "#16D8FA",
    "Mediterranean Region": "#008C45",
    "New World Region": "#1CCD92",
    "Iberian Region": "#F1BF00",
    "British Isles Region": "#C8102E",
    "Visegrad Region": "#6C3BAA",
    "Germanic Region": "#7EB8C9",
    "Baltic Region": "#6CD405",
    "French Region": "#318CE7",
    "Pan-Slavic Region": "#E8A0E8",
    "Black Sea Region": "#B87333",
    "Ex-Yugoslavian Region": "#FF4500",
    "Benelux Region": "#CE009B",
};

export const getRegionById = (id: number): Region | undefined =>
    REGIONS.find(r => r.id === id);

export const getRegionColor = (regionId: number): string => {
    const region = getRegionById(regionId);
    return region ? (REGION_COLORS[region.name] || "#888") : "#888";
};

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