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
        // Mock Data Implementation
        console.log(`[Mock] Fetching devices for ${platform}`);
        const mockDevices: DeviceInfo[] = [
            {
                id: '1',
                udid: '00008030-001A2B3C4D5E6F',
                deviceName: 'iPhone 15 Pro',
                model: 'iPhone 15 Pro',
                modelName: 'iPhone 15 Pro',
                platform: 'ios',
                osVersion: '17.4',
                serialNo: 'C02XD12345',
                imei: '354890061234567',
                status: 'ONLINE',
                complianceStatus: 'compliant',
                connectionStatus: 'online',
                batteryLevel: 85,
                deviceCapacity: 256,
                availableDeviceCapacity: 120,
                userEmail: 'john.doe@example.com',
                enrollmentTime: '2024-03-15T10:30:00Z',
                lastSyncTime: new Date().toISOString(),
                wifiInfo: { ipAddress: '192.168.1.105', macId: '00:1A:2B:3C:4D:5E' }
            },
            {
                id: '2',
                deviceName: 'Pixel 8',
                model: 'Pixel 8',
                manufacturer: 'Google',
                platform: 'android',
                osVersion: '14.0',
                serialNo: '8A9X1234Z',
                status: 'ONLINE',
                complianceStatus: 'compliant',
                connectionStatus: 'online',
                batteryLevel: 62,
                storageCapacity: 128,
                storageUsed: 45,
                ramCapacity: 8,
                ramUsed: 4.2,
                deviceUser: 'jane.doe@example.com',
                enrollmentTime: '2024-02-20T09:15:00Z',
                lastSyncTime: new Date().toISOString(),
                opSysInfo: { osType: 'ANDROID', name: 'Android', version: '14' },
                wifiInfo: { ipAddress: '192.168.1.106' }
            },
            {
                id: '3',
                deviceName: 'Windows Workstation',
                model: 'Dell XPS 15',
                platform: 'windows',
                osVersion: '11 Pro',
                serialNo: 'ABC123XYZ',
                status: 'OFFLINE',
                complianceStatus: 'non-compliant',
                connectionStatus: 'offline',
                userEmail: 'admin@example.com',
                enrollmentTime: '2023-11-10T08:00:00Z',
                lastSyncTime: '2024-03-25T16:00:00Z'
            }
        ];

        // Filter if platform matches (though UI calls per platform usually)
        const filtered = mockDevices.filter(d => d.platform === platform);

        return {
            content: filtered,
            pageable: {
                pageNumber: 0,
                pageSize: 20,
                sort: { empty: true, sorted: false, unsorted: true },
                offset: 0,
                paged: true,
                unpaged: false
            },
            last: true,
            totalPages: 1,
            totalElements: filtered.length,
            first: true,
            size: 20,
            number: 0,
            sort: { empty: true, sorted: false, unsorted: true },
            numberOfElements: filtered.length,
            empty: filtered.length === 0
        };
        // End Mock

        // const params = { ...pageable, search };
        // const response = await apiClient.get<PagedResponse<DeviceInfo>>(`/${platform}/devices`, { params });
        // return response.data;
    },

    getDevice: async (platform: Platform, deviceId: string) => {
        // Mock Data
        console.log(`[Mock] Fetching device details for ${deviceId}`);
        return {
            id: deviceId,
            udid: '00008030-001A2B3C4D5E6F',
            deviceName: 'Mock iPhone 15 Pro',
            model: 'iPhone 15 Pro',
            modelName: 'iPhone 15 Pro', // Matches model generally
            manufacturer: 'Apple Inc.',
            productName: 'iPhone16,1',
            platform: platform || 'ios',
            osVersion: '17.4',
            buildVersion: '21E219',
            serialNo: 'C02XD12345',
            imei: '354890061234567',
            imeis: ['354890061234567', '354890061234568'], // Dual SIM
            macAddress: '00:1A:2B:3C:4D:5E',
            wifiMAC: '00:1A:2B:3C:4D:5E',
            bluetoothMAC: '00:1A:2B:3C:4D:5F',

            // Status & State
            status: 'ONLINE',
            complianceStatus: 'compliant',
            connectionStatus: 'online',
            lastSyncTime: new Date().toISOString(),
            enrollmentTime: '2024-03-15T10:30:00Z',
            creationTime: '2024-03-15T10:25:00Z',
            modificationTime: '2024-03-20T14:45:00Z',

            // Hardware
            batteryLevel: 85,
            isBatteryCharging: true,
            deviceCapacity: 256, // iOS
            availableDeviceCapacity: 120, // iOS
            storageCapacity: 256, // Android/General
            storageUsed: 136, // Calculated from above
            ramCapacity: 8,
            ramUsed: 4.2,

            // User/Org
            organizationName: 'Acme Corp',
            userEmail: 'mock.user@example.com',
            deviceUser: 'mock.user',

            // Detailed Objects
            opSysInfo: {
                osType: platform === 'android' ? 'ANDROID' : 'IOS',
                name: platform === 'android' ? 'Android' : 'iOS',
                version: '17.4',
                fullVersion: '17.4 (21E219)'
            },
            modelInfo: {
                manufacturer: 'Apple Inc.',
                modelName: 'iPhone 15 Pro'
            },
            wifiInfo: {
                ssid: 'Acme-Corp-Secure',
                macId: '00:1A:2B:3C:4D:5E',
                ipAddress: '192.168.1.105'
            },

            // Misc
            isSupervised: true,
            isDeviceLocatorServiceEnabled: true,
            isDoNotDisturbInEffect: false,
            isNetworkTethered: false,
            dataRoamingEnabled: true
        } as DeviceInfo;

        // const response = await apiClient.get<DeviceInfo>(`/${platform}/devices/${deviceId}`);
        // return response.data;
    },

    deleteDevice: async (platform: Platform, deviceId: string) => {
        console.log('[Mock] Deleting device', deviceId);
        // await apiClient.delete(`/${platform}/devices/${deviceId}`);
    },

    getEffectiveProfile: async (deviceId: string) => {
        // Mock Data
        return {
            id: "profile-1",
            name: "Corporate Default Profile",
            description: "Standard corporate profile",
            status: "PUBLISHED",
            version: 1,
            deviceCount: 10,
            creationTime: "2024-01-01T00:00:00Z",
            modificationTime: "2024-01-01T00:00:00Z",
            createdBy: "admin",
            lastModifiedBy: "admin",
            profileType: "IosProfile",
            mailPolicy: {
                id: "mail-1",
                accountDescription: "Corporate Email",
                accountType: "EMAIL",
                emailAddress: "employee@company.com",
                incomingMailServerHostName: "imap.company.com"
            },
            passCodePolicy: {
                id: "pass-1",
                name: "Strong Passcode",
                policyType: "IosPasscodeRestrictionPolicy",
                minLength: 6,
                requirePassCode: true
            },
            wifiPolicy: {
                id: "wifi-1",
                ssid: "Office-Secure",
                securityType: "WPA2"
            }
        } as FullProfile;

        // const response = await apiClient.get<FullProfile>(`/devices/${deviceId}/effective-profile`);
        // return response.data;
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
