import { Platform } from '@/types/models';

export interface EnrollmentProfile {
    id: string;
    name: string;
    description: string;
    config: {
        wifiSSID: string;
        vpnEnabled: boolean;
        vpnServer?: string;
        mandatoryApps: string[];
        restrictions: string[];
    };
}

export interface EnrollmentQrData {
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME"?: string;
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION"?: string;
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM"?: string;
    "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED"?: boolean;
    "android.app.extra.PROVISIONING_SKIP_ENCRYPTION"?: boolean;
    "android.app.extra.PROVISIONING_WIFI_SSID"?: string;
    "android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE"?: string;
    "android.app.extra.PROVISIONING_WIFI_PASSWORD"?: string;
    "android.app.extra.PROVISIONING_USE_MOBILE_DATA"?: boolean;
    "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"?: Record<string, string>;
    [key: string]: any;
}

export const EnrollmentService = {
    getProfiles: async (platform: Platform): Promise<EnrollmentProfile[]> => {
        // Mock Data
        console.log(`[Mock] Fetching enrollment profiles for ${platform}`);
        const profiles: Record<Platform, EnrollmentProfile[]> = {
            android: [
                {
                    id: 'android-standard',
                    name: 'Standard Enterprise',
                    description: 'Default Android enterprise profile',
                    config: {
                        wifiSSID: 'CDOT-Enterprise',
                        vpnEnabled: true,
                        vpnServer: 'vpn.cdot.in',
                        mandatoryApps: ['Microsoft Outlook', 'Microsoft Teams', 'Company Portal'],
                        restrictions: ['Camera disabled in work profile', 'USB debugging disabled'],
                    },
                },
                {
                    id: 'android-kiosk',
                    name: 'Kiosk Mode',
                    description: 'Locked-down single-app mode',
                    config: {
                        wifiSSID: 'CDOT-Kiosk',
                        vpnEnabled: false,
                        mandatoryApps: ['Kiosk App'],
                        restrictions: ['Single app mode', 'Navigation disabled', 'Status bar hidden'],
                    },
                },
            ],
            ios: [
                {
                    id: 'ios-standard',
                    name: 'Standard Enterprise',
                    description: 'Default iOS enterprise profile',
                    config: {
                        wifiSSID: 'CDOT-Enterprise',
                        vpnEnabled: true,
                        vpnServer: 'vpn.cdot.in',
                        mandatoryApps: ['Microsoft Outlook', 'Microsoft Teams'],
                        restrictions: ['iCloud backup disabled', 'App Store restricted'],
                    },
                },
            ],
            windows: [
                {
                    id: 'windows-standard',
                    name: 'Domain Join',
                    description: 'Azure AD join with Autopilot',
                    config: {
                        wifiSSID: 'CDOT-Enterprise',
                        vpnEnabled: true,
                        vpnServer: 'vpn.cdot.in',
                        mandatoryApps: ['Microsoft 365', 'Defender', 'Company Portal'],
                        restrictions: ['BitLocker required', 'Windows Hello required'],
                    },
                },
            ],
            macos: [
                {
                    id: 'macos-standard',
                    name: 'Standard Enterprise',
                    description: 'Default macOS enterprise profile',
                    config: {
                        wifiSSID: 'CDOT-Enterprise',
                        vpnEnabled: true,
                        vpnServer: 'vpn.cdot.in',
                        mandatoryApps: ['Microsoft 365', 'Company Portal'],
                        restrictions: ['FileVault required', 'Gatekeeper enabled'],
                    },
                },
            ],
            linux: [
                {
                    id: 'linux-standard',
                    name: 'Standard Workstation',
                    description: 'Ubuntu/RHEL workstation profile',
                    config: {
                        wifiSSID: 'CDOT-Enterprise',
                        vpnEnabled: true,
                        vpnServer: 'vpn.cdot.in',
                        mandatoryApps: ['Intune Agent', 'OpenVPN'],
                        restrictions: ['Root access restricted', 'USB storage disabled'],
                    },
                },
            ],
        };

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(profiles[platform] || []);
            }, 500); // Simulate network delay
        });

        // const response = await apiClient.get<EnrollmentProfile[]>(`/${platform}/profiles`);
        // return response.data;
    },

    downloadProfile: async (platform: Platform, profileId: string): Promise<string> => {
        // Mock Data
        console.log(`[Mock] Getting download URL for ${platform} profile ${profileId}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`https://mock-download.cdot.in/${platform}/profiles/${profileId}.blob`);
            }, 500);
        });

        // const response = await apiClient.get<string>(`/${platform}/profiles/${profileId}/download`);
        // return response.data;
    },

    getQrCode: async (platform: Platform, profileId: string): Promise<EnrollmentQrData> => {
        // Mock Data
        console.log(`[Mock] Fetching QR code data for ${platform} profile ${profileId}`);
        const mockQrData = {
            "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.hmdm.launcher/com.hmdm.launcher.AdminReceiver",
            "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "http://172.29.3.52/files/hmdm-5.24-os.apk",
            "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM": "zZ_SaOfrYBZ5J6_e4QWAxs3B4ERvbIspX2FMx5ilrTA=",
            "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": true,
            "android.app.extra.PROVISIONING_SKIP_ENCRYPTION": true,
            "android.app.extra.PROVISIONING_WIFI_SSID": "CDOT-WIFI",
            "android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE": "WPA",
            "android.app.extra.PROVISIONING_WIFI_PASSWORD": "Abcd@123",
            "android.app.extra.PROVISIONING_USE_MOBILE_DATA": false,
            "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
                "com.hmdm.CONFIG": "18f7666f-727f-42bd-bf05-3193b78c3502",
                "com.hmdm.DEVICE_ID_USE": "imei",
                "com.hmdm.BASE_URL": "http://172.29.3.52",
                "com.hmdm.SERVER_PROJECT": "",
                "com.hmdm.CUSTOMER": "590bd48c-7340-40ca-901e-44ac20040e26"
            }
        };

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockQrData);
            }, 500);
        });

        // const response = await apiClient.get<EnrollmentQrData>(`/${platform}/profiles/${profileId}/qr`);
        // return response.data;
    }
};
