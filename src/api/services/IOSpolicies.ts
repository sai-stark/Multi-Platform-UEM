import {
    IosAppLockPolicy,
    IosGlobalHttpProxyPolicy,
    IosHomeScreenLayoutPolicy,
    IosPerAppVpnPolicy,
    IosPerDomainVpnPolicy,
    IosRelayPolicy,
    IosVpnPolicy,
    IosWebContentFilterPolicy,
    IosPemCertificatePolicy,
    IosPkcsCertificatePolicy,
    IosPkcs12CertificatePolicy,
    IosRootCertificatePolicy,
} from '@/types/ios';
import {
    ApplicationPolicy,
    IosMailPolicy,
    IosWiFiConfiguration,
    LockScreenMessagePolicy,
    NotificationPolicy,
    PagedResponse,
    PasscodeRestrictionPolicy,
    Platform,
    WebApplicationPolicy
} from '@/types/models';
import { IosRestrictionsPayload } from '@/types/restrictions';
import apiClient from '../client';

const CORE_PATH = '/profiles';

/**
 * PolicyService - UEM Policy APIs only
 * 
 * Contains only APIs tagged with "UEM policy" in OpenAPI spec:
 * - Passcode Restriction
 * - WiFi Configuration (iOS)
 * - Mail Policy (iOS)
 * - Notification Policy
 * - Lock Screen Message
 * - Web Application Policy
 */
