import {
    ApplicationsRestriction,
    ConnectivityRestriction,
    DateTimeRestriction,
    DisplayRestriction,
    KioskRestriction,
    LocationRestriction,
    MiscellaneousRestriction,
    NetworkRestriction,
    PhoneRestriction,
    SecurityRestriction,
    SyncStorageRestriction,
    TetheringRestriction,
} from '@/types/restrictions';
import { Platform } from '@/types/models';
import apiClient from '../client';

// Restriction API
export const restrictionAPI = {
    // Security Restriction
    createSecurityRestriction: (platform: Platform, profileId: string, restriction: Partial<SecurityRestriction>): Promise<SecurityRestriction> => {
        return apiClient.post<SecurityRestriction, any, Partial<SecurityRestriction>>(`/${platform}/profiles/${profileId}/restrictions/security`, restriction).then(res => res.data);
    },

    updateSecurityRestriction: (platform: Platform, profileId: string, restriction: Partial<SecurityRestriction>): Promise<SecurityRestriction> => {
        return apiClient.put<SecurityRestriction, any, Partial<SecurityRestriction>>(`/${platform}/profiles/${profileId}/restrictions/security`, restriction).then(res => res.data);
    },

    deleteSecurityRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/security`).then(() => { });
    },

    // Sync Storage Restriction
    createSyncStorageRestriction: (platform: Platform, profileId: string, restriction: Partial<SyncStorageRestriction>): Promise<SyncStorageRestriction> => {
        return apiClient.post<SyncStorageRestriction, any, Partial<SyncStorageRestriction>>(`/${platform}/profiles/${profileId}/restrictions/sync-storage`, restriction).then(res => res.data);
    },

    updateSyncStorageRestriction: (platform: Platform, profileId: string, restriction: Partial<SyncStorageRestriction>): Promise<SyncStorageRestriction> => {
        return apiClient.put<SyncStorageRestriction, any, Partial<SyncStorageRestriction>>(`/${platform}/profiles/${profileId}/restrictions/sync-storage`, restriction).then(res => res.data);
    },

    deleteSyncStorageRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/sync-storage`).then(() => { });
    },

    // Kiosk Restriction
    createKioskRestriction: (platform: Platform, profileId: string, restriction: Partial<KioskRestriction>): Promise<KioskRestriction> => {
        return apiClient.post<KioskRestriction, any, Partial<KioskRestriction>>(`/${platform}/profiles/${profileId}/restrictions/kiosk`, restriction).then(res => res.data);
    },

    updateKioskRestriction: (platform: Platform, profileId: string, restriction: Partial<KioskRestriction>): Promise<KioskRestriction> => {
        return apiClient.put<KioskRestriction, any, Partial<KioskRestriction>>(`/${platform}/profiles/${profileId}/restrictions/kiosk`, restriction).then(res => res.data);
    },

    deleteKioskRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/kiosk`).then(() => { });
    },

    // Location Restriction
    createLocationRestriction: (platform: Platform, profileId: string, restriction: Partial<LocationRestriction>): Promise<LocationRestriction> => {
        return apiClient.post<LocationRestriction, any, Partial<LocationRestriction>>(`/${platform}/profiles/${profileId}/restrictions/location`, restriction).then(res => res.data);
    },

    updateLocationRestriction: (platform: Platform, profileId: string, restriction: Partial<LocationRestriction>): Promise<LocationRestriction> => {
        return apiClient.put<LocationRestriction, any, Partial<LocationRestriction>>(`/${platform}/profiles/${profileId}/restrictions/location`, restriction).then(res => res.data);
    },

    deleteLocationRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/location`).then(() => { });
    },

    // Tethering Restriction
    createTetheringRestriction: (platform: Platform, profileId: string, restriction: Partial<TetheringRestriction>): Promise<TetheringRestriction> => {
        return apiClient.post<TetheringRestriction, any, Partial<TetheringRestriction>>(`/${platform}/profiles/${profileId}/restrictions/tethering`, restriction).then(res => res.data);
    },

    updateTetheringRestriction: (platform: Platform, profileId: string, restriction: Partial<TetheringRestriction>): Promise<TetheringRestriction> => {
        return apiClient.put<TetheringRestriction, any, Partial<TetheringRestriction>>(`/${platform}/profiles/${profileId}/restrictions/tethering`, restriction).then(res => res.data);
    },

    deleteTetheringRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/tethering`).then(() => { });
    },

    // Phone Restriction
    createPhoneRestriction: (platform: Platform, profileId: string, restriction: Partial<PhoneRestriction>): Promise<PhoneRestriction> => {
        return apiClient.post<PhoneRestriction, any, Partial<PhoneRestriction>>(`/${platform}/profiles/${profileId}/restrictions/phone`, restriction).then(res => res.data);
    },

    updatePhoneRestriction: (platform: Platform, profileId: string, restriction: Partial<PhoneRestriction>): Promise<PhoneRestriction> => {
        return apiClient.put<PhoneRestriction, any, Partial<PhoneRestriction>>(`/${platform}/profiles/${profileId}/restrictions/phone`, restriction).then(res => res.data);
    },

    deletePhoneRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/phone`).then(() => { });
    },

    // DateTime Restriction
    createDateTimeRestriction: (platform: Platform, profileId: string, restriction: Partial<DateTimeRestriction>): Promise<DateTimeRestriction> => {
        return apiClient.post<DateTimeRestriction, any, Partial<DateTimeRestriction>>(`/${platform}/profiles/${profileId}/restrictions/date-time`, restriction).then(res => res.data);
    },

    updateDateTimeRestriction: (platform: Platform, profileId: string, restriction: Partial<DateTimeRestriction>): Promise<DateTimeRestriction> => {
        return apiClient.put<DateTimeRestriction, any, Partial<DateTimeRestriction>>(`/${platform}/profiles/${profileId}/restrictions/date-time`, restriction).then(res => res.data);
    },

    deleteDateTimeRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/date-time`).then(() => { });
    },

    // Display Restriction
    createDisplayRestriction: (platform: Platform, profileId: string, restriction: Partial<DisplayRestriction>): Promise<DisplayRestriction> => {
        return apiClient.post<DisplayRestriction, any, Partial<DisplayRestriction>>(`/${platform}/profiles/${profileId}/restrictions/display`, restriction).then(res => res.data);
    },

    updateDisplayRestriction: (platform: Platform, profileId: string, restriction: Partial<DisplayRestriction>): Promise<DisplayRestriction> => {
        return apiClient.put<DisplayRestriction, any, Partial<DisplayRestriction>>(`/${platform}/profiles/${profileId}/restrictions/display`, restriction).then(res => res.data);
    },

    deleteDisplayRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/display`).then(() => { });
    },

    // Miscellaneous Restriction
    createMiscellaneousRestriction: (platform: Platform, profileId: string, restriction: Partial<MiscellaneousRestriction>): Promise<MiscellaneousRestriction> => {
        return apiClient.post<MiscellaneousRestriction, any, Partial<MiscellaneousRestriction>>(`/${platform}/profiles/${profileId}/restrictions/miscellaneous`, restriction).then(res => res.data);
    },

    updateMiscellaneousRestriction: (platform: Platform, profileId: string, restriction: Partial<MiscellaneousRestriction>): Promise<MiscellaneousRestriction> => {
        return apiClient.put<MiscellaneousRestriction, any, Partial<MiscellaneousRestriction>>(`/${platform}/profiles/${profileId}/restrictions/miscellaneous`, restriction).then(res => res.data);
    },

    deleteMiscellaneousRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/miscellaneous`).then(() => { });
    },

    // Applications Restriction
    createApplicationsRestriction: (platform: Platform, profileId: string, restriction: Partial<ApplicationsRestriction>): Promise<ApplicationsRestriction> => {
        return apiClient.post<ApplicationsRestriction, any, Partial<ApplicationsRestriction>>(`/${platform}/profiles/${profileId}/restrictions/applications`, restriction).then(res => res.data);
    },

    updateApplicationsRestriction: (platform: Platform, profileId: string, restriction: Partial<ApplicationsRestriction>): Promise<ApplicationsRestriction> => {
        return apiClient.put<ApplicationsRestriction, any, Partial<ApplicationsRestriction>>(`/${platform}/profiles/${profileId}/restrictions/applications`, restriction).then(res => res.data);
    },

    deleteApplicationsRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/applications`).then(() => { });
    },

    // Network Restriction
    createNetworkRestriction: (platform: Platform, profileId: string, restriction: Partial<NetworkRestriction>): Promise<NetworkRestriction> => {
        return apiClient.post<NetworkRestriction, any, Partial<NetworkRestriction>>(`/${platform}/profiles/${profileId}/restrictions/network`, restriction).then(res => res.data);
    },

    updateNetworkRestriction: (platform: Platform, profileId: string, restriction: Partial<NetworkRestriction>): Promise<NetworkRestriction> => {
        return apiClient.put<NetworkRestriction, any, Partial<NetworkRestriction>>(`/${platform}/profiles/${profileId}/restrictions/network`, restriction).then(res => res.data);
    },

    deleteNetworkRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/network`).then(() => { });
    },

    // Connectivity Restriction
    createConnectivityRestriction: (platform: Platform, profileId: string, restriction: Partial<ConnectivityRestriction>): Promise<ConnectivityRestriction> => {
        return apiClient.post<ConnectivityRestriction, any, Partial<ConnectivityRestriction>>(`/${platform}/profiles/${profileId}/restrictions/connectivity`, restriction).then(res => res.data);
    },

    updateConnectivityRestriction: (platform: Platform, profileId: string, restriction: Partial<ConnectivityRestriction>): Promise<ConnectivityRestriction> => {
        return apiClient.put<ConnectivityRestriction, any, Partial<ConnectivityRestriction>>(`/${platform}/profiles/${profileId}/restrictions/connectivity`, restriction).then(res => res.data);
    },

    deleteConnectivityRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/connectivity`).then(() => { });
    },

    // Passcode Restriction
    // 1) Legacy/profile-scoped APIs (kept intact)
    createPasscodeRestriction: (
        platform: Platform,
        profileId: string,
        restriction: PasscodeRestrictionPolicyReq
    ): Promise<PasscodeRestrictionAudit> => {
        return apiClient.post<PasscodeRestrictionAudit, any, PasscodeRestrictionPolicyReq>(`/${platform}/profiles/${profileId}/restrictions/passcode`, restriction).then(res => res.data);
    },

    updatePasscodeRestriction: (
        platform: Platform,
        profileId: string,
        restriction: PasscodeRestrictionPolicyReq
    ): Promise<PasscodeRestrictionAudit> => {
        return apiClient.put<PasscodeRestrictionAudit, any, PasscodeRestrictionPolicyReq>(`/${platform}/profiles/${profileId}/restrictions/passcode`, restriction).then(res => res.data);
    },

    deletePasscodeRestriction: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/restrictions/passcode`).then(() => { });
    },

    // 2) New global-scope APIs per spec (distinct names)
    createPasscodeRestrictionGlobal: (data: {
        complexity: string;
        minLength: number;
        minUpperCase: number;
        minLowerCase: number;
        minSymbols: number;
        minDigits: number;
    }): Promise<any> => {
        return apiClient.post(`/passcode-restrictions`, data).then(res => res.data);
    },

    updatePasscodeRestrictionGlobal: (
        id: string,
        data: {
            complexity: string;
            minLength: number;
            minUpperCase: number;
            minLowerCase: number;
            minSymbols: number;
            minDigits: number;
        }
    ): Promise<any> => {
        return apiClient.put(`/passcode-restrictions/${id}`, data).then(res => res.data);
    },

    deletePasscodeRestrictionGlobal: (id: string): Promise<void> => {
        return apiClient.delete(`/passcode-restrictions/${id}`).then(() => { });
    },

    // Get all passcode restrictions (paginated)
    getPasscodeRestrictions: (): Promise<PaginatedPasscodeRestrictionAuditList> => {
        return apiClient.get<any>('/passcode-restrictions').then((res) => {
            const data = res.data;
            if (!data) {
                return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 };
            }
            // API returns { page: { number, size, totalElements, totalPages }, content: [...] }
            if (data.page && Array.isArray(data.content)) {
                return {
                    number: data.page.number ?? 0,
                    size: data.page.size ?? data.content.length ?? 0,
                    totalElements: data.page.totalElements ?? data.content.length ?? 0,
                    totalPages: data.page.totalPages ?? 1,
                    content: data.content ?? [],
                } as PaginatedPasscodeRestrictionAuditList;
            }
            // Fallback if backend returns array directly
            const list = Array.isArray(data) ? data : [];
            return {
                number: 0,
                size: list.length,
                totalElements: list.length,
                totalPages: 1,
                content: list,
            } as PaginatedPasscodeRestrictionAuditList;
        });
    },

    // Get passcode restriction by ID
    getPasscodeRestriction: (restrictionId: string): Promise<PasscodeRestrictionAudit> => {
        return apiClient.get<PasscodeRestrictionAudit>(`/passcode-restrictions/${restrictionId}`).then(res => res.data);
    },

    // Create standalone passcode policy
    createPasscodePolicy: (policy: Partial<PasscodeRestrictionCore>): Promise<PasscodeRestrictionAudit> => {
        return apiClient.post<PasscodeRestrictionAudit, any, Partial<PasscodeRestrictionCore>>('/passcode-policies', policy).then(res => res.data);
    },

    // Update standalone passcode policy
    updatePasscodePolicy: (policyId: string, policy: Partial<PasscodeRestrictionCore>): Promise<PasscodeRestrictionAudit> => {
        return apiClient.put<PasscodeRestrictionAudit, any, Partial<PasscodeRestrictionCore>>(`/passcode-policies/${policyId}`, policy).then(res => res.data);
    },

    // Delete standalone passcode policy
    deletePasscodePolicy: (policyId: string): Promise<void> => {
        return apiClient.delete(`/passcode-policies/${policyId}`).then(() => { });
    },
};

export default restrictionAPI;