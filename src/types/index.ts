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
    image: string;
}

export const REGIONS: Region[] = [
    { id: 1, name: "Baltic Region", image: "/Banners/Baltic Region.png" },
    { id: 2, name: "Benelux Region", image: "/Banners/Benelux Region.png" },
    { id: 3, name: "Black Sea Region", image: "/Banners/Black Sea Region.png" },
    { id: 4, name: "British Isles Region", image: "/Banners/British Isles Region.png" },
    { id: 5, name: "Ex-Yugoslavian Region", image: "/Banners/Ex-Yugoslavian Region.png" },
    { id: 6, name: "French Region", image: "/Banners/French Region.png" },
    { id: 7, name: "Germanic Region", image: "/Banners/Germanic Region.png" },
    { id: 8, name: "Iberian Region", image: "/Banners/Iberian Region.png" },
    { id: 9, name: "Mediterranean Region", image: "/Banners/Mediterranean Region.png" },
    { id: 10, name: "New World Region", image: "/Banners/New World Region.png" },
    { id: 11, name: "Nordic Region", image: "/Banners/Nordic Region.png" },
    { id: 12, name: "Pan-Slavic Region", image: "/Banners/Pan-Slavic Region.png" },
    { id: 13, name: "Visegrad Region", image: "/Banners/Visegrad Region.png" },
];

export const REGION_COLORS: Record<string, string> = {
    "Baltic Region": "#6CD405",
    "Benelux Region": "#CE009B",
    "Black Sea Region": "#B87333",
    "British Isles Region": "#C8102E",
    "Ex-Yugoslavian Region": "#FF4500",
    "French Region": "#318CE7",
    "Germanic Region": "#7EB8C9",
    "Iberian Region": "#F1BF00",
    "Mediterranean Region": "#008C45",
    "New World Region": "#1CCD92",
    "Nordic Region": "#16D8FA",
    "Pan-Slavic Region": "#E8A0E8",
    "Visegrad Region": "#6C3BAA",
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