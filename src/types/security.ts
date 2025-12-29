export interface Vulnerability {
    cveId: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface EndpointVulnerabilityResponse {
    endpointId: string;
    vulnerabilities: Vulnerability[];
}

export interface SoftwareVulnerabilityResponse {
    softwareId: string;
    vulnerabilities: Vulnerability[];
}
