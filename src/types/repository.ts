import { Platform } from './common';

export interface CustomRepo {
    id?: string;
    name: string;
    url: string;
    type?: 'APT' | 'YUM' | 'GENERIC';
    platform?: Platform;
}

export interface PatchInfo {
    id?: string;
    name: string;
    version: string;
    description?: string;
    releaseDate?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PatchRequest {
    name: string;
    version: string;
    file?: File; // or link
}
