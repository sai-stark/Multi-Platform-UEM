import {
    MobileApplication,
    Pageable,
    PagedResponse,
    Platform,
    WebApplication
} from '@/types/models';
import apiClient from '../client';

export const ApplicationService = {
    // Mobile Applications
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

    // Web Applications
    getWebApplications: async (pageable?: Pageable, search?: string) => {
        const params = { ...pageable, search };
        const response = await apiClient.get<PagedResponse<WebApplication>>('/web-applications', { params });
        return response.data;
    },

    createWebApplication: async (data: any) => {
        const response = await apiClient.post<WebApplication>('/web-applications', data);
        return response.data;
    },

    updateWebApplication: async (applicationId: string, data: any) => {
        const response = await apiClient.put<WebApplication>(`/web-applications/${applicationId}`, data);
        return response.data;
    },

    deleteWebApplication: async (applicationId: string) => {
        await apiClient.delete(`/web-applications/${applicationId}`);
    },

    // Repo Apps
    getRepositoryApplications: async (platform: Platform, repoId: string, pageable?: Pageable, search?: string) => {
        const params = { ...pageable, searchTerm: search };
        const response = await apiClient.get<PagedResponse<MobileApplication>>(`/${platform}/repository/${repoId}/applications`, { params });
        return response.data;
    }
};
