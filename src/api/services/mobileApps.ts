import {
    MobileApplication,
    Pageable,
    PagedResponse,
    Platform
} from '@/types/models';
import apiClient from '../client';

// Device Application types based on OpenAPI spec
export interface DeviceApplication {
    appId: string;
    name: string;
    packageName: string;
    appVersionId: string;
    appVersion: string;
    isInstalled?: boolean;
    isExpected?: boolean;
    applicationType?: 'DeviceAndroidApplication' | 'DeviceIosApplication';
}

export const MobileApplicationService = {
    // Mobile Applications (legacy /androidmdm endpoint)
    getMobileApplications: async (pageable?: Pageable, search?: string) => {
        const params = { ...pageable, search };
        const response = await apiClient.get<PagedResponse<MobileApplication>>('/androidmdm/applications', { params });
        return response.data;
    },

    getMobileApplication: async (applicationId: string) => {
        const response = await apiClient.get<MobileApplication>(`/androidmdm/applications/${applicationId}`);
        return response.data;
    },

    createMobileApplication: async (data: any) => {
        const response = await apiClient.post<MobileApplication>('/androidmdm/applications', data);
        return response.data;
    },

    deleteMobileApplication: async (applicationId: string) => {
        await apiClient.delete(`/androidmdm/applications/${applicationId}`);
    },

    // Platform-specific applications - GET /{platform}/applications
    // This endpoint gets the list of applications available for a platform
    getApplications: async (
        platform: Platform,
        params?: { 
            deviceId?: string;
            NameAndIdFilter?: { name?: string; ids?: string[] };
        }
    ): Promise<DeviceApplication[]> => {
        const response = await apiClient.get<DeviceApplication[]>(
            `/${platform}/applications`,
            { params }
        );
        return response.data;
    },

    // Note: Repository App methods will be moved to repository.ts or kept here? 
    // The spec has them under 'UEM Apps' tag, often related to custom repo.
    // Keeping Basic get for now, but main repo logic goes to RepositoryService.
};
