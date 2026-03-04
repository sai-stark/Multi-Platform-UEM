import { Platform } from './common';

export interface DeviceInfo {
    id: string;
    // Core Identity
    deviceName?: string;
    model?: string; // Identifier
    modelName?: string; // Human readable
    manufacturer?: string;
    deviceType?: string; // 'AndroidDeviceInfo' | 'IosDeviceInfo'
    platform?: Platform; // Injected helper
    serialNo?: string;
    udid?: string; // iOS
    imei?: string; // General/iOS
    imeis?: Imei[]; // Android
    macAddress?: string; // Helper/Mapped

    // System & OS
    osVersion?: string;
    buildVersion?: string;
    supplementalBuildVersion?: string; // iOS
    supplementalOSVersionExtra?: string; // iOS
    androidVersion?: string; // Android
    cpuArch?: string; // Android
    cpu?: string; // Android detail

    // Status & State
    status?: string; // DeviceStatus
    complianceStatus?: 'compliant' | 'non-compliant' | 'pending'; // UI helper
    connectionStatus?: 'online' | 'offline'; // UI helper
    lastSyncTime?: string;
    enrollmentTime?: string;
    creationTime?: string;
    batteryLevel?: number; // 0.0 - 1.0 (iOS) or 0-100 (Android) - UI should normalize
    isBatteryCharging?: boolean; // Normalized from isBatterCharging (Android) / isBatteryCharging (iOS)

    // Storage & RAM
    deviceCapacity?: number; // iOS (GB float)
    availableDeviceCapacity?: number; // iOS (GB float)
    storageCapacity?: number; // Android (Bytes) / iOS (mapped?)
    storageUsed?: number; // Android (Bytes)
    freeStorage?: string; // Android (String)
    usedStorage?: string; // Android (String)
    totalStorage?: string; // Android (String)

    ramCapacity?: number; // Android
    ramUsed?: number; // Android
    freeRam?: string; // Android
    usedRam?: string; // Android
    totalRam?: string; // Android

    // Settings & Configuration
    timeZone?: string;
    volume?: number;
    ringVolume?: number;
    brightness?: number;

    // Network
    wifiMAC?: string;
    bluetoothMAC?: string;
    ipAddress?: string; // Mapped
    wifiInfo?: WifiInfo; // Android
    simInfos?: SimInfo[]; // Android
    serviceSubscriptions?: ServiceSubscription[]; // iOS
    modemFirmwareVersion?: string; // iOS
    cellularTechnology?: number; // iOS

    // Features / Toggles / Restrictions
    isSupervised?: boolean;
    isDeviceLocatorServiceEnabled?: boolean;
    isDoNotDisturbInEffect?: boolean;
    isNetworkTethered?: boolean;
    dataRoamingEnabled?: boolean; // iOS
    personalHotspotEnabled?: boolean; // iOS
    activationLockAllowedWhileSupervised?: boolean; // iOS
    isCloudBackupEnabled?: boolean; // iOS
    isMDMLostModeEnabled?: boolean; // iOS

    gpsStatus?: boolean; // Android
    bluetooth?: boolean; // Android
    wifi?: boolean; // Android
    mobileData?: boolean; // Android
    nfcStatus?: boolean; // Android
    mdmMode?: boolean; // Android
    kioskMode?: boolean; // Android
    isUsbStorageEnabled?: boolean; // Android
    isKeyguardEnabled?: boolean; // Android (and iOS inferred?)

    // User / Org
    organizationName?: string;
    userEmail?: string;
    deviceUser?: string; // Android

    // Detailed Objects
    opSysInfo?: OpSysInfoCore;
    modelInfo?: DeviceModelCore;

    // iOS Specific New Fields
    iTunesStoreAccountIsActive?: boolean;
    iTunesStoreAccountHash?: string;
    modelNumber?: string;
    quotaSize?: number;
    residentUsers?: number;
    managedAppleIDDefaultDomains?: string[];
    onlineAuthenticationGracePeriod?: number;
    skipLanguageAndLocaleSetupForNewUsers?: boolean;
    diagnosticSubmissionEnabled?: boolean;
    appAnalyticsEnabled?: boolean;
    boldTextEnabled?: boolean;
    increaseContrastEnabled?: boolean;
    reduceMotionEnabled?: boolean;
    reduceTransparencyEnabled?: boolean;
    textSize?: number;
    touchAccommodationsEnabled?: boolean;
    voiceOverEnabled?: boolean;
    zoomEnabled?: boolean;
    eid?: string; // iOS
    iccid?: string; // iOS

    // Legacy/Unsure (Keep for safety or map)
    productName?: string;
    lastCloudBackupDate?: string;
    awaitingConfiguration?: boolean;
    isMultiUser?: boolean;

    // Extras
    remarks?: string;
    deployedLocation?: string;
}

export interface Imei {
    imei: string;
}

