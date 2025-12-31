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
    packageName?: string;
    permission?: 'GRANT' | 'DENY' | 'PROMPT';
    configuration?: Record<string, any>;
    installType?: 'REQUIRED' | 'AVAILABLE' | 'BLOCKED' | 'FORCE_INSTALLED';
    autoUpdateMode?: 'WIFI_ONLY' | 'ALWAYS' | 'NEVER' | 'CHOICE_TO_THE_USER';
    disabled?: boolean;
}

// 5. Web Application Policy
export interface WebApplicationPolicy {
    id?: string;
    webApplicationId: string;
    label?: string;
    url?: string;
    allowCookies?: boolean;
    isAllowed?: boolean;
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

// iOS Mail Policy
export interface MailPolicy {
    id: string;
    name: string;
    policyType: string; // 'IosMail'
    emailAccountDescription?: string;
    emailAccountName?: string;
    emailAccountType: string;
    emailAddress: string;
    incomingMailServerHostName: string;
    incomingMailServerUsername: string;
    // ... add other specific fields from JSON as needed
}

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
    id: string;
    name: string;
    policyType: string; // 'IosNotificationSettings'
    bundleIdentifier: string;
    notificationsEnabled?: boolean;
    showInNotificationCenter?: boolean;
    showInLockScreen?: boolean;
    alertType?: number;
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
