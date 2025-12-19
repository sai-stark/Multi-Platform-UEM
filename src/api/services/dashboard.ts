import {
    DashboardStats,
    DateWiseCounts
} from '@/types/models';
import apiClient from '../client';

export const DashboardService = {
    getStats: async () => {
        const response = await apiClient.get<DashboardStats>('/dashboard/stats');
        return response.data;
    },

    getDeviceTimeSeries: async (days: number = 30) => {
        const response = await apiClient.get<DateWiseCounts>('/dashboard/devices/series', { params: { days } });
        return response.data;
    },

    getApplicationTimeSeries: async (days: number = 30) => {
        const response = await apiClient.get<DateWiseCounts>('/dashboard/applications/series', { params: { days } });
        return response.data;
    },

    getComplianceStats: async () => {
        const response = await apiClient.get('/dashboard/compliance');
        return response.data;
    },

    getPlatformDistribution: async () => {
        const response = await apiClient.get('/dashboard/platform-distribution');
        return response.data;
    }
};
