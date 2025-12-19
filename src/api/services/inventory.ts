import {
    InventoryBulkUploadResponse,
    InventoryDevice,
    Pageable,
    PagedResponse
} from '@/types/models';
import apiClient from '../client';

export const InventoryService = {
    getInventoryDevices: async (pageable?: Pageable, search?: string) => {
        const params = { ...pageable, search };
        const response = await apiClient.get<PagedResponse<InventoryDevice>>('/inventory/devices', { params });
        return response.data;
    },

    getInventoryDevice: async (deviceId: string) => {
        const response = await apiClient.get<InventoryDevice>(`/inventory/devices/${deviceId}`);
        return response.data;
    },

    createInventoryDevice: async (device: InventoryDevice) => {
        const response = await apiClient.post<InventoryDevice>('/inventory/devices', device);
        return response.data;
    },

    updateInventoryDevice: async (deviceId: string, device: InventoryDevice) => {
        const response = await apiClient.put<InventoryDevice>(`/inventory/devices/${deviceId}`, device);
        return response.data;
    },

    deleteInventoryDevice: async (deviceId: string) => {
        await apiClient.delete(`/inventory/devices/${deviceId}`);
    },

    bulkUploadInventory: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<InventoryBulkUploadResponse>('/inventory/devices/bulk/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    validateBulkUpload: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<InventoryBulkUploadResponse>('/inventory/devices/bulk/upload/validate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getTemplate: async () => {
        const response = await apiClient.get('/inventory/devices/bulk/upload/template', { responseType: 'blob' });
        return response.data;
    }
};
