import { Platform, PagedResponse } from './common';

// Repository types matching API spec for GET /{platform}/repository
export type RepoType = 'CustomWindowsRepo' | 'CustomCommonFileRepo' | 'CustomAndroidFileRepo' | 'CustomMacOsFileRepo' | 'CustomUbuntuRepo' | 'CustomRpmRepo';

// Custom Ubuntu Repository
export interface CustomUbuntuRepo {
    id: string;
    name: string;
    components: string[];
    architectures: string[];
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

// Custom RPM Repository
export interface CustomRpmRepo {
    id: string;
    name: string;
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

// Base repository item from API
export interface CustomRepository {
    customUbuntuRepo?: CustomUbuntuRepo;
    customRpmRepo?: CustomRpmRepo;
    repoType: RepoType;
    id?: string;
    name?: string;
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

// Paginated response type for custom repositories
export interface PaginatedCustomRepoList {
    page: {
        number: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
    content: CustomRepository[];
}

// Legacy types (kept for backward compatibility)
export type RepoTypeLegacy = 'deb' | 'deb-src';
export type DebSuite = 'buster' | 'bullseye' | 'bookworm' | 'sid' | 'stable' | 'testing' | 'unstable' | 'experimental' | 'security-updates' | 'backports';
export type DebComponent = 'main' | 'contrib' | 'non-free' | 'non-free-firmware';
export type UbuntuSuite = 'focal' | 'jammy' | 'lunar' | 'focal-updates' | 'focal-secuirty' | 'jammy-backports';
export type UbuntuComponent = 'main' | 'restricted' | 'universe' | 'multiverse';

export interface DebRepo {
    id: string;
    types: RepoTypeLegacy[];
    uris: string[];
    suites: DebSuite[];
    components: DebComponent[];
    'signed-by'?: string;
    enabled: boolean;
    description?: string;
    distroType: 'DebRepo';
}

export interface UbuntuRepo {
    id: string;
    types: RepoTypeLegacy[];
    uris: string[];
    suites: UbuntuSuite[];
    components: UbuntuComponent[];
    'signed-by'?: string;
    enabled: boolean;
    description?: string;
    distroType: 'UbuntuRepo';
}

export interface LinuxRepo {
    osType: 'LinuxRepo';
    details: DebRepo | UbuntuRepo;
}

export interface WindowsRepo {
    osType: 'WindowsRepo';
    id: string;
    name: string;
    url: string;
    explicit: boolean;
}

export type Repository = LinuxRepo | WindowsRepo;

export interface PaginatedRepoList {
    page: {
        number: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
    content: Repository[];
}

// Legacy types (kept for backward compatibility if needed)
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
