import { Pageable, PagedResponse, Platform, PaginatedCustomRepoList, CustomRepository, ApplicationUnion } from '@/types/models';
import apiClient from '../client';

export const RepositoryService = {
    // --- Custom Repositories (GET /{platform}/repository) ---
    
    getCustomRepositories: async (
        platform: Platform,
        pageable?: Pageable
    ): Promise<PaginatedCustomRepoList> => {
        const params: Record<string, any> = {};
        if (pageable?.page !== undefined) params.page = pageable.page;
        if (pageable?.size !== undefined) params.size = pageable.size;
        if (pageable?.sort) params.sort = pageable.sort;

        const response = await apiClient.get<PaginatedCustomRepoList>(
            `/${platform}/repository`,
            { params }
        );
        return response.data;
    },

    createCustomRepository: async (
        platform: Platform,
        repository: CustomRepository
    ): Promise<CustomRepository> => {
        const response = await apiClient.post<CustomRepository>(
            `/${platform}/repository`,
            repository
        );
        return response.data;
    },

    getRepositoryApplications: async (
        platform: Platform,
        customRepoId: string,
        pageable?: Pageable
    ): Promise<PagedResponse<ApplicationUnion>> => {
        const params: Record<string, any> = {};
        if (pageable?.page !== undefined) params.page = pageable.page;
        if (pageable?.size !== undefined) params.size = pageable.size;
        if (pageable?.sort) params.sort = pageable.sort;

        const response = await apiClient.get<PagedResponse<ApplicationUnion>>(
            `/${platform}/repository/${customRepoId}/applications`,
            { params }
        );
        return response.data;
    },
};
