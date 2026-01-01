import { Platform } from './common';

// Base Application type with common properties
export interface Application {
    id: string;
    name: string;
    version: string;
    description?: string;
    manufacturere?: string; // Note: typo in API spec
    osType: 'MobileApplication' | 'WindowsApplication' | 'LinuxApplication' | 'FileDetail' | 'AndroidApplication' | 'DmgFileDetail';
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

// Mobile Application extends Application
export interface MobileApplication extends Application {
    osType: 'MobileApplication';
    packageName: string;
    platform: Platform;
    iconUrl?: string;
    appType?: 'ENTERPRISE' | 'PUBLIC';
    isEmmApp?: boolean;
    isEmmAgent?: boolean;
    isLauncher?: boolean;
}

// Windows Application extends Application
export interface WindowsApplication extends Application {
    osType: 'WindowsApplication';
    extraProperties?: any;
}

// Linux Application extends Application
export interface LinuxApplication extends Application {
    osType: 'LinuxApplication';
    extraProperties?: any;
}

// Dmg Application extends Application
export interface DmgApplication extends Application {
    osType: 'DmgFileDetail';
    fileName?: string;
    packageName?: string;
}

// Union type for all application types
export type ApplicationUnion = MobileApplication | WindowsApplication | LinuxApplication | DmgApplication;

export interface WebApplication {
    id: string;
    name: string;
    url: string;
    iconUrl?: string;
}
