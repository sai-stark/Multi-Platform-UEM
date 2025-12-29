import { Platform } from './common';

export interface MobileApplication {
    id: string;
    name: string;
    packageName: string;
    version: string;
    platform: Platform;
    iconUrl?: string;
    appType?: 'ENTERPRISE' | 'PUBLIC';
}

export interface WebApplication {
    id: string;
    name: string;
    url: string;
    iconUrl?: string;
}
