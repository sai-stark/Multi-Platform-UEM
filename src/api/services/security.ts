import {
    EndpointVulnerabilityResponse,
    Pageable,
    PagedResponse,
    SoftwareVulnerabilityResponse,
    Vulnerability
} from '@/types/models';
import apiClient from '../client';

export const SecurityService = {
    getVulnerabilities: async (pageable?: Pageable, severity?: string) => {
        const params = { ...pageable, severity };
        const response = await apiClient.get<PagedResponse<Vulnerability>>('/security/vulnerabilities', { params });
        return response.data;
    },

    getEndpointVulnerabilities: async (endpointId: string) => {
        const response = await apiClient.get<EndpointVulnerabilityResponse>(`/security/vulnerabilities/endpoints/${endpointId}`);
        return response.data;
    },

    getSoftwareVulnerabilities: async (softwareId: string) => {
        const response = await apiClient.get<SoftwareVulnerabilityResponse>(`/security/vulnerabilities/software/${softwareId}`);
        return response.data;
    },

    getVulnerability: async (cveId: string) => {
        const response = await apiClient.get<Vulnerability>(`/security/vulnerabilities/${cveId}`);
        return response.data;
    }
};
