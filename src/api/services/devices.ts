import {
    DeviceInfo,
    FullProfile,
    MobileApplication,
    Pageable,
    Platform
} from '@/types/models';
import apiClient from '../client';

export const DeviceService = {
    getDevices: async (platform: Platform, pageable?: Pageable, search?: string) => {
        const params = { ...pageable, search };
        const response = await apiClient.get<any>(`/${platform}/devices`, { params });
        return response.data;
    },

    getDevice: async (platform: Platform, deviceId: string) => {
        const response = await apiClient.get<DeviceInfo>(`/${platform}/devices/${deviceId}`);
        return response.data;
    },

    deleteDevice: async (platform: Platform, deviceId: string) => {
        await apiClient.delete(`/${platform}/devices/${deviceId}`);
    },

    getEffectiveProfile: async (deviceId: string) => {
        const response = await apiClient.get<FullProfile>(`/devices/${deviceId}/effective-profile`);
        return response.data;
    },

    getDeviceApplications: async (platform: Platform, deviceId: string) => {
        const response = await apiClient.get<MobileApplication[]>(`/${platform}/devices/${deviceId}/applications`);
        return response.data;
    },

    getLocationHistory: async (deviceId: string) => {
        const response = await apiClient.get(`/devices/${deviceId}/locations`);
        return response.data;
    },

    // Commands
    rebootDevice: async (platform: Platform, deviceId: string) => {
        const payload = platform === 'ios' ? { command: 'RestartDevice' } : {};
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/reboot`, payload);
    },

    factoryResetDevice: async (platform: Platform, deviceId: string) => {
        const payload = platform === 'ios' ? { command: 'EraseDevice' } : {};
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/factory-reset`, payload);
    },

    lockDevice: async (platform: Platform, deviceId: string) => {
        const payload = platform === 'ios' ? { command: 'DeviceLock' } : {};
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/lock`, payload);
    },

    // default actions
    syncDevice: async (deviceId: string) => {
        await apiClient.post(`/devices/${deviceId}/actions/sync`);
    },

    getGPS: async (deviceId: string) => {
        await apiClient.post(`/devices/${deviceId}/actions/get-gps`);
    },

    // iOS Specific Commands
    removePassCode: async (deviceId: string) => {
        await apiClient.post(`/ios/devices/${deviceId}/commands/removePassCode`);
    },

    removeRestrictionPassword: async (deviceId: string) => {
        await apiClient.post(`/ios/devices/${deviceId}/commands/removeRestrictionPassword`);
    },

    unlockUserAccount: async (deviceId: string) => {
        await apiClient.post(`/ios/devices/${deviceId}/commands/unlockUserAccount`);
    },

    // APNS
    sendApns: async (udid: string) => {
        await apiClient.post(`/ios/apns/send`, { udid });
    }
};
