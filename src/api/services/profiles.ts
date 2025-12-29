import {
    FullProfile,
    Platform,
    Profile,
    PublishProfile
} from '@/types/models';
import apiClient from '../client';

const CORE_PATH = '/profiles';

export const ProfileService = {
    createProfile: async (platform: Platform, profile: Profile) => {
        const response = await apiClient.post<Profile>(`/${platform}${CORE_PATH}`, profile);
        return response.data;
    },

    getProfile: async (platform: Platform, profileId: string) => {
        const response = await apiClient.get<FullProfile>(`/${platform}${CORE_PATH}/${profileId}`);
        return response.data;
    },

    updateProfile: async (platform: Platform, profileId: string, profile: Partial<Profile>) => {
        const response = await apiClient.put<Profile>(`/${platform}${CORE_PATH}/${profileId}`, profile);
        return response.data;
    },

    publishProfile: async (platform: Platform, profileId: string, data: PublishProfile) => {
        await apiClient.post(`/${platform}${CORE_PATH}/${profileId}:publish`, data);
    },

    downloadProfile: async (platform: Platform, profileId: string) => {
        const response = await apiClient.get(`/${platform}${CORE_PATH}/${profileId}:download`);
        return response.data;
    },

    getProfileQR: async (platform: Platform, profileId: string) => {
        const response = await apiClient.get(`/${platform}${CORE_PATH}/${profileId}/qr`);
        return response.data;
    }
};
