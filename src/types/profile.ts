import { Platform } from './common';

// Profile types as per OpenAPI spec
export type ProfileType = 'AndroidProfile' | 'IosProfile';

export interface Profile {
    id?: string;
    name: string;
    description?: string;
    platform?: Platform; // Used for URL path routing
    profileType?: ProfileType; // Required for API payload
    createdTime?: string;
    updatedTime?: string;
    status?: 'active' | 'draft' | 'archived';
    category?: 'Corporate' | 'BYOD' | 'Kiosk' | 'Specialized';
    deviceCount?: number;
}

export interface FullProfile extends Profile {
    policies?: any[]; // Simplified for now, can be expanded
}

export interface PublishProfile {
    deviceIds?: string[];
    groupIds?: string[];
}
