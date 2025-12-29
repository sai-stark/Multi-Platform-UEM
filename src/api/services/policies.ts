import {
    ApplicationPolicy,
    ApplicationsRestriction,
    CommonSettingsPolicy,
    ConnectivityRestriction,
    DateTimeRestriction,
    DeviceThemePolicy,
    DisplayRestriction,
    EnrollmentPolicy,
    IosAppNotificationSetting,
    IosLockScreenMessage,
    IosMailPolicy,
    IosWiFiConfiguration,
    KioskRestriction,
    LocationRestriction,
    MiscellaneousRestriction,
    NetworkRestriction,
    PasscodeRestrictionPolicy,
    PhoneRestriction,
    Platform,
    SecurityRestriction,
    SyncStorageRestriction,
    TetheringRestriction,
    WebApplicationPolicy
} from '@/types/models';
import apiClient from '../client';

const CORE_PATH = '/profiles';

export const PolicyService = {
    // --- Common Policies ---

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

    // --- Restrictions ---

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
    },

    // --- iOS Specific Policies ---

    // WiFi
    createIosWiFiConfiguration: async (profileId: string, policy: IosWiFiConfiguration) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/wifi`, policy);
        return response.data;
    },

    // Mail
    createIosMailPolicy: async (profileId: string, policy: IosMailPolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/mail`, policy);
        return response.data;
    },

    // App Notifications
    createIosAppNotificationPolicy: async (profileId: string, policy: IosAppNotificationSetting) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/notifications`, policy);
        return response.data;
    },

    // Lock Screen Message
    createIosLockScreenMessage: async (profileId: string, policy: IosLockScreenMessage) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/lockScreenMessage`, policy);
        return response.data;
    },

    // MDM Config
    getIosMdmConfiguration: async (profileId: string) => {
        const response = await apiClient.get(`/ios${CORE_PATH}/${profileId}/policies/mdm`);
        return response.data;
    },

    // Certificates
    getIosRootCertificate: async (profileId: string) => {
        const response = await apiClient.get(`/ios${CORE_PATH}/${profileId}/policies/rootCertificate`);
        return response.data;
    },

    getIosScepConfiguration: async (profileId: string) => {
        const response = await apiClient.get(`/ios${CORE_PATH}/${profileId}/policies/scep`);
        return response.data;
    },

    getIosAcmeConfiguration: async (profileId: string) => {
        const response = await apiClient.get(`/ios${CORE_PATH}/${profileId}/policies/acme`);
        return response.data;
    }
};

