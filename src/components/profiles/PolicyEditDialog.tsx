import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IosMdmConfiguration, IosScepConfiguration } from "@/types/ios";
import {
    AndroidProfileRestrictions,
    ApplicationPolicy,
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
    Globe,
    Grid,
    Mail,
    MessageSquare,
    Wifi,
} from "lucide-react";

// Android Policy Imports
import {
    AndroidApplicationPolicy,
    PasscodePolicy as AndroidPasscodePolicy,
    AndroidWebApplicationPolicy,
    CommonSettingsPolicy,
    DeviceThemePolicy,
    EnrollmentPolicy,
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
import { LockScreenMessagePolicy } from "@/components/profiles/IosPolicies/LockScreenMessagePolicy";
import { MailPolicy } from "@/components/profiles/IosPolicies/MailPolicy";
import { NotificationPolicy } from "@/components/profiles/IosPolicies/NotificationPolicy";
import { PasscodePolicy } from "@/components/profiles/IosPolicies/PasscodePolicy";
import { RestrictionsPolicy } from "@/components/profiles/IosPolicies/RestrictionsPolicy";
import { WebApplicationPolicyEditor } from "@/components/profiles/IosPolicies/WebApplicationPolicy";
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
            // Add other cases as needed
            default:
                return { title: "Edit Policy", icon: null };
        }
    };

    const { title, icon } = getPolicyHeader();

    // Some policies render their own cards/headers, so we might want to hide the standard dialog header for them
    // or wrap them in a clean way. 
    // Based on EditProfilePolicies, some keys hid the header.
    const hideDefaultHeader = [
        "passcode",
        "notifications",
        "lockScreenMessage",
        "scep",
        "mdm",
        "androidPasscode" // Assuming android passcode also handles its own UI
    ].includes(activePolicyType);


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {!hideDefaultHeader && (
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {icon}
                            {title}
                        </DialogTitle>
                        <DialogDescription>
                            Configure the settings for this policy module.
                        </DialogDescription>
                    </DialogHeader>
                )}

                <div className="py-2">
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
                        <CommonSettingsPolicy
                            platform={platform}
                            profileId={profileId}
                            initialData={undefined}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "deviceTheme" && (
                        <DeviceThemePolicy
                            platform={platform}
                            profileId={profileId}
                            initialData={undefined}
                            onSave={onSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activePolicyType === "enrollment" && (
                        <EnrollmentPolicy
                            platform={platform}
                            profileId={profileId}
                            initialData={undefined}
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
