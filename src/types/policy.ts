// ========================================
// COMMON TYPES
// ========================================

// Application Action enum
export type ApplicationAction = 'INSTALL' | 'UNINSTALL' | 'ALLOW' | 'BLOCK';

// Android Policy Enums (from OpenAPI)
export type IconSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type ScreenOrientation = 'NONE' | 'PORTRAIT' | 'LANDSCAPE';
export type Color = string; // Pattern: ^#[0-9a-f]{6}$
export type AppPermissionType = 'GRANT' | 'DENY' | 'PROMPT';
export type WifiSecurity = 'WPA' | 'WEP' | 'EAP';

// Android Passcode Policy Enums (from OpenAPI)
export type PasscodeComplexity = 'LOW' | 'MEDIUM' | 'HIGH';
export type StrongAuthRequiredTimeout = 'DEVICE_DEFAULT' | 'EVERY_DAY';

// Android Device Passcode Policy
export interface AndroidDevicePasscodePolicy {
    id?: string; // read-only
    complexity: PasscodeComplexity;
    historyLength?: number; // minimum: 0
    maxFailedAttemptsToWipe?: number; // minimum: 0
    changeAfterSeconds?: number; // minimum: 0
    strongAuthRequiredTimeout?: StrongAuthRequiredTimeout;
}

// Android Work Passcode Policy (extends device policy)
export interface AndroidWorkPasscodePolicy extends AndroidDevicePasscodePolicy {
    separateLock?: boolean; // separate lock for work profile
}

// Personal Device Enforcement
export interface PersonalDeviceEnforcement {
    blockAfterDays: number; // minimum: 0, must be < wipeAfterDays
    wipeAfterDays: number; // minimum: 0, must be > blockAfterDays
}

// Android Passcode Policy (AndroidPersonalDevicesPasscodePolicy)
export interface AndroidPasscodePolicy {
    work: AndroidWorkPasscodePolicy; // required
    device?: AndroidDevicePasscodePolicy;
    enforcement?: PersonalDeviceEnforcement;
    devicePolicyType?: 'AndroidPersonalDevicesPasscodePolicy';
}

// Volume Policy (discriminated union)
export interface ManagedVolume {
    manageVolume: 'ManagedVolume';
    volume: number; // 1-100
}

export interface UnmanagedVolume {
    manageVolume: 'UnmanagedVolume';
}

export type VolumePolicy = ManagedVolume | UnmanagedVolume;

// System Update Policy (discriminated union)
export interface ScheduledSystemUpdate {
    systemUpdate: 'SCHEDULED';
    systemUpdateScheduleFrom: string; // time format
    systemUpdateScheduleTo: string; // time format
}

export interface NonScheduledSystemUpdate {
    systemUpdate: 'DEFAULT' | 'IMMEDIATELY' | 'POSTPONE';
}

export type SystemUpdatePolicy = ScheduledSystemUpdate | NonScheduledSystemUpdate;

// Schedule Time
export interface ScheduleTime {
    from: string; // time format
    to: string; // time format
}

// WiFi Hotspot Info
export interface WifiHotspotInfo {
    ssid: string;
    security: WifiSecurity;
    password: string;
}

// Basic Audit Data (from OpenAPI)
export interface BasicAuditData {
    creationTime: string; // ISO date-time
    modificationTime: string; // ISO date-time
}

// User Audit Data (from OpenAPI)
export interface UserAuditData extends BasicAuditData {
    createdBy: string; // UUID
    lastModifiedBy: string; // UUID
}

// ========================================
// POLICIES
// ========================================

// 1. Common Settings Policy (AndroidCommonSettingsPolicy)
export interface CommonSettingsPolicy {
    id?: string;
    locationTracking?: boolean;
    defaultAppPerms?: AppPermissionType;
    keepAliveTime?: number; // positive integer in minutes
    disableScreenCapture?: boolean;
    appUpdateSchedule?: ScheduleTime;
    volumePolicy?: VolumePolicy;
    systemUpdatePolicy?: SystemUpdatePolicy;
    devicePolicyType?: 'AndroidCommonSettingsPolicy';
}

// 2. Device Theme Policy (AndroidDeviceThemePolicy)
export interface DeviceThemePolicy {
    id?: string;
    appNamesColor?: Color;
    iconSize?: IconSize;
    screenSignature?: string;
    screenOrientation?: ScreenOrientation;
    backgroundColor?: Color;
    backgroundImage?: string; // URI
    devicePolicyType?: 'AndroidDeviceThemePolicy';
}

// 3. Enrollment Policy (AndroidEnrollmentPolicy)
export interface EnrollmentPolicy {
    id?: string;
    isKioskMode?: boolean;
    wifiHotspot?: WifiHotspotInfo;
    useMobileData?: boolean;
    devicePolicyType?: 'AndroidEnrollmentPolicy';
}

