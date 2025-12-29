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
}

export interface BriefDeviceInfo {
    id: string;
    name: string;
    model: string;
    osVersion: string;
    status: string;
    platform?: Platform;
}
