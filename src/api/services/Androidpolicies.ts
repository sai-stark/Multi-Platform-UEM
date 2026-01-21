import {
    CommonSettingsPolicy,
    DeviceThemePolicy,
    EnrollmentPolicy,
    ApplicationPolicy,
    WebApplicationPolicy,
} from '@/types/policy';
import { Platform } from '@/types/models';
import apiClient from '../client';

// Policy API
export const policyAPI = {
    // Common Settings Policy
    createCommonSettingsPolicy: (platform: Platform, profileId: string, policy: Partial<CommonSettingsPolicy>): Promise<CommonSettingsPolicy> => {
        return apiClient.post<CommonSettingsPolicy, any, Partial<CommonSettingsPolicy>>(`/${platform}/profiles/${profileId}/policies/common-settings`, policy).then(res => res.data);
    },

    updateCommonSettingsPolicy: (platform: Platform, profileId: string, policy: Partial<CommonSettingsPolicy>): Promise<CommonSettingsPolicy> => {
        return apiClient.put<CommonSettingsPolicy, any, Partial<CommonSettingsPolicy>>(`/${platform}/profiles/${profileId}/policies/common-settings`, policy).then(res => res.data);
    },

    deleteCommonSettingsPolicy: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/policies/common-settings`).then(() => { });
    },

    // Device Theme Policy
    createDeviceThemePolicy: (platform: Platform, profileId: string, policy: Partial<DeviceThemePolicy>): Promise<DeviceThemePolicy> => {
        return apiClient.post<DeviceThemePolicy, any, Partial<DeviceThemePolicy>>(`/${platform}/profiles/${profileId}/policies/device-theme`, policy).then(res => res.data);
    },

    updateDeviceThemePolicy: (platform: Platform, profileId: string, policy: Partial<DeviceThemePolicy>): Promise<DeviceThemePolicy> => {
        return apiClient.put<DeviceThemePolicy, any, Partial<DeviceThemePolicy>>(`/${platform}/profiles/${profileId}/policies/device-theme`, policy).then(res => res.data);
    },

    deleteDeviceThemePolicy: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/policies/device-theme`).then(() => { });
    },

    // Enrollment Policy
    createEnrollmentPolicy: (platform: Platform, profileId: string, policy: Partial<EnrollmentPolicy>): Promise<EnrollmentPolicy> => {
        return apiClient.post<EnrollmentPolicy, any, Partial<EnrollmentPolicy>>(`/${platform}/profiles/${profileId}/policies/enrollment`, policy).then(res => res.data);
    },

    updateEnrollmentPolicy: (platform: Platform, profileId: string, policy: Partial<EnrollmentPolicy>): Promise<EnrollmentPolicy> => {
        return apiClient.put<EnrollmentPolicy, any, Partial<EnrollmentPolicy>>(`/${platform}/profiles/${profileId}/policies/enrollment`, policy).then(res => res.data);
    },

    deleteEnrollmentPolicy: (platform: Platform, profileId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/policies/enrollment`).then(() => { });
    },

    // Application Policy
    createApplicationPolicy: (platform: Platform, profileId: string, policy: Partial<ApplicationPolicy>): Promise<ApplicationPolicy> => {
        return apiClient.post<ApplicationPolicy, any, Partial<ApplicationPolicy>>(`/${platform}/profiles/${profileId}/policies/applications`, policy).then(res => res.data);
    },

    updateApplicationPolicy: (platform: Platform, profileId: string, applicationPolicyId: string, policy: Partial<ApplicationPolicy>): Promise<ApplicationPolicy> => {
        return apiClient.put<ApplicationPolicy, any, Partial<ApplicationPolicy>>(`/${platform}/profiles/${profileId}/policies/applications/${applicationPolicyId}`, policy).then(res => res.data);
    },

    deleteApplicationPolicy: (platform: Platform, profileId: string, applicationPolicyId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/policies/applications/${applicationPolicyId}`).then(() => { });
    },

    // Web Application Policy
    createWebApplicationPolicy: (platform: Platform, profileId: string, policy: Partial<WebApplicationPolicy>): Promise<WebApplicationPolicy> => {
        return apiClient.post<WebApplicationPolicy, any, Partial<WebApplicationPolicy>>(`/${platform}/profiles/${profileId}/policies/web-applications`, policy).then(res => res.data);
    },

    updateWebApplicationPolicy: (platform: Platform, profileId: string, webApplicationPolicyId: string, policy: Partial<WebApplicationPolicy>): Promise<WebApplicationPolicy> => {
        return apiClient.put<WebApplicationPolicy, any, Partial<WebApplicationPolicy>>(`/${platform}/profiles/${profileId}/policies/web-applications/${webApplicationPolicyId}`, policy).then(res => res.data);
    },

    deleteWebApplicationPolicy: (platform: Platform, profileId: string, webApplicationPolicyId: string): Promise<void> => {
        return apiClient.delete(`/${platform}/profiles/${profileId}/policies/web-applications/${webApplicationPolicyId}`).then(() => { });
    },

};

export default policyAPI;