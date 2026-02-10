import { UserAuditData } from './policy';

export interface IosAppNotificationSetting {
    id?: string;
    bundleIdentifier: string;
    enabled?: boolean;
    showInNotificationCenter?: boolean;
    showInLockScreen?: boolean;
    alertStyle?: 'NONE' | 'BANNER' | 'ALERT';
    eventsEnabled?: boolean;
    badgesEnabled?: boolean;
    soundsEnabled?: boolean;
    alertType?: string; // or number, usage in ProfileDetails is just string/number display
}

// EAP Types enum values
export type EAPType = 13 | 17 | 18 | 21 | 23 | 25 | 43;
// 13: EAP-TLS, 17: LEAP, 18: EAP-SIM, 21: EAP-TTLS, 23: EAP-AKA, 25: PEAPv0/v1, 43: EAP-FAST

// TTLS Inner Authentication types
export type TTLSInnerAuth = 'PAP' | 'EAP' | 'CHAP' | 'MSCHAP' | 'MSCHAPv2';

// TLS Version types
export type TLSVersion = '1.0' | '1.1' | '1.2' | '1.3';

// EAP Client Configuration (Enterprise WiFi)
export interface EAPClientConfiguration {
    acceptEAPTypes: EAPType[]; // Required, min 1 item
    userName?: string;
    userPassword?: string;
    payloadCertificateAnchorUUID?: string[]; // UUID array
    tlsTrustedCertificates?: string[];
    tlsTrustedServerNames?: string[];
    tlsAllowTrustExceptions?: boolean; // Default: true (removed in iOS 8.0)
    tlsCertificateIsRequired?: boolean; // Default: false (iOS 7.0+)
    ttlsInnerAuthentication?: TTLSInnerAuth; // Default: MSCHAPv2
    tlsMinimumVersion?: TLSVersion; // Default: 1.0 (iOS 11.0+)
    tlsMaximumVersion?: TLSVersion; // Default: 1.2 (iOS 11.0+)
    outerIdentity?: string; // Required if TLSMinimumVersion is 1.3
    eapFastUsePAC?: boolean; // Default: false
    eapFastProvisionPAC?: boolean; // Default: false
    eapFastProvisionPACAnonymously?: boolean; // Default: false
    eapSimNumberOfRANDs?: 2 | 3; // Default: 3 (iOS 8.0+)
    systemModeCredentialsSource?: string; // 'ActiveDirectory' for AD credentials
    systemModeUseOpenDirectoryCredentials?: boolean; // Default: false
    oneTimeUserPassword?: boolean; // Default: false (iOS 8.0+)
}

// QoS Marking Policy (iOS 10.0+)
export interface QoSMarkingPolicy {
    qosMarkingAllowListAppIdentifiers?: string[]; // Bundle IDs (iOS 14.5+)
    qosMarkingAppleAudioVideoCalls?: boolean; // Default: true
    qosMarkingEnabled?: boolean; // Default: true
}

// iOS WiFi Configuration (from OpenAPI)
export interface IosWiFiConfiguration extends UserAuditData {
    id?: string; // UUID, read-only
    name: string; // Required
    policyType?: 'IosWiFiConfiguration'; // Default: IosWiFiConfiguration

    // Basic WiFi Settings
    ssid?: string; // Optional if domainName is specified (iOS 7.0+)
    autoJoin?: boolean; // Default: true (iOS 5.0+)
    hiddenNetwork?: boolean; // Default: false
    encryptionType?: 'WEP' | 'WPA' | 'WPA2' | 'WPA3' | 'Any' | 'None'; // Default: Any
    password?: string;
    payloadCertificateUUID?: string; // UUID for client credential certificate

    // Proxy Settings (forbidden in user enrollment)
    proxyType?: 'None' | 'Manual' | 'Auto'; // Default: None
    proxyServer?: string;
    proxyServerPort?: number; // 0-65535
    proxyUsername?: string;
    proxyPassword?: string;
    proxyPACURL?: string; // URI format
    proxyPACFallbackAllowed?: boolean; // Default: false

