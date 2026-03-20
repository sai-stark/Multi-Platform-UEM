// ========================================
// ANDROID RESTRICTIONS - OpenAPI Spec
// ========================================

// Shared Types
export type ControlType = 'ENABLE' | 'DISABLE' | 'USER_CONTROLLED';

// Kiosk Restriction Enums (from new API)
export type SystemNavigationRestriction = 'NAVIGATION_ENABLED' | 'NAVIGATION_DISABLED' | 'HOME_BUTTON_ONLY';
export type StatusBarRestrictionEnum = 'NOTIFICATIONS_AND_SYSTEM_INFO_ENABLED' | 'NOTIFICATIONS_AND_SYSTEM_INFO_DISABLED' | 'SYSTEM_INFO_ONLY';
export type BatteryPluggedMode = 'AC' | 'USB' | 'WIRELESS';

// Storage Restriction Enums (from new API)
export type UsbDataAccess = 'ALLOW_USB_DATA_TRANSFER' | 'DISALLOW_USB_FILE_TRANSFER' | 'DISALLOW_USB_DATA_TRANSFER';

// DateTimePolicy discriminated union
export interface NetworkProvidedDateTime {
    dateTimeSetting: 'NetworkProvidedDateTime';
}

export interface ManualDateTime {
    dateTimeSetting: 'ManualDateTime';
    timezone?: string;
}

export type DateTimePolicy = NetworkProvidedDateTime | ManualDateTime;

// BrightnessPolicy discriminated union
export interface AdaptiveBrightness {
    brightness: 'AdaptiveBrightness';
}

export interface FixedBrightness {
    brightness: 'FixedBrightness';
    brightnessPercentage?: number;
}

export type BrightnessPolicy = AdaptiveBrightness | FixedBrightness;

// ========================================
// RESTRICTIONS
// ========================================

// 1. Security Restriction (AndroidSecurityRestriction)
export interface SecurityRestriction {
    id?: string;
    lockSafeSettings?: boolean;
    disableDevMode?: boolean;
    disableThirdPartyAppInstall?: boolean;
    enablePermissiveMode?: boolean;
    devicePolicyType?: 'AndroidSecurityRestriction';
}

// 2. Passcode Restriction
export interface PasscodeRestrictionPolicy {
    id?: string;
    passcodeId?: string;
    name?: string;
    policyType?: string;
    complexity?: string;
    minLength?: number;
    minUpperCase?: number;
    minLowerCase?: number;
    minDigits?: number;
    minSymbols?: number;
    creationTime?: string;
    modificationTime?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

// 3. Sync Storage Restriction (AndroidSyncStorageRestriction)
export interface SyncStorageRestriction {
    id?: string;
    disableExternalMediaMount?: boolean;
    usbDataAccess?: UsbDataAccess;
    devicePolicyType?: 'AndroidSyncStorageRestriction';
}

// 4. Kiosk Restriction (AndroidKioskRestriction)
export interface KioskRestriction {
    id?: string;
    navigation?: SystemNavigationRestriction;
    statusBar?: StatusBarRestrictionEnum;
    denyDeviceSettingsAccess?: boolean;
    enableSystemWarnings?: boolean;
    disableLockScreen?: boolean;
    createWindowsDisabled?: boolean;
    skipFirstUseHintsEnabled?: boolean;
    stayOnPlugged?: BatteryPluggedMode[];
    lockPowerButton?: boolean;
    devicePolicyType?: 'AndroidKioskRestriction';
}

// 5. Location Restriction (AndroidLocationRestriction)
export interface LocationRestriction {
    id?: string;
    location?: ControlType;
    disableLocationSharing?: boolean;
    devicePolicyType?: 'AndroidLocationRestriction';
}

// 6. Tethering Restriction (AndroidTetheringRestriction)
export interface TetheringRestriction {
    id?: string;
    disableTethering?: boolean;
    disableWifiTethering?: boolean;
    devicePolicyType?: 'AndroidTetheringRestriction';
}

// 7. Phone Restriction (AndroidPhoneRestriction)
export interface PhoneRestriction {
    id?: string;
    disableSms?: boolean;
    disableCalls?: boolean;
    devicePolicyType?: 'AndroidPhoneRestriction';
}

// 8. DateTime Restriction (AndroidDateTimeRestriction)
export interface DateTimeRestriction {
    id?: string;
    dateTimePolicy?: DateTimePolicy;
    disableDateTimeSetting?: boolean;
    devicePolicyType?: 'AndroidDateTimeRestriction';
}

// 9. Display Restriction (AndroidDisplayRestriction)
export interface DisplayRestriction {
    id?: string;
    screenTimeoutSeconds?: number;
    disableScreenTimeoutSetting?: boolean;
    disableBrightnessSetting?: boolean;
    disableAmbientDisplay?: boolean;
    brightnessPolicy?: BrightnessPolicy;
    devicePolicyType?: 'AndroidDisplayRestriction';
}

// 10. Miscellaneous Restriction (AndroidMiscellaneousRestriction)
export interface MiscellaneousRestriction {
    id?: string;
    disableAddUser?: boolean;
    disableFactoryReset?: boolean;
    devicePolicyType?: 'AndroidMiscellaneousRestriction';
}

// 11. Applications Restriction (AndroidApplicationsRestriction)
export interface ApplicationsRestriction {
    id?: string;
    disableAppInstall?: boolean;
    disableAppUninstall?: boolean;
    disableAppControl?: boolean;
    devicePolicyType?: 'AndroidApplicationsRestriction';
}

// 12. Connectivity Restriction (AndroidConnectivityRestriction)
export interface ConnectivityRestriction {
    id?: string;
    disableOutgoingBeam?: boolean;
    disablePrinting?: boolean;
    nfc?: ControlType;
    bluetooth?: ControlType;
    devicePolicyType?: 'AndroidConnectivityRestriction';
}

// 13. Network Restriction (AndroidNetworkRestriction)
export interface NetworkRestriction {
    id?: string;
    disableAirplaneMode?: boolean;
    disableRoamingData?: boolean;
    disableVpnConfig?: boolean;
    disableWifiDirect?: boolean;
    wifi?: ControlType;
    disableWifiConfig?: boolean;
    devicePolicyType?: 'AndroidNetworkRestriction';
}

// iOS Restrictions Payload (from OpenAPI IosRestrictionsPayload)
export interface IosRestrictionsPayload {
    id?: string;
    name: string;
    policyType?: 'IosDeviceRestrictions';
    restrictions?: RestrictionsPayload;
}

export interface RestrictionsPayload {
    // --- Security ---
    allowCamera?: boolean;
    allowScreenShot?: boolean;
    allowFingerprintForUnlock?: boolean;
    allowFingerprintModification?: boolean;
    allowPasscodeModification?: boolean;
    allowPasswordAutoFill?: boolean;
    allowPasswordProximityRequests?: boolean;
    allowPasswordSharing?: boolean;
    allowUntrustedTLSPrompt?: boolean;
    allowUSBRestrictedMode?: boolean;
    allowUnpairedExternalBootToRecovery?: boolean;
    forceEncryptedBackup?: boolean;
    forceAuthenticationBeforeAutoFill?: boolean;

