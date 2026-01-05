import apiClient from '@/api/client';
import { FullProfile, Platform, Profile } from '@/types/models';

export interface EnrollmentProfile extends Profile {
    id: string; // Enforce ID presence for enrollment
    config?: {
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
        const response = await apiClient.get<any>(`/${platform}/profiles`);
        const profiles = response.data.content || response.data;

        if (!Array.isArray(profiles)) {
            console.error("Unexpected API response format:", response.data);
            return [];
        }

        return profiles.map((p: any) => ({
            ...p,
            config: p.config || {
                wifiSSID: 'Not Configured',
                vpnEnabled: false,
                mandatoryApps: [],
                restrictions: []
            }
        }));
    },

    getProfileDetails: async (platform: Platform, profileId: string): Promise<FullProfile> => {
        const response = await apiClient.get<FullProfile>(`/${platform}/profiles/${profileId}`);
        return response.data;
    },

    downloadProfile: async (platform: Platform, profileId: string): Promise<string> => {
        const response = await apiClient.get<string>(`/${platform}/profiles/${profileId}/download`);
        return response.data;
    },

    getQrCode: async (platform: Platform, profileId: string): Promise<EnrollmentQrData> => {
        const response = await apiClient.get<EnrollmentQrData>(`/${platform}/profiles/${profileId}/qr`);
        return response.data;
    }
};
