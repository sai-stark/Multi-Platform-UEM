import { Platform } from './common';

// Base Application type with common properties
export interface Application {
    id: string;
    name: string;
    version: string;
    description?: string;
    manufacturere?: string; // Note: typo in API spec
    osType: 'MobileApplication' | 'WindowsApplication' | 'LinuxApplication' | 'FileDetail' | 'AndroidApplication' | 'IosApplication' | 'DmgFileDetail';
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

// iOS Application extends Application (App Store metadata)
export interface IosApplication extends Application {
    osType: 'IosApplication';
    bundleId: string;
    // App Store identity
    trackId?: number;
    trackName?: string;
    trackCensoredName?: string;
    trackViewUrl?: string;
    artistId?: number;
    artistName?: string;
    artistViewUrl?: string;
    sellerName?: string;
    sellerUrl?: string;
    // Artwork & media
    artworkUrl60?: string;
    artworkUrl100?: string;
    screenshotUrls?: string[];
    // Ratings
    averageUserRating?: number;
    userRatingCount?: number;
    averageUserRatingForCurrentVersion?: number;
    userRatingCountForCurrentVersion?: number;
    // Pricing & store
    price?: number;
    formattedPrice?: string;
    currency?: string;
    fileSizeBytes?: string;
    minimumOsVersion?: string;
    // Content & classification
    trackContentRating?: string;
    contentAdvisoryRating?: string;
    primaryGenreName?: string;
    primaryGenreId?: number;
    genres?: string[];
    genreIds?: string[];
    // Release info
    releaseDate?: string; // ISO date-time
    currentVersionReleaseDate?: string; // ISO date-time
    releaseNotes?: string;
    // Features & capabilities
    isGameCenterEnabled?: boolean;
    isVppDeviceBasedLicensingEnabled?: boolean;
    features?: string[];
    advisories?: string[];
    kind?: string;
    wrapperType?: string;
    languageCodesISO2A?: string[];
    // Enrollment & management
    enrollmentStatus?: string; // REGISTERED, PENDING_FOR_DELETION
    // Nested configurations
    applicationConfigurations?: ApplicationConfiguration[];
}

// Application Configuration (for managed app config)
export interface ApplicationConfiguration {
    key: string;
    valueType: 'string' | 'integer' | 'boolean';
}

// App Registration Request
export interface AppRequest {
    identifier: string; // App Store URL or identifier
    configurations?: ApplicationConfiguration[];
}

// Union type for all application types
export type ApplicationUnion = MobileApplication | WindowsApplication | LinuxApplication | DmgApplication | IosApplication;

export interface WebApplication {
    id: string;
    name: string;
    icon: string; // Base64 encoded icon
    iconText: string;
    pageUrl: string;
    deviceCount: number;
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}
