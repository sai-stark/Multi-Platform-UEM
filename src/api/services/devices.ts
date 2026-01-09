import { generateUUID } from '@/lib/utils';
import {
    ActionAndroidDeviceFactoryReset,
    ActionAndroidDeviceLock,
    ActionAndroidDeviceReboot,
    ActionDeviceFactoryReset,
    ActionDeviceLock,
    ActionDeviceReboot,
    ActionIosDeviceFactoryReset,
    ActionIosDeviceLock,
    ActionIosDeviceReboot,
    DeviceApplicationList,
    DeviceInfo,
    FullProfile,
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

    getEffectiveProfile: async (platform: Platform, deviceId: string) => {
        const response = await apiClient.get<FullProfile>(`/${platform}/profiles/effective-profile`, {
            params: { deviceId }
        });
        return response.data;
    },

    getDeviceApplications: async (platform: Platform, deviceId: string) => {
        const response = await apiClient.get<DeviceApplicationList>(`/${platform}/applications`, {
            params: { deviceId }
        });
        return response.data;
    },

    getLocationHistory: async (deviceId: string) => {
        const response = await apiClient.get(`/devices/${deviceId}/locations`);
        return response.data;
    },

    // Commands
    rebootDevice: async (platform: Platform, deviceId: string, payload?: ActionDeviceReboot) => {
        let body: any = {};
        if (platform === 'ios') {
            body = {
                commandReferenceId: (payload as any)?.commandReferenceId || generateUUID(),
                deviceType: 'ActionIosDeviceReboot',
                notifyUser: (payload as any)?.notifyUser
            } as ActionIosDeviceReboot;
        } else if (platform === 'android') {
            body = {
                deviceType: 'ActionAndroidDeviceReboot',
                force: (payload as any)?.force,
                delay: (payload as any)?.delay
            } as ActionAndroidDeviceReboot;
        }
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/reboot`, body);
    },

    factoryResetDevice: async (platform: Platform, deviceId: string, payload?: ActionDeviceFactoryReset) => {
        let body: any = {};
        if (platform === 'ios') {
            body = {
                commandReferenceId: (payload as any)?.commandReferenceId || generateUUID(),
                deviceActionType: 'ActionIosDeviceFactoryReset',
                preserveDataPlan: (payload as any)?.preserveDataPlan,
                disallowProximitySetup: (payload as any)?.disallowProximitySetup,
                returnToServiceEnabled: (payload as any)?.returnToServiceEnabled
            } as ActionIosDeviceFactoryReset;
        } else if (platform === 'android') {
            body = {
                deviceActionType: 'ActionAndroidDeviceFactoryReset',
                delay: (payload as any)?.delay
            } as ActionAndroidDeviceFactoryReset;
        }
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/factory-reset`, body);
    },

    lockDevice: async (platform: Platform, deviceId: string, payload?: ActionDeviceLock) => {
        let body: any = {};
        if (platform === 'ios') {
            body = {
                commandReferenceId: (payload as any)?.commandReferenceId || generateUUID(),
                deviceActionType: 'ActionIosDeviceLock',
                message: (payload as any)?.message,
                phoneNumber: (payload as any)?.phoneNumber,
                requestRequiresNetworkTether: (payload as any)?.requestRequiresNetworkTether
            } as ActionIosDeviceLock;
        } else if (platform === 'android') {
            body = {
                deviceActionType: 'ActionAndroidDeviceLock',
                delay: (payload as any)?.delay
            } as ActionAndroidDeviceLock;
        }
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/lock`, body);
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
        // Spec requires a body with commandreferenceId usually, but let's check if it's optional in strict mode or if we need to gen UUID
        // For now, assuming empty object or simple call if backend handles it, but definitions say required.
        // Let's pass a dummy for now as many implementations do this automatically or we'll add uuid lib.
        // Actually for this call, let's just do empty object as per previous code unless strictly required by client validation.
        // Spec said required `commandreferenceId`.
        const payload = { commandreferenceId: generateUUID() };
        await apiClient.post(`/ios/devices/${deviceId}/commands/removePassCode`, payload);
    },

    removeRestrictionPassword: async (deviceId: string) => {
        const payload = { commandreferenceId: generateUUID() };
        await apiClient.post(`/ios/devices/${deviceId}/commands/removeRestrictionPassword`, payload);
    },

    // APNS
    sendApns: async (udid: string) => {
        await apiClient.post(`/ios/apns/send`, { udid });
    }
};
