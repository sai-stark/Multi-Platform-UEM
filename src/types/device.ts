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
    isInstalled?: boolean;
    isExpected?: boolean;
    isBlocked?: boolean;
    isIconVisible?: boolean;
    isManaged?: boolean; // iOS
    applicationType?: string;
    externalVersionIdentifier?: number; // iOS
}

export type DeviceApplicationList = DeviceApplication[];

// Command Payloads
export interface ClearRestrictionsPassword {
    commandreferenceId: string;
    requestRequiresNetworkTether?: boolean;
}

export interface ClearPasscodeAction {
    commandreferenceId: string;
    requestRequiresNetworkTether?: boolean;
}

export interface ActionDeviceFactoryReset {
    commandReferenceId?: string; // iOS
    delay?: number; // Android
    deviceActionType?: string; // ActionAndroidDeviceFactoryReset | ActionIosDeviceFactoryReset
    preserveDataPlan?: boolean; // iOS
    disallowProximitySetup?: boolean; // iOS
    returnToServiceEnabled?: boolean; // iOS
}

export interface ActionDeviceLock {
    commandreferenceId?: string; // iOS
    delay?: number; // Android
    message?: string; // iOS
    phoneNumber?: string; // iOS
    requestRequiresNetworkTether?: boolean; // iOS
    deviceActionType?: string;
}

export interface ActionDeviceReboot {
    commandReferenceId: string;
    deviceType?: string;
    notifyUser?: boolean;
}
