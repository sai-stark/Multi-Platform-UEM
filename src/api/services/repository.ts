import { CustomRepo, Pageable, PagedResponse, PatchInfo, PatchRequest, Platform, PaginatedCustomRepoList, CustomRepository, ApplicationUnion, MobileApplication, WindowsApplication, LinuxApplication, DmgApplication } from '@/types/models';
import apiClient from '../client';

// Mock Data Store (for legacy/fallback)
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

// Mock custom repositories matching API spec for GET /{platform}/repository
const mockCustomRepos: Record<Platform, CustomRepository[]> = {
    android: [
        {
            repoType: 'CustomAndroidFileRepo',
            id: 'android-repo-1',
            name: 'Corporate Android Apps',
            creationTime: '2024-01-15T10:00:00Z',
            modificationTime: '2024-01-20T14:30:00Z',
            createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            lastModifiedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
        {
            repoType: 'CustomAndroidFileRepo',
            id: 'android-repo-2',
            name: 'Internal Testing Repository',
            creationTime: '2024-02-01T09:00:00Z',
            modificationTime: '2024-02-05T11:15:00Z',
            createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            lastModifiedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
    ],
    ios: [],
    windows: [
        {
            repoType: 'CustomWindowsRepo',
            id: 'win-repo-1',
            name: 'Corporate Software Repository',
            creationTime: '2024-01-10T08:00:00Z',
            modificationTime: '2024-01-22T16:30:00Z',
            createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            lastModifiedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
        {
            repoType: 'CustomWindowsRepo',
            id: 'win-repo-2',
            name: 'Internal Tools Repository',
            creationTime: '2024-01-05T12:00:00Z',
            modificationTime: '2024-01-18T10:45:00Z',
            createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            lastModifiedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
        {
            repoType: 'CustomCommonFileRepo',
            id: 'common-repo-1',
            name: 'Shared Application Repository',
            creationTime: '2024-01-12T11:30:00Z',
            modificationTime: '2024-01-21T15:20:00Z',
            createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            lastModifiedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
    ],
    linux: [
        {
            customUbuntuRepo: {
                id: 'ubuntu-repo-1',
                name: 'Corporate Ubuntu Repository',
                components: ['main', 'restricted', 'universe'],
                architectures: ['amd64', 'arm64'],
                creationTime: '2024-01-15T10:00:00Z',
                modificationTime: '2024-01-20T14:30:00Z',
                createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                lastModifiedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
            repoType: 'CustomUbuntuRepo',
        },
        {
            customUbuntuRepo: {
                id: 'ubuntu-repo-2',
                name: 'Ubuntu Security Updates',
                components: ['main'],
                architectures: ['amd64'],
                creationTime: '2024-01-10T09:00:00Z',
                modificationTime: '2024-01-22T11:15:00Z',
                createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                lastModifiedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
            repoType: 'CustomUbuntuRepo',
        },
        {
            customRpmRepo: {
                id: 'rpm-repo-1',
                name: 'Corporate RPM Repository',
                creationTime: '2024-01-08T13:45:00Z',
                modificationTime: '2024-01-19T10:10:00Z',
                createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                lastModifiedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
            repoType: 'CustomRpmRepo',
        },
        {
            customRpmRepo: {
                id: 'rpm-repo-2',
                name: 'CentOS Base Repository',
                creationTime: '2024-01-14T10:00:00Z',
                modificationTime: '2024-01-23T12:00:00Z',
                createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                lastModifiedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
            repoType: 'CustomRpmRepo',
        },
    ],
    macos: [
        {
            repoType: 'CustomMacOsFileRepo',
            id: 'macos-repo-1',
            name: 'Corporate macOS Applications',
            creationTime: '2024-01-02T08:15:00Z',
            modificationTime: '2024-01-16T16:50:00Z',
            createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            lastModifiedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
    ],
};

export const RepositoryService = {
    // --- Custom Repositories (GET /{platform}/repository) ---
    
    getCustomRepositories: async (
        platform: Platform,
        pageable?: Pageable
    ): Promise<PaginatedCustomRepoList> => {
        await simulateDelay();
        
        // Return mock data matching API spec structure
        const repos = mockCustomRepos[platform] || [];
        
        const pageNumber = pageable?.page || 0;
        const pageSize = pageable?.size || 10;
        const startIndex = pageNumber * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedContent = repos.slice(startIndex, endIndex);
        const totalPages = Math.ceil(repos.length / pageSize);
        
        return {
            page: {
                number: pageNumber,
                size: pageSize,
                totalElements: repos.length,
                totalPages: totalPages,
            },
            content: paginatedContent,
        };
    },

    createCustomRepository: async (
        platform: Platform,
        repository: CustomRepository
    ): Promise<CustomRepository> => {
        try {
            const response = await apiClient.post<CustomRepository>(
                `/${platform}/repository`,
                repository
            );
            return response.data;
        } catch (error) {
            console.error(`Error creating repository for ${platform}:`, error);
            // For now, simulate success with mock data
            await simulateDelay();
            const newRepo: CustomRepository = {
                ...repository,
                id: `repo-${Date.now()}`,
                creationTime: new Date().toISOString(),
                modificationTime: new Date().toISOString(),
            };
            if (platform === "linux" && repository.repoType === "CustomUbuntuRepo") {
                mockCustomRepos[platform].push(newRepo);
            } else if (platform === "linux" && repository.repoType === "CustomRpmRepo") {
                mockCustomRepos[platform].push(newRepo);
            } else {
                mockCustomRepos[platform] = mockCustomRepos[platform] || [];
                mockCustomRepos[platform].push(newRepo);
            }
            return newRepo;
        }
    },

    getRepositoryApplications: async (
        platform: Platform,
        customRepoId: string,
        pageable?: Pageable
    ): Promise<PagedResponse<ApplicationUnion>> => {
        await simulateDelay();
        
        // Mock applications data - determine osType based on platform
        const getOsType = (platform: Platform): 'MobileApplication' | 'WindowsApplication' | 'LinuxApplication' | 'DmgFileDetail' => {
            switch (platform) {
                case 'android':
                    return 'MobileApplication';
                case 'windows':
                    return 'WindowsApplication';
                case 'linux':
                    return 'LinuxApplication';
                case 'macos':
                    return 'DmgFileDetail';
                default:
                    return 'MobileApplication';
            }
        };

        const osType = getOsType(platform);
        
        // Create mock applications based on osType
        const createMockApp = (id: string, name: string, description: string, manufacturere: string, version: string, size: string): ApplicationUnion => {
            const baseApp = {
                id,
                name,
                description,
                manufacturere,
                osType,
                version,
                creationTime: "2024-01-15T10:00:00Z",
                modificationTime: "2024-01-20T14:30:00Z",
            };

            if (osType === 'MobileApplication') {
                return {
                    ...baseApp,
                    osType: 'MobileApplication',
                    packageName: `com.company.${name.toLowerCase().replace(/\s+/g, '')}`,
                    platform: platform,
                    appType: "ENTERPRISE" as const,
                    isEmmApp: true,
                } as MobileApplication;
            } else if (osType === 'WindowsApplication') {
                return {
                    ...baseApp,
                    osType: 'WindowsApplication',
                    extraProperties: {},
                } as WindowsApplication;
            } else if (osType === 'LinuxApplication') {
                return {
                    ...baseApp,
                    osType: 'LinuxApplication',
                    extraProperties: {},
                } as LinuxApplication;
            } else if (osType === 'DmgFileDetail') {
                return {
                    ...baseApp,
                    osType: 'DmgFileDetail',
                    fileName: `${name.replace(/\s+/g, '')}.dmg`,
                    packageName: `com.company.${name.toLowerCase().replace(/\s+/g, '')}`,
                } as DmgApplication;
            }
            return baseApp as MobileApplication;
        };

        const mockApplications: ApplicationUnion[] = [
            {
                ...createMockApp("app-1", "Corporate App Manager", "Enterprise application management tool for device administration", "Company Corp", "1.2.3", "45 MB"),
                size: "45 MB",
                isMandatory: true,
                isBlocked: false,
                installTypes: ["PRE_INSTALLED"],
            } as any,
            {
                ...createMockApp("app-2", "Internal Tools Suite", "Collection of internal productivity and collaboration tools", "Company Corp", "2.1.0", "128 MB"),
                size: "128 MB",
                isMandatory: false,
                isBlocked: false,
                installTypes: ["AUTO_INSTALL"],
            } as any,
            {
                ...createMockApp("app-3", "Security Scanner", "Advanced security scanning and threat detection application", "Security Solutions Inc", "3.0.1", "67 MB"),
                size: "67 MB",
                isMandatory: true,
                isBlocked: false,
                installTypes: ["PRE_INSTALLED"],
            } as any,
        ];

        const pageNumber = pageable?.page || 0;
        const pageSize = pageable?.size || 10;
        const startIndex = pageNumber * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedContent = mockApplications.slice(startIndex, endIndex);
        const totalPages = Math.ceil(mockApplications.length / pageSize);

        return {
            content: paginatedContent,
            pageable: {
                pageNumber: pageNumber,
                pageSize: pageSize,
                sort: { empty: true, sorted: false, unsorted: true },
                offset: startIndex,
                paged: true,
                unpaged: false,
            },
            last: pageNumber >= totalPages - 1,
            totalPages: totalPages,
            totalElements: mockApplications.length,
            first: pageNumber === 0,
            size: pageSize,
            number: pageNumber,
            sort: { empty: true, sorted: false, unsorted: true },
            numberOfElements: paginatedContent.length,
            empty: paginatedContent.length === 0,
        } as PagedResponse<ApplicationUnion>;
    },

    // --- Custom Repositories (legacy) ---

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
