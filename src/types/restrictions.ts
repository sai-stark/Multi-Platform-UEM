// ========================================
// ANDROID RESTRICTIONS - OpenAPI Spec
// ========================================

// Shared Types
export type ControlType = 'ENABLE' | 'DISABLE' | 'USER_CONTROLLED';

// DateTimePolicy discriminated union
export interface NetworkProvidedDateTime {
    dateTimeSetting: 'NetworkProvidedDateTime';
}

export interface ManualDateTime {
    dateTimeSetting: 'ManualDateTime';
    timezone?: string;
}

export type DateTimePolicy = NetworkProvidedDateTime | ManualDateTime;

// BrightnessPolicy discriminated union
export interface AdaptiveBrightness {
    brightness: 'AdaptiveBrightness';
}

export interface FixedBrightness {
    brightness: 'FixedBrightness';
    brightnessLevel?: number;
}

export type BrightnessPolicy = AdaptiveBrightness | FixedBrightness;

// ========================================
// RESTRICTIONS
// ========================================

// 1. Security Restriction (AndroidSecurityRestriction)
export interface SecurityRestriction {
    id?: string;
    lockSafeSettings?: boolean;
    disableDevMode?: boolean;
    disableThirdPartyAppInstall?: boolean;
    enablePermissiveMode?: boolean;
    devicePolicyType?: 'AndroidSecurityRestriction';
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

// 3. Sync Storage Restriction (AndroidSyncStorageRestriction)
export interface SyncStorageRestriction {
    id?: string;
    disableExternalMediaMount?: boolean;
    disableUsbTransfer?: boolean;
    devicePolicyType?: 'AndroidSyncStorageRestriction';
}

// 4. Kiosk Restriction (AndroidKioskRestriction)
export interface KioskRestriction {
    id?: string;
    enableHomeButton?: boolean;
    enableRecentsButton?: boolean;
    enableNotifications?: boolean;
    enableStatusBar?: boolean;
    enableScreenLock?: boolean;
    lockPowerButton?: boolean;
    exitKioskButton?: boolean;
    devicePolicyType?: 'AndroidKioskRestriction';
}

// 5. Location Restriction (AndroidLocationRestriction)
export interface LocationRestriction {
    id?: string;
    location?: ControlType;
    disableLocationSharing?: boolean;
    devicePolicyType?: 'AndroidLocationRestriction';
}

// 6. Tethering Restriction (AndroidTetheringRestriction)
export interface TetheringRestriction {
    id?: string;
    disableTethering?: boolean;
    disableWifiTethering?: boolean;
    devicePolicyType?: 'AndroidTetheringRestriction';
}

// 7. Phone Restriction (AndroidPhoneRestriction)
export interface PhoneRestriction {
    id?: string;
    disableSms?: boolean;
    disableCalls?: boolean;
    devicePolicyType?: 'AndroidPhoneRestriction';
}

// 8. DateTime Restriction (AndroidDateTimeRestriction)
export interface DateTimeRestriction {
    id?: string;
    dateTimePolicy?: DateTimePolicy;
    disableDateTimeSetting?: boolean;
    devicePolicyType?: 'AndroidDateTimeRestriction';
}

// 9. Display Restriction (AndroidDisplayRestriction)
export interface DisplayRestriction {
    id?: string;
    screenTimeoutSeconds?: number;
    disableScreenTimeoutSetting?: boolean;
    disableBrightnessSetting?: boolean;
    disableAmbientDisplay?: boolean;
    brightnessPolicy?: BrightnessPolicy;
    devicePolicyType?: 'AndroidDisplayRestriction';
}

// 10. Miscellaneous Restriction (AndroidMiscellaneousRestriction)
export interface MiscellaneousRestriction {
    id?: string;
    disableAddUser?: boolean;
    disableFactoryReset?: boolean;
    devicePolicyType?: 'AndroidMiscellaneousRestriction';
}

// 11. Applications Restriction (AndroidApplicationsRestriction)
export interface ApplicationsRestriction {
    id?: string;
    disableAppInstall?: boolean;
    disableAppUninstall?: boolean;
    disableAppControl?: boolean;
    devicePolicyType?: 'AndroidApplicationsRestriction';
}

// 12. Connectivity Restriction (AndroidConnectivityRestriction)
export interface ConnectivityRestriction {
    id?: string;
    disableOutgoingBeam?: boolean;
    disablePrinting?: boolean;
    nfc?: ControlType;
    bluetooth?: ControlType;
    devicePolicyType?: 'AndroidConnectivityRestriction';
}

// 13. Network Restriction (AndroidNetworkRestriction)
export interface NetworkRestriction {
    id?: string;
    disableAirplaneMode?: boolean;
    disableRoamingData?: boolean;
    disableVpnConfig?: boolean;
    disableWifiDirect?: boolean;
    wifi?: ControlType;
    disableWifiConfig?: boolean;
    devicePolicyType?: 'AndroidNetworkRestriction';
}