    // Enterprise/EAP Configuration
    eapClientConfiguration?: EAPClientConfiguration;

    // Hotspot 2.0 Settings (iOS 7.0+)
    displayedOperatorName?: string;
    domainName?: string;
    roamingConsortiumOIs?: string[]; // Pattern: ^([0-9A-Fa-f]{6})|([0-9A-Fa-f]{9})$
    serviceProviderRoamingEnabled?: boolean; // Default: false
    isHotspot?: boolean; // Default: false
    hessid?: string;
    naiRealmNames?: string[];
    mccAndMNCs?: string[]; // Pattern: ^[0-9]{6}$ (iOS only)

    // Other Settings
    captiveBypass?: boolean; // Default: false (iOS 10.0+)
    qosMarkingPolicy?: QoSMarkingPolicy; // iOS 10.0+
    enableIPv6?: boolean; // Default: true
    tlsCertificateRequired?: boolean; // Default: false
    disableAssociationMACRandomization?: boolean; // Default: false (iOS 14.0+, forbidden in user enrollment)
    allowJoinBeforeFirstUnlock?: boolean; // Default: false (visionOS 26.0+)
}

// iOS Mail Policy (from OpenAPI)
export interface IosMailPolicy extends UserAuditData {
    id?: string; // UUID, read-only (optional for create requests)
    name: string; // Required
    policyType: 'IosMail'; // Required, must be exactly 'IosMail'
    emailAccountDescription?: string;
    emailAccountName?: string;
    emailAccountType: 'EmailTypeIMAP' | 'EmailTypePOP'; // Required
    emailAddress?: string;
    incomingMailServerAuthentication: 'EmailAuthNone' | 'EmailAuthPassword' | 'EmailAuthCRAMMD5' | 'EmailAuthNTLM' | 'EmailAuthHTTPMD5'; // Required
    incomingMailServerHostName: string; // Required
    incomingMailServerPortNumber?: number;
    incomingMailServerUseSSL?: boolean; // Default: false
    incomingMailServerUsername?: string;
    incomingPassword?: string;
    outgoingPassword?: string;
    outgoingPasswordSameAsIncomingPassword?: boolean; // Default: false
    outgoingMailServerAuthentication: 'EmailAuthNone' | 'EmailAuthPassword' | 'EmailAuthCRAMMD5' | 'EmailAuthNTLM' | 'EmailAuthHTTPMD5'; // Required
    outgoingMailServerHostName: string; // Required
    outgoingMailServerPortNumber?: number;
    outgoingMailServerUseSSL?: boolean; // Default: false
    outgoingMailServerUsername?: string;
    preventMove?: boolean; // Default: false
    preventAppSheet?: boolean; // Default: false
    smimeEnabled?: boolean; // Default: false
    smimeSigningEnabled?: boolean; // Default: false
    smimeSigningCertificateUUID?: string; // UUID pattern
    smimeEncryptionEnabled?: boolean; // Default: false
    smimeEncryptionCertificateUUID?: string; // UUID pattern
    disableMailRecentsSyncing?: boolean; // Default: false
    allowMailDrop?: boolean; // Default: false
    incomingMailServerIMAPPathPrefix?: string;
    smimeSigningUserOverrideable?: boolean; // Default: false
    smimeSigningCertificateUUIDUserOverrideable?: boolean; // Default: false
    smimeEncryptByDefault?: boolean; // Default: false
    smimeEncryptByDefaultUserOverrideable?: boolean; // Default: false
    smimeEncryptionCertificateUUIDUserOverrideable?: boolean; // Default: false
    smimeEnableEncryptionPerMessageSwitch?: boolean; // Default: false
    vpnUUID?: string;
}

