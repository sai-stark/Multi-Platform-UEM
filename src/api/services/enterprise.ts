import {
    AndroidEnterprise,
    AndroidEnterpriseSignup,
    AndroidEnterpriseSignupRequest,
    AndroidEnterpriseWebToken,
    EnterpriseDevice,
    PaginatedEnterpriseDeviceList,
    Pageable,
    Platform
} from '@/types/models';
import apiClient from '../client';

/**
 * EnterpriseService - Enterprise tag APIs
 * 
 * Service for Android Enterprise Management through Google Android Management APIs
 * Contains all APIs tagged with "Enterprise" in OpenAPI spec
 */

export const EnterpriseService = {
    // ============================================
    // Enterprise Management APIs
    // ============================================

    /**
     * GET /{platform}/enterprise - Get Android Enterprise information
     * 
     * Retrieves the current Android Enterprise information for the organization.
     * This includes enterprise display name, contact email, enterprise type, etc.
     * 
     * @param platform - The platform (typically 'android')
     * @returns Promise<AndroidEnterprise> - Enterprise information
     */
    getEnterprise: async (platform: Platform): Promise<AndroidEnterprise> => {
        const response = await apiClient.get<AndroidEnterprise>(`/${platform}/enterprise`);
        return response.data;
    },

    /**
     * POST /{platform}/enterprise:signup - Create a Signup URL for Enterprise Binding
     * 
     * Initiates the enterprise signup process with Google.
     * Provide enterprise DisplayName and email to generate a signup URL.
     * The admin must visit this URL to complete the binding with Google Play EMM.
     * 
     * @param platform - The platform (typically 'android')
     * @param signupData - Enterprise signup request data
     * @returns Promise<AndroidEnterpriseSignup> - Signup response with URL
     */
    createEnterpriseSignup: async (
        platform: Platform,
        signupData: AndroidEnterpriseSignupRequest
    ): Promise<AndroidEnterpriseSignup> => {
        const response = await apiClient.post<AndroidEnterpriseSignup>(
            `/${platform}/enterprise:signup`,
            signupData
        );
        return response.data;
    },

    /**
     * GET /{platform}/bind/enterpriseToken/{signId} - Complete Enterprise Binding
     * 
     * Completes the enterprise binding by submitting the enterprise token
     * received from Google after the admin completes the signup process.
     * 
     * @param platform - The platform (typically 'android')
     * @param signId - The signup ID from the signup response
     * @param enterpriseToken - The enterprise token from Google callback
     * @returns Promise<void>
     */
    setEnterpriseToken: async (
        platform: Platform,
        signId: string,
        enterpriseToken: string
    ): Promise<void> => {
        await apiClient.get(`/${platform}/enterprise/bind/enterpriseToken/${signId}`, {
            params: { enterpriseToken }
        });
    },

    /**
     * POST /{platform}/enterprise/webToken - Generate Enterprise Web Token
     * 
     * Generates a web token for accessing Google Play iframe services.
     * This token is used to embed the Google Play store in the UEM console.
     * 
     * @param platform - The platform (typically 'android')
     * @param tokenRequest - Web token request parameters (optional)
     * @returns Promise<AndroidEnterpriseWebToken> - Web token response
     */
    generateEnterpriseWebToken: async (
        platform: Platform,
        tokenRequest?: Partial<AndroidEnterpriseWebToken>
    ): Promise<AndroidEnterpriseWebToken> => {
        const response = await apiClient.post<AndroidEnterpriseWebToken>(
            `/${platform}/enterprise/webToken`,
            tokenRequest || {}
        );
        return response.data;
    },
};
