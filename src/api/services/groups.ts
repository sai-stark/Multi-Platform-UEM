import {
    Group,
    Pageable,
    PagedResponse
} from '@/types/models';
import apiClient from '../client';

export const GroupService = {
    getGroups: async (pageable?: Pageable, search?: string) => {
        const params = { ...pageable, search };
        const response = await apiClient.get<PagedResponse<Group>>('/groups', { params });
        return response.data;
    },

    getGroupDevices: async (groupId: string, pageable?: Pageable, search?: string) => {
        const params = { ...pageable, search };
        // Assuming the endpoint returns basic device info for the list
        const response = await apiClient.get<PagedResponse<any>>(`/groups/${groupId}/devices`, { params });
        return response.data;
    },

    getGroup: async (groupId: string) => {
        const response = await apiClient.get<Group>(`/groups/${groupId}`);
        return response.data;
    },

    createGroup: async (group: Group) => {
        const response = await apiClient.post<Group>('/groups', group);
        return response.data;
    },

    updateGroup: async (groupId: string, group: Group) => {
        const response = await apiClient.put<Group>(`/groups/${groupId}`, group);
        return response.data;
    },

    deleteGroup: async (groupId: string) => {
        await apiClient.delete(`/groups/${groupId}`);
    },

    addDevicesToGroup: async (groupId: string, deviceIds: string[]) => {
        await apiClient.post(`/groups/${groupId}/devices`, deviceIds);
    },

    removeDevicesFromGroup: async (groupId: string, deviceIds: string[]) => {
        await apiClient.delete(`/groups/${groupId}/devices`, { data: deviceIds });
    }
};
