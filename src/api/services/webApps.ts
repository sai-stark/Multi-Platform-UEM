import {
    Pageable,
    PagedResponse,
    WebApplication
} from '@/types/models';
import apiClient from '../client';

export const WebApplicationService = {
    getWebApplications: async (pageable?: Pageable, search?: string) => {
        const params = { ...pageable, search };
        const response = await apiClient.get<PagedResponse<WebApplication>>('/web-applications', { params });
        return response.data;
    },

    getWebApplication: async (applicationId: string) => {
        const response = await apiClient.get<WebApplication>(`/web-applications/${applicationId}`);
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
    }
};
