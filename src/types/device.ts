import { Platform } from './common';

export interface DeviceInfo {
    id: string;
    udid?: string;
    deviceName?: string;
    model?: string;
    modelName?: string;
    manufacturer?: string;
    productName?: string;
    osVersion?: string;
    buildVersion?: string;
    platform?: Platform; // Injected or inferred
    serialNo?: string;
    imei?: string;
    imeis?: string[];
    macAddress?: string; // Mapped from wifiMAC or wifiInfo.macId?
    wifiMAC?: string;
    bluetoothMAC?: string;

    // Status & State
    status?: string; // 'ONLINE', etc.
    complianceStatus?: 'compliant' | 'non-compliant' | 'pending';
    connectionStatus?: 'online' | 'offline';
    lastSyncTime?: string;
    enrollmentTime?: string;
    creationTime?: string;
    modificationTime?: string;

    // Hardware
    batteryLevel?: number;
    isBatteryCharging?: boolean;
    deviceCapacity?: number; // iOS
    availableDeviceCapacity?: number; // iOS
    storageCapacity?: number; // Android
    storageUsed?: number; // Android
    ramCapacity?: number;
    ramUsed?: number;

    // User/Org
    organizationName?: string;
    userEmail?: string; // Might need mapping
    deviceUser?: string; // Android

    // Hardware (More specific)
    cpu?: string;

    // Detailed Objects
    opSysInfo?: {
        osType?: string;
        name?: string;
        version?: string;
        fullVersion?: string;
    };
    modelInfo?: {
        manufacturer?: string;
        modelName?: string;
        deviceName?: string;
        productName?: string;
        deviceType?: string;
    };
    wifiInfo?: {
        ssid?: string;
        macId?: string;
        ipAddress?: string;
    };

    // Misc
    isSupervised?: boolean;
    isDeviceLocatorServiceEnabled?: boolean;
    isDoNotDisturbInEffect?: boolean;
    isNetworkTethered?: boolean;
    dataRoamingEnabled?: boolean;

    // New fields from JSON
    activationLockAllowedWhileSupervised?: boolean;
    lastCloudBackupDate?: string;
    awaitingConfiguration?: boolean;

    modemFirmwareVersion?: string;
    cellularTechnology?: string;
    isMultiUser?: boolean;
    isCloudBackupEnabled?: boolean;
    isMDMLostModeEnabled?: boolean;
    // iOS Specific New Fields
    iTunesStoreAccountIsActive?: boolean;
    iTunesStoreAccountHash?: string;
    supplementalOSVersionExtra?: string;
    supplementalBuildVersion?: string;
    modelNumber?: string;
    quotaSize?: number;
    residentUsers?: number;
    managedAppleIDDefaultDomains?: string[];
    onlineAuthenticationGracePeriod?: number;
    skipLanguageAndLocaleSetupForNewUsers?: boolean;
    diagnosticSubmissionEnabled?: boolean;
    appAnalyticsEnabled?: boolean;
    timeZone?: string;
    personalHotspotEnabled?: boolean;
    boldTextEnabled?: boolean;
    increaseContrastEnabled?: boolean;
    reduceMotionEnabled?: boolean;
    reduceTransparencyEnabled?: boolean;
    textSize?: number;
    touchAccommodationsEnabled?: boolean;
    voiceOverEnabled?: boolean;
    zoomEnabled?: boolean;
    eid?: string;
    iccid?: string;

    serviceSubscriptions?: {
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
    }[];

    deviceType?: string;
    devicePropertiesAttestation?: string[];
    // Android Specific
    simInfos?: {
        imei?: string;
        imsi?: string;
        phoneNumber?: string;
        carrierNetwork?: string;
        isRoaming?: boolean;
        isDataTxOn?: boolean;
        simState?: boolean;
        connectionState?: boolean;
        rssi?: number;
        txBytes?: number;
        rxBytes?: number;
        ipAddress?: string;
    }[];
    cpuArch?: string;
    volume?: number;
    ringVolume?: number;
    brightness?: number;
    gpsStatus?: boolean;
    bluetooth?: boolean;
    wifi?: boolean;
    freeRam?: string;
    usedRam?: string;
    totalRam?: string;
    freeStorage?: string;
    usedStorage?: string;
    totalStorage?: string;
    usbstorageEnabled?: boolean;
    keyguardEnabled?: boolean;
    mdmMode?: boolean;
    kioskMode?: boolean;
    mobileData?: boolean;
    nfcStatus?: boolean;
    remarks?: string;
    deployedLocation?: string;

}

export interface BriefDeviceInfo {
    id: string;
    name: string;
    model: string;
    osVersion: string;
    status: string;
    platform?: Platform;
}
