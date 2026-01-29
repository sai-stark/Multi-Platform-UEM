import {
    MobileApplication,
    Pageable,
    PagedResponse,
    Platform
} from '@/types/models';
import apiClient from '../client';

/**
 * ApplicationService - Application tag APIs
 * 
 * Service for Mobile Application Management
 * Contains all APIs tagged with "Application" in OpenAPI spec
 */

// App Action types
export type AppActionType = 'MANDATORY' | 'BLOCKED' | 'OPTIONAL';

export interface AppAction {
    action: AppActionType;
}

// Application version with extended details
export interface ApplicationVersion {
    id: string;
    version: string;
    versionCode?: string;
    versionName?: string;
    fileSize?: number;
    createdAt?: string;
    action?: AppActionType;
    deviceCount?: number;
    profileCount?: number;
    isProduction?: boolean;
    url?: string;
    trackIds?: string[];
    isMandatory?: boolean;
    isBlocked?: boolean;
}

// Application permission
export interface ApplicationPermission {
    permissionId: string;
    name?: string;
    description?: string;
}

// Device with application installed
export interface ApplicationDevice {
    id: string;
    deviceName: string;
    serialNumber?: string;
    model?: string;
    osVersion?: string;
    appVersion?: string;
    installedAt?: string;
}

// Extended Application type with versions
export interface Application extends MobileApplication {
    versions?: ApplicationVersion[];
    action?: AppActionType;
    author?: string;
    category?: string;
    contentRating?: string;
    description?: string;
    appTracks?: Array<{ trackId: string; trackAlias: string }>;
    isMandatory?: boolean;
    isBlocked?: boolean;
}

export const ApplicationService = {
    // ============================================
    // Mobile Application CRUD APIs
    // ============================================

    // GET /{platform}/applications - List Mobile Applications
    getApplications: async (
        platform: Platform,
        pageable?: Pageable,
        filter?: { name?: string; ids?: string[] }
    ): Promise<PagedResponse<Application>> => {
        const params: Record<string, any> = {};
        if (pageable?.page !== undefined) params.page = pageable.page;
        if (pageable?.size !== undefined) params.size = pageable.size;
        if (pageable?.sort) params.sort = pageable.sort;
        if (filter) params.applicationFilter = JSON.stringify(filter);

        const response = await apiClient.get<PagedResponse<Application>>(
            `/${platform}/applications`,
            { params }
        );
        return response.data;
    },

    // POST /{platform}/applications - Create Mobile Application
    createApplication: async (
        platform: Platform,
        applicationData: FormData | Partial<Application>
    ): Promise<Application> => {
        const isFormData = applicationData instanceof FormData;
        const response = await apiClient.post<Application>(
            `/${platform}/applications`,
            applicationData,
            isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
        );
        return response.data;
    },

    // GET /{platform}/applications/{applicationId} - Get Mobile Application
    getApplication: async (
        platform: Platform,
        applicationId: string
    ): Promise<Application> => {
        const response = await apiClient.get<Application>(
            `/${platform}/applications/${applicationId}`
        );
        return response.data;
    },

    // DELETE /{platform}/applications/{applicationId} - Delete Mobile Application
    deleteApplication: async (
        platform: Platform,
        applicationId: string
    ): Promise<void> => {
        await apiClient.delete(`/${platform}/applications/${applicationId}`);
    },

    // ============================================
    // Application Action APIs
    // ============================================

    // POST /{platform}/applications/{applicationId}/:action - Set Application Action
    setApplicationAction: async (
        platform: Platform,
        applicationId: string,
        action: AppAction
    ): Promise<Application> => {
        const response = await apiClient.post<Application>(
            `/${platform}/applications/${applicationId}/:action`,
            action
        );
        return response.data;
    },

    // ============================================
    // Application Version APIs
    // ============================================

    // DELETE /{platform}/applications/{applicationId}/versions/{appVersionId} - Delete Mobile Application version
    deleteApplicationVersion: async (
        platform: Platform,
        applicationId: string,
        appVersionId: string
    ): Promise<void> => {
        await apiClient.delete(
            `/${platform}/applications/${applicationId}/versions/${appVersionId}`
        );
    },

    // POST /{platform}/applications/{applicationId}/versions/{appVersionId}/:action - Set Application Version Action
    setApplicationVersionAction: async (
        platform: Platform,
        applicationId: string,
        appVersionId: string,
        action: AppAction
    ): Promise<Application> => {
        const response = await apiClient.post<Application>(
            `/${platform}/applications/${applicationId}/versions/${appVersionId}/:action`,
            action
        );
        return response.data;
    },
};