// Application Attribute (iOS app attributes from OpenAPI)
export interface ApplicationAttribute {
    associatedDomains?: string[];
    associatedDomainsEnableDirectDownloads?: boolean;
    cellularSliceUuid?: string; // read-only
    contentFilterUuid?: string;
    dnsProxyUuid?: string; // read-only
    lockable?: string;
    relayUuid?: string; // read-only
    removable?: string;
    tapToPayScreenLock?: boolean;
    vpnUuid?: string; // read-only
}

// 4. Application Policy
export interface IosApplicationPolicy extends UserAuditData {
    id?: string; // UUID, read-only
    name: string;
    applicationId?: string; // UUID, deprecated - internal application id
    action: 'INSTALL';
    configurationValues?: Record<string, object>;
    purchaseMethod?: number; // 0 = Free/VPP with redemption code, 1 = VPP app assignment
    devicePolicyType: 'IosApplicationPolicy';
    attribute?: ApplicationAttribute;
    enableAppAnalytics?: boolean;
}

export interface AndroidApplicationPolicy extends UserAuditData {
    id?: string; // UUID, read-only
    applicationVersionId: string; // UUID
    action: ApplicationAction; // INSTALL | UNINSTALL | ALLOW | BLOCK
    applicationVersion?: string; // read-only
    packageName?: string;
    installType?: string; // mapping to action for UI if needed, or API returns it
    autoUpdateMode?: string;
    defaultConfiguration?: boolean;
    devicePolicyType: 'AndroidApplicationPolicy';
}

export type ApplicationPolicy = IosApplicationPolicy | AndroidApplicationPolicy;

// 5. Web Application Policy
export interface IosWebApplicationPolicy {
    id?: string;
    name: string;
    fullScreen?: boolean;
    ignoreManifestScope?: boolean;
    isRemovable?: boolean;
    label: string;
    precomposed?: boolean;
    url: string;
    policyType: 'IosWebApplicationPolicy';
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

export interface AndroidWebApplicationPolicy {
    id?: string; // read-only
    webAppId: string;
    keyCode?: number;
    webAppName?: string; // read-only
    title?: string;
    url?: string;
    displayMode?: string;
    icon?: string;
    screenOrder?: number;
    screenBottom?: boolean;
    policyType: 'AndroidWebApplicationPolicy';
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

export type WebApplicationPolicy = IosWebApplicationPolicy | AndroidWebApplicationPolicy;

// 6. Passcode Policy (iOS)
export interface PasscodePolicy {
    id: string;
    name: string;
    policyType: string; // 'IosPasscodeRestrictionPolicy'
    minLength?: number;
    allowSimple?: boolean;
    requirePassCode?: boolean;
    requireAlphanumericPasscode?: boolean;
    requireComplexPasscode?: boolean;
    minimumComplexCharacters?: number;
    maximumFailedAttempts?: number;
    maximumGracePeriodInMinutes?: number;
    maximumInactivityInMinutes?: number;
    maximumPasscodeAgeInDays?: number;
    passCodeReuseLimit?: number;
    changeAtNextAuth?: boolean;
}

// 7. SCEP Policy (iOS)
export interface ScepPolicy {
    id: string;
    policyType: string; // 'IosScepPolicyRes'
    url: string;
    scepName?: string;
    challenge?: string;
    keySize?: number;
    keyType?: string;
    subject?: string[][][]; // Complex subject structure
}

// 8. WebClip Policy (iOS)
export interface WebClipPolicy {
    id: string;
    name: string;
    label: string;
    url: string;
    fullScreen?: boolean;
    isRemovable?: boolean;
    precomposed?: boolean;
    icon?: string;
}

// 9. MDM Policy (iOS)
export interface MdmPolicy {
    policyType: string; // 'IosMdmConfiguration'
    serverURL: string;
    checkInURL: string;
    topic: string;
    accessRights: number;
    enrollmentMode: string;
}

// 10. ACME Policy (iOS)
export interface AcmePolicy {
    id: string;
    name: string;
    policyType: string; // 'IosAcmeConfiguration'
    directoryURL: string;
    clientIdentifier: string;
    keySize?: number;
    keyType?: string;
    usageFlags?: number;
}

// 11. Notification Policy (iOS)
export interface NotificationPolicy {
    id?: string;
    name?: string;
    policyType?: string; // 'IosNotificationSettings'
    bundleIdentifier: string;
    notificationsEnabled?: boolean;
    showInNotificationCenter?: boolean;
    showInLockScreen?: boolean;
    alertType?: number;
    badgesEnabled?: boolean;
    soundsEnabled?: boolean;
    showInCarPlay?: boolean;
    criticalAlertEnabled?: boolean;
    groupingType?: number;
    previewType?: number;
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

// 12. WiFi Policy (iOS)
export interface WifiPolicy {
    id: string;
    name: string;
    policyType: string; // 'IosWiFiConfiguration'
    ssid: string;
    autoJoin?: boolean;
    hiddenNetwork?: boolean;
    encryptionType: string;
    password?: string;
    proxyType?: string;
}

// 13. Lock Screen Message Policy (iOS)
export interface LockScreenMessagePolicy {
    id?: string;
    name?: string;
    policyType?: string; // 'IosLockScreenMessage'
    assetTagInformation?: string;
    lockScreenFootnote?: string;
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

