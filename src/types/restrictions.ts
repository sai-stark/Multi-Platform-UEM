// ========================================
// RESTRICTIONS
// ========================================

// 1. Security Restriction
export interface SecurityRestriction {
    id?: string;
    allowCamera?: boolean;
    allowScreenCapture?: boolean;
}

// 2. Passcode Restriction
export interface PasscodeRestrictionPolicy {
    id?: string;
    passcodeId?: string;
    name?: string;
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

// 3. Sync Storage Restriction
export interface SyncStorageRestriction {
    id?: string;
    allowUsbMassStorage?: boolean;
}

// 4. Kiosk Restriction
export interface KioskRestriction {
    id?: string;
    mode?: 'SINGLE_APP' | 'MULTI_APP';
    apps?: string[];
}

// 5. Location Restriction
export interface LocationRestriction {
    id?: string;
    forceGps?: boolean;
}

// 6. Tethering Restriction
export interface TetheringRestriction {
    id?: string;
    allowWifiTethering?: boolean;
}

// 7. Phone Restriction
export interface PhoneRestriction {
    id?: string;
    allowOutgoingCalls?: boolean;
}

// 8. DateTime Restriction
export interface DateTimeRestriction {
    id?: string;
    forceAutomaticTime?: boolean;
}

// 9. Display Restriction
export interface DisplayRestriction {
    id?: string;
    screenTimeout?: number;
}

// 10. Miscellaneous Restriction
export interface MiscellaneousRestriction {
    id?: string;
    allowFactoryReset?: boolean;
}

// 11. Applications Restriction (blocklist/allowlist)
export interface ApplicationsRestriction {
    id?: string;
    blockedApps?: string[];
    allowedApps?: string[];
}

// 12. Connectivity Restriction
export interface ConnectivityRestriction {
    id?: string;
    allowBluetooth?: boolean;
}

// 13. Network Restriction
export interface NetworkRestriction {
    id?: string;
    allowWifi?: boolean;
}