export interface SimInfo {
    imei?: string;
    imsi?: string;
    phoneNumber?: string;
    carrierNetwork?: string;
    isRoaming?: boolean;
    isDataTxOn?: boolean;
    simState?: any; // Start with any, refine if enum known
    connectionState?: any;
    rssi?: number;
    txBytes?: number;
    rxBytes?: number;
    ipAddress?: string;
}

export interface WifiInfo {
    ssid?: string;
    macId?: string;
    ipAddress?: string;
    linkSpeed?: number;
    frequency?: number;
    networkId?: number;
    rssi?: number;
}

export interface ServiceSubscription {
    carrierSettingsVersion?: string;
    currentCarrierNetwork?: string;
    currentMCC?: string;
    currentMNC?: string;
    eid?: string;
    iccId?: string;
    imei?: string;
    isDataPreferred?: boolean;
    isRoaming?: boolean;
    isVoicePreferred?: boolean;
    label?: string;
    phoneNumber?: string;
    slot?: string;
}

export interface OpSysInfoCore {
    osType?: string;
    name?: string;
    version?: string;
    fullVersion?: string;
}

export interface DeviceModelCore {
    manufacturer?: string;
    modelName?: string;
    deviceName?: string;
    productName?: string;
    deviceType?: string;
}

export interface BriefDeviceInfo {
    id: string;
    name: string;
    model: string;
    osVersion: string;
    status: string;
    platform?: Platform;
}

export interface DeviceApplication {
    id?: string;
    appId?: string;
    name?: string;
    packageName?: string; // Android
    identifier?: string; // iOS
    appVersionId?: string;
    appVersion?: string;
    version?: string; // iOS internal version
    shortVersion?: string; // iOS user-facing version
    isInstalled?: boolean;
    isExpected?: boolean;
    isBlocked?: boolean;
    isIconVisible?: boolean;
    isManaged?: boolean; // iOS
    applicationType?: string;
    externalVersionIdentifier?: number; // iOS
    bundleSize?: number; // iOS - bytes
    dynamicSize?: number; // iOS - bytes
    isValidated?: boolean; // iOS
    installing?: boolean; // iOS
    appStoreVendable?: boolean; // iOS
    deviceBasedVPP?: boolean; // iOS
    betaApp?: boolean; // iOS
    adHocCodeSigned?: boolean; // iOS
    hasUpdateAvailable?: boolean; // iOS
    isAppClip?: boolean; // iOS
    applicationStatus?: string; // iOS - e.g. "Installed"
    applicationConfigurationChecked?: Record<string, unknown>; // iOS
    iosDeviceApplicationExtraDetails?: {
        hasConfiguration?: boolean;
        hasFeedback?: boolean;
        isValidated?: boolean;
        managementFlags?: number;
        status?: string; // e.g. "Managed"
    };
}

export type DeviceApplicationList = DeviceApplication[] | { content: DeviceApplication[] };

// New Types for Security and Certificates
export interface DeviceSecurityInfo {
    FDE_Enabled?: boolean;
    FDE_HasInstitutionalRecoveryKey?: boolean;
    FDE_HasPersonalRecoveryKey?: boolean;
    FDE_PersonalRecoveryKeyCMS?: string;
    FDE_PersonalRecoveryKeyDeviceKey?: string;
    HardwareEncryptionCaps?: number;
    hardwareEncryptionCaps?: number;
    IsUserEnrollment?: boolean;
    passcodePresent?: boolean;
    passcodeCompliant?: boolean;
    passcodeCompliantWithProfiles?: boolean;
    passcodeLockGracePeriod?: number;
    passcodeLockGracePeriodEnforced?: number;
    SecureBoot?: {
        SecureBootLevel?: 'full' | 'medium' | 'off' | 'not supported';
        ExternalBootLevel?: 'allowed' | 'disallowed' | 'not supported';
        ReducedSecurity?: {
            AllowsAnyAppleSignedOS?: 'true' | 'false';
            AllowsMDM?: 'true' | 'false';
            AllowsUserKextApproval?: 'true' | 'false';
        };
    };
}

export interface DeviceCertificateItem {
    CommonName?: string;
    Data?: string;
    IsIdentity?: boolean;
}

export interface DeviceCertificateList {
    CertificateList?: DeviceCertificateItem[];
    content?: DeviceCertificateItem[];
}

export interface SyncDevice {
    deviceIds: string[];
}

// Command Payloads
export interface ClearRestrictionsPassword {
    commandreferenceId?: string;
    requestRequiresNetworkTether?: boolean;
}

export interface ClearPasscodeAction {
    commandreferenceId?: string;
    requestRequiresNetworkTether?: boolean;
}

export interface ActionAndroidDeviceFactoryReset {
    delay?: number;
    deviceActionType: 'ActionAndroidDeviceFactoryReset';
}