export interface IosMdmConfiguration {
    id?: string;
    policyType?: string;
    identityCertificateUUID?: string;
    topic?: string;
    serverURL?: string;
    checkInURL?: string;
    signMessage?: boolean;
    accessRights?: number;
    useDevelopmentAPNS?: boolean;
    assignedManagedAppleID?: string;
    enrollmentMode?: 'BYOD' | 'ADDE';
    serverURLPinningCertificateUUIDs?: string[];
    checkInURLPinningCertificateUUIDs?: string[];
    pinningRevocationCheckRequired?: boolean;
    serverCapabilities?: string[];
    checkOutWhenRemoved?: boolean;
    checkInInterval?: number;
    promptUserToAllowBootstrapTokenForAuthentication?: boolean;
}

export interface IosCertificateRootPolicy {
    id?: string;
    fileName: string;
    content: string; // Base64
}

export interface IosScepConfiguration {
    id?: string;
    policyType?: string;
    url: string;
    scepName?: string;
    name?: string;
    subject?: any[][][];
    challenge?: string;
    keysize?: number;
    keyType?: string;
    keyUsage?: number;
    subjectAltName?: {
        dnsName?: string;
    };
}

export interface IosAcmeConfiguration {
    id?: string;
    directoryUrl: string;
    clientIdentifier: string;
}

export interface IosLockScreenMessage {
    id?: string;
    ifLostReturnTo?: string;
    assetTagInformation?: string;
    lockScreenFootnote?: string;
}

// ========================================
// UEM PHASE 2 - iOS Policies
// ========================================

// iOS Web Content Filter Policy
export interface IosWebContentFilterPolicy extends UserAuditData {
    id?: string;
    name: string;
    policyType?: 'IosWebContentFilterPolicy';
    filterType?: 'BuiltIn';
    autoFilterEnabled?: boolean;
    permittedUrls?: string[];
    denyListUrls?: string[];
    filterSockets?: boolean;
    whitelistedBookmarks?: { url?: string; title?: string }[];
    hideDenyListURLs?: boolean;
    safariHistoryRetentionEnabled?: boolean;
}

// iOS Global HTTP Proxy Policy
export interface IosGlobalHttpProxyPolicy extends UserAuditData {
    id?: string;
    name: string;
    policyType?: 'IosGlobalHttpProxyPolicy';
    proxyType: 'Manual' | 'Automatic';
    proxyServer?: string;
    proxyServerPort?: number;
    proxyUsername?: string;
    proxyPassword?: string;
    proxyPacUrl?: string;
    proxyPacFallbackAllowed?: boolean;
    proxyCaptiveLoginAllowed?: boolean;
}

// VPN Sub-types
export interface IosVpnIKEv2SA {
    encryptionAlgorithm?: string;
    integrityAlgorithm?: string;
    diffieHellmanGroup?: number;
    lifeTimeInMinutes?: number;
}

export interface IosVpnIKEv2 {
    remoteIdentifier?: string;
    localIdentifier?: string;
    authenticationMethod?: 'None' | 'SharedSecret' | 'Certificate';
    payloadCertificateUUID?: string;
    sharedSecret?: string;
    authName?: string;
    authPassword?: string;
    password?: string;
    certificateType?: 'RSA' | 'ECDSA256' | 'ECDSA384' | 'ECDSA521' | 'RSA-PSS';
    serverCertificateCommonName?: string;
    serverCertificateIssuerCommonName?: string;
    enablePFS?: boolean;
    enableCertificateRevocationCheck?: boolean;
    disableMOBIKE?: boolean;
    disableRedirect?: boolean;
    enableFallback?: boolean;
    extendedAuthEnabled?: boolean;
    useConfigurationAttributeInternalIPSubnet?: boolean;
    deadPeerDetectionRate?: 'None' | 'Low' | 'Medium' | 'High';
    disconnectOnIdle?: boolean;
    disconnectOnIdleTimer?: number;
    mTU?: number;
    nATKeepAliveInterval?: number;
    nATKeepAliveOffloadEnable?: boolean;
    includeAllNetworks?: boolean;
    enforceRoutes?: boolean;
    excludeLocalNetworks?: boolean;
    excludeCellularServices?: boolean;
    excludeAPNs?: boolean;
    excludeDeviceCommunication?: boolean;
    pPK?: string;
    pPKIdentifier?: string;
    pPKMandatory?: boolean;
    allowPostQuantumKeyExchangeFallback?: boolean;
    enforceStrictAlgorithmSelection?: boolean;
    tLSMaximumVersion?: string;
    tLSMinimumVersion?: string;
    iKESecurityAssociationParameters?: IosVpnIKEv2SA;
    childSecurityAssociationParameters?: IosVpnIKEv2SA;
}

