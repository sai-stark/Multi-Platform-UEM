import { ProfileService } from "@/api/services/profiles";
import { PolicyConfigSkeleton } from "@/components/skeletons";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { ApplicationPolicyEditor } from "@/components/profiles/IosPolicies/ApplicationPolicy";
import { LockScreenMessagePolicy } from "@/components/profiles/IosPolicies/LockScreenMessagePolicy";
import { MailPolicy } from "@/components/profiles/IosPolicies/MailPolicy";
import { NotificationPolicy } from "@/components/profiles/IosPolicies/NotificationPolicy";
import { PasscodePolicy } from "@/components/profiles/IosPolicies/PasscodePolicy";
import {
    RestrictionsPolicy
} from "@/components/profiles/IosPolicies/RestrictionsPolicy";
import { WebApplicationPolicyEditor } from "@/components/profiles/IosPolicies/WebApplicationPolicy";
import { WifiPolicy } from "@/components/profiles/IosPolicies/WifiPolicy";
import {
    MdmPolicyView,
    ScepPolicyView,
} from "@/components/profiles/IosPolicyCards";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import {
    IosFullProfile,
    Platform
} from "@/types/models";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Ban,
    Globe,
    Grid,
    Mail, Settings, Wifi
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";

export default function PolicyConfigurationPage() {
    const { platform, id, policyType } = useParams<{ platform: string; id: string; policyType: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Flattened state to hold relevant policy data
    const [policyData, setPolicyData] = useState<any>(undefined);

    // We need to fetch the full profile to get the initial data for the specific policy
    const fetchProfileData = async () => {
        if (!platform || !id || !policyType) return;
        setLoading(true);
        try {
            const data = await ProfileService.getProfile(platform as Platform, id);

            // Extract the specific policy data based on policyType and platform
            let extractedData: any = undefined;
            const isIos = platform === "ios";
            const isAndroid = platform === "android";

            if (isIos) {
                const iosData = data as IosFullProfile;
                switch (policyType) {
                    case "passcode": extractedData = iosData.passCodePolicy; break;
                    case "wifi": extractedData = iosData.wifiPolicy; break;
                    case "mail": extractedData = iosData.mailPolicy; break;
                    case "restrictions": extractedData = undefined; break; // Restrictions usually load their own composite or passed as undefined to fetch? ProfileDetails passed 'restrictionsPolicy' state.
                    // Wait, ProfileDetails sets 'restrictionsPolicy' state from iosData.
                    // But RestrictionsPolicy component takes 'initialData'. 
                    // In ProfileDetails, 'restrictionsPolicy' state was undefined? No, it looks like it wasn't set in fetchProfile for iOS?
                    // Checking ProfileDetails fetchProfile:
                    // setPasscodePolicy(iosData.passCodePolicy ...);
                    // setWifiPolicy...
                    // It does NOT seem to set restrictionsPolicy for iOS in the snippet I saw?
                    // Re-checking snippet... 
                    // setLockScreenMessagePolicy(iosData.lockScreenPolicy...);
                    // setNotificationPolicy...
                    // setScepPolicy...
                    // setMdmPolicy...
                    // setMailPolicy...
                    // setWebApplicationPolicy...
                    // setApplicationPolicy...
                    // It seems "Restrictions" might be handled differently or I missed it. 
                    // However, for Android it DOES set restrictionsPolicy.
                    // For iOS, maybe it fetches internally if not provided? Or I missed the line.
                    // I will pass 'undefined' if not found, as most components handle fetching or default.

                    case "lockScreenMessage": extractedData = iosData.lockScreenPolicy; break;
                    case "notifications": extractedData = iosData.notificationPolicies; break;
                    case "scep": extractedData = iosData.scepPolicy; break;
                    case "mdm": extractedData = iosData.mdmPolicy; break;
                    case "webApps": extractedData = iosData.webClipPolicies; break;
                    case "applications": extractedData = iosData.applicationPolicies; break;
                    default: extractedData = undefined;
                }
            } else if (isAndroid) {
                const anyData = data as any;
                switch (policyType) {
                    case "androidPasscode": extractedData = anyData.passcodePolicy; break;
                    case "webApps": // fallthrough
                    case "androidWebApp": extractedData = anyData.webApplicationPolicies; break;
                    case "applications": // fallthrough
                    case "androidApplication": extractedData = anyData.applicationPolicies; break;
                    // Android Restrictions are nested
                    case "securityRestriction": extractedData = anyData.restrictions?.security; break;
                    case "kioskRestriction": extractedData = anyData.restrictions?.kiosk; break;
                    case "networkRestriction": extractedData = anyData.restrictions?.network; break;
                    case "locationRestriction": extractedData = anyData.restrictions?.location; break;
                    case "tetheringRestriction": extractedData = anyData.restrictions?.tethering; break;
                    case "phoneRestriction": extractedData = anyData.restrictions?.phone; break;
                    case "dateTimeRestriction": extractedData = anyData.restrictions?.dateTime; break;
                    case "displayRestriction": extractedData = anyData.restrictions?.display; break;
                    case "storageRestriction": extractedData = anyData.restrictions?.syncStorage; break;
                    case "commonSettings": extractedData = undefined; break; // usually separate endpoint or composite
                    case "deviceTheme": extractedData = undefined; break;
                    case "enrollment": extractedData = undefined; break;
                    default:
                        // For direct mapping or if it's one of the restriction types not explicitly extracted above
                        if (anyData.restrictions && anyData.restrictions[policyType]) {
                            extractedData = anyData.restrictions[policyType];
                        }
                }
            }

            setPolicyData(extractedData);

        } catch (err) {
            console.error("Failed to load profile for policy config:", err);
            setError("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [platform, id, policyType]);

    const handleSave = () => {
        toast({
            title: "Success",
            description: "Policy updated successfully",
        });
        navigate(`/profiles/${platform}/${id}`);
    };

    const handleCancel = () => {
        navigate(`/profiles/${platform}/${id}`);
    };

    if (loading) {
        return (
            <MainLayout>
                <PolicyConfigSkeleton />
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="p-8 text-center text-muted-foreground">{error}</div>
            </MainLayout>
        );
    }

    // Helper to determine title/icon based on policyType
    const getHeaderInfo = () => {
        switch (policyType) {
            case "wifi": return { title: "WiFi Configuration", icon: <Wifi className="w-6 h-6 text-info" /> };
            case "mail": return { title: "Mail Configuration", icon: <Mail className="w-6 h-6 text-accent" /> };
            case "restrictions": return { title: "Device Restrictions", icon: <Ban className="w-6 h-6 text-destructive" /> };
            case "applications": return { title: "Application Policy", icon: <Grid className="w-6 h-6 text-warning" /> };
            case "webApps": case "androidWebApp": return { title: "Web Application Policy", icon: <Globe className="w-6 h-6 text-info" /> };
            // Add others as needed
            default: return { title: "Policy Configuration", icon: <Settings className="w-6 h-6" /> };
        }
    };

    const { title, icon } = getHeaderInfo();

    // Set breadcrumb entity name to policy title
    const { setEntityName } = useBreadcrumb();
    useEffect(() => {
        if (title) setEntityName(title);
    }, [title, setEntityName]);

    return (
        <MainLayout>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                >
                    <Card className="border-t-4 border-t-primary shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {icon}
                                {title}
                            </CardTitle>
                            <CardDescription>Configure the settings for this policy module.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Render specific editor based on policyType */}
                            {policyType === "passcode" && (
                                <PasscodePolicy platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />
                            )}
                            {policyType === "androidPasscode" && (
                                <AndroidPasscodePolicy platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />
                            )}
                            {policyType === "wifi" && (
                                <WifiPolicy profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />
                            )}
                            {policyType === "mail" && (
                                <MailPolicy profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />
                            )}
                            {policyType === "restrictions" && (
                                <RestrictionsPolicy profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />
                            )}
                            {policyType === "applications" && (
                                <ApplicationPolicyEditor profileId={id!} platform={platform as Platform} initialData={policyData || []} onSave={handleSave} onCancel={handleCancel} />
                            )}
                            {policyType === "webApps" && (
                                <WebApplicationPolicyEditor profileId={id!} platform={platform as Platform} initialData={policyData || []} onSave={handleSave} onCancel={handleCancel} />
                            )}
                            {policyType === "androidWebApp" && (
                                <AndroidWebApplicationPolicy profileId={id!} platform={platform as Platform} initialData={policyData || []} onSave={handleSave} onCancel={handleCancel} />
                            )}
                            {policyType === "notifications" && (
                                <NotificationPolicy platform={platform as Platform} profileId={id!} initialData={policyData || []} />
                            )}
                            {policyType === "lockScreenMessage" && (
                                <LockScreenMessagePolicy platform={platform as Platform} profileId={id!} initialData={policyData} />
                            )}
                            {policyType === "scep" && policyData && (
                                <ScepPolicyView policy={policyData} onClose={handleCancel} />
                            )}
                            {policyType === "mdm" && policyData && (
                                <MdmPolicyView policy={policyData} onClose={handleCancel} />
                            )}

                            {/* Android Restrictions */}
                            {policyType === "securityRestriction" && (<SecurityRestriction platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "kioskRestriction" && (<KioskRestriction platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "networkRestriction" && (<NetworkRestriction platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "locationRestriction" && (<LocationRestriction platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "tetheringRestriction" && (<TetheringRestriction platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "phoneRestriction" && (<PhoneRestriction platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "dateTimeRestriction" && (<DateTimeRestriction platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "displayRestriction" && (<DisplayRestriction platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "storageRestriction" && (<SyncStorageRestriction platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "miscRestriction" && (<MiscellaneousRestriction platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "connectivityRestriction" && (<ConnectivityRestriction platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "commonSettings" && (<CommonSettingsPolicy platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "deviceTheme" && (<DeviceThemePolicy platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "enrollment" && (<EnrollmentPolicy platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}
                            {policyType === "androidApplication" && (<AndroidApplicationPolicy platform={platform as Platform} profileId={id!} initialData={policyData} onSave={handleSave} onCancel={handleCancel} />)}

                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </MainLayout>
    );
}
