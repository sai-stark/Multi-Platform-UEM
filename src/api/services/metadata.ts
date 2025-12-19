import { DeviceModel, OsInfo, Platform } from '@/types/models';
import apiClient from '../client';

export const MetadataService = {

    getOsInfo: async (platform: Platform) => {
        const response = await apiClient.get<OsInfo[]>(`/metadata/os-info`, { params: { platform } });
        return response.data;
    },

    getDeviceModels: async (platform: Platform) => {
        const response = await apiClient.get<DeviceModel[]>(`/metadata/device-models`, { params: { platform } });
        return response.data;
    }
};
