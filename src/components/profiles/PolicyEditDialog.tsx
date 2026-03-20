import { cn } from "@/lib/utils";
import { IosAppLockPolicy, IosDeviceSettingsPolicy, IosGlobalHttpProxyPolicy, IosHomeScreenLayoutPolicy, IosMdmConfiguration, IosPerAppVpnPolicy, IosPerDomainVpnPolicy, IosRelayPolicy, IosScepConfiguration, IosVpnPolicy, IosWebContentFilterPolicy } from "@/types/ios";
import {
    AndroidProfileRestrictions,
    ApplicationPolicy,
    CommonSettingsPolicy,
    DeviceThemePolicy,
    EnrollmentPolicy,
    IosMailPolicy,
    IosPasscodeRestrictionPolicy,
    IosWiFiConfiguration,
    LockScreenMessagePolicy as LockScreenMessagePolicyType,
    ManagementMode,
    NotificationPolicy as NotificationPolicyType,
    PasscodeRestrictionPolicy, Platform, RestrictionsComposite,
    WebApplicationPolicy
} from "@/types/models";
import {
    Ban,
    Bell,
    Filter,
    Globe,
    Grid,
    Lock,
    Mail,
    MessageSquare,
    Radio,
    Server,
    Settings,
    Shield,
    Smartphone,
    Wifi,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

// Base Dialog
import { BaseDialog } from "@/components/common/BaseDialog";
import { BaseDialogProvider } from "@/components/common/BaseDialogContext";

// Android Policy Imports
import {
    AndroidApplicationPolicy,
    PasscodePolicy as AndroidPasscodePolicy,
    AndroidWebApplicationPolicy,
    CommonSettingsPolicy as CommonSettingsPolicyEditor,
    DeviceThemePolicy as DeviceThemePolicyEditor,
    EnrollmentPolicy as EnrollmentPolicyEditor,
} from "@/components/profiles/AndroidPolicies";
import {
    AndroidDeviceRestrictions,
} from "@/components/profiles/AndroidRestrictions";

// iOS Policy Imports
import { ApplicationPolicyEditor } from "@/components/profiles/IosPolicies/ApplicationPolicy";
import { AppLockPolicy as AppLockPolicyEditor } from "@/components/profiles/IosPolicies/AppLockPolicy";
import { CertificatesPolicy } from "@/components/profiles/IosPolicies/CertificatesPolicy";
import { DeviceSettingsPolicy } from "@/components/profiles/IosPolicies/DeviceSettingsPolicy";
import { GlobalHttpProxyPolicy as GlobalHttpProxyPolicyEditor } from "@/components/profiles/IosPolicies/GlobalHttpProxyPolicy";
import { HomeScreenLayoutPolicy as HomeScreenLayoutPolicyEditor } from "@/components/profiles/IosPolicies/HomeScreenLayoutPolicy";
import { LockScreenMessagePolicy } from "@/components/profiles/IosPolicies/LockScreenMessagePolicy";
import { MailPolicy } from "@/components/profiles/IosPolicies/MailPolicy";
import { MdmPolicy } from "@/components/profiles/IosPolicies/MdmPolicy";
import { NotificationPolicy } from "@/components/profiles/IosPolicies/NotificationPolicy";
import { PasscodePolicy } from "@/components/profiles/IosPolicies/PasscodePolicy";
import { PerAppVpnPolicy as PerAppVpnPolicyEditor } from "@/components/profiles/IosPolicies/PerAppVpnPolicy";
import { PerDomainVpnPolicy as PerDomainVpnPolicyEditor } from "@/components/profiles/IosPolicies/PerDomainVpnPolicy";
import { RelayPolicy as RelayPolicyEditor } from "@/components/profiles/IosPolicies/RelayPolicy";
import { RestrictionsPolicy } from "@/components/profiles/IosPolicies/RestrictionsPolicy";
import { VpnPolicy as VpnPolicyEditor } from "@/components/profiles/IosPolicies/VpnPolicy";
import { WebApplicationPolicyEditor } from "@/components/profiles/IosPolicies/WebApplicationPolicy";
import { WebContentFilterPolicy as WebContentFilterPolicyEditor } from "@/components/profiles/IosPolicies/WebContentFilterPolicy";
import { WifiPolicy } from "@/components/profiles/IosPolicies/WifiPolicy";
import { ScepPolicyView } from "@/components/profiles/IosPolicyCards";

interface PolicyEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activePolicyType: string | null;
    platform: Platform;
    profileId: string;
    managementMode?: ManagementMode;
    // Policy Data Props
    passcodePolicy?: PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy;
    androidPasscodePolicy?: any;
    wifiPolicy?: IosWiFiConfiguration;
    mailPolicy?: IosMailPolicy;
    restrictionsPolicy?: RestrictionsComposite | AndroidProfileRestrictions;
    applicationPolicy: ApplicationPolicy[];
    webApplicationPolicy: WebApplicationPolicy[];
    notificationPolicy: NotificationPolicyType[];
    lockScreenMessagePolicy: LockScreenMessagePolicyType | null;
    scepPolicy?: IosScepConfiguration;
    mdmPolicy?: IosMdmConfiguration;
    deviceSettingsPolicy?: IosDeviceSettingsPolicy;
    webContentFilterPolicy?: IosWebContentFilterPolicy;
    globalHttpProxyPolicy?: IosGlobalHttpProxyPolicy;
    vpnPolicy?: IosVpnPolicy;
    perAppVpnPolicy?: IosPerAppVpnPolicy;
    perDomainVpnPolicy?: IosPerDomainVpnPolicy;
    relayPolicy?: IosRelayPolicy;
    homeScreenLayoutPolicy?: IosHomeScreenLayoutPolicy;
    appLockPolicy?: IosAppLockPolicy;
    certificatesConfigured?: boolean;
    certificatesCount?: number;
    commonSettingsPolicy?: CommonSettingsPolicy;
    deviceThemePolicy?: DeviceThemePolicy;
    enrollmentPolicy?: EnrollmentPolicy;
    onSave: () => void | Promise<void>;
}

