import { ProfileService } from "@/api/services/profiles";
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  AndroidApplicationPolicy,
  AndroidWebApplicationPolicy,
  CommonSettingsPolicy,
  DeviceThemePolicy,
  EnrollmentPolicy,
  PasscodePolicy as AndroidPasscodePolicy,
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
  RestrictionsPolicy,
} from "@/components/profiles/IosPolicies/RestrictionsPolicy";
import { WebApplicationPolicyEditor } from "@/components/profiles/IosPolicies/WebApplicationPolicy";
import { WifiPolicy } from "@/components/profiles/IosPolicies/WifiPolicy";
import { WebContentFilterPolicy } from "@/components/profiles/IosPolicies/WebContentFilterPolicy";
import { GlobalHttpProxyPolicy } from "@/components/profiles/IosPolicies/GlobalHttpProxyPolicy";
import { VpnPolicy } from "@/components/profiles/IosPolicies/VpnPolicy";
import { PerAppVpnPolicy } from "@/components/profiles/IosPolicies/PerAppVpnPolicy";
import { PerDomainVpnPolicy } from "@/components/profiles/IosPolicies/PerDomainVpnPolicy";
import { RelayPolicy } from "@/components/profiles/IosPolicies/RelayPolicy";
import {
  ApplicationsPolicyCard,
  LockScreenMessagePolicyCard,
  MailPolicyCard,
  MdmPolicyCard,
  MdmPolicyView,
  NotificationsPolicyCard,
  PasscodePolicyCard,
  RestrictionsPolicyCard,
  ScepPolicyCard,
  ScepPolicyView,
  WebApplicationsPolicyCard,
  WifiPolicyCard,
} from "@/components/profiles/IosPolicyCards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IosMdmConfiguration, IosScepConfiguration, IosWebContentFilterPolicy, IosGlobalHttpProxyPolicy, IosVpnPolicy, IosPerAppVpnPolicy, IosPerDomainVpnPolicy, IosRelayPolicy } from "@/types/ios";
import {
  ApplicationPolicy,
  CommonSettingsPolicy as CommonSettingsPolicyType,
  DeviceThemePolicy as DeviceThemePolicyType,
  EnrollmentPolicy as EnrollmentPolicyType,
  FullProfile,
  IosMailPolicy,
  IosPasscodeRestrictionPolicy,
  IosWiFiConfiguration,
  LockScreenMessagePolicy as LockScreenMessagePolicyType,
  NotificationPolicy as NotificationPolicyType,
  PasscodeRestrictionPolicy,
  Platform,
  RestrictionsComposite,
  WebApplicationPolicy,
} from "@/types/models";
import { AnimatePresence, motion } from "framer-motion";
import {
  Apple,
  ArrowLeft,
  Ban,
  Bell,
  Filter,
  Globe,
  Grid,
  Key,
  Layout,
  Lock,
  Mail,
  MessageSquare,
  Monitor,
  Palette,
  Plus,
  Radio,
  Server,
  Settings,
  Shield,
  Smartphone,
  UserPlus,
  Wifi,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function EditProfilePolicies() {
  const { platform, id } = useParams<{ platform: string; id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePolicyType, setActivePolicyType] = useState<string | null>(null);

  // State for specific Policy Data
  const [passcodePolicy, setPasscodePolicy] = useState<
    PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy | undefined
  >(undefined);
  const [wifiPolicy, setWifiPolicy] = useState<
    IosWiFiConfiguration | undefined
  >(undefined);
  const [mailPolicy, setMailPolicy] = useState<IosMailPolicy | undefined>(
    undefined
  );
  const [restrictionsPolicy, setRestrictionsPolicy] = useState<
    RestrictionsComposite | undefined
  >(undefined);
  const [applicationPolicy, setApplicationPolicy] = useState<
    ApplicationPolicy[]
  >([]);
  const [webApplicationPolicy, setWebApplicationPolicy] = useState<
    WebApplicationPolicy[]
  >([]);
  const [notificationPolicy, setNotificationPolicy] = useState<
    NotificationPolicyType[]
  >([]);
  const [lockScreenMessagePolicy, setLockScreenMessagePolicy] =
    useState<LockScreenMessagePolicyType | null>(null);
  const [scepPolicy, setScepPolicy] = useState<
    IosScepConfiguration | undefined
  >(undefined);
  const [mdmPolicy, setMdmPolicy] = useState<IosMdmConfiguration | undefined>(
    undefined
  );
  // Phase 2 iOS policies
  const [webContentFilterPolicy, setWebContentFilterPolicy] = useState<IosWebContentFilterPolicy | undefined>(undefined);
  const [globalHttpProxyPolicy, setGlobalHttpProxyPolicy] = useState<IosGlobalHttpProxyPolicy | undefined>(undefined);
  const [vpnPolicy, setVpnPolicy] = useState<IosVpnPolicy | undefined>(undefined);
  const [perAppVpnPolicy, setPerAppVpnPolicy] = useState<IosPerAppVpnPolicy | undefined>(undefined);
  const [perDomainVpnPolicy, setPerDomainVpnPolicy] = useState<IosPerDomainVpnPolicy | undefined>(undefined);
  const [relayPolicy, setRelayPolicy] = useState<IosRelayPolicy | undefined>(undefined);
  // Android-specific policy state
  const [androidPasscodePolicy, setAndroidPasscodePolicy] = useState<
    any | undefined
  >(undefined);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (platform && id) {
        const data = await ProfileService.getProfile(platform as Platform, id);
        setProfile(data);

        const isIos = platform === "ios";
        const isAndroid = platform === "android";

        // Common: Application Policies
        if (data.applicationPolicies && data.applicationPolicies.length > 0) {
          setApplicationPolicy(data.applicationPolicies as any);
        }

        if (isIos) {
          if (data.passCodePolicy) {
            setPasscodePolicy(data.passCodePolicy as any);
          }
          if (data.wifiPolicy) {
            setWifiPolicy(data.wifiPolicy);
          }
          if (data.lockScreenPolicy) {
            setLockScreenMessagePolicy(data.lockScreenPolicy as any);
          }
          if (
            data.notificationPolicies &&
            data.notificationPolicies.length > 0
          ) {
            setNotificationPolicy(data.notificationPolicies as any);
          }
          if ((data as any).scepPolicy) {
            setScepPolicy((data as any).scepPolicy);
          }
          if ((data as any).mdmPolicy) {
            setMdmPolicy((data as any).mdmPolicy);
          }
          if ((data as any).mailPolicy) {
            setMailPolicy((data as any).mailPolicy);
          }
          if (data.webClipPolicies && data.webClipPolicies.length > 0) {
            setWebApplicationPolicy(data.webClipPolicies as any);
          }
          // Phase 2 policies
          if ((data as any).webContentFilterPolicy) {
            setWebContentFilterPolicy((data as any).webContentFilterPolicy);
          }
          if ((data as any).globalHttpProxyPolicy) {
            setGlobalHttpProxyPolicy((data as any).globalHttpProxyPolicy);
          }
          if ((data as any).vpnPolicy) {
            setVpnPolicy((data as any).vpnPolicy);
          }
          if ((data as any).perAppVpnPolicy) {
            setPerAppVpnPolicy((data as any).perAppVpnPolicy);
          }
          if ((data as any).perDomainVpnPolicy) {
            setPerDomainVpnPolicy((data as any).perDomainVpnPolicy);
          }
          if ((data as any).relayPolicy) {
            setRelayPolicy((data as any).relayPolicy);
          }
        }

        if (isAndroid) {
          if ((data as any).restrictions) {
            const restrictions = (data as any).restrictions;
            setRestrictionsPolicy({
              security: restrictions.security,
              passcode: restrictions.passcode,
              syncStorage: restrictions.syncStorage,
              kiosk: restrictions.kiosk,
              tethering: restrictions.tethering,
              location: restrictions.location,
              phone: restrictions.phone,
              dateTime: restrictions.dateTime,
              display: restrictions.display,
              miscellaneous: restrictions.miscellaneous,
              applications: restrictions.applications,
              network: restrictions.network,
              connectivity: restrictions.connectivity,
            } as any);
          }
          if (
            (data as any).webApplicationPolicies &&
            (data as any).webApplicationPolicies.length > 0
          ) {
            setWebApplicationPolicy((data as any).webApplicationPolicies);
          }
          // Android passcode policy
          if ((data as any).passcodePolicy) {
            setAndroidPasscodePolicy((data as any).passcodePolicy);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, platform]);

  const handlePolicySave = () => {
    setActivePolicyType(null);
    fetchProfile();
  };

  const handleCloseEditor = () => setActivePolicyType(null);

  const getPlatformIcon = (plat?: string) => {
    switch (plat) {
      case "android":
        return <Smartphone className="w-5 h-5 text-success" />;
      case "ios":
        return <Apple className="w-5 h-5 text-muted-foreground" />;
      case "windows":
        return <Monitor className="w-5 h-5 text-info" />;
      default:
        return <Layout className="w-5 h-5 text-primary" />;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingAnimation message={t('editPolicies.loading')} />
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-muted-foreground">
          {t('profiles.profileNotFound')}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/profiles/${platform}/${id}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {getPlatformIcon(profile.platform)}
              {t('editPolicies.title')}: {profile.name}
            </h1>
            <p className="text-muted-foreground">
              {t('editPolicies.subtitle')}
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activePolicyType ? (
            <PolicyEditor
              activePolicyType={activePolicyType}
              platform={platform as Platform}
              profileId={id!}
              passcodePolicy={passcodePolicy}
              androidPasscodePolicy={androidPasscodePolicy}
              wifiPolicy={wifiPolicy}
              mailPolicy={mailPolicy}
              restrictionsPolicy={restrictionsPolicy}
              applicationPolicy={applicationPolicy}
              webApplicationPolicy={webApplicationPolicy}
              notificationPolicy={notificationPolicy}
              lockScreenMessagePolicy={lockScreenMessagePolicy}
              scepPolicy={scepPolicy}
              mdmPolicy={mdmPolicy}
              webContentFilterPolicy={webContentFilterPolicy}
              globalHttpProxyPolicy={globalHttpProxyPolicy}
              vpnPolicy={vpnPolicy}
              perAppVpnPolicy={perAppVpnPolicy}
              perDomainVpnPolicy={perDomainVpnPolicy}
              relayPolicy={relayPolicy}
              onSave={handlePolicySave}
              onCancel={handleCloseEditor}
            />
          ) : (
            <PolicyCardGrid
              platform={platform}
              passcodePolicy={passcodePolicy}
              androidPasscodePolicy={androidPasscodePolicy}
              wifiPolicy={wifiPolicy}
              mailPolicy={mailPolicy}
              restrictionsPolicy={restrictionsPolicy}
              applicationPolicy={applicationPolicy}
              webApplicationPolicy={webApplicationPolicy}
              notificationPolicy={notificationPolicy}
              lockScreenMessagePolicy={lockScreenMessagePolicy}
              scepPolicy={scepPolicy}
              mdmPolicy={mdmPolicy}
              webContentFilterPolicy={webContentFilterPolicy}
              globalHttpProxyPolicy={globalHttpProxyPolicy}
              vpnPolicy={vpnPolicy}
              perAppVpnPolicy={perAppVpnPolicy}
              perDomainVpnPolicy={perDomainVpnPolicy}
              relayPolicy={relayPolicy}
              onSelectPolicy={setActivePolicyType}
            />
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

// ------ Add Policy Dropdown ------
interface AddPolicyDropdownProps {
  platform?: string;
  passcodePolicy?: PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy;
  wifiPolicy?: IosWiFiConfiguration;
  mailPolicy?: IosMailPolicy;
  restrictionsPolicy?: RestrictionsComposite;
  applicationPolicy: ApplicationPolicy[];
  webApplicationPolicy: WebApplicationPolicy[];
  notificationPolicy: NotificationPolicyType[];
  lockScreenMessagePolicy: LockScreenMessagePolicyType | null;
  onSelect: (type: string) => void;
}

function AddPolicyDropdown({
  platform,
  passcodePolicy,
  wifiPolicy,
  mailPolicy,
  restrictionsPolicy,
  applicationPolicy,
  webApplicationPolicy,
  notificationPolicy,
  lockScreenMessagePolicy,
  onSelect,
}: AddPolicyDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Policy
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!passcodePolicy && (
          <DropdownMenuItem onClick={() => onSelect("passcode")}>
            <Shield className="w-4 h-4 mr-2" /> Passcode Policy
          </DropdownMenuItem>
        )}
        {!wifiPolicy && (
          <DropdownMenuItem onClick={() => onSelect("wifi")}>
            <Wifi className="w-4 h-4 mr-2" /> WiFi Configuration
          </DropdownMenuItem>
        )}
        {platform === "ios" && !mailPolicy && (
          <DropdownMenuItem onClick={() => onSelect("mail")}>
            <Mail className="w-4 h-4 mr-2" /> Mail Configuration
          </DropdownMenuItem>
        )}
        {!restrictionsPolicy && (
          <DropdownMenuItem onClick={() => onSelect("restrictions")}>
            <Ban className="w-4 h-4 mr-2" /> Device Restrictions
          </DropdownMenuItem>
        )}
        {applicationPolicy.length === 0 && (
          <DropdownMenuItem onClick={() => onSelect("applications")}>
            <Grid className="w-4 h-4 mr-2" /> Application Policy
          </DropdownMenuItem>
        )}
        {webApplicationPolicy.length === 0 && (
          <DropdownMenuItem onClick={() => onSelect("webApps")}>
            <Globe className="w-4 h-4 mr-2" /> Web Application Policy
          </DropdownMenuItem>
        )}
        {notificationPolicy.length === 0 && (
          <DropdownMenuItem onClick={() => onSelect("notifications")}>
            <Bell className="w-4 h-4 mr-2" /> Notification Policy
          </DropdownMenuItem>
        )}
        {!lockScreenMessagePolicy && (
          <DropdownMenuItem onClick={() => onSelect("lockScreenMessage")}>
            <MessageSquare className="w-4 h-4 mr-2" /> Lock Screen Message
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ------ Policy Editor Panel ------
interface PolicyEditorProps {
  activePolicyType: string;
  platform: Platform;
  profileId: string;
  passcodePolicy?: PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy;
  androidPasscodePolicy?: any;
  wifiPolicy?: IosWiFiConfiguration;
  mailPolicy?: IosMailPolicy;
  restrictionsPolicy?: RestrictionsComposite;
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
  onSave: () => void;
  onCancel: () => void;
}

function PolicyEditor({
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
  vpnPolicy: vpnPolicyData,
  perAppVpnPolicy,
  perDomainVpnPolicy,
  relayPolicy: relayPolicyData,
  onSave,
  onCancel,
}: PolicyEditorProps) {
  const showHeader = ![
    "passcode",
    "notifications",
    "lockScreenMessage",
    "scep",
    "mdm",
  ].includes(activePolicyType);

  return (
    <motion.div
      key="editor"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-l-4 border-l-primary shadow-md">
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activePolicyType === "wifi" && (
                <Wifi className="w-6 h-6 text-info" />
              )}
              {activePolicyType === "mail" && (
                <Mail className="w-6 h-6 text-purple-500" />
              )}
              {activePolicyType === "restrictions" && (
                <Ban className="w-6 h-6 text-destructive" />
              )}
              {activePolicyType === "applications" && (
                <Grid className="w-6 h-6 text-orange-500" />
              )}
              {activePolicyType === "webApps" && (
                <Globe className="w-6 h-6 text-blue-500" />
              )}

              {activePolicyType === "wifi" && "WiFi Configuration"}
              {activePolicyType === "mail" && "Mail Configuration"}
              {activePolicyType === "restrictions" && "Device Restrictions"}
              {activePolicyType === "applications" && "Application Policy"}
              {activePolicyType === "webApps" && "Web Application Policy"}
            </CardTitle>
            <CardDescription>
              Configure the settings for this policy module.
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          {activePolicyType === "passcode" && (
            <PasscodePolicy
              platform={platform}
              profileId={profileId}
              initialData={passcodePolicy}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "wifi" && (
            <WifiPolicy
              profileId={profileId}
              initialData={wifiPolicy}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "mail" && (
            <MailPolicy
              profileId={profileId}
              initialData={mailPolicy}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "restrictions" && (
            <RestrictionsPolicy
              profileId={profileId}
              initialData={restrictionsPolicy}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "applications" && (
            <ApplicationPolicyEditor
              profileId={profileId}
              platform={platform}
              initialData={applicationPolicy}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "webApps" && (
            <WebApplicationPolicyEditor
              profileId={profileId}
              platform={platform}
              initialData={webApplicationPolicy}
              onSave={onSave}
              onCancel={onCancel}
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
            <ScepPolicyView policy={scepPolicy} onClose={onCancel} />
          )}
          {activePolicyType === "mdm" && mdmPolicy && (
            <MdmPolicyView policy={mdmPolicy} onClose={onCancel} />
          )}
          {/* Phase 2 iOS policy editors */}
          {activePolicyType === "webContentFilter" && (
            <WebContentFilterPolicy
              profileId={profileId}
              initialData={webContentFilterPolicy}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "globalHttpProxy" && (
            <GlobalHttpProxyPolicy
              profileId={profileId}
              initialData={globalHttpProxyPolicy}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "vpn" && (
            <VpnPolicy
              profileId={profileId}
              initialData={vpnPolicyData}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "perAppVpn" && (
            <PerAppVpnPolicy
              profileId={profileId}
              initialData={perAppVpnPolicy}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "perDomainVpn" && (
            <PerDomainVpnPolicy
              profileId={profileId}
              initialData={perDomainVpnPolicy}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "relay" && (
            <RelayPolicy
              profileId={profileId}
              initialData={relayPolicyData}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {/* Android-specific policy editors */}
          {activePolicyType === "securityRestriction" && (
            <SecurityRestriction
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "kioskRestriction" && (
            <KioskRestriction
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "locationRestriction" && (
            <LocationRestriction
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "tetheringRestriction" && (
            <TetheringRestriction
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "phoneRestriction" && (
            <PhoneRestriction
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "dateTimeRestriction" && (
            <DateTimeRestriction
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "displayRestriction" && (
            <DisplayRestriction
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "miscRestriction" && (
            <MiscellaneousRestriction
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "connectivityRestriction" && (
            <ConnectivityRestriction
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "networkRestriction" && (
            <NetworkRestriction
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "storageRestriction" && (
            <SyncStorageRestriction
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "commonSettings" && (
            <CommonSettingsPolicy
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "deviceTheme" && (
            <DeviceThemePolicy
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "enrollment" && (
            <EnrollmentPolicy
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "androidApplication" && (
            <AndroidApplicationPolicy
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "androidWebApp" && (
            <AndroidWebApplicationPolicy
              platform={platform}
              profileId={profileId}
              initialData={undefined}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          {activePolicyType === "androidPasscode" && (
            <AndroidPasscodePolicy
              platform={platform}
              profileId={profileId}
              initialData={androidPasscodePolicy}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ------ Policy Card Grid ------
interface PolicyCardGridProps {
  platform?: string;
  passcodePolicy?: PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy;
  androidPasscodePolicy?: any;
  wifiPolicy?: IosWiFiConfiguration;
  mailPolicy?: IosMailPolicy;
  restrictionsPolicy?: RestrictionsComposite;
  applicationPolicy?: ApplicationPolicy[];
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
  onSelectPolicy: (type: string) => void;
}

// Uniform card wrapper component for consistent sizing
function UniformPolicyCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={`h-full ${className}`}>
      {children}
    </motion.div>
  );
}

// Available policy card (grayed out, not yet configured)
interface AvailablePolicyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function AvailablePolicyCard({ icon, title, description, onClick }: AvailablePolicyCardProps) {
  return (
    <motion.div variants={itemVariants} className="h-full">
      <Card
        className="cursor-pointer hover:shadow-md transition-all h-full bg-muted/30 border-dashed border-2 hover:bg-muted/50 hover:border-solid"
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-end">
          <Badge variant="outline" className="w-fit text-muted-foreground border-muted-foreground/50">
            Not Configured
          </Badge>
          <p className="text-sm mt-2 text-muted-foreground/70">Click to configure</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function PolicyCardGrid({
  platform,
  passcodePolicy,
  androidPasscodePolicy,
  wifiPolicy,
  mailPolicy,
  restrictionsPolicy,
  applicationPolicy = [],
  webApplicationPolicy,
  notificationPolicy,
  lockScreenMessagePolicy,
  scepPolicy,
  mdmPolicy,
  webContentFilterPolicy,
  globalHttpProxyPolicy,
  vpnPolicy: vpnPolicyGridData,
  perAppVpnPolicy: perAppVpnGridData,
  perDomainVpnPolicy: perDomainVpnGridData,
  relayPolicy: relayGridData,
  onSelectPolicy,
}: PolicyCardGridProps) {
  const { t } = useLanguage();
  
  // Check which policies are configured (active)
  const hasPasscode = !!passcodePolicy;
  const hasWifi = !!wifiPolicy;
  const hasMail = platform === 'ios' && !!mailPolicy;
  const hasRestrictions = !!restrictionsPolicy;
  const hasScep = !!scepPolicy;
  const hasMdm = !!mdmPolicy;
  const hasWebApps = webApplicationPolicy && webApplicationPolicy.length > 0;
  const hasNotifications = notificationPolicy && notificationPolicy.length > 0;
  const hasLockScreen = !!lockScreenMessagePolicy;
  const hasApplications = applicationPolicy && applicationPolicy.length > 0;
  const hasWebContentFilter = !!webContentFilterPolicy;
  const hasGlobalHttpProxy = !!globalHttpProxyPolicy;
  const hasVpn = !!vpnPolicyGridData;
  const hasPerAppVpn = !!perAppVpnGridData;
  const hasPerDomainVpn = !!perDomainVpnGridData;
  const hasRelay = !!relayGridData;

  // Android-specific: check if passcode policy is configured
  const hasAndroidPasscode = !!androidPasscodePolicy;

  // Determine which policies are available based on platform
  const isIos = platform === 'ios';
  const isAndroid = platform === 'android';

  // Android-specific: check which restrictions are configured
  const hasSecurityRestriction = !!(restrictionsPolicy as any)?.security;
  const hasKioskRestriction = !!(restrictionsPolicy as any)?.kiosk;
  const hasLocationRestriction = !!(restrictionsPolicy as any)?.location;
  const hasTetheringRestriction = !!(restrictionsPolicy as any)?.tethering;
  const hasPhoneRestriction = !!(restrictionsPolicy as any)?.phone;
  const hasDateTimeRestriction = !!(restrictionsPolicy as any)?.dateTime;
  const hasDisplayRestriction = !!(restrictionsPolicy as any)?.display;
  const hasMiscRestriction = !!(restrictionsPolicy as any)?.miscellaneous;
  const hasConnectivityRestriction = !!(restrictionsPolicy as any)?.connectivity;
  const hasNetworkRestriction = !!(restrictionsPolicy as any)?.network;
  const hasStorageRestriction = !!(restrictionsPolicy as any)?.syncStorage;

  // Count active policies
  const activePolicies = [
    hasPasscode, hasWifi, hasMail, hasRestrictions, hasScep, hasMdm,
    hasWebApps, hasNotifications, hasLockScreen,
    hasWebContentFilter, hasGlobalHttpProxy, hasVpn, hasPerAppVpn, hasPerDomainVpn, hasRelay
  ].filter(Boolean).length;

  // iOS available policies (not configured)
  const iosAvailablePolicies: { type: string; title: string; description: string; icon: React.ReactNode; show: boolean }[] = [
    { type: 'passcode', title: t('policies.ios.passcode'), description: t('policies.ios.passcode.desc'), icon: <Shield className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasPasscode },
    { type: 'wifi', title: t('policies.ios.wifi'), description: t('policies.ios.wifi.desc'), icon: <Wifi className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasWifi },
    { type: 'mail', title: t('policies.ios.mail'), description: t('policies.ios.mail.desc'), icon: <Mail className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasMail },
    { type: 'restrictions', title: t('policies.ios.restrictions'), description: t('policies.ios.restrictions.desc'), icon: <Ban className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasRestrictions },
    { type: 'webApps', title: t('policies.ios.webApps'), description: t('policies.ios.webApps.desc'), icon: <Globe className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasWebApps },
    { type: 'notifications', title: t('policies.ios.notifications'), description: t('policies.ios.notifications.desc'), icon: <Bell className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasNotifications },
    { type: 'lockScreenMessage', title: t('policies.ios.lockScreen'), description: t('policies.ios.lockScreen.desc'), icon: <MessageSquare className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasLockScreen },
    { type: 'webContentFilter', title: 'Web Content Filter', description: 'URL filtering and content restrictions', icon: <Filter className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasWebContentFilter },
    { type: 'globalHttpProxy', title: 'Global HTTP Proxy', description: 'Network proxy configuration', icon: <Globe className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasGlobalHttpProxy },
    { type: 'vpn', title: 'VPN', description: 'Virtual private network', icon: <Lock className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasVpn },
    { type: 'perAppVpn', title: 'Per-App VPN', description: 'App-specific VPN routing', icon: <Smartphone className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasPerAppVpn },
    { type: 'perDomainVpn', title: 'Per-Domain VPN', description: 'Domain-based VPN routing', icon: <Globe className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasPerDomainVpn },
    { type: 'relay', title: 'Relay', description: 'HTTP relay tunneling', icon: <Radio className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasRelay },
  ].filter(p => p.show).sort((a, b) => a.title.localeCompare(b.title));

  // Android Policies (not restrictions) - sorted alphabetically
  // ============================================================================
  // ANDROID POLICIES
  // Currently configured for Work Profile (WP) mode only.
  // TODO: When Device Owner (DO) mode is implemented, uncomment DO-only policies
  // based on the selected management mode (WP or DO).
  // ============================================================================
  const androidPolicies = [
    { type: 'androidApplication', title: t('policies.android.applications'), description: t('policies.android.applications.desc'), icon: <Smartphone className="w-5 h-5" />, configured: hasApplications },
    { type: 'commonSettings', title: t('policies.android.commonSettings'), description: t('policies.android.commonSettings.desc'), icon: <Settings className="w-5 h-5" />, configured: false },
    // ----- DO-ONLY POLICIES (Comment out for Work Profile) -----
    // TODO: Uncomment when Device Owner mode is implemented
    // { type: 'deviceTheme', title: t('policies.android.deviceTheme'), description: t('policies.android.deviceTheme.desc'), icon: <Palette className="w-5 h-5" />, configured: false },
    // { type: 'enrollment', title: t('policies.android.enrollment'), description: t('policies.android.enrollment.desc'), icon: <UserPlus className="w-5 h-5" />, configured: false },
    // ----- END DO-ONLY POLICIES -----
    { type: 'androidPasscode', title: t('policies.android.passcode'), description: t('policies.android.passcode.desc'), icon: <Key className="w-5 h-5" />, configured: hasAndroidPasscode },
    { type: 'androidWebApp', title: t('policies.android.webApps'), description: t('policies.android.webApps.desc'), icon: <Globe className="w-5 h-5" />, configured: hasWebApps },
  ].sort((a, b) => a.title.localeCompare(b.title));

  // ============================================================================
  // ANDROID RESTRICTIONS
  // Currently configured for Work Profile (WP) mode only.
  // WP supports: Location Restrictions, Security Restrictions
  // DO supports: All restrictions (uncomment when DO mode is implemented)
  // ============================================================================
  const androidRestrictions = [
    // ----- DO-ONLY RESTRICTIONS (Not supported in Work Profile) -----
    // TODO: Uncomment when Device Owner mode is implemented
    // { type: 'connectivityRestriction', title: t('restrictions.android.connectivity'), description: t('restrictions.android.connectivity.desc'), icon: <Wifi className="w-5 h-5" />, configured: hasConnectivityRestriction },
    // { type: 'dateTimeRestriction', title: t('restrictions.android.dateTime'), description: t('restrictions.android.dateTime.desc'), icon: <Bell className="w-5 h-5" />, configured: hasDateTimeRestriction },
    // { type: 'displayRestriction', title: t('restrictions.android.display'), description: t('restrictions.android.display.desc'), icon: <Monitor className="w-5 h-5" />, configured: hasDisplayRestriction },
    // { type: 'kioskRestriction', title: t('restrictions.android.kiosk'), description: t('restrictions.android.kiosk.desc'), icon: <Monitor className="w-5 h-5" />, configured: hasKioskRestriction },
    // { type: 'miscRestriction', title: t('restrictions.android.miscellaneous'), description: t('restrictions.android.miscellaneous.desc'), icon: <Settings className="w-5 h-5" />, configured: hasMiscRestriction },
    // { type: 'networkRestriction', title: t('restrictions.android.network'), description: t('restrictions.android.network.desc'), icon: <Wifi className="w-5 h-5" />, configured: hasNetworkRestriction },
    // { type: 'phoneRestriction', title: t('restrictions.android.phone'), description: t('restrictions.android.phone.desc'), icon: <Smartphone className="w-5 h-5" />, configured: hasPhoneRestriction },
    // { type: 'storageRestriction', title: t('restrictions.android.storage'), description: t('restrictions.android.storage.desc'), icon: <Server className="w-5 h-5" />, configured: hasStorageRestriction },
    // { type: 'tetheringRestriction', title: t('restrictions.android.tethering'), description: t('restrictions.android.tethering.desc'), icon: <Wifi className="w-5 h-5" />, configured: hasTetheringRestriction },
    // ----- END DO-ONLY RESTRICTIONS -----
    
    // ----- WP-SUPPORTED RESTRICTIONS -----
    { type: 'locationRestriction', title: t('restrictions.android.location'), description: t('restrictions.android.location.desc'), icon: <Globe className="w-5 h-5" />, configured: hasLocationRestriction },
    { type: 'securityRestriction', title: t('restrictions.android.security'), description: t('restrictions.android.security.desc'), icon: <Shield className="w-5 h-5" />, configured: hasSecurityRestriction },
    // ----- END WP-SUPPORTED RESTRICTIONS -----
  ].sort((a, b) => a.title.localeCompare(b.title));

  // Split Android items into configured vs available
  const configuredAndroidPolicies = androidPolicies.filter(p => p.configured);
  const availableAndroidPolicies = androidPolicies.filter(p => !p.configured);
  const configuredAndroidRestrictions = androidRestrictions.filter(r => r.configured);
  const availableAndroidRestrictions = androidRestrictions.filter(r => !r.configured);

  // For iOS: merge into availablePolicies for backward compatibility
  const availablePolicies = iosAvailablePolicies;

  return (
    <motion.div
      key="list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* iOS: Active Policies Section */}
      {isIos && activePolicies > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Active Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hasPasscode && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-primary h-full flex flex-col" onClick={() => onSelectPolicy('passcode')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" /> Passcode
                    </CardTitle>
                    <CardDescription>Security requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">Min length: {(passcodePolicy as any).minLength || '-'}</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasWifi && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-info h-full flex flex-col" onClick={() => onSelectPolicy('wifi')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wifi className="w-5 h-5 text-info" /> WiFi
                    </CardTitle>
                    <CardDescription>Network configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{wifiPolicy?.ssid || wifiPolicy?.name || 'Configured'}</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasMail && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-purple-500 h-full flex flex-col" onClick={() => onSelectPolicy('mail')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-500" /> Mail
                    </CardTitle>
                    <CardDescription>Email configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{mailPolicy?.name || 'Configured'}</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasScep && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-warning h-full flex flex-col" onClick={() => onSelectPolicy('scep')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key className="w-5 h-5 text-warning" /> SCEP
                    </CardTitle>
                    <CardDescription>Certificate enrollment</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{(scepPolicy as any)?.scepName || 'Configured'}</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasMdm && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-success h-full flex flex-col" onClick={() => onSelectPolicy('mdm')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Server className="w-5 h-5 text-success" /> MDM
                    </CardTitle>
                    <CardDescription>Device management</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge className="bg-destructive hover:bg-destructive/90">Active</Badge>
                    <Button variant="secondary" size="sm" className="w-full mt-2">View Policy</Button>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasRestrictions && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-destructive h-full flex flex-col" onClick={() => onSelectPolicy('restrictions')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Ban className="w-5 h-5 text-destructive" /> Restrictions
                    </CardTitle>
                    <CardDescription>Device restrictions</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">Custom restrictions applied</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasWebApps && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-blue-500 h-full flex flex-col" onClick={() => onSelectPolicy('webApps')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" /> Web Apps
                    </CardTitle>
                    <CardDescription>Web application links</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{webApplicationPolicy.length} web app(s)</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasNotifications && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-yellow-500 h-full flex flex-col" onClick={() => onSelectPolicy('notifications')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell className="w-5 h-5 text-yellow-500" /> Notifications
                    </CardTitle>
                    <CardDescription>Notification settings</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{notificationPolicy.length} rule(s)</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasLockScreen && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-teal-500 h-full flex flex-col" onClick={() => onSelectPolicy('lockScreenMessage')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-teal-500" /> Lock Screen
                    </CardTitle>
                    <CardDescription>Lock screen message</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">Message configured</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {/* Phase 2 active policy cards */}
            {hasWebContentFilter && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-orange-500 h-full flex flex-col" onClick={() => onSelectPolicy('webContentFilter')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="w-5 h-5 text-orange-500" /> Web Content Filter
                    </CardTitle>
                    <CardDescription>URL filtering and content restrictions</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{webContentFilterPolicy?.name || 'Configured'}</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasGlobalHttpProxy && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-blue-500 h-full flex flex-col" onClick={() => onSelectPolicy('globalHttpProxy')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" /> Global HTTP Proxy
                    </CardTitle>
                    <CardDescription>Network proxy configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{globalHttpProxyPolicy?.proxyType || 'Configured'}</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasVpn && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-emerald-500 h-full flex flex-col" onClick={() => onSelectPolicy('vpn')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lock className="w-5 h-5 text-emerald-500" /> VPN
                    </CardTitle>
                    <CardDescription>Virtual private network</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{vpnPolicyGridData?.vpnType || 'Configured'}</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasPerAppVpn && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-violet-500 h-full flex flex-col" onClick={() => onSelectPolicy('perAppVpn')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-violet-500" /> Per-App VPN
                    </CardTitle>
                    <CardDescription>App-specific VPN routing</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{perAppVpnGridData?.applicationIds?.length || 0} app(s)</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasPerDomainVpn && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-teal-500 h-full flex flex-col" onClick={() => onSelectPolicy('perDomainVpn')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="w-5 h-5 text-teal-500" /> Per-Domain VPN
                    </CardTitle>
                    <CardDescription>Domain-based VPN routing</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{perDomainVpnGridData?.safariDomains?.length || 0} domain(s)</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {hasRelay && (
              <UniformPolicyCard>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-cyan-500 h-full flex flex-col" onClick={() => onSelectPolicy('relay')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Radio className="w-5 h-5 text-cyan-500" /> Relay
                    </CardTitle>
                    <CardDescription>HTTP relay tunneling</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{relayGridData?.name || 'Configured'}</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            )}

            {/* Applications Policy Card - always shown for iOS */}
            <UniformPolicyCard>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-orange-500 h-full flex flex-col" onClick={() => onSelectPolicy('applications')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Grid className="w-5 h-5 text-orange-500" /> Applications
                  </CardTitle>
                  <CardDescription>Manage app catalog</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <Button variant="outline" size="sm" className="w-full">Manage Apps</Button>
                </CardContent>
              </Card>
            </UniformPolicyCard>
          </div>
        </div>
      )}

      {/* iOS: Available Policies Section */}
      {isIos && availablePolicies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">{t('policyEditor.availablePolicies')}</h3>
          <p className="text-sm text-muted-foreground/70">{t('policyEditor.clickToConfigurePolicy')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePolicies.map((policy) => (
              <AvailablePolicyCard
                key={policy.type}
                icon={policy.icon}
                title={policy.title}
                description={policy.description}
                onClick={() => onSelectPolicy(policy.type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* iOS: Show applications card if no active policies exist */}
      {isIos && activePolicies === 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Manage Applications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UniformPolicyCard>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-orange-500 h-full flex flex-col" onClick={() => onSelectPolicy('applications')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Grid className="w-5 h-5 text-orange-500" /> Applications
                  </CardTitle>
                  <CardDescription>Manage app catalog</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <Button variant="outline" size="sm" className="w-full">Manage Apps</Button>
                </CardContent>
              </Card>
            </UniformPolicyCard>
          </div>
        </div>
      )}

      {/* ===== ANDROID SECTIONS ===== */}

      {/* Android: Configured Policies Section */}
      {isAndroid && configuredAndroidPolicies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{t('policyEditor.configuredPolicies')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configuredAndroidPolicies.map((policy) => (
              <UniformPolicyCard key={policy.type}>
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-primary h-full flex flex-col" 
                  onClick={() => onSelectPolicy(policy.type)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {React.cloneElement(policy.icon as React.ReactElement, { className: "w-5 h-5 text-primary" })}
                      {policy.title}
                    </CardTitle>
                    <CardDescription>{policy.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge>Configured</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">Click to edit</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            ))}
          </div>
        </div>
      )}

      {/* Android: Configured Restrictions Section */}
      {isAndroid && configuredAndroidRestrictions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{t('policyEditor.configuredRestrictions')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configuredAndroidRestrictions.map((restriction) => (
              <UniformPolicyCard key={restriction.type}>
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-destructive h-full flex flex-col" 
                  onClick={() => onSelectPolicy(restriction.type)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {React.cloneElement(restriction.icon as React.ReactElement, { className: "w-5 h-5 text-destructive" })}
                      {restriction.title}
                    </CardTitle>
                    <CardDescription>{restriction.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Badge variant="destructive">Configured</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">Click to edit</p>
                  </CardContent>
                </Card>
              </UniformPolicyCard>
            ))}
          </div>
        </div>
      )}

      {/* Android: Available Policies Section */}
      {isAndroid && availableAndroidPolicies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">{t('policyEditor.availablePolicies')}</h3>
          <p className="text-sm text-muted-foreground/70">{t('policyEditor.clickToConfigurePolicy')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableAndroidPolicies.map((policy) => (
              <AvailablePolicyCard
                key={policy.type}
                icon={React.cloneElement(policy.icon as React.ReactElement, { className: "w-5 h-5 text-muted-foreground" })}
                title={policy.title}
                description={policy.description}
                onClick={() => onSelectPolicy(policy.type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Android: Available Restrictions Section */}
      {isAndroid && availableAndroidRestrictions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">{t('policyEditor.availableRestrictions')}</h3>
          <p className="text-sm text-muted-foreground/70">{t('policyEditor.clickToConfigureRestriction')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableAndroidRestrictions.map((restriction) => (
              <AvailablePolicyCard
                key={restriction.type}
                icon={React.cloneElement(restriction.icon as React.ReactElement, { className: "w-5 h-5 text-muted-foreground" })}
                title={restriction.title}
                description={restriction.description}
                onClick={() => onSelectPolicy(restriction.type)}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
