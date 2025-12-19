import {
    ApplicationPolicy,
    ApplicationsRestriction,
    CommonSettingsPolicy,
    ConnectivityRestriction,
    DateTimeRestriction,
    DeviceThemePolicy,
    DisplayRestriction,
    EnrollmentPolicy,
    FullProfile,
    KioskRestriction,
    LocationRestriction,
    MiscellaneousRestriction,
    NetworkRestriction,
    Pageable,
    PagedResponse,
    PasscodeRestrictionPolicy,
    PhoneRestriction,
    Platform,
    Profile,
    PublishProfile,
    SecurityRestriction,
    SyncStorageRestriction,
    TetheringRestriction,
    WebApplicationPolicy
} from '@/types/models';
import apiClient from '../client';

const CORE_PATH = '/profiles';

export const ProfileService = {
    getProfiles: async (platform: Platform, pageable?: Pageable, search?: string) => {
        const params = { ...pageable, search };
        const response = await apiClient.get<PagedResponse<Profile>>(`/${platform}${CORE_PATH}`, { params });
        return response.data;
    },

    getBriefProfiles: async (pageable?: Pageable, search?: string) => {
        const params = { ...pageable, search };
        const response = await apiClient.get<PagedResponse<Profile>>('/brief-profiles', { params });
        return response.data;
    },

    getProfile: async (platform: Platform, profileId: string) => {
        const response = await apiClient.get<FullProfile>(`/${platform}${CORE_PATH}/${profileId}`);
        return response.data;
    },

    createProfile: async (platform: Platform, profile: Profile) => {
        const response = await apiClient.post<Profile>(`/${platform}${CORE_PATH}`, profile);
        return response.data;
    },

    updateProfile: async (platform: Platform, profileId: string, profile: Profile) => {
        const response = await apiClient.put<Profile>(`/${platform}${CORE_PATH}/${profileId}`, profile);
        return response.data;
    },

    deleteProfile: async (platform: Platform, profileId: string) => {
        await apiClient.delete(`/${platform}${CORE_PATH}/${profileId}`);
    },

    publishProfile: async (platform: Platform, profileId: string, data: PublishProfile) => {
        await apiClient.post(`/${platform}${CORE_PATH}/${profileId}:publish`, data);
    },

    cloneProfile: async (profileId: string, profile: Profile) => {
        const response = await apiClient.post<FullProfile>(`${CORE_PATH}/${profileId}:clone`, profile);
        return response.data;
    },

    assignProfileToDevice: async (profileId: string, deviceId: string) => {
        await apiClient.post(`${CORE_PATH}/${profileId}/devices/${deviceId}`);
    },

    getProfileQR: async (platform: Platform, profileId: string) => {
        const response = await apiClient.get(`/${platform}${CORE_PATH}/${profileId}/qr`);
        return response.data;
    },

    // --- Policy Management Methods ---

    // Common Settings
    createCommonSettingsPolicy: async (profileId: string, policy: CommonSettingsPolicy) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/policies/common-settings`, policy);
        return response.data;
    },
    updateCommonSettingsPolicy: async (profileId: string, policy: CommonSettingsPolicy) => {
        const response = await apiClient.put(`${CORE_PATH}/${profileId}/policies/common-settings`, policy);
        return response.data;
    },

    // Device Theme
    createDeviceThemePolicy: async (profileId: string, policy: DeviceThemePolicy) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/policies/device-theme`, policy);
        return response.data;
    },
    updateDeviceThemePolicy: async (profileId: string, policy: DeviceThemePolicy) => {
        const response = await apiClient.put(`${CORE_PATH}/${profileId}/policies/device-theme`, policy);
        return response.data;
    },

    // Enrollment
    createEnrollmentPolicy: async (profileId: string, policy: EnrollmentPolicy) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/policies/enrollment`, policy);
        return response.data;
    },
    updateEnrollmentPolicy: async (profileId: string, policy: EnrollmentPolicy) => {
        const response = await apiClient.put(`${CORE_PATH}/${profileId}/policies/enrollment`, policy);
        return response.data;
    },

    // Applications Policy
    createApplicationPolicy: async (platform: Platform, profileId: string, policy: ApplicationPolicy) => {
        const response = await apiClient.post(`/${platform}${CORE_PATH}/${profileId}/policies/applications`, policy);
        return response.data;
    },
    updateApplicationPolicy: async (platform: Platform, profileId: string, appId: string, policy: ApplicationPolicy) => {
        const response = await apiClient.put(`/${platform}${CORE_PATH}/${profileId}/policies/applications/${appId}`, policy);
        return response.data;
    },

    // Web Applications Policy
    createWebApplicationPolicy: async (platform: Platform, profileId: string, policy: WebApplicationPolicy) => {
        const response = await apiClient.post(`/${platform}${CORE_PATH}/${profileId}/policies/web-applications`, policy);
        return response.data;
    },

    // Security Restriction
    createSecurityRestriction: async (profileId: string, policy: SecurityRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/security`, policy);
        return response.data;
    },
    updateSecurityRestriction: async (profileId: string, policy: SecurityRestriction) => {
        const response = await apiClient.put(`${CORE_PATH}/${profileId}/restrictions/security`, policy);
        return response.data;
    },

    // Passcode Restriction
    createPasscodeRestriction: async (profileId: string, policy: PasscodeRestrictionPolicy) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/passcode`, policy);
        return response.data;
    },
    updatePasscodeRestriction: async (profileId: string, policy: PasscodeRestrictionPolicy) => {
        const response = await apiClient.put(`${CORE_PATH}/${profileId}/restrictions/passcode`, policy);
        return response.data;
    },

    // Sync Storage
    createSyncStorageRestriction: async (profileId: string, policy: SyncStorageRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/sync-storage`, policy);
        return response.data;
    },

    // Kiosk
    createKioskRestriction: async (profileId: string, policy: KioskRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/kiosk`, policy);
        return response.data;
    },

    // Location
    createLocationRestriction: async (profileId: string, policy: LocationRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/location`, policy);
        return response.data;
    },

    // Tethering
    createTetheringRestriction: async (profileId: string, policy: TetheringRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/tethering`, policy);
        return response.data;
    },

    // Phone
    createPhoneRestriction: async (profileId: string, policy: PhoneRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/phone`, policy);
        return response.data;
    },

    // DateTime
    createDateTimeRestriction: async (profileId: string, policy: DateTimeRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/date-time`, policy);
        return response.data;
    },

    // Display
    createDisplayRestriction: async (profileId: string, policy: DisplayRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/display`, policy);
        return response.data;
    },

    // Miscellaneous
    createMiscellaneousRestriction: async (profileId: string, policy: MiscellaneousRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/miscellaneous`, policy);
        return response.data;
    },

    // Applications Restriction
    createApplicationsRestriction: async (profileId: string, policy: ApplicationsRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/applications`, policy);
        return response.data;
    },

    // Network
    createNetworkRestriction: async (profileId: string, policy: NetworkRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/network`, policy);
        return response.data;
    },

    // Connectivity
    createConnectivityRestriction: async (profileId: string, policy: ConnectivityRestriction) => {
        const response = await apiClient.post(`${CORE_PATH}/${profileId}/restrictions/connectivity`, policy);
        return response.data;
    }
};
