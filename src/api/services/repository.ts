import { CustomRepo, Pageable, PagedResponse, PatchInfo, PatchRequest, Platform } from '@/types/models';
import apiClient from '../client';

export const RepositoryService = {
    // --- Custom Repositories ---

    getAllRepositories: async (pageable: Pageable) => {
        const response = await apiClient.get<PagedResponse<CustomRepo>>('/repository', { params: pageable });
        return response.data;
    },

    getRepository: async (id: string) => {
        const response = await apiClient.get<CustomRepo>(`/repository/${id}`);
        return response.data;
    },

    createRepository: async (repo: CustomRepo) => {
        const response = await apiClient.post('/repository', repo);
        return response.data;
    },

    updateRepository: async (id: string, repo: CustomRepo) => {
        const response = await apiClient.put(`/repository/${id}`, repo);
        return response.data;
    },

    deleteRepository: async (id: string) => {
        await apiClient.delete(`/repository/${id}`);
    },

    // --- Patches ---

    getPatches: async (repositoryId: string, pageable: Pageable) => {
        const response = await apiClient.get<PagedResponse<PatchInfo>>(`/repository/${repositoryId}/patches`, { params: pageable });
        return response.data;
    },

    uploadPatch: async (repositoryId: string, patch: PatchRequest) => {
        const formData = new FormData();
        formData.append('name', patch.name);
        formData.append('version', patch.version);
        if (patch.file) {
            formData.append('file', patch.file);
        }

        const response = await apiClient.post(`/repository/${repositoryId}/patches`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deletePatch: async (repositoryId: string, patchId: string) => {
        await apiClient.delete(`/repository/${repositoryId}/patches/${patchId}`);
    },

    // Applications in Repository
    addApplicationToRepository: async (repositoryId: string, file: File, platform: Platform) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('platform', platform);

        const response = await apiClient.post(`/repository/${repositoryId}/applications`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
