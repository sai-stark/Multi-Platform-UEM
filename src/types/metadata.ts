import { Platform } from './common';

export interface OsInfo {
    name: string;
    version: string;
    platform: Platform;
}

export interface DeviceModel {
    name: string;
    code: string;
    platform: Platform;
}
