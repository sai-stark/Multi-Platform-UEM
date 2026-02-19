import { Platform } from './common';
import {
    IosAcmeConfiguration,
    IosAppNotificationSetting,
    IosGlobalHttpProxyPolicy,
    IosHomeScreenLayoutPolicy,
    IosLockScreenMessage,
    IosMailPolicy,
    IosMdmConfiguration,
    IosPerAppVpnPolicy,
    IosPerDomainVpnPolicy,
    IosRelayPolicy,
    IosScepConfiguration,
    IosVpnPolicy,
    IosWebContentFilterPolicy,
    IosWiFiConfiguration
} from './ios';
import {
    AndroidApplicationPolicy,
    AndroidWebApplicationPolicy,
    CommonSettingsPolicy,
    DeviceThemePolicy,
    EnrollmentPolicy,
    IosApplicationPolicy,
    IosWebApplicationPolicy
} from './policy';
import {
    ApplicationsRestriction,
    ConnectivityRestriction,
    DateTimeRestriction,
    DisplayRestriction,
    KioskRestriction,
    LocationRestriction,
    MiscellaneousRestriction,
    NetworkRestriction,
    PasscodeRestrictionPolicy,
    PhoneRestriction,
    SecurityRestriction, // Note: using Android one here, but check naming conflict
    SyncStorageRestriction,
    TetheringRestriction
} from './restrictions';

// Profile types as per OpenAPI spec
export type ProfileType = 'AndroidProfile' | 'IosProfile' | 'IosFullProfile' | 'Android_Full_Profile';

// Profile status as per OpenAPI spec
export type ProfileStatus = 'DRAFT' | 'PUBLISHED';

// Base Profile interface matching API response (summary/list view)
export interface Profile {
    // API response fields
    id?: string;
    name: string;
    description: string;
    status?: ProfileStatus; // DRAFT or PUBLISHED as per OpenAPI spec
    version?: number;
    deviceCount?: number;
    creationTime?: string; // API uses creationTime
    modificationTime?: string; // API uses modificationTime
    createdBy?: string;
    lastModifiedBy?: string;
    profileType?: ProfileType; // Required for API payload

    // UI-specific fields (not in API response, used for routing/display)
    platform?: Platform; // Used for URL path routing
}

// iOS Passcode Policy specific to iOS Profile
export interface IosPasscodeRestrictionPolicy {
    id?: string;
    name?: string;
    policyType?: string;
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
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

export interface IosFullProfile extends Profile {
    profileType?: 'IosFullProfile';
    mailPolicy?: IosMailPolicy;
    passCodePolicy?: IosPasscodeRestrictionPolicy;
    scepPolicy?: IosScepConfiguration;
    webClipPolicies?: IosWebApplicationPolicy[];
    mdmPolicy?: IosMdmConfiguration;
    acmePolicy?: IosAcmeConfiguration;
    notificationPolicies?: IosAppNotificationSetting[];
    wifiPolicy?: IosWiFiConfiguration;
    lockScreenPolicy?: IosLockScreenMessage;
    applicationPolicies?: IosApplicationPolicy[];

    // Phase 2 Policies
    webContentFilterPolicy?: IosWebContentFilterPolicy;
    globalHttpProxyPolicy?: IosGlobalHttpProxyPolicy;
    vpnPolicy?: IosVpnPolicy;
    perAppVpnPolicy?: IosPerAppVpnPolicy;
    perDomainVpnPolicy?: IosPerDomainVpnPolicy;
    relayPolicy?: IosRelayPolicy;
    homeScreenLayoutPolicy?: IosHomeScreenLayoutPolicy;
}

export interface AndroidProfileRestrictions {
    security?: SecurityRestriction;
    passcode?: PasscodeRestrictionPolicy; // This refers to the Android one in ./restrictions
    syncStorage?: SyncStorageRestriction;
    kiosk?: KioskRestriction;
    tethering?: TetheringRestriction;
    location?: LocationRestriction;
    phone?: PhoneRestriction;
    dateTime?: DateTimeRestriction;
    display?: DisplayRestriction;
    miscellaneous?: MiscellaneousRestriction;
    applications?: ApplicationsRestriction;
    network?: NetworkRestriction;
    connectivity?: ConnectivityRestriction;
}

// Android Passcode Policy (WP-compatible) - matches API response structure
export interface AndroidPasscodeWorkProfile {
    id?: string;
    complexity?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    historyLength?: number;
    maxFailedAttemptsToWipe?: number;
    changeAfterSeconds?: number;
    strongAuthRequiredTimeout?: 'DEVICE_DEFAULT' | 'EVERY_DAY';
    separateLock?: boolean;
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

export interface AndroidPasscodeDeviceProfile {
    id?: string;
    complexity?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    historyLength?: number;
    maxFailedAttemptsToWipe?: number;
    changeAfterSeconds?: number;
    strongAuthRequiredTimeout?: 'DEVICE_DEFAULT' | 'EVERY_DAY';
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

export interface AndroidPasscodeEnforcement {
    blockAfterDays?: number;
    wipeAfterDays?: number;
}

export interface AndroidPasscodePolicy {
    devicePolicyType?: 'Android_Personal_Device_s_Passcode_Policy' | 'Android_Company_Owned_Device_s_Passcode_Policy';
    work?: AndroidPasscodeWorkProfile;
    device?: AndroidPasscodeDeviceProfile;
    enforcement?: AndroidPasscodeEnforcement;
}

export interface AndroidFullProfile extends Profile {
    profileType?: 'Android_Full_Profile';
    commonSettingsPolicy?: CommonSettingsPolicy;
    deviceThemePolicy?: DeviceThemePolicy;
    enrollmentPolicy?: EnrollmentPolicy;
    applicationPolicies?: AndroidApplicationPolicy[];
    webApplicationPolicies?: AndroidWebApplicationPolicy[];
    restrictions?: AndroidProfileRestrictions;
    passcodePolicy?: AndroidPasscodePolicy;
}

// Full Profile interface matching API response (detail view with all policies)
export type FullProfile = IosFullProfile | AndroidFullProfile;

export interface PublishProfile {
    deviceIds?: string[];
    groupIds?: string[];
    profileType?: 'AndroidPublishProfile' | 'IosPublishProfile';
}