export interface ActionIosDeviceFactoryReset {
    commandReferenceId?: string;
    preserveDataPlan?: boolean;
    disallowProximitySetup?: boolean;
    returnToServiceEnabled?: boolean;
    deviceActionType: 'ActionIosDeviceFactoryReset';
}

export type ActionDeviceFactoryReset = ActionAndroidDeviceFactoryReset | ActionIosDeviceFactoryReset;

export interface ActionAndroidDeviceLock {
    delay?: number;
    deviceActionType: 'ActionAndroidDeviceLock';
}

export interface ActionIosDeviceLock {
    commandReferenceId?: string;
    message?: string;
    phoneNumber?: string;
    requestRequiresNetworkTether?: boolean;
    deviceActionType: 'ActionIosDeviceLock';
}

export type ActionDeviceLock = ActionAndroidDeviceLock | ActionIosDeviceLock;

export interface ActionAndroidDeviceReboot {
    force?: boolean; // Default: false
    delay?: number; // Default: 0
    deviceType?: 'ActionAndroidDeviceReboot';
}

export interface ActionIosDeviceReboot {
    commandReferenceId?: string;
    deviceType: 'ActionIosDeviceReboot';
    notifyUser?: boolean;
}

export type ActionDeviceReboot = ActionAndroidDeviceReboot | ActionIosDeviceReboot;

// Lost Mode Actions
export interface ActionAndroidEnableLostMode {
    deviceActionType: 'ActionAndroidEnableLostMode';
}

export interface ActionIosEnableLostMode {
    commandReferenceId?: string;
    deviceActionType: 'ActionIosEnableLostMode';
    Message?: string;
    PhoneNumber?: string;
    Footnote?: string;
    RequestRequiresNetworkTether?: boolean;
}

export type ActionEnableLostMode = ActionAndroidEnableLostMode | ActionIosEnableLostMode;

export interface ActionAndroidDisableLostMode {
    deviceActionType: 'ActionAndroidDisableLostMode';
}

export interface ActionIosDisableLostMode {
    commandReferenceId?: string;
    deviceActionType: 'ActionIosDisableLostMode';
}

export type ActionDisableLostMode = ActionAndroidDisableLostMode | ActionIosDisableLostMode;

export interface ActionAndroidPlayLostModeSound {
    deviceActionType: 'ActionAndroidPlayLostModeSound';
}

export interface ActionIosPlayLostModeSound {
    commandReferenceId?: string;
    deviceActionType: 'ActionIosPlayLostModeSound';
    RequestRequiresNetworkTether?: boolean;
}

export type ActionPlayLostModeSound = ActionAndroidPlayLostModeSound | ActionIosPlayLostModeSound;

// Logout
export interface ActionAndroidDeviceLogout {
    deviceType: 'ActionAndroidDeviceLogout';
}

export interface ActionIosDeviceLogout {
    deviceType: 'ActionIosDeviceLogout';
}

export type ActionDeviceLogout = ActionAndroidDeviceLogout | ActionIosDeviceLogout;

// Shutdown
export interface ActionAndroidDeviceShutdown {
    deviceType: 'ActionAndroidDeviceShutdown';
}

export interface ActionIosDeviceShutdown {
    deviceType: 'ActionIosDeviceShutdown';
}

export type ActionDeviceShutdown = ActionAndroidDeviceShutdown | ActionIosDeviceShutdown;

// Delete User
export interface ActionAndroidDeviceDeleteUser {
    deviceType: 'ActionAndroidDeviceDeleteUser';
}

export interface ActionIosDeviceDeleteUser {
    deviceType: 'ActionIosDeviceDeleteUser';
    userName: string;
    forceDeletion?: boolean;
}

export type ActionDeviceDeleteUser = ActionAndroidDeviceDeleteUser | ActionIosDeviceDeleteUser;

// Location Action (for lost mode mostly, but seems reused or similar pattern)
export interface ActionAndroidDeviceLocation {
    deviceActionType: 'ActionAndroidDeviceLocation';
}

export interface ActionIosDeviceLocation {
    deviceActionType: 'ActionIosDeviceLocation';
    RequestRequiresNetworkTether?: boolean;
}

export type ActionDeviceLocation = ActionAndroidDeviceLocation | ActionIosDeviceLocation;

// Location Response
export interface AndroidDeviceLocation {
    deviceType: 'AndroidDeviceLocation';
    Latitude?: number;
    Longitude?: number;
}

export interface IosDeviceLocation {
    deviceType: 'IosDeviceLocation';
    Latitude?: number;
    Longitude?: number;
    Altitude?: number;
    HorizontalAccuracy?: number;
    VerticalAccuracy?: number;
    Course?: number;
    Speed?: number;
    Timestamp?: string;
}

export type DeviceLocationResponse = AndroidDeviceLocation | IosDeviceLocation;
