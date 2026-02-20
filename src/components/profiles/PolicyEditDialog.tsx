import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IosGlobalHttpProxyPolicy, IosHomeScreenLayoutPolicy, IosMdmConfiguration, IosPerAppVpnPolicy, IosPerDomainVpnPolicy, IosRelayPolicy, IosScepConfiguration, IosVpnPolicy, IosWebContentFilterPolicy } from "@/types/ios";
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
    Smartphone,
    Wifi,
} from "lucide-react";

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
    ConnectivityRestriction,
    DateTimeRestriction,
    DisplayRestriction,
    KioskRestriction,
    LocationRestriction,
    MiscellaneousRestriction,
    NetworkRestriction,
    PhoneRestriction,
    SecurityRestriction,
    SyncStorageRestriction,
    TetheringRestriction,
} from "@/components/profiles/AndroidRestrictions";

// iOS Policy Imports
import { ApplicationPolicyEditor } from "@/components/profiles/IosPolicies/ApplicationPolicy";
import { GlobalHttpProxyPolicy as GlobalHttpProxyPolicyEditor } from "@/components/profiles/IosPolicies/GlobalHttpProxyPolicy";
import { HomeScreenLayoutPolicy as HomeScreenLayoutPolicyEditor } from "@/components/profiles/IosPolicies/HomeScreenLayoutPolicy";
import { LockScreenMessagePolicy } from "@/components/profiles/IosPolicies/LockScreenMessagePolicy";
import { MailPolicy } from "@/components/profiles/IosPolicies/MailPolicy";
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
import { MdmPolicyView, ScepPolicyView } from "@/components/profiles/IosPolicyCards";

interface PolicyEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activePolicyType: string | null;
    platform: Platform;
    profileId: string;
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
    webContentFilterPolicy?: IosWebContentFilterPolicy;
    globalHttpProxyPolicy?: IosGlobalHttpProxyPolicy;
    vpnPolicy?: IosVpnPolicy;
    perAppVpnPolicy?: IosPerAppVpnPolicy;
    perDomainVpnPolicy?: IosPerDomainVpnPolicy;
    relayPolicy?: IosRelayPolicy;
    homeScreenLayoutPolicy?: IosHomeScreenLayoutPolicy;
    commonSettingsPolicy?: CommonSettingsPolicy;
    deviceThemePolicy?: DeviceThemePolicy;
    enrollmentPolicy?: EnrollmentPolicy;
    onSave: () => void;
}

export function PolicyEditDialog({
    open,
    onOpenChange,
    activePolicyType,
    platform,
    profileId,
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
    webContentFilterPolicy,
    globalHttpProxyPolicy,
    vpnPolicy,
    perAppVpnPolicy,
    perDomainVpnPolicy,
    relayPolicy,
    homeScreenLayoutPolicy,
    commonSettingsPolicy,
    deviceThemePolicy,
    enrollmentPolicy,
    onSave,
}: PolicyEditDialogProps) {
    if (!activePolicyType) return null;

    const handleCancel = () => onOpenChange(false);

    // Helper to determine dialog title and icon based on policy type
    const getPolicyHeader = () => {
        switch (activePolicyType) {
            case "passcode":
            case "androidPasscode":
                return { title: "Passcode Policy", icon: null }; // Passcode policies often have their own headers or don't need one
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
            // Add other cases as needed
            default:
                return { title: "Edit Policy", icon: null };
        }
    };

    const { title, icon } = getPolicyHeader();

    // All policy components render their own headers, so always hide the generic dialog header
    const hideDefaultHeader = true;


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="pt-0">
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
                        />
                    )}
                    {activePolicyType === "lockScreenMessage" && (
                        <LockScreenMessagePolicy
                            platform={platform}
                            profileId={profileId}
                            initialData={lockScreenMessagePolicy}
                        />
                    )}
                    {activePolicyType === "scep" && scepPolicy && (
                        <ScepPolicyView policy={scepPolicy} onClose={handleCancel} />
                    )}
                    {activePolicyType === "mdm" && mdmPolicy && (
                        <MdmPolicyView policy={mdmPolicy} onClose={handleCancel} />
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

                    {/* Android-specific policy editors */}
                    {activePolicyType === "securityRestriction" && (
                        <SecurityRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={(restrictionsPolicy as AndroidProfileRestrictions)?.security}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "kioskRestriction" && (
                        <KioskRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={(restrictionsPolicy as AndroidProfileRestrictions)?.kiosk}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "locationRestriction" && (
                        <LocationRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={(restrictionsPolicy as AndroidProfileRestrictions)?.location}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "tetheringRestriction" && (
                        <TetheringRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={(restrictionsPolicy as AndroidProfileRestrictions)?.tethering}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "phoneRestriction" && (
                        <PhoneRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={(restrictionsPolicy as AndroidProfileRestrictions)?.phone}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "dateTimeRestriction" && (
                        <DateTimeRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={(restrictionsPolicy as AndroidProfileRestrictions)?.dateTime}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "displayRestriction" && (
                        <DisplayRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={(restrictionsPolicy as AndroidProfileRestrictions)?.display}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "miscRestriction" && (
                        <MiscellaneousRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={(restrictionsPolicy as AndroidProfileRestrictions)?.miscellaneous}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "connectivityRestriction" && (
                        <ConnectivityRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={(restrictionsPolicy as AndroidProfileRestrictions)?.connectivity}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "networkRestriction" && (
                        <NetworkRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={(restrictionsPolicy as AndroidProfileRestrictions)?.network}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "storageRestriction" && (
                        <SyncStorageRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={(restrictionsPolicy as AndroidProfileRestrictions)?.syncStorage}
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