    // --- Apps & App Store ---
    allowAppInstallation?: boolean;
    allowAppRemoval?: boolean;
    allowUIAppInstallation?: boolean;
    allowAppClips?: boolean;
    allowAutomaticAppDownloads?: boolean;
    allowInAppPurchases?: boolean;
    allowSystemAppRemoval?: boolean;
    allowMarketplaceAppInstallation?: boolean;
    allowWebDistributionAppInstallation?: boolean;
    allowEnterpriseAppTrust?: boolean;
    allowListedAppBundleIDs?: string[];
    blockedAppBundleIDs?: string[];
    allowAppsToBeHidden?: boolean;
    allowAppsToBeLocked?: boolean;

    // --- iCloud ---
    allowCloudBackup?: boolean;
    allowCloudDocumentSync?: boolean;
    allowCloudKeychainSync?: boolean;
    allowCloudPhotoLibrary?: boolean;
    allowCloudPrivateRelay?: boolean;
    allowCloudAddressBook?: boolean;
    allowCloudBookmarks?: boolean;
    allowCloudCalendar?: boolean;
    allowCloudDesktopAndDocuments?: boolean;
    allowCloudFreeform?: boolean;
    allowCloudMail?: boolean;
    allowCloudNotes?: boolean;
    allowCloudReminders?: boolean;
    allowManagedAppsCloudSync?: boolean;

    // --- Safari ---
    allowSafari?: boolean;
    allowSafariHistoryClearing?: boolean;
    allowSafariPrivateBrowsing?: boolean;
    allowSafariSummary?: boolean;
    safariAcceptCookies?: number;
    safariAllowAutoFill?: boolean;
    safariAllowJavaScript?: boolean;
    safariAllowPopups?: boolean;
    safariForceFraudWarning?: boolean;

    // --- Siri & AI ---
    allowAssistant?: boolean;
    allowAssistantUserGeneratedContent?: boolean;
    allowAssistantWhileLocked?: boolean;
    allowAppleIntelligenceReport?: boolean;
    allowExternalIntelligenceIntegrations?: boolean;
    allowExternalIntelligenceIntegrationsSignIn?: boolean;
    allowGenmoji?: boolean;
    allowImagePlayground?: boolean;
    allowImageWand?: boolean;
    allowWritingTools?: boolean;
    allowVisualIntelligenceSummary?: boolean;
    forceAssistantProfanityFilter?: boolean;
    forceOnDeviceOnlyDictation?: boolean;
    forceOnDeviceOnlyTranslation?: boolean;

    // --- Communication ---
    allowAirDrop?: boolean;
    allowAirPlayIncomingRequests?: boolean;
    allowAirPrint?: boolean;
    allowAirPrintCredentialsStorage?: boolean;
    allowAirPrintiBeaconDiscovery?: boolean;
    forceAirDropUnmanaged?: boolean;
    forceAirPlayIncomingRequestsPairingPassword?: boolean;
    forceAirPlayOutgoingRequestsPairingPassword?: boolean;
    forceAirPrintTrustedTLSRequirement?: boolean;
    allowChat?: boolean;
    allowRCSMessaging?: boolean;
    allowVideoConferencing?: boolean;
    allowVideoConferencingRemoteControl?: boolean;

