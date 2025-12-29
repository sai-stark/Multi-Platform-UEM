export type Platform = 'android' | 'ios' | 'windows' | 'macos' | 'linux';

export interface Pageable {
    page?: number;
    size?: number;
    sort?: string[];
}

export interface PagedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
}

// Profile Models
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

// Device Models
export interface DeviceInfo {
    id: string;
    udid?: string;
    serialNumber?: string;
    macAddress?: string;
    imei?: string;
    model?: string;
    osVersion?: string;
    platform: Platform;
    enrollmentTime?: string;
    lastSyncTime?: string;
    status?: 'active' | 'inactive' | 'enrolled' | 'unenrolled';
    userEmail?: string;
}

export interface BriefDeviceInfo {
    id: string;
    name: string;
    model: string;
    osVersion: string;
    status: string;
}

// Application Models
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

// Group Models
export interface Group {
    id?: string;
    name: string;
    description?: string;
    deviceCount?: number;
}

// Policy Models

// 1. Common Settings
export interface CommonSettingsPolicy {
    id?: string;
    name: string;
    description?: string;
    // Add specific properties as needed
}

// 2. Device Theme
export interface DeviceThemePolicy {
    id?: string;
    name: string;
    theme?: 'LIGHT' | 'DARK' | 'SYSTEM';
}

// 3. Enrollment
export interface EnrollmentPolicy {
    id?: string;
    allowEnrollment: boolean;
    enrollmentUrl?: string;
}

// 4. Application Policy (Permissions/Config)
export interface ApplicationPolicy {
    id?: string;
    applicationId: string;
    permission?: 'GRANT' | 'DENY' | 'PROMPT';
    configuration?: Record<string, any>;
}

// 5. Web Application Policy
export interface WebApplicationPolicy {
    id?: string;
    webApplicationId: string;
    allowCookies?: boolean;
}

// 6. Security Restriction
export interface SecurityRestriction {
    id?: string;
    allowCamera?: boolean;
    allowScreenCapture?: boolean;
}

// 7. Passcode Restriction
export interface PasscodeRestrictionPolicy {
    id?: string;
    minLength?: number;
    requireAlphanumeric?: boolean;
    maxFailedAttempts?: number;
}

// 8. Sync Storage
export interface SyncStorageRestriction {
    id?: string;
    allowUsbMassStorage?: boolean;
}

// 9. Kiosk
export interface KioskRestriction {
    id?: string;
    mode?: 'SINGLE_APP' | 'MULTI_APP';
    apps?: string[];
}

// 10. Location
export interface LocationRestriction {
    id?: string;
    forceGps?: boolean;
}

// 11. Tethering
export interface TetheringRestriction {
    id?: string;
    allowWifiTethering?: boolean;
}

// 12. Phone
export interface PhoneRestriction {
    id?: string;
    allowOutgoingCalls?: boolean;
}

// 13. DateTime
export interface DateTimeRestriction {
    id?: string;
    forceAutomaticTime?: boolean;
}

// 14. Display
export interface DisplayRestriction {
    id?: string;
    screenTimeout?: number;
}

// 15. Miscellaneous
export interface MiscellaneousRestriction {
    id?: string;
    allowFactoryReset?: boolean;
}

// 16. Applications Restriction (blocklist/allowlist)
export interface ApplicationsRestriction {
    id?: string;
    blockedApps?: string[];
    allowedApps?: string[];
}

// 17. Network
export interface NetworkRestriction {
    id?: string;
    allowWifi?: boolean;
}

// 18. Connectivity
export interface ConnectivityRestriction {
    id?: string;
    allowBluetooth?: boolean;
}


// Inventory Models
export interface InventoryDevice {
    id?: string;
    serialNumber: string;
    manufacturer: string;
    modelNumber: string;
    location?: string;
    assetTag?: string;
    assignedUser?: string;
    userEmail?: string;
}

export interface InventoryBulkUpload {
    file: File;
}

export interface InventoryBulkUploadResponse {
    total: number;
    success: number;
    failed: number;
    errors?: string[];
}


// Geofence Models
export interface Geofence {
    id?: string;
    name: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    type?: 'CIRCLE' | 'POLYGON';
    coordinates?: Array<{ lat: number; lng: number }>;
}

export interface GeofencePolicy {
    id?: string;
    name: string;
    geofenceIds: string[];
    actions?: {
        onEnter?: string;
        onExit?: string;
    };
}

export interface GeofenceAlert {
    id: string;
    deviceId: string;
    geofenceId: string;
    eventType: 'ENTER' | 'EXIT';
    timestamp: string;
}


// Dashboard Models
export interface DashboardStats {
    totalDevices: number;
    activeDevices: number;
    totalApplications: number;
    compliantDevices: number;
}

export interface DateWiseCounts {
    dates: string[];
    counts: number[];
}


// Security Models
export interface Vulnerability {
    cveId: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface EndpointVulnerabilityResponse {
    endpointId: string;
    vulnerabilities: Vulnerability[];
}

export interface SoftwareVulnerabilityResponse {
    softwareId: string;
    vulnerabilities: Vulnerability[];
}

// iOS Specific Policies

export interface IosAppNotificationSetting {
    id?: string;
    bundleIdentifier: string;
    enabled?: boolean;
    showInNotificationCenter?: boolean;
    showInLockScreen?: boolean;
    alertStyle?: 'NONE' | 'BANNER' | 'ALERT';
}

export interface IosWiFiConfiguration {
    id?: string;
    ssid: string;
    securityType?: 'NONE' | 'WEP' | 'WPA' | 'WPA2' | 'ANY';
    password?: string;
}

export interface IosMailPolicy {
    id?: string;
    accountDescription?: string;
    accountType?: 'EMAIL' | 'EXCHANGE';
    emailAddress?: string;
    incomingMailServerHostName?: string;
    outgoingMailServerHostName?: string;
}

export interface IosMdmConfiguration {
    id?: string;
    serverUrl?: string;
    accessRights?: number;
}

export interface IosCertificateRootPolicy {
    id?: string;
    fileName: string;
    content: string; // Base64
}

export interface IosScepConfiguration {
    id?: string;
    url: string;
    name?: string;
}

export interface IosAcmeConfiguration {
    id?: string;
    directoryUrl: string;
    clientIdentifier: string;
}

export interface IosLockScreenMessage {
    id?: string;
    ifLostReturnTo?: string;
    assetTagInformation?: string;
}


// Repository & Patches

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


// Metadata

export interface OsInfo {
    name: string;
    version: string;
    platform: Platform;
}

export interface DeviceModel {
    name: string;
    code: string;
    platform: Platform;
}

// Geofence Mapping (for response objects)
export interface GeofenceMapping {
    geofenceId: string;
    entityId: string; // deviceId or groupId
    entityType: 'DEVICE' | 'GROUP';
}

export interface GeoFenceWholeMappingDetails {
    mappings: GeofenceMapping[];
}

