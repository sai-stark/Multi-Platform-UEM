import {
    MobileApplication,
    Pageable,
    PagedResponse
} from '@/types/models';
import apiClient from '../client';

export const MobileApplicationService = {
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

    // Note: Repository App methods will be moved to repository.ts or kept here? 
    // The spec has them under 'UEM Apps' tag, often related to custom repo.
    // Keeping Basic get for now, but main repo logic goes to RepositoryService.
};