    // --- Content Ratings ---
    allowExplicitContent?: boolean;
    ratingApps?: number;
    ratingMovies?: number;
    ratingTVShows?: number;
    ratingRegion?: string;
    ratingAppsExemptedBundleIDs?: string[];
    allowBookstore?: boolean;
    allowBookstoreErotica?: boolean;

    // --- Connectivity ---
    allowBluetoothModification?: boolean;
    allowBluetoothSharingModification?: boolean;
    allowNFC?: boolean;
    allowPersonalHotspotModification?: boolean;
    allowCellularPlanModification?: boolean;
    allowAppCellularDataModification?: boolean;
    allowESIMModification?: boolean;
    allowESIMOutgoingTransfers?: boolean;
    allowGlobalBackgroundFetchWhenRoaming?: boolean;
    allowVPNCreation?: boolean;
    forceWiFiPowerOn?: boolean;
    forceWiFiToAllowedNetworksOnly?: boolean;
    allowSatelliteConnection?: boolean;

    // --- Device Features ---
    allowAccountModification?: boolean;
    allowActivityContinuation?: boolean;
    allowAutoCorrection?: boolean;
    allowAutoDim?: boolean;
    allowAutoUnlock?: boolean;
    allowContinuousPathKeyboard?: boolean;
    allowDefinitionLookup?: boolean;
    allowDeviceNameModification?: boolean;
    allowDiagnosticSubmission?: boolean;
    allowDiagnosticSubmissionModification?: boolean;
    allowDictation?: boolean;
    allowEnablingRestrictions?: boolean;
    allowEraseContentAndSettings?: boolean;
    allowHostPairing?: boolean;
    allowKeyboardShortcuts?: boolean;
    allowLockScreenControlCenter?: boolean;
    allowLockScreenNotificationsView?: boolean;
    allowLockScreenTodayView?: boolean;
    allowNotificationsModification?: boolean;
    allowPairedWatch?: boolean;
    allowPassbookWhileLocked?: boolean;
    allowPredictiveKeyboard?: boolean;
    allowProximitySetupToNewDevice?: boolean;
    allowRemoteScreenObservation?: boolean;
    allowSharedStream?: boolean;
    allowSpellCheck?: boolean;
    allowSpotlightInternetResults?: boolean;
    allowWallpaperModification?: boolean;
    allowFilesNetworkDriveAccess?: boolean;
    allowFilesUSBDriveAccess?: boolean;
    allowFindMyDevice?: boolean;
    allowFindMyFriends?: boolean;
    allowFindMyFriendsModification?: boolean;
    forceAutomaticDateAndTime?: boolean;
    forceWatchWristDetection?: boolean;
    requireManagedPasteboard?: boolean;
    allowUIConfigurationProfileInstallation?: boolean;
    allowCallRecording?: boolean;
    allowApplePersonalizedAdvertising?: boolean;
    forceLimitAdTracking?: boolean;

    // --- Media & Entertainment ---
    allowiTunes?: boolean;
    allowMusicService?: boolean;
    allowRadioService?: boolean;
    allowNews?: boolean;
    allowPodcasts?: boolean;

    // --- Gaming ---
    allowGameCenter?: boolean;
    allowAddingGameCenterFriends?: boolean;
    allowMultiplayerGaming?: boolean;

    // --- Data Sharing ---
    allowOpenFromManagedToUnmanaged?: boolean;
    allowOpenFromUnmanagedToManaged?: boolean;
    allowManagedToWriteUnmanagedContacts?: boolean;
    allowUnmanagedToReadManagedContacts?: boolean;
    allowEnterpriseBookBackup?: boolean;
    allowEnterpriseBookMetadataSync?: boolean;

    // --- Misc ---
    allowMailPrivacyProtection?: boolean;
    allowMailSmartReplies?: boolean;
    allowMailSummary?: boolean;
    allowNotesTranscription?: boolean;
    allowNotesTranscriptionSummary?: boolean;
    allowPersonalizedHandwritingResults?: boolean;
    allowLiveVoicemail?: boolean;
    allowiPhoneMirroring?: boolean;
    allowiPhoneWidgetsOnMac?: boolean;
    allowOTAPKIUpdates?: boolean;
    allowSharedDeviceTemporarySession?: boolean;
    allowDefaultBrowserModification?: boolean;
    allowDefaultCallingAppModification?: boolean;
    allowDefaultMessagingAppModification?: boolean;
    forcePreserveESIMOnErase?: boolean;
    autonomousSingleAppModePermittedAppIDs?: string[];
    [key: string]: boolean | number | string | string[] | undefined;
}

// Composite interface for the editor (wraps iOS restrictions - DEPRECATED but kept for compat)
export interface RestrictionsComposite extends IosRestrictionsPayload { }

