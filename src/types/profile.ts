import { Platform } from './common';

export interface Profile {
    id?: string;
    name: string;
    description?: string;
    platform?: Platform; // Inferred as it's common in paths
    createdTime?: string;
    updatedTime?: string;
    status?: 'active' | 'draft' | 'archived';
    category?: 'Corporate' | 'BYOD' | 'Kiosk' | 'Specialized';
}

export interface FullProfile extends Profile {
    policies?: any[]; // Simplified for now, can be expanded
}

export interface PublishProfile {
    deviceIds?: string[];
    groupIds?: string[];
}