export const PolicyService = {
    // --- Application Policy (CRUD) ---
    getApplicationPolicies: async (platform: Platform, profileId: string) => {
        const response = await apiClient.get<PagedResponse<ApplicationPolicy>>(`/${platform}${CORE_PATH}/${profileId}/policies/applications`);
        return response.data;
    },
    createApplicationPolicy: async (platform: Platform, profileId: string, policy: ApplicationPolicy) => {
        const response = await apiClient.post(`/${platform}${CORE_PATH}/${profileId}/policies/applications`, policy);
        return response.data;
    },
    updateApplicationPolicy: async (platform: Platform, profileId: string, policyId: string, policy: ApplicationPolicy) => {
        const response = await apiClient.put(`/${platform}${CORE_PATH}/${profileId}/policies/applications/${policyId}`, policy);
        return response.data;
    },
    deleteApplicationPolicy: async (platform: Platform, profileId: string, policyId: string) => {
        await apiClient.delete(`/${platform}${CORE_PATH}/${profileId}/policies/applications/${policyId}`);
    },

    // --- Passcode Restriction (UEM policy) ---
    getPasscodeRestriction: async (platform: Platform, profileId: string) => {
        const response = await apiClient.get(`/${platform}${CORE_PATH}/${profileId}/restrictions/passcode`);
        return response.data;
    },
    createPasscodeRestriction: async (platform: Platform, profileId: string, policy: PasscodeRestrictionPolicy) => {
        const response = await apiClient.post(`/${platform}${CORE_PATH}/${profileId}/restrictions/passcode`, policy);
        return response.data;
    },
    updatePasscodeRestriction: async (platform: Platform, profileId: string, policy: PasscodeRestrictionPolicy) => {
        const response = await apiClient.put(`/${platform}${CORE_PATH}/${profileId}/restrictions/passcode`, policy);
        return response.data;
    },
    deletePasscodeRestriction: async (platform: Platform, profileId: string) => {
        await apiClient.delete(`/${platform}${CORE_PATH}/${profileId}/restrictions/passcode`);
    },

    // --- iOS WiFi Configuration (UEM policy) ---
    getIosWiFiConfiguration: async (profileId: string) => {
        const response = await apiClient.get(`/ios${CORE_PATH}/${profileId}/policies/wifi`);
        return response.data;
    },
    createIosWiFiConfiguration: async (profileId: string, policy: IosWiFiConfiguration) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/wifi`, policy);
        return response.data;
    },
    updateIosWiFiConfiguration: async (profileId: string, policy: IosWiFiConfiguration) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/wifi`, policy);
        return response.data;
    },
    deleteIosWiFiConfiguration: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/wifi`);
    },

    // --- iOS Mail Policy (UEM policy) ---
    getIosMailPolicy: async (profileId: string) => {
        const response = await apiClient.get(`/ios${CORE_PATH}/${profileId}/policies/mail`);
        return response.data;
    },
    createIosMailPolicy: async (profileId: string, policy: IosMailPolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/mail`, policy);
        return response.data;
    },
    updateIosMailPolicy: async (profileId: string, policy: IosMailPolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/mail`, policy);
        return response.data;
    },
    deleteIosMailPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/mail`);
    },

    // --- Notification Policy (UEM policy) ---
    getNotificationPolicies: async (platform: Platform, profileId: string) => {
        const response = await apiClient.get<PagedResponse<NotificationPolicy>>(`/${platform}${CORE_PATH}/${profileId}/policies/notifications`);
        return response.data;
    },
    getNotificationPolicy: async (platform: Platform, profileId: string, policyId: string) => {
        const response = await apiClient.get<NotificationPolicy>(`/${platform}${CORE_PATH}/${profileId}/policies/notifications/${policyId}`);
        return response.data;
    },
    createNotificationPolicy: async (platform: Platform, profileId: string, policy: NotificationPolicy) => {
        const response = await apiClient.post(`/${platform}${CORE_PATH}/${profileId}/policies/notifications`, policy);
        return response.data;
    },
    updateNotificationPolicy: async (platform: Platform, profileId: string, policyId: string, policy: NotificationPolicy) => {
        const response = await apiClient.put(`/${platform}${CORE_PATH}/${profileId}/policies/notifications/${policyId}`, policy);
        return response.data;
    },
    deleteNotificationPolicy: async (platform: Platform, profileId: string, policyId: string) => {
        await apiClient.delete(`/${platform}${CORE_PATH}/${profileId}/policies/notifications/${policyId}`);
    },

    // --- Lock Screen Message (UEM policy) ---
    getLockScreenMessage: async (platform: Platform, profileId: string) => {
        const response = await apiClient.get<LockScreenMessagePolicy>(`/${platform}${CORE_PATH}/${profileId}/policies/lockScreenMessage`);
        return response.data;
    },
    createLockScreenMessage: async (platform: Platform, profileId: string, policy: LockScreenMessagePolicy) => {
        const response = await apiClient.post(`/${platform}${CORE_PATH}/${profileId}/policies/lockScreenMessage`, policy);
        return response.data;
    },
    updateLockScreenMessage: async (platform: Platform, profileId: string, policy: LockScreenMessagePolicy) => {
        const response = await apiClient.put(`/${platform}${CORE_PATH}/${profileId}/policies/lockScreenMessage`, policy);
        return response.data;
    },
    deleteLockScreenMessage: async (platform: Platform, profileId: string) => {
        await apiClient.delete(`/${platform}${CORE_PATH}/${profileId}/policies/lockScreenMessage`);
    },

    // --- Web Application Policy (UEM policy) ---
    createWebApplicationPolicy: async (platform: Platform, profileId: string, policy: WebApplicationPolicy) => {
        const response = await apiClient.post(`/${platform}${CORE_PATH}/${profileId}/policies/web-applications`, policy);
        return response.data;
    },
    getWebApplicationPolicies: async (platform: Platform, profileId: string) => {
        const response = await apiClient.get<PagedResponse<WebApplicationPolicy>>(`/${platform}${CORE_PATH}/${profileId}/policies/web-applications`);
        return response.data;
    },
    getWebApplicationPolicy: async (platform: Platform, profileId: string, policyId: string) => {
        const response = await apiClient.get<WebApplicationPolicy>(`/${platform}${CORE_PATH}/${profileId}/policies/web-applications/${policyId}`);
        return response.data;
    },
    updateWebApplicationPolicy: async (platform: Platform, profileId: string, policyId: string, policy: WebApplicationPolicy) => {
        const response = await apiClient.put(`/${platform}${CORE_PATH}/${profileId}/policies/web-applications/${policyId}`, policy);
        return response.data;
    },
    deleteWebApplicationPolicy: async (platform: Platform, profileId: string, policyId: string) => {
        await apiClient.delete(`/${platform}${CORE_PATH}/${profileId}/policies/web-applications/${policyId}`);
    },

    // --- iOS Web Content Filter (UEM Phase 2) ---
    getWebContentFilterPolicy: async (profileId: string) => {
        const response = await apiClient.get<IosWebContentFilterPolicy>(`/ios${CORE_PATH}/${profileId}/policies/web-content-filter`);
        return response.data;
    },
    createWebContentFilterPolicy: async (profileId: string, policy: IosWebContentFilterPolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/web-content-filter`, policy);
        return response.data;
    },
    updateWebContentFilterPolicy: async (profileId: string, policy: IosWebContentFilterPolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/web-content-filter`, policy);
        return response.data;
    },
    deleteWebContentFilterPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/web-content-filter`);
    },

    // --- iOS Global HTTP Proxy (UEM Phase 2) ---
    getGlobalHttpProxyPolicy: async (profileId: string) => {
        const response = await apiClient.get<IosGlobalHttpProxyPolicy>(`/ios${CORE_PATH}/${profileId}/policies/http-proxy`);
        return response.data;
    },
    createGlobalHttpProxyPolicy: async (profileId: string, policy: IosGlobalHttpProxyPolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/http-proxy`, policy);
        return response.data;
    },
    updateGlobalHttpProxyPolicy: async (profileId: string, policy: IosGlobalHttpProxyPolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/http-proxy`, policy);
        return response.data;
    },
    deleteGlobalHttpProxyPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/http-proxy`);
    },

    // --- iOS VPN (UEM Phase 2) ---
    getVpnPolicy: async (profileId: string) => {
        const response = await apiClient.get<IosVpnPolicy>(`/ios${CORE_PATH}/${profileId}/policies/vpn`);
        return response.data;
    },
    createVpnPolicy: async (profileId: string, policy: IosVpnPolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/vpn`, policy);
        return response.data;
    },
    updateVpnPolicy: async (profileId: string, policy: IosVpnPolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/vpn`, policy);
        return response.data;
    },
    deleteVpnPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/vpn`);
    },

    // --- iOS Per-App VPN (UEM Phase 2) ---
    getPerAppVpnPolicy: async (profileId: string) => {
        const response = await apiClient.get<IosPerAppVpnPolicy>(`/ios${CORE_PATH}/${profileId}/policies/per-app-vpn`);
        return response.data;
    },
    createPerAppVpnPolicy: async (profileId: string, policy: IosPerAppVpnPolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/per-app-vpn`, policy);
        return response.data;
    },
    updatePerAppVpnPolicy: async (profileId: string, policy: IosPerAppVpnPolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/per-app-vpn`, policy);
        return response.data;
    },
    deletePerAppVpnPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/per-app-vpn`);
    },

    // --- iOS Per-Domain VPN (UEM Phase 2) ---
    getPerDomainVpnPolicy: async (profileId: string) => {
        const response = await apiClient.get<IosPerDomainVpnPolicy>(`/ios${CORE_PATH}/${profileId}/policies/per-domain-vpn`);
        return response.data;
    },
    createPerDomainVpnPolicy: async (profileId: string, policy: IosPerDomainVpnPolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/per-domain-vpn`, policy);
        return response.data;
    },
    updatePerDomainVpnPolicy: async (profileId: string, policy: IosPerDomainVpnPolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/per-domain-vpn`, policy);
        return response.data;
    },
    deletePerDomainVpnPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/per-domain-vpn`);
    },

    // --- iOS Relay (UEM Phase 2) ---
    getRelayPolicy: async (profileId: string) => {
        const response = await apiClient.get<IosRelayPolicy>(`/ios${CORE_PATH}/${profileId}/policies/relay`);
        return response.data;
    },
    createRelayPolicy: async (profileId: string, policy: IosRelayPolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/relay`, policy);
        return response.data;
    },
    updateRelayPolicy: async (profileId: string, policy: IosRelayPolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/relay`, policy);
        return response.data;
    },
    deleteRelayPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/relay`);
    },


    // --- iOS PEM Certificate ---
    getCertPemPolicy: async (profileId: string) => {
        const response = await apiClient.get<PagedResponse<IosPemCertificatePolicy>>(`/ios${CORE_PATH}/${profileId}/policies/certificate-pem`);
        return response.data?.content?.[0] ?? null;
    },
    createCertPemPolicy: async (profileId: string, policy: IosPemCertificatePolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/certificate-pem`, policy);
        return response.data;
    },
    updateCertPemPolicy: async (profileId: string, policy: IosPemCertificatePolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/certificate-pem`, policy);
        return response.data;
    },
    deleteCertPemPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/certificate-pem`);
    },

    // --- iOS PKCS Certificate ---
    getCertPkcsPolicy: async (profileId: string) => {
        const response = await apiClient.get<PagedResponse<IosPkcsCertificatePolicy>>(`/ios${CORE_PATH}/${profileId}/policies/certificate-pkcs`);
        return response.data?.content?.[0] ?? null;
    },
    createCertPkcsPolicy: async (profileId: string, policy: IosPkcsCertificatePolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/certificate-pkcs`, policy);
        return response.data;
    },
    updateCertPkcsPolicy: async (profileId: string, policy: IosPkcsCertificatePolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/certificate-pkcs`, policy);
        return response.data;
    },
    deleteCertPkcsPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/certificate-pkcs`);
    },

    // --- iOS PKCS12 Certificate ---
    getCertPkcs12PolicyList: async (profileId: string) => {
        const response = await apiClient.get<PagedResponse<IosPkcs12CertificatePolicy>>(`/ios${CORE_PATH}/${profileId}/policies/certificate-pkcs12`);
        return response.data;
    },
    getCertPkcs12PolicyById: async (profileId: string, certificateId: string) => {
        const response = await apiClient.get<IosPkcs12CertificatePolicy>(`/ios${CORE_PATH}/${profileId}/policies/certificate-pkcs12/${certificateId}`);
        return response.data;
    },
    createCertPkcs12Policy: async (profileId: string, policy: IosPkcs12CertificatePolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/certificate-pkcs12`, policy);
        return response.data;
    },
    updateCertPkcs12Policy: async (profileId: string, policy: IosPkcs12CertificatePolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/certificate-pkcs12`, policy);
        return response.data;
    },
    deleteCertPkcs12Policy: async (profileId: string, certificateId: string) => {
        // According to OpenAPI: delete has no {certificateId} in the path? Yes it does? 
        // Wait, the spec says: '/{platform}/profiles/{profileId}/policies/certificate-pkcs12/{certificateId}' has DELETE.
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/certificate-pkcs12/${certificateId}`);
    },

    // --- iOS Root Certificate ---
    getRootCertificatesPolicyList: async (profileId: string) => {
        const response = await apiClient.get<PagedResponse<IosRootCertificatePolicy>>(`/ios${CORE_PATH}/${profileId}/policies/rootCertificates`);
        return response.data;
    },
    getRootCertificatePolicyById: async (profileId: string, certificateId: string) => {
        const response = await apiClient.get<IosRootCertificatePolicy>(`/ios${CORE_PATH}/${profileId}/policies/rootCertificate/${certificateId}`);
        return response.data;
    },
    createRootCertificatePolicy: async (profileId: string, policy: IosRootCertificatePolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/rootCertificates`, policy);
        return response.data;
    },
    updateRootCertificatePolicy: async (profileId: string, policy: IosRootCertificatePolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/rootCertificate/${policy.id}`, policy);
        return response.data;
    },
    deleteRootCertificatePolicy: async (profileId: string, certificateId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/rootCertificate/${certificateId}`);
    },

    // --- iOS Home Screen Layout (UEM Phase 2) ---
    getHomeScreenLayoutPolicy: async (profileId: string) => {
        const response = await apiClient.get<IosHomeScreenLayoutPolicy>(`/ios${CORE_PATH}/${profileId}/policies/homeScreenLayout`);
        return response.data;
    },
    createHomeScreenLayoutPolicy: async (profileId: string, policy: IosHomeScreenLayoutPolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/homeScreenLayout`, policy);
        return response.data;
    },
    updateHomeScreenLayoutPolicy: async (profileId: string, policy: IosHomeScreenLayoutPolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/homeScreenLayout`, policy);
        return response.data;
    },
    deleteHomeScreenLayoutPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/homeScreenLayout`);
    },

    // --- iOS App Lock (UEM Phase 2) ---
    getAppLockPolicy: async (profileId: string) => {
        const response = await apiClient.get<IosAppLockPolicy>(`/ios${CORE_PATH}/${profileId}/policies/app-lock`);
        return response.data;
    },
    createAppLockPolicy: async (profileId: string, policy: IosAppLockPolicy) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/app-lock`, policy);
        return response.data;
    },
    updateAppLockPolicy: async (profileId: string, policy: IosAppLockPolicy) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/app-lock`, policy);
        return response.data;
    },
    deleteAppLockPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/app-lock`);
    },

    // --- iOS Restrictions ---
    getRestrictionsPolicy: async (profileId: string) => {
        const response = await apiClient.get<IosRestrictionsPayload>(`/ios${CORE_PATH}/${profileId}/policies/restrictions`);
        return response.data;
    },
    createRestrictionsPolicy: async (profileId: string, policy: IosRestrictionsPayload) => {
        const response = await apiClient.post(`/ios${CORE_PATH}/${profileId}/policies/restrictions`, policy);
        return response.data;
    },
    updateRestrictionsPolicy: async (profileId: string, policy: IosRestrictionsPayload) => {
        const response = await apiClient.put(`/ios${CORE_PATH}/${profileId}/policies/restrictions`, policy);
        return response.data;
    },
    deleteRestrictionsPolicy: async (profileId: string) => {
        await apiClient.delete(`/ios${CORE_PATH}/${profileId}/policies/restrictions`);
    },
};
