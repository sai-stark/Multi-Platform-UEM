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
