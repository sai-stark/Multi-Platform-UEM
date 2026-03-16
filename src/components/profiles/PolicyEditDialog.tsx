import {
    Dialog,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
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
import { useEffect, useState } from "react";

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
    const [isChildEditing, setIsChildEditing] = useState(false);

    useEffect(() => {
        setIsChildEditing(false);
    }, [activePolicyType, profileId]);

    if (!activePolicyType) return null;

    const handleCancel = () => onOpenChange(false);

    // Helper to determine dialog title and icon based on policy type
    const getPolicyHeader = () => {
        switch (activePolicyType) {
            case "passcode":
            case "androidPasscode":
                return { title: "Passcode Policy", icon: null }; // Passcode policies often have their own headers or don't need one

            case "certificates":
                return {
                    title: certificatesConfigured ? "Edit Certificates Policy" : "Configure Certificates Policy",
                    icon: <Shield className={cn("w-6 h-6", certificatesConfigured ? "text-primary" : "text-muted-foreground")} />,
                    description: "Manage PEM, PKCS, and PKCS12 identities."
                };
            case "appLock":
                return { title: "App Lock / Kiosk Mode", icon: <Lock className="w-5 h-5 text-indigo-500" /> };
            case "wifi":
                return { title: "WiFi Configuration", icon: <Wifi className="w-5 h-5 text-info" /> };
            case "mail":
                return { title: "Mail Configuration", icon: <Mail className="w-5 h-5 text-purple-500" /> };
            case "restrictions":
                return { title: "Device Restrictions", icon: <Ban className="w-5 h-5 text-destructive" /> };
            case "applications":
            case "androidApplication":
                return { title: "Application Policy", icon: <Grid className="w-5 h-5 text-orange-500" /> };
            case "webApps":
            case "androidWebApp":
                return { title: "Web Application Policy", icon: <Globe className="w-5 h-5 text-blue-500" /> };
            case "notifications":
                return { title: "Notification Policy", icon: <Bell className="w-5 h-5" /> };
            case "lockScreenMessage":
                return { title: "Lock Screen Message", icon: <MessageSquare className="w-5 h-5" /> };
            case "webContentFilter":
                return { title: "Web Content Filter", icon: <Filter className="w-5 h-5 text-orange-500" /> };
            case "globalHttpProxy":
                return { title: "Global HTTP Proxy", icon: <Globe className="w-5 h-5 text-cyan-600" /> };
            case "vpn":
                return { title: "VPN", icon: <Lock className="w-5 h-5 text-violet-600" /> };
            case "perAppVpn":
                return { title: "Per-App VPN", icon: <Lock className="w-5 h-5 text-fuchsia-600" /> };
            case "perDomainVpn":
                return { title: "Per-Domain VPN", icon: <Lock className="w-5 h-5 text-rose-600" /> };
            case "relay":
                return { title: "Relay", icon: <Radio className="w-5 h-5 text-amber-600" /> };
            case "homeScreenLayout":
                return { title: "Home Screen Layout", icon: <Smartphone className="w-5 h-5 text-teal-600" /> };
            case "mdm":
                return { title: "MDM Configuration", icon: <Server className="w-5 h-5 text-slate-500" /> };
            case "deviceSettings":
                return { title: "Device Settings", icon: <Settings className="w-5 h-5 text-emerald-600" /> };
            // Add other cases as needed
            default:
                return { title: "Edit Policy", icon: null };
        }
    };

    const { title, icon } = getPolicyHeader();



    const isWidePolicy = activePolicyType === "androidApplication" || activePolicyType === "applications";
    const isEditingWideContent = (activePolicyType === "restrictions" || activePolicyType === "deviceSettings") && isChildEditing;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "max-h-[90vh] overflow-hidden flex flex-col p-0",
                isWidePolicy || isEditingWideContent ? "max-w-[80vw]" : "max-w-4xl"
            )}>
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <div className="flex-1 overflow-y-auto min-h-0 p-6 pt-0 pb-0">
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
                            onEditModeChange={setIsChildEditing}
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
                            onEditModeChange={setIsChildEditing}
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
