import { Pageable, PagedResponse, Platform, PaginatedCustomRepoList, CustomRepository, ApplicationUnion } from '@/types/models';
import apiClient from '../client';

/**
 * RepositoryService - UEM Apps APIs
 * 
 * Contains APIs tagged with "UEM Apps" in OpenAPI spec:
 * - Custom Repositories (CRUD)
 * - Applications in Repositories
 * - Application Download
 * - Patch Management
 * - Application Versions
 */

// Type definitions for patch info
export interface PatchInfo {
    id?: string;
    name: string;
    description?: string;
    applicationId: string;
    version?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginatedPatchList {
    content: PatchInfo[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const RepositoryService = {
    // ============================================
    // Custom Repository APIs
    // ============================================

    // GET /{platform}/repository - List all custom repos
    getCustomRepositories: async (
        platform: Platform,
        pageable?: Pageable
    ): Promise<PaginatedCustomRepoList> => {
        const params: Record<string, any> = {};
        if (pageable?.pageNumber !== undefined) params.pageNumber = pageable.pageNumber;
        if (pageable?.pageSize !== undefined) params.pageSize = pageable.pageSize;
        if (pageable?.sort) params.sort = pageable.sort;

        const response = await apiClient.get<PaginatedCustomRepoList>(
            `/${platform}/repository`,
            { params }
        );
        return response.data;
    },

    // POST /{platform}/repository - Create a custom Repository
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

    // DELETE /{platform}/repository/{customRepoId} - Delete Custom Repository (deprecated but UEM tagged)
    deleteCustomRepository: async (
        platform: Platform,
        customRepoId: string
    ): Promise<void> => {
        await apiClient.delete(`/${platform}/repository/${customRepoId}`);
    },

    // ============================================
    // Application APIs
    // ============================================

    // GET /{platform}/repository/{customRepoId}/applications - List Applications in repository
    getRepositoryApplications: async (
        platform: Platform,
        customRepoId: string,
        pageable?: Pageable,
        searchTerm?: string
    ): Promise<PagedResponse<ApplicationUnion>> => {
        const params: Record<string, any> = {};
        if (pageable?.pageNumber !== undefined) params.pageNumber = pageable.pageNumber;
        if (pageable?.pageSize !== undefined) params.pageSize = pageable.pageSize;
        if (pageable?.sort) params.sort = pageable.sort;
        if (searchTerm) params.searchTerm = searchTerm;

        const response = await apiClient.get<PagedResponse<ApplicationUnion>>(
            `/${platform}/repository/${customRepoId}/applications`,
            { params }
        );
        return response.data;
    },

    // POST /{platform}/repository/{customRepoId}/applications - Store An Application in Repository
    createApplication: async (
        platform: Platform,
        customRepoId: string,
        applicationData: FormData | any
    ): Promise<ApplicationUnion> => {
        const response = await apiClient.post<ApplicationUnion>(
            `/${platform}/repository/${customRepoId}/applications`,
            applicationData,
            {
                headers: {
                    'Content-Type': applicationData instanceof FormData ? 'multipart/form-data' : 'application/json'
                }
            }
        );
        return response.data;
    },

    // GET /{platform}/repository/{customRepoId}/applications/{applicationId}:download - Download Application
    downloadApplication: async (
        platform: Platform,
        customRepoId: string,
        applicationId: string
    ): Promise<Blob> => {
        const response = await apiClient.get(
            `/${platform}/repository/${customRepoId}/applications/${applicationId}:download`,
            { responseType: 'blob' }
        );
        return response.data;
    },

    // GET /{platform}/repository/{customRepoId}/applications/{applicationId}/versions/{versionId} - Get Application Version
    getApplicationVersion: async (
        platform: Platform,
        customRepoId: string,
        applicationId: string,
        versionId: string
    ): Promise<ApplicationUnion> => {
        const response = await apiClient.get<ApplicationUnion>(
            `/${platform}/repository/${customRepoId}/applications/${applicationId}/versions/${versionId}`
        );
        return response.data;
    },

    // ============================================
    // Patch Management APIs
    // ============================================

    // GET /{platform}/repository/{customRepoId}/patches - Get all patch Info
    getPatches: async (
        platform: Platform,
        customRepoId: string,
        pageable?: Pageable
    ): Promise<PaginatedPatchList> => {
        const params: Record<string, any> = {};
        if (pageable?.pageNumber !== undefined) params.pageNumber = pageable.pageNumber;
        if (pageable?.pageSize !== undefined) params.pageSize = pageable.pageSize;
        if (pageable?.sort) params.sort = pageable.sort;

        const response = await apiClient.get<PaginatedPatchList>(
            `/${platform}/repository/${customRepoId}/patches`,
            { params }
        );
        return response.data;
    },

    // POST /{platform}/repository/{customRepoId}/patches - Create patch info
    createPatch: async (
        platform: Platform,
        customRepoId: string,
        patchData: Partial<PatchInfo>
    ): Promise<PatchInfo> => {
        const response = await apiClient.post<PatchInfo>(
            `/${platform}/repository/${customRepoId}/patches`,
            patchData
        );
        return response.data;
    },

    // GET /{platform}/repository/{customRepoId}/patches/{patchId} - Get patch
    getPatch: async (
        platform: Platform,
        customRepoId: string,
        patchId: string
    ): Promise<PatchInfo> => {
        const response = await apiClient.get<PatchInfo>(
            `/${platform}/repository/${customRepoId}/patches/${patchId}`
        );
        return response.data;
    },

    // PUT /{platform}/repository/{customRepoId}/patches/{patchId} - Update patch info
    updatePatch: async (
        platform: Platform,
        customRepoId: string,
        patchId: string,
        patchData: Partial<PatchInfo>
    ): Promise<PatchInfo> => {
        const response = await apiClient.put<PatchInfo>(
            `/${platform}/repository/${customRepoId}/patches/${patchId}`,
            patchData
        );
        return response.data;
    },

    // DELETE /{platform}/repository/{customRepoId}/patches/{patchId} - Delete patch info
    deletePatch: async (
        platform: Platform,
        customRepoId: string,
        patchId: string
    ): Promise<void> => {
        await apiClient.delete(`/${platform}/repository/${customRepoId}/patches/${patchId}`);
    },

    // GET /{platform}/repository/{customRepoId}/applications/{applicationId}/patches - Get patches for an application
    getApplicationPatches: async (
        platform: Platform,
        customRepoId: string,
        applicationId: string
    ): Promise<PatchInfo[]> => {
        const response = await apiClient.get<PatchInfo[]>(
            `/${platform}/repository/${customRepoId}/applications/${applicationId}/patches`
        );
        return response.data;
    },

    // ============================================
    // Device-related APIs (UEM Apps tagged)
    // ============================================

    // GET /{platform}/devices/repos - Get all repositories in devices
    getDeviceRepos: async (platform: Platform): Promise<PaginatedCustomRepoList> => {
        const response = await apiClient.get<PaginatedCustomRepoList>(
            `/${platform}/devices/repos`
        );
        return response.data;
    },
};
