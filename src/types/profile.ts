import { Platform } from './common';
import {
    IosAcmeConfiguration,
    IosAppNotificationSetting,
    IosApplicationPolicy,
    IosLockScreenMessage,
    IosMailPolicy,
    IosMdmConfiguration,
    IosWiFiConfiguration
} from './ios';

// Profile types as per OpenAPI spec
export type ProfileType = 'AndroidProfile' | 'IosProfile' | 'IosFullProfile' | 'AndroidFullProfile';

// Profile status as per OpenAPI spec
export type ProfileStatus = 'DRAFT' | 'PUBLISHED';

// Base Profile interface matching API response (summary/list view)
export interface Profile {
    // API response fields
    id?: string;
    name: string;
    description?: string;
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

// Policy types for full profile
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

export interface IosScepPolicyRes {
    id?: string;
    policyType?: string;
    url?: string;
    scepName?: string;
    subject?: string[][][];
    challenge?: string;
    keysize?: number;
    keyType?: string;
    caFingerprint?: string;
    subjectAltName?: {
        rfc822Name?: string;
        dNSName?: string;
        uniformResourceIdentifier?: string;
        ntPrincipalName?: string;
    };
}

export interface IosWebApplicationPolicy {
    id?: string;
    name?: string;
    fullScreen?: boolean;
    ignoreManifestScope?: boolean;
    isRemovable?: boolean;
    label?: string;
    precomposed?: boolean;
    url?: string;
    policyType?: string;
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

// Full Profile interface matching API response (detail view with all policies)
export interface FullProfile extends Profile {
    // iOS-specific policies (only present in full profile response)
    mailPolicy?: IosMailPolicy;
    passCodePolicy?: IosPasscodeRestrictionPolicy;
    scepPolicy?: IosScepPolicyRes;
    webClipPolicies?: IosWebApplicationPolicy[];
    mdmPolicy?: IosMdmConfiguration;
    acmePolicy?: IosAcmeConfiguration;
    notificationPolicies?: IosAppNotificationSetting[];
    wifiPolicy?: IosWiFiConfiguration;
    lockScreenPolicy?: IosLockScreenMessage;
    applicationPolicies?: IosApplicationPolicy[];
}

export interface PublishProfile {
    deviceIds?: string[];
    groupIds?: string[];
}