export interface IosVpnIPSec {
    authenticationMethod?: 'SharedSecret' | 'Certificate';
    localIdentifier?: string;
    localIdentifierType?: 'KeyID';
    sharedSecret?: string;
    payloadCertificateUUID?: string;
    xAuthEnabled?: boolean;
    xAuthName?: string;
    xAuthPassword?: string;
    xAuthPasswordEncryption?: 'Prompt';
    promptForVPNPIN?: boolean;
    onDemandEnabled?: boolean;
    disconnectOnIdle?: boolean;
    disconnectOnIdleTimer?: number;
}

export interface IosVpnPPP {
    authName?: string;
    authPassword?: string;
    commRemoteAddress?: string;
    tokenCard?: boolean;
    disconnectOnIdle?: boolean;
    disconnectOnIdleTimer?: number;
    authEAPPlugins?: string[];
    authProtocol?: string[];
    cCPEnabled?: boolean;
    cCPMPPE40Enabled?: boolean;
    cCPMPPE128Enabled?: boolean;
}

export interface IosVpnIPv4 {
    overridePrimary?: boolean;
    configMethod?: string;
}

export interface IosVpnDNS {
    serverAddresses?: string[];
    searchDomains?: string[];
    supplementalMatchDomains?: string[];
}

export interface IosVpnProxies {
    hTTPEnable?: boolean;
    hTTPProxy?: string;
    hTTPPort?: number;
    proxyAutoConfigEnable?: boolean;
    proxyAutoConfigURLString?: string;
}

// iOS VPN Policy
export interface IosVpnPolicy extends UserAuditData {
    id?: string;
    name: string;
    policyType?: 'IosVpnPolicy';
    vpnType: 'L2TP' | 'PPTP' | 'IPSec' | 'IKEv2' | 'AlwaysOn' | 'VPN' | 'TransparentProxy';
    vpnSubType?: string;
    providerBundleIdentifier?: string;
    providerDesignatedRequirement?: string;
    providerType?: 'packet-tunnel' | 'app-proxy';
    remoteAddress: string;
    authName?: string;
    authPassword?: string;
    payloadCertificateUUID?: string;
    ikev2?: IosVpnIKEv2;
    ipsec?: IosVpnIPSec;
    ppp?: IosVpnPPP;
    ipv4?: IosVpnIPv4;
    dns?: IosVpnDNS;
    proxies?: IosVpnProxies;
}

// iOS Per-App VPN Policy
export interface IosPerAppVpnPolicy extends UserAuditData {
    id?: string;
    name: string;
    applicationIds: string[];
}

// iOS Per-Domain VPN Policy
export interface IosPerDomainVpnPolicy extends UserAuditData {
    id?: string;
    name: string;
    policyType?: 'IosPerDomainVpnPolicy';
    safariDomains?: string[];
    associatedDomains?: string[];
    excludedDomains?: string[];
    onDemandMatchAppEnabled?: boolean;
}

// iOS Relay Policy
export interface IosRelayPolicy extends UserAuditData {
    id?: string;
    name: string;
    policyType?: 'IosRelayPolicy';
    http3RelayUrl?: string;
    http2RelayUrl?: string;
    additionalHttpHeaders?: Record<string, string>;
    matchDomains?: string[];
    excludedDomains?: string[];
    payloadCertificateUUID?: string;
    rawPublicKeys?: string[];
}

