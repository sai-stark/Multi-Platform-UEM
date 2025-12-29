import { Platform } from './common';

export interface DeviceInfo {
    id: string;
    udid?: string;
    serialNumber?: string;
    macAddress?: string;
    imei?: string;
    model?: string;
    osVersion?: string;
    platform: Platform;
    enrollmentTime?: string;
    lastSyncTime?: string;
    status?: 'active' | 'inactive' | 'enrolled' | 'unenrolled';
    userEmail?: string;
}

export interface BriefDeviceInfo {
    id: string;
    name: string;
    model: string;
    osVersion: string;
    status: string;
}