// ── Wide / master-detail dialog types ────────────────────────
const WIDE_POLICY_TYPES = new Set([
    'androidApplication', 'applications',
    'restrictions', 'androidDeviceRestriction', 'deviceSettings',
]);

export function PolicyEditDialog({
    open,
    onOpenChange,
    activePolicyType,
    platform,
    profileId,
    managementMode,
    passcodePolicy,
    androidPasscodePolicy,
    wifiPolicy,
    mailPolicy,
    restrictionsPolicy,
    applicationPolicy,
    webApplicationPolicy,
    notificationPolicy,
    lockScreenMessagePolicy,
    scepPolicy,
    mdmPolicy,
    deviceSettingsPolicy,
    webContentFilterPolicy,
    globalHttpProxyPolicy,
    vpnPolicy,
    perAppVpnPolicy,
    perDomainVpnPolicy,
    relayPolicy,
    homeScreenLayoutPolicy,
    appLockPolicy,
    certificatesConfigured,
    certificatesCount,
    commonSettingsPolicy,
    deviceThemePolicy,
    enrollmentPolicy,
    onSave,
}: PolicyEditDialogProps) {

    // ── Context bridge state ─────────────────────────────────
    const saveRef = useRef<(() => void | Promise<void>) | null>(null);
    const [isChildLoading, setIsChildLoading] = useState(false);
    const [isSaveDisabled, setIsSaveDisabled] = useState(false);

    const handleLoadingChange = useCallback((loading: boolean) => {
        setIsChildLoading(loading);
    }, []);

    const handleSaveDisabledChange = useCallback((disabled: boolean) => {
        setIsSaveDisabled(disabled);
    }, []);

    const handleSave = useCallback(() => {
        saveRef.current?.();
    }, []);

    if (!activePolicyType) return null;

    const handleCancel = () => onOpenChange(false);

    // Helper to determine dialog title, icon, and subtitle based on policy type
    const getPolicyHeader = () => {
        switch (activePolicyType) {
            case "passcode":
            case "androidPasscode":
                return { title: "Passcode Policy", icon: <Lock className={cn("w-5 h-5 text-primary")} />, subtitle: "Configure passcode requirements" };

            case "certificates":
                return {
                    title: certificatesConfigured ? "Edit Certificates Policy" : "Configure Certificates Policy",
                    icon: <Shield className={cn("w-5 h-5", certificatesConfigured ? "text-primary" : "text-muted-foreground")} />,
                    subtitle: "Manage PEM, PKCS, and PKCS12 identities"
                };
            case "rootCertificates":
                return {
                    title: "Root Certificates",
                    icon: <Shield className="w-5 h-5 text-primary" />,
                    subtitle: "Manage root certificate trust anchors"
                };
            case "appLock":
                return { title: "App Lock / Kiosk Mode", icon: <Lock className="w-5 h-5 text-primary" />, subtitle: "Configure single-app kiosk mode" };
            case "wifi":
                return { title: "WiFi Configuration", icon: <Wifi className="w-5 h-5 text-info" />, subtitle: "Configure wireless network settings" };
            case "mail":
                return { title: "Mail Configuration", icon: <Mail className="w-5 h-5 text-primary" />, subtitle: "Configure mail account settings" };
            case "restrictions":
                return { title: "Device Restrictions", icon: <Ban className="w-5 h-5 text-destructive" />, subtitle: "Manage allowed features and limitations" };
            case "applications":
            case "androidApplication":
                return { title: "Application Policy", icon: <Grid className="w-5 h-5 text-primary" />, subtitle: "Manage app installation, updates, and permissions" };
            case "webApps":
            case "androidWebApp":
                return { title: "Web Application Policy", icon: <Globe className="w-5 h-5 text-info" />, subtitle: "Configure web app clips and shortcuts" };
            case "notifications":
                return { title: "Notification Policy", icon: <Bell className="w-5 h-5 text-primary" />, subtitle: "Configure notification behaviour per app" };
            case "lockScreenMessage":
                return { title: "Lock Screen Message", icon: <MessageSquare className="w-5 h-5 text-primary" />, subtitle: "Set messages shown on the lock screen" };
            case "webContentFilter":
                return { title: "Web Content Filter", icon: <Filter className="w-5 h-5 text-warning" />, subtitle: "Filter web content access" };
            case "globalHttpProxy":
                return { title: "Global HTTP Proxy", icon: <Globe className="w-5 h-5 text-info" />, subtitle: "Route traffic through a proxy server" };
            case "vpn":
                return { title: "VPN", icon: <Lock className="w-5 h-5 text-primary" />, subtitle: "Configure virtual private network" };
            case "perAppVpn":
                return { title: "Per-App VPN", icon: <Lock className="w-5 h-5 text-primary" />, subtitle: "Route specific app traffic through VPN" };
            case "perDomainVpn":
                return { title: "Per-Domain VPN", icon: <Lock className="w-5 h-5 text-primary" />, subtitle: "Route specific domains through VPN" };
            case "relay":
                return { title: "Relay", icon: <Radio className="w-5 h-5 text-warning" />, subtitle: "Configure iCloud Private Relay settings" };
            case "homeScreenLayout":
                return { title: "Home Screen Layout", icon: <Smartphone className="w-5 h-5 text-primary" />, subtitle: "Customise home screen pages and dock" };
            case "mdm":
                return { title: "MDM Configuration", icon: <Server className="w-5 h-5 text-muted-foreground" />, subtitle: "View MDM enrollment settings" };
            case "deviceSettings":
                return { title: "Device Settings", icon: <Settings className="w-5 h-5 text-success" />, subtitle: "Configure device-level settings" };
            case "scep":
                return { title: "SCEP Configuration", icon: <Shield className="w-5 h-5 text-primary" />, subtitle: "View SCEP certificate enrolment" };
            case "commonSettings":
                return { title: "Common Settings", icon: <Settings className="w-5 h-5 text-primary" />, subtitle: "Configure common device settings" };
            case "deviceTheme":
                return { title: "Device Theme", icon: <Settings className="w-5 h-5 text-primary" />, subtitle: "Customise device appearance" };
            case "enrollment":
                return { title: "Enrollment Policy", icon: <Shield className="w-5 h-5 text-primary" />, subtitle: "Configure enrollment settings" };
            case "androidDeviceRestriction":
                return { title: "Device Restrictions", icon: <Ban className="w-5 h-5 text-destructive" />, subtitle: "Configure Android device restrictions" };
            default:
                return { title: "Edit Policy", icon: <Settings className="w-5 h-5 text-muted-foreground" />, subtitle: undefined };
        }
    };

    const { title, icon, subtitle } = getPolicyHeader();
    const isWide = WIDE_POLICY_TYPES.has(activePolicyType);

    // Read-only policies that don't need a save button
    const isReadOnly = activePolicyType === 'mdm' || activePolicyType === 'scep';

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            icon={icon}
            title={title}
            subtitle={subtitle}
            onClose={handleCancel}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isChildLoading}
            saveDisabled={isSaveDisabled || isReadOnly}
            contentClassName={cn(
                isWide && "max-w-[80vw]",
            )}
        >
            <BaseDialogProvider
                onSaveRef={saveRef}
                onLoadingChange={handleLoadingChange}
                onSaveDisabledChange={handleSaveDisabledChange}
            >
                {/* Render appropriate policy component based on activePolicyType */}
                {activePolicyType === "passcode" && (
                    <PasscodePolicy
                        platform={platform}
                        profileId={profileId}
                        initialData={passcodePolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "wifi" && (
                    <WifiPolicy
                        profileId={profileId}
                        initialData={wifiPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "mail" && (
                    <MailPolicy
                        profileId={profileId}
                        initialData={mailPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "restrictions" && (
                    <RestrictionsPolicy
                        profileId={profileId}
                        initialData={restrictionsPolicy as RestrictionsComposite | undefined}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "applications" && (
                    <ApplicationPolicyEditor
                        profileId={profileId}
                        platform={platform}
                        initialData={applicationPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "webApps" && (
                    <WebApplicationPolicyEditor
                        profileId={profileId}
                        platform={platform}
                        initialData={webApplicationPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "notifications" && (
                    <NotificationPolicy
                        platform={platform}
                        profileId={profileId}
                        initialData={notificationPolicy}
                        applicationPolicy={applicationPolicy}
                        onSave={onSave}
                    />
                )}
                {activePolicyType === "lockScreenMessage" && (
                    <LockScreenMessagePolicy
                        platform={platform}
                        profileId={profileId}
                        initialData={lockScreenMessagePolicy}
                        onSave={onSave}
                    />
                )}
                {activePolicyType === "scep" && scepPolicy && (
                    <ScepPolicyView policy={scepPolicy} onClose={handleCancel} />
                )}
                {activePolicyType === "mdm" && (
                    <MdmPolicy
                        profileId={profileId}
                        initialData={mdmPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "deviceSettings" && (
                    <DeviceSettingsPolicy
                        profileId={profileId}
                        initialData={deviceSettingsPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "certificates" && (
                    <CertificatesPolicy
                        profileId={profileId}
                        onCancel={handleCancel}
                        onSaveSuccess={onSave}
                        defaultTab="pem"
                    />
                )}
                {activePolicyType === "rootCertificates" && (
                    <CertificatesPolicy
                        profileId={profileId}
                        onCancel={handleCancel}
                        onSaveSuccess={onSave}
                        defaultTab="root"
                    />
                )}

                {/* Phase 2 iOS policy editors */}
                {activePolicyType === "webContentFilter" && (
                    <WebContentFilterPolicyEditor
                        profileId={profileId}
                        initialData={webContentFilterPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "globalHttpProxy" && (
                    <GlobalHttpProxyPolicyEditor
                        profileId={profileId}
                        initialData={globalHttpProxyPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "vpn" && (
                    <VpnPolicyEditor
                        profileId={profileId}
                        initialData={vpnPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "perAppVpn" && (
                    <PerAppVpnPolicyEditor
                        profileId={profileId}
                        initialData={perAppVpnPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "perDomainVpn" && (
                    <PerDomainVpnPolicyEditor
                        profileId={profileId}
                        initialData={perDomainVpnPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "relay" && (
                    <RelayPolicyEditor
                        profileId={profileId}
                        initialData={relayPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}

                {activePolicyType === "homeScreenLayout" && (
                    <HomeScreenLayoutPolicyEditor
                        profileId={profileId}
                        initialData={homeScreenLayoutPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "appLock" && (
                    <AppLockPolicyEditor
                        profileId={profileId}
                        initialData={appLockPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}

                {/* Android-specific policy editors */}
                {activePolicyType === "androidDeviceRestriction" && (
                    <AndroidDeviceRestrictions
                        platform={platform}
                        profileId={profileId}
                        restrictions={restrictionsPolicy as AndroidProfileRestrictions}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "commonSettings" && (
                    <CommonSettingsPolicyEditor
                        platform={platform}
                        profileId={profileId}
                        initialData={commonSettingsPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "deviceTheme" && (
                    <DeviceThemePolicyEditor
                        platform={platform}
                        profileId={profileId}
                        initialData={deviceThemePolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "enrollment" && (
                    <EnrollmentPolicyEditor
                        platform={platform}
                        profileId={profileId}
                        initialData={enrollmentPolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "androidApplication" && (
                    <AndroidApplicationPolicy
                        platform={platform}
                        profileId={profileId}
                        initialData={undefined}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "androidWebApp" && (
                    <AndroidWebApplicationPolicy
                        platform={platform}
                        profileId={profileId}
                        initialData={undefined}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
                {activePolicyType === "androidPasscode" && (
                    <AndroidPasscodePolicy
                        platform={platform}
                        profileId={profileId}
                        managementMode={managementMode}
                        initialData={androidPasscodePolicy}
                        onSave={onSave}
                        onCancel={handleCancel}
                    />
                )}
            </BaseDialogProvider>
        </BaseDialog>
    );
}
