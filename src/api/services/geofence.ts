import {
    Geofence,
    GeofenceAlert,
    GeofencePolicy,
    GeoFenceWholeMappingDetails,
    Pageable,
    PagedResponse
} from '@/types/models';
import apiClient from '../client';

export const GeofenceService = {
    // Geofences
    getGeofences: async (pageable?: Pageable, search?: string) => {
        const params = { ...pageable, search };
        const response = await apiClient.get<PagedResponse<Geofence>>('/geofences', { params });
        return response.data;
    },

    getGeofence: async (geofenceId: string) => {
        const response = await apiClient.get<Geofence>(`/geofences/${geofenceId}`);
        return response.data;
    },

    createGeofence: async (geofence: Geofence) => {
        const response = await apiClient.post<Geofence>('/geofences', geofence);
        return response.data;
    },

    updateGeofence: async (geofenceId: string, geofence: Geofence) => {
        const response = await apiClient.put<Geofence>(`/geofences/${geofenceId}`, geofence);
        return response.data;
    },

    deleteGeofence: async (geofenceId: string) => {
        await apiClient.delete(`/geofences/${geofenceId}`);
    },

    // Policies
    getGeofencePolicies: async (pageable?: Pageable, search?: string) => {
        const params = { ...pageable, search };
        const response = await apiClient.get<PagedResponse<GeofencePolicy>>('/geofences/policies', { params });
        return response.data;
    },

    createGeofencePolicy: async (policy: GeofencePolicy) => {
        const response = await apiClient.post<GeofencePolicy>('/geofences/policies', policy);
        return response.data;
    },

    updateGeofencePolicy: async (policyId: string, policy: GeofencePolicy) => {
        const response = await apiClient.put<GeofencePolicy>(`/geofences/policies/${policyId}`, policy);
        return response.data;
    },

    deleteGeofencePolicy: async (policyId: string) => {
        await apiClient.delete(`/geofences/policies/${policyId}`);
    },

    assignPolicyToGroup: async (policyId: string, groupId: string) => {
        await apiClient.post(`/geofences/policies/${policyId}/groups/${groupId}`);
    },

    // Alerts
    getGeofenceAlerts: async (pageable?: Pageable, deviceId?: string) => {
        const params = { ...pageable, deviceId };
        const response = await apiClient.get<PagedResponse<GeofenceAlert>>('/geofences/alerts', { params });
        return response.data;
    },

    // Mappings
    getDeviceMappings: async (deviceId: string) => {
        const response = await apiClient.get<GeoFenceWholeMappingDetails>(`/geofence-management/mappings/devices/${deviceId}`);
        return response.data;
    },

    getGroupMappings: async (groupId: string) => {
        const response = await apiClient.get<GeoFenceWholeMappingDetails>(`/geofence-management/mappings/groups/${groupId}`);
        return response.data;
    },

    assignGeofenceToDevice: async (geofenceId: string, deviceId: string) => {
        await apiClient.put(`/geofence-management/mappings/devices/${deviceId}/geofences/${geofenceId}`);
    },

    assignGeofenceToGroup: async (geofenceId: string, groupId: string) => {
        await apiClient.put(`/geofence-management/mappings/groups/${groupId}/geofences/${geofenceId}`);
    },

    removeGeofenceFromDevice: async (geofenceId: string, deviceId: string) => {
        await apiClient.delete(`/geofence-management/mappings/devices/${deviceId}/geofences/${geofenceId}`);
    },

    removeGeofenceFromGroup: async (geofenceId: string, groupId: string) => {
        await apiClient.delete(`/geofence-management/mappings/groups/${groupId}/geofences/${geofenceId}`);
    }
};
