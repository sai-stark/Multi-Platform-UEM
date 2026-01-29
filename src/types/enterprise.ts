// Enterprise Types - Android Enterprise Management API

/**
 * Audit data fields for basic entities
 */
export interface BasicAuditData {
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Audit data fields for user-created entities
 */
export interface UserAuditData {
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

/**
 * Android Enterprise - Enterprise information of the Organization
 */
export interface AndroidEnterprise extends BasicAuditData {
    id: string;
    name: string;
    enterpriseDisplayName: string;
    contactEmail: string;
    enterpriseType: string;
    webToken?: string;
    orgType: 'AndroidEnterprise';
}

/**
 * Android Enterprise Signup - Request/Response for enterprise binding
 */
export interface AndroidEnterpriseSignup extends UserAuditData {
    id: string;
    enterpriseDisplayName: string;
    contactEmail: string;
    signupURL: string;
    enterpriseSignupType: 'AndroidEnterpriseSignup';
}

/**
 * Android Enterprise Signup Request - Input for creating signup
 */
export interface AndroidEnterpriseSignupRequest {
    enterpriseDisplayName: string;
    contactEmail: string;
}

/**
 * Android Enterprise Web Token - Google Play iframe access token
 */
export interface AndroidEnterpriseWebToken extends UserAuditData {
    id?: string;
    name?: string;
    enabledFeatures?: string;
    parentFrameUrl?: string;
    webToken?: string;
    enterpriseWebTokenType: 'AndroidEnterpriseWebToken';
}

/**
 * Hardware information for enterprise devices
 */
export interface HardwareInfo {
    brand?: string;
    deviceBasebandVersion?: string;
    enterpriseSpecificId?: string;
    hardware?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
}

/**
 * Memory information for enterprise devices
 */
export interface MemoryInfo {
    totalInternalStorage?: string;
    totalRam?: string;
}

/**
 * Security posture of enterprise device
 */
export interface SecurityPosture {
    devicePosture?: string;
}

/**
 * Enterprise Device - Information about enterprise-managed device
 */
export interface EnterpriseDevice extends BasicAuditData {
    id: string;
    name: string;
    managementMode: string;
    state: string;
    appliedState: string;
    apiLevel?: number;
    appliedPolicyName?: string;
    appliedPolicyVersion?: string;
    enrollmentTime?: string;
    enrollmentTokenName?: string;
    hardwareInfo?: HardwareInfo;
    lastPolicySyncTime?: string;
    lastStatusReportTime?: string;
    memoryInfo?: MemoryInfo;
    policyCompliant?: boolean;
    policyName?: string;
    previousDeviceNames?: string[];
    securityPosture?: SecurityPosture;
    userName?: string;
}

/**
 * Paginated list of enterprise devices
 */
export interface PaginatedEnterpriseDeviceList {
    content: EnterpriseDevice[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
}
