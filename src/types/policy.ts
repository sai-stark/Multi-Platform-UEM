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

// Application Action enum
export type ApplicationAction = 'INSTALL' | 'UNINSTALL' | 'ALLOW' | 'BLOCK';

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

// iOS Application Policy (from OpenAPI)
export interface IosApplicationPolicy extends UserAuditData {
    id?: string; // UUID, read-only (optional for create requests)
    name: string;
    bundleIdentifier: string;
    action: 'INSTALL'; // iOS only supports INSTALL currently
    purchaseMethod?: number; // 0 = Free/VPP with redemption code, 1 = VPP app assignment
    removable?: boolean; // iOS 14+, tvOS 14+
    requestRequiresNetworkTether?: boolean; // Only applicable when removing
    devicePolicyType: 'IosApplicationPolicy';
}

// Android Application Policy (from OpenAPI)
export interface AndroidApplicationPolicy extends UserAuditData {
    id?: string; // UUID, read-only (optional for create requests)
    applicationVersionId: string; // UUID
    action: ApplicationAction; // INSTALL | UNINSTALL | ALLOW | BLOCK
    applicationVersion?: string; // read-only (optional for create requests)
    devicePolicyType: 'AndroidApplicationPolicy';
}

// Application Policy - Discriminated Union (from OpenAPI)
export type ApplicationPolicy = IosApplicationPolicy | AndroidApplicationPolicy;

// 5. Web Application Policy
// 5. Web Application Policy
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
    screenOrder?: number;
    screenBottom?: boolean;
    policyType: 'AndroidWebApplicationPolicy';
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

export type WebApplicationPolicy = IosWebApplicationPolicy | AndroidWebApplicationPolicy;

// 6. Security Restriction
export interface SecurityRestriction {
    id?: string;
    allowCamera?: boolean;
    allowScreenCapture?: boolean;
}

// 7. Passcode Restriction
// 7. Passcode Restriction
export interface PasscodeRestrictionPolicy {
    id?: string;
    passcodeId?: string;
    policyType?: string;
    complexity?: string;
    minLength?: number;
    minUpperCase?: number;
    minLowerCase?: number;
    minDigits?: number;
    minSymbols?: number;
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
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

// 17. Connectivity
export interface ConnectivityRestriction {
    id?: string;
    allowBluetooth?: boolean;
}

// 18. Network
export interface NetworkRestriction {
    id?: string;
    allowWifi?: boolean;
}

// iOS Mail Policy is defined in ios.ts as IosMailPolicy

// iOS Passcode Policy
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

// iOS SCEP Policy
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

// iOS WebClip Policy
export interface WebClipPolicy {
    id: string;
    name: string;
    label: string;
    url: string;
    fullScreen?: boolean;
    isRemovable?: boolean;
    precomposed?: boolean;
    icon?: string; // If available
}

// iOS MDM Policy
export interface MdmPolicy {
    policyType: string; // 'IosMdmConfiguration'
    serverURL: string;
    checkInURL: string;
    topic: string;
    accessRights: number;
    enrollmentMode: string;
}

// iOS ACME Policy
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

// iOS Notification Policy
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

// iOS WiFi Policy
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

// iOS Lock Screen Message Policy
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
