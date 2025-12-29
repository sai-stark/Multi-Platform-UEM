import { CustomRepo, Pageable, PagedResponse, PatchInfo, PatchRequest, Platform } from '@/types/models';

// Mock Data Store
let mockRepos: CustomRepo[] = [
    { id: '1', name: 'Ubuntu Main', url: 'http://archive.ubuntu.com/ubuntu', type: 'APT', platform: 'linux' },
    { id: '2', name: 'CentOS Base', url: 'http://mirror.centos.org/centos', type: 'YUM', platform: 'linux' },
    { id: '3', name: 'Windows Update', url: 'https://update.microsoft.com', type: 'GENERIC', platform: 'windows' },
    { id: '4', name: 'Internal Android Apps', url: 'https://repo.internal.com/android', type: 'GENERIC', platform: 'android' },
];

let mockPatches: PatchInfo[] = [
    { id: '101', name: 'Security Patch 2024-01', version: '1.0.1', description: 'Critical security fix', severity: 'CRITICAL', releaseDate: '2024-01-15' },
    { id: '102', name: 'Feature Update', version: '1.1.0', description: 'New features', severity: 'LOW', releaseDate: '2024-02-01' }
];

const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export const RepositoryService = {
    // --- Custom Repositories ---

    getAllRepositories: async (pageable: Pageable) => {
        await simulateDelay();
        // Simple search implementation if needed, for now just return all
        return {
            content: [...mockRepos],
            pageable: {
                pageNumber: pageable.page || 0,
                pageSize: pageable.size || 20,
                sort: { empty: true, sorted: false, unsorted: true },
                offset: 0,
                paged: true,
                unpaged: false
            },
            last: true,
            totalPages: 1,
            totalElements: mockRepos.length,
            first: true,
            size: mockRepos.length,
            number: 0,
            sort: { empty: true, sorted: false, unsorted: true },
            numberOfElements: mockRepos.length,
            empty: mockRepos.length === 0
        } as PagedResponse<CustomRepo>;
    },

    getRepository: async (id: string) => {
        await simulateDelay();
        return mockRepos.find(r => r.id === id);
    },

    createRepository: async (repo: CustomRepo) => {
        await simulateDelay();
        const newRepo = { ...repo, id: Math.random().toString(36).substr(2, 9) };
        mockRepos.push(newRepo);
        return newRepo;
    },

    updateRepository: async (id: string, repo: CustomRepo) => {
        await simulateDelay();
        mockRepos = mockRepos.map(r => r.id === id ? { ...repo, id } : r);
        return repo;
    },

    deleteRepository: async (id: string) => {
        await simulateDelay();
        mockRepos = mockRepos.filter(r => r.id !== id);
    },

    // --- Patches ---

    getPatches: async (repositoryId: string, pageable: Pageable) => {
        await simulateDelay();
        return {
            content: [...mockPatches],
            pageable: {
                pageNumber: 0,
                pageSize: 20,
                sort: { empty: true, sorted: false, unsorted: true },
                offset: 0,
                paged: true,
                unpaged: false
            },
            totalElements: mockPatches.length,
            totalPages: 1,
            last: true,
            first: true,
            size: mockPatches.length,
            number: 0,
            numberOfElements: mockPatches.length,
            empty: false,
            sort: { empty: true, sorted: false, unsorted: true }
        } as PagedResponse<PatchInfo>;
    },

    uploadPatch: async (repositoryId: string, patch: PatchRequest) => {
        await simulateDelay();
        const newPatch: PatchInfo = {
            id: Math.random().toString(36).substr(2, 9),
            name: patch.name,
            version: patch.version,
            description: 'Uploaded patch',
            severity: 'MEDIUM',
            releaseDate: new Date().toISOString().split('T')[0]
        };
        mockPatches.push(newPatch);
        return newPatch;
    },

    deletePatch: async (repositoryId: string, patchId: string) => {
        await simulateDelay();
        mockPatches = mockPatches.filter(p => p.id !== patchId);
    },

    // Applications in Repository
    addApplicationToRepository: async (repositoryId: string, file: File, platform: Platform) => {
        await simulateDelay();
        return { success: true, message: "Application added (mock)" };
    }
};
