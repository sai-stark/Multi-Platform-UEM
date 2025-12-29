export interface IosAppNotificationSetting {
    id?: string;
    bundleIdentifier: string;
    enabled?: boolean;
    showInNotificationCenter?: boolean;
    showInLockScreen?: boolean;
    alertStyle?: 'NONE' | 'BANNER' | 'ALERT';
}

export interface IosWiFiConfiguration {
    id?: string;
    ssid: string;
    securityType?: 'NONE' | 'WEP' | 'WPA' | 'WPA2' | 'ANY';
    password?: string;
}

export interface IosMailPolicy {
    id?: string;
    accountDescription?: string;
    accountType?: 'EMAIL' | 'EXCHANGE';
    emailAddress?: string;
    incomingMailServerHostName?: string;
    outgoingMailServerHostName?: string;
}

export interface IosMdmConfiguration {
    id?: string;
    serverUrl?: string;
    accessRights?: number;
}

export interface IosCertificateRootPolicy {
    id?: string;
    fileName: string;
    content: string; // Base64
}

export interface IosScepConfiguration {
    id?: string;
    url: string;
    name?: string;
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
}
