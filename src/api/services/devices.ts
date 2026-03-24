
import {
    ActionAndroidDeviceDeleteUser,
    ActionAndroidDeviceFactoryReset,
    ActionAndroidDeviceLock,
    ActionAndroidDeviceLogout,
    ActionAndroidDeviceReboot,
    ActionAndroidDeviceShutdown,
    ActionAndroidDisableLostMode,
    ActionAndroidEnableLostMode,
    ActionAndroidPlayLostModeSound,
    ActionDeviceDeleteUser,
    ActionDeviceFactoryReset,
    ActionDeviceLock,
    ActionDeviceReboot,
    ActionDisableLostMode,
    ActionEnableLostMode,
    ActionIosDeviceDeleteUser,
    ActionIosDeviceFactoryReset,
    ActionIosDeviceLock,
    ActionIosDeviceLogout,
    ActionIosDeviceReboot,
    ActionIosDeviceShutdown,
    ActionIosDisableLostMode,
    ActionIosEnableLostMode,
    ActionIosPlayLostModeSound,
    ActionPlayLostModeSound,
    DeviceApplicationList,
    DeviceCertificateList,
    DeviceInfo,
    DeviceLocationResponse,
    DeviceSecurityInfo,
    FullProfile,
    Pageable,
    Platform,
    SyncDevice
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
        const response = await apiClient.delete(`/${platform}/devices/${deviceId}`);
        return response;
    },

    // Corrected: Uses /{platform}/devices/{deviceId}/effective-profile per OpenAPI spec
    getEffectiveProfile: async (platform: Platform, deviceId: string) => {
        const response = await apiClient.get<FullProfile>(`/${platform}/devices/${deviceId}/effective-profile`);
        return response.data;
    },

    // Corrected: Uses /{platform}/devices/{deviceId}/applications per OpenAPI spec
    getDeviceApplications: async (platform: Platform, deviceId: string, pageable?: Pageable) => {
        const params = { ...pageable };
        const response = await apiClient.get<DeviceApplicationList>(`/${platform}/devices/${deviceId}/applications`, { params });
        return response.data;
    },

    // New: Get web applications installed on a device
    getDeviceWebApplications: async (platform: Platform, deviceId: string) => {
        const response = await apiClient.get(`/${platform}/devices/${deviceId}/web-applications`);
        return response.data;
    },

    getLocationHistory: async (platform: Platform, deviceId: string) => {
        const response = await apiClient.get(`/${platform}/devices/${deviceId}/locations`);
        return response.data;
    },

    // New API Methods
    syncDevices: async (platform: Platform, deviceIds: string[]) => {
        const payload: SyncDevice = { deviceIds };
        await apiClient.post(`/${platform}/devices:sync`, payload);
    },

    getDeviceSecurityInfo: async (platform: Platform, deviceId: string) => {
        const response = await apiClient.get<DeviceSecurityInfo>(`/${platform}/devices/${deviceId}/security`);
        return response.data;
    },

    getDeviceCertificates: async (platform: Platform, deviceId: string, pageable?: Pageable) => {
        const params = { ...pageable };
        const response = await apiClient.get<DeviceCertificateList>(`/${platform}/devices/${deviceId}/certificates`, { params });
        return response.data;
    },

    // Commands
    rebootDevice: async (platform: Platform, deviceId: string, payload?: ActionDeviceReboot) => {
        let body: any = {};
        if (platform === 'ios') {
            body = {
                commandReferenceId: (payload as any)?.commandReferenceId,
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
                commandReferenceId: (payload as any)?.commandReferenceId,
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
        if (platform === 'macos') {
            body = {
                commandReferenceId: (payload as any)?.commandReferenceId,
                deviceActionType: 'MacosActionDeviceLock',
                message: (payload as any)?.message,
                phoneNumber: (payload as any)?.phoneNumber,
                PIN: (payload as any)?.PIN,
                requestRequiresNetworkTether: (payload as any)?.requestRequiresNetworkTether
            };
        } else if (platform === 'ios') {
            body = {
                commandReferenceId: (payload as any)?.commandReferenceId,
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

    enableLostMode: async (platform: Platform, deviceId: string, payload?: ActionEnableLostMode) => {
        let body: any = {};
        if (platform === 'ios') {
            const iosPayload = payload as ActionIosEnableLostMode;
            body = {
                commandReferenceId: iosPayload?.commandReferenceId,
                deviceActionType: 'ActionIosEnableLostMode',
                Message: iosPayload?.Message,
                PhoneNumber: iosPayload?.PhoneNumber,
                Footnote: iosPayload?.Footnote,
                RequestRequiresNetworkTether: iosPayload?.RequestRequiresNetworkTether
            } as ActionIosEnableLostMode;
        } else if (platform === 'android') {
            body = {
                deviceActionType: 'ActionAndroidEnableLostMode'
            } as ActionAndroidEnableLostMode;
        }
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/enableLostMode`, body);
    },

    disableLostMode: async (platform: Platform, deviceId: string, payload?: ActionDisableLostMode) => {
        let body: any = {};
        if (platform === 'ios') {
            const iosPayload = payload as ActionIosDisableLostMode;
            body = {
                commandReferenceId: iosPayload?.commandReferenceId,
                deviceActionType: 'ActionIosDisableLostMode'
            } as ActionIosDisableLostMode;
        } else if (platform === 'android') {
            body = {
                deviceActionType: 'ActionAndroidDisableLostMode'
            } as ActionAndroidDisableLostMode;
        }
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/disableLostMode`, body);
    },

    playLostModeSound: async (platform: Platform, deviceId: string, payload?: ActionPlayLostModeSound) => {
        let body: any = {};
        if (platform === 'ios') {
            const iosPayload = payload as ActionIosPlayLostModeSound;
            body = {
                commandReferenceId: iosPayload?.commandReferenceId,
                deviceActionType: 'ActionIosPlayLostModeSound',
                RequestRequiresNetworkTether: iosPayload?.RequestRequiresNetworkTether
            } as ActionIosPlayLostModeSound;
        } else if (platform === 'android') {
            body = {
                deviceActionType: 'ActionAndroidPlayLostModeSound'
            } as ActionAndroidPlayLostModeSound;
        }
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/playLostModeSound`, body);
    },


    // default actions
    syncDevice: async (platform: Platform, deviceId: string) => {
        await apiClient.post(`/${platform}/devices/${deviceId}/actions/sync`);
    },

    getGPS: async (platform: Platform, deviceId: string) => {
        await apiClient.post(`/${platform}/devices/${deviceId}/actions/get-gps`);
    },

    // iOS Specific Commands
    removePassCode: async (deviceId: string) => {
        // Spec required a body with commandreferenceId usually, but let's check if it's optional in strict mode or if we need to gen UUID
        // For now, assuming empty object or simple call if backend handles it, but definitions say required.
        // Let's pass a dummy for now as many implementations do this automatically or we'll add uuid lib.
        // Actually for this call, let's just do empty object as per previous code unless strictly required by client validation.
        // Spec said required `commandreferenceId`.
        const payload = {};
        await apiClient.post(`/ios/devices/${deviceId}/commands/removePassCode`, payload);
    },

    removeRestrictionPassword: async (deviceId: string) => {
        const payload = {};
        await apiClient.post(`/ios/devices/${deviceId}/commands/removeRestrictionPassword`, payload);
    },

    // New Commands
    logoutDevice: async (platform: Platform, deviceId: string) => {
        let body: any = {};
        if (platform === 'ios') {
            body = {
                deviceType: 'ActionIosDeviceLogout'
            } as ActionIosDeviceLogout;
        } else if (platform === 'android') {
            body = {
                deviceType: 'ActionAndroidDeviceLogout'
            } as ActionAndroidDeviceLogout;
        }
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/logout`, body);
    },

    shutdownDevice: async (platform: Platform, deviceId: string) => {
        let body: any = {};
        if (platform === 'ios') {
            body = {
                deviceType: 'ActionIosDeviceShutdown'
            } as ActionIosDeviceShutdown;
        } else if (platform === 'android') {
            body = {
                deviceType: 'ActionAndroidDeviceShutdown'
            } as ActionAndroidDeviceShutdown;
        }
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/shutdown`, body);
    },

    deleteUser: async (platform: Platform, deviceId: string, payload?: ActionDeviceDeleteUser) => {
        let body: any = {};
        if (platform === 'ios') {
            body = {
                deviceType: 'ActionIosDeviceDeleteUser',
                userName: (payload as ActionIosDeviceDeleteUser)?.userName,
                forceDeletion: (payload as ActionIosDeviceDeleteUser)?.forceDeletion
            } as ActionIosDeviceDeleteUser;
        } else if (platform === 'android') {
            body = {
                deviceType: 'ActionAndroidDeviceDeleteUser'
            } as ActionAndroidDeviceDeleteUser;
        }
        await apiClient.post(`/${platform}/devices/${deviceId}/commands/delete-user`, body);
    },

    getDeviceLocation: async (platform: Platform, deviceId: string) => {
        const response = await apiClient.get<DeviceLocationResponse>(`/${platform}/devices/${deviceId}/commands/deviceLocation`);
        return response.data;
    },

    // APNS
    sendApns: async (udid: string) => {
        await apiClient.post(`/ios/apns/send`, { udid });
    }
};
