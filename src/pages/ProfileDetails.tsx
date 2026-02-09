import { ProfileService } from "@/api/services/profiles";
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  RestrictionsComposite
} from "@/components/profiles/IosPolicies/RestrictionsPolicy";
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
import { Separator } from "@/components/ui/separator";
import { getAssetUrl } from "@/config/env";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { usePlatformValidation } from "@/hooks/usePlatformValidation";
import { cn } from "@/lib/utils";
import { IosMdmConfiguration, IosScepConfiguration } from "@/types/ios";
import {
  AndroidFullProfile,
  AndroidProfileRestrictions,
  ApplicationPolicy,
  FullProfile,
  IosFullProfile,
  IosMailPolicy,
  IosPasscodeRestrictionPolicy,
  IosWiFiConfiguration,
  LockScreenMessagePolicy as LockScreenMessagePolicyType,
  NotificationPolicy as NotificationPolicyType,
  PasscodeRestrictionPolicy,
  Platform,
  WebApplicationPolicy
} from "@/types/models";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Ban,
  Bell,
  Bluetooth,
  CheckCircle,
  ChevronDown,
  Clock,
  Database,
  Edit,
  FileText,
  Globe,
  Grid,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageSquare,
  Monitor,
  Phone,
  Plus,
  Send,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  TabletSmartphone,
  Users,
  Wifi,
  WifiOff
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Extended type for UI display
type ProfileDetailsData = FullProfile & {
  deployedDevices?: number;
  complianceRate?: number;
  category?: string;
};

// Helper to check profile type
function isIosProfile(profile: FullProfile): profile is IosFullProfile {
  return profile.platform === 'ios' || profile.profileType === 'IosFullProfile';
}

function isAndroidProfile(profile: FullProfile): profile is AndroidFullProfile {
  return profile.platform === 'android' || profile.profileType === 'Android_Full_Profile';
}

// ------ Add Policy Dropdown ------
interface AddPolicyDropdownProps {
  platform?: string;
  passcodePolicy?: PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy;
  wifiPolicy?: IosWiFiConfiguration;
  mailPolicy?: IosMailPolicy;
  restrictionsPolicy?: RestrictionsComposite | AndroidProfileRestrictions;
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
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button className="rounded-full w-10 h-10 p-0 shadow-lg bg-primary hover:bg-primary/90" size="icon">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </Button>
        </motion.div>
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



// ------ Policy Card Grid ------
interface PolicyCardGridProps {
  platform?: string;
  passcodePolicy?: PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy;
  androidPasscodePolicy?: any;
  wifiPolicy?: IosWiFiConfiguration;
  mailPolicy?: IosMailPolicy;
  restrictionsPolicy?: RestrictionsComposite | AndroidProfileRestrictions;
  applicationPolicy?: ApplicationPolicy[];
  webApplicationPolicy: WebApplicationPolicy[];
  notificationPolicy: NotificationPolicyType[];
  lockScreenMessagePolicy: LockScreenMessagePolicyType | null;
  scepPolicy?: IosScepConfiguration;
  mdmPolicy?: IosMdmConfiguration;
  onSelectPolicy: (type: string) => void;
}

// Uniform card wrapper component for consistent sizing
// Uniform card wrapper component for consistent sizing
function UniformPolicyCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className={`h-full ${className}`}>
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
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
      <Card
        className="cursor-pointer hover:shadow-md transition-all h-full bg-muted/30 border-dashed border-2 hover:bg-muted/50 hover:border-solid flex flex-col"
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <Button variant="ghost" size="sm" className="w-full mt-2 border border-dashed">Configure</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Configured policy card (colored, active)
interface ConfiguredPolicyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string; // Static description
  statusText?: string; // Dynamic status
  colorClass?: string;
  borderClass?: string;
  onClick: () => void;
  badgeText?: string;
}

function ConfiguredPolicyCard({
  icon,
  title,
  description,
  statusText,
  colorClass = "text-primary",
  borderClass = "border-t-primary",
  onClick,
  badgeText = "Active"
}: ConfiguredPolicyCardProps) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
      <Card
        className={cn(
          "cursor-pointer hover:shadow-lg transition-all h-full border-t-4 flex flex-col",
          borderClass
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-lg flex items-center gap-2", colorClass)}>
            {icon}
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <Badge className="w-fit mb-2 bg-green-100 text-green-700 hover:bg-green-200 border-green-200">{badgeText}</Badge>
          <p className="text-sm text-foreground/80 font-medium">{statusText || "Click to edit configuration"}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PolicyCardGrid({
  platform,
  passcodePolicy,
  androidPasscodePolicy,
  wifiPolicy,
  mailPolicy,
  restrictionsPolicy,
  applicationPolicy = [],
  webApplicationPolicy = [],
  notificationPolicy = [],
  lockScreenMessagePolicy,
  scepPolicy,
  mdmPolicy,
  onSelectPolicy,
}: PolicyCardGridProps) {
  const isIos = platform === "ios";
  const isAndroid = platform === "android";
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  type PolicyItem = {
    id: string;
    title: string;
    description: string; // Static description
    statusText?: string; // Configured details
    icon: React.ReactNode;
    isConfigured: boolean;
    colorClass?: string;
    borderClass?: string;
    badgeText?: string;
  };

  const allPolicies: PolicyItem[] = [];

  if (isIos) {
    allPolicies.push({
      id: "passcode",
      title: "Passcode Policy",
      description: "Enforce password requirements and device locking.",
      statusText: passcodePolicy ? "Minimum length, complexity, and auto-lock settings configured." : undefined,
      icon: <Shield className="w-5 h-5" />,
      isConfigured: !!passcodePolicy,
      colorClass: "text-emerald-600",
      borderClass: "border-t-emerald-600",
    });
    allPolicies.push({
      id: "wifi",
      title: "WiFi Configuration",
      description: "Pre-configure WiFi networks for automatic connection.",
      statusText: wifiPolicy ? `SSID: ${wifiPolicy.ssid} • ${wifiPolicy.encryptionType}` : undefined,
      icon: <Wifi className="w-5 h-5" />,
      isConfigured: !!wifiPolicy,
      colorClass: "text-blue-500",
      borderClass: "border-t-blue-500",
    });
    allPolicies.push({
      id: "mail",
      title: "Mail Configuration",
      description: "Configure email accounts (Exchange, POP/IMAP).",
      statusText: mailPolicy ? `${mailPolicy.emailAccountName} • ${mailPolicy.emailAddress}` : undefined,
      icon: <Mail className="w-5 h-5" />,
      isConfigured: !!mailPolicy,
      colorClass: "text-indigo-500",
      borderClass: "border-t-indigo-500",
    });
    allPolicies.push({
      id: "restrictions",
      title: "Device Restrictions",
      description: "Restrict device features, apps, and content.",
      statusText: restrictionsPolicy ? "Camera, iCloud, App Store, and content restrictions configured." : undefined,
      icon: <Ban className="w-5 h-5" />,
      isConfigured: !!restrictionsPolicy,
      colorClass: "text-purple-600",
      borderClass: "border-t-purple-600",
    });
    allPolicies.push({
      id: "webApps",
      title: "Web Clips",
      description: "Add shortcuts to websites on the Home Screen.",
      statusText: webApplicationPolicy.length > 0 ? `${webApplicationPolicy.length} Web Clips configured.` : undefined,
      icon: <Globe className="w-5 h-5" />,
      isConfigured: webApplicationPolicy.length > 0,
      colorClass: "text-teal-500",
      borderClass: "border-t-teal-500",
      badgeText: `${webApplicationPolicy.length} Active`
    });
    allPolicies.push({
      id: "notifications",
      title: "Notifications",
      description: "Control notification settings per app.",
      statusText: notificationPolicy.length > 0 ? `${notificationPolicy.length} Apps configured.` : undefined,
      icon: <Bell className="w-5 h-5" />,
      isConfigured: notificationPolicy.length > 0,
      colorClass: "text-sky-500",
      borderClass: "border-t-sky-500",
      badgeText: `${notificationPolicy.length} Active`
    });
    allPolicies.push({
      id: "lockScreenMessage",
      title: "Lock Screen Msg",
      description: "Display 'If Lost' information.",
      statusText: lockScreenMessagePolicy ? "Custom text on the lock screen." : undefined,
      icon: <MessageSquare className="w-5 h-5" />,
      isConfigured: !!lockScreenMessagePolicy,
      colorClass: "text-indigo-500",
      borderClass: "border-t-indigo-500",
    });
    if (scepPolicy) {
      allPolicies.push({
        id: "scep",
        title: "SCEP",
        description: "Certificate enrollment.",
        statusText: "Certificate enrollment configured",
        icon: <FileText className="w-5 h-5" />,
        isConfigured: true,
        colorClass: "text-slate-500",
        borderClass: "border-t-slate-500"
      });
    }
    if (mdmPolicy) {
      allPolicies.push({
        id: "mdm",
        title: "MDM Settings",
        description: "Device management.",
        statusText: `Server: ${mdmPolicy.serverURL?.substring(0, 20)}...`,
        icon: <Server className="w-5 h-5" />,
        isConfigured: true,
        colorClass: "text-slate-500",
        borderClass: "border-t-slate-500"
      });
    }
  }

  if (isAndroid) {
    const androidRestrictions = restrictionsPolicy as AndroidProfileRestrictions | undefined;

    const androidItems = [
      { id: "androidPasscode", title: "Passcode Policy", icon: <Shield className="w-5 h-5" />, check: !!androidPasscodePolicy, desc: "Password complexity settings.", status: "Complexity settings active" },
      { id: "securityRestriction", title: "Security", icon: <Shield className="w-5 h-5" />, check: !!androidRestrictions?.security, desc: "Device security settings.", status: "Security restrictions active" },
      { id: "networkRestriction", title: "Network", icon: <WifiOff className="w-5 h-5" />, check: !!androidRestrictions?.network, desc: "Network restrictions.", status: "Network restrictions active" },
      { id: "kioskRestriction", title: "Kiosk", icon: <TabletSmartphone className="w-5 h-5" />, check: !!androidRestrictions?.kiosk, desc: "Kiosk mode settings.", status: "Kiosk mode active" },
      { id: "locationRestriction", title: "Location", icon: <MapPin className="w-5 h-5" />, check: !!androidRestrictions?.location, desc: "Location services.", status: "Location settings active" },
      { id: "tetheringRestriction", title: "Tethering", icon: <Bluetooth className="w-5 h-5" />, check: !!androidRestrictions?.tethering, desc: "Bluetooth & tethering.", status: "Tethering settings active" },
      { id: "phoneRestriction", title: "Phone", icon: <Phone className="w-5 h-5" />, check: !!androidRestrictions?.phone, desc: "Telephony restrictions.", status: "Phone restrictions active" },
      { id: "dateTimeRestriction", title: "Date/Time", icon: <Clock className="w-5 h-5" />, check: !!androidRestrictions?.dateTime, desc: "Date and time settings.", status: "Date/Time settings active" },
      { id: "displayRestriction", title: "Display", icon: <Monitor className="w-5 h-5" />, check: !!androidRestrictions?.display, desc: "Display settings.", status: "Display settings active" },
      { id: "storageRestriction", title: "Storage", icon: <Database className="w-5 h-5" />, check: !!androidRestrictions?.syncStorage, desc: "Storage & Sync.", status: "Storage settings active" },
      { id: "enrollment", title: "Enrollment", icon: <FileText className="w-5 h-5" />, check: false, desc: "Enrollment settings.", status: "" },
      { id: "deviceTheme", title: "Theme", icon: <ImageIcon className="w-5 h-5" />, check: false, desc: "Device theme settings.", status: "" },
      { id: "commonSettings", title: "Common", icon: <Settings className="w-5 h-5" />, check: false, desc: "Common global settings.", status: "" },
      { id: "androidWebApp", title: "Web Apps", icon: <Globe className="w-5 h-5" />, check: webApplicationPolicy.length > 0, desc: "Web shortcuts.", status: `${webApplicationPolicy.length} Web Apps` },
    ];

    androidItems.forEach(item => {
      allPolicies.push({
        id: item.id,
        title: item.title,
        description: item.desc,
        statusText: item.status,
        icon: item.icon,
        isConfigured: item.check,
        colorClass: item.check ? "text-primary" : undefined,
        borderClass: item.check ? "border-t-primary" : undefined,
      });
    });
  }

  // Application Policy is common
  allPolicies.push({
    id: "applications",
    title: "Applications",
    description: "Install, remove, or manage apps.",
    statusText: applicationPolicy.length > 0 ? `${applicationPolicy.length} Apps configured.` : undefined,
    icon: <Grid className="w-5 h-5" />,
    isConfigured: applicationPolicy.length > 0,
    colorClass: "text-blue-600",
    borderClass: "border-t-blue-600",
    badgeText: `${applicationPolicy.length} Active`
  });


  const configuredPolicies = allPolicies.filter(p => p.isConfigured);
  const availablePolicies = allPolicies.filter(p => !p.isConfigured);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-20 space-y-8"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold tracking-tight">Configuration Policies</h2>
      </div>

      {configuredPolicies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" /> Configured Policies
            </h3>
            <AddPolicyDropdown
              platform={platform}
              passcodePolicy={passcodePolicy}
              wifiPolicy={wifiPolicy}
              mailPolicy={mailPolicy}
              restrictionsPolicy={restrictionsPolicy}
              applicationPolicy={applicationPolicy}
              webApplicationPolicy={webApplicationPolicy}
              notificationPolicy={notificationPolicy}
              lockScreenMessagePolicy={lockScreenMessagePolicy}
              onSelect={onSelectPolicy}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {configuredPolicies.map(policy => (
              <ConfiguredPolicyCard
                key={policy.id}
                icon={policy.icon}
                title={policy.title}
                description={policy.description}
                statusText={policy.statusText}
                colorClass={policy.colorClass}
                borderClass={policy.borderClass}
                badgeText={policy.badgeText}
                onClick={() => onSelectPolicy(policy.id)}
              />
            ))}
          </div>
        </div>
      )}

      {availablePolicies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
            <Plus className="w-5 h-5" /> Available Policies
          </h3>
          <p className="text-sm text-muted-foreground/70">Select a policy to configure settings for this profile.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availablePolicies.map(policy => (
              <AvailablePolicyCard
                key={policy.id}
                icon={policy.icon}
                title={policy.title}
                description={policy.description}
                onClick={() => onSelectPolicy(policy.id)}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function ProfileDetails() {
  const { platform, id } = useParams<{ platform: string; id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  // State for specific Policy Data (Merged from EditProfilePolicies)
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
    RestrictionsComposite | AndroidProfileRestrictions | undefined
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
  // Android-specific policy state
  const [androidPasscodePolicy, setAndroidPasscodePolicy] = useState<
    any | undefined
  >(undefined);

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const fetchProfile = async () => {
    if (!platform || !id) {
      setError(t('profiles.invalidParameters'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await ProfileService.getProfile(platform as Platform, id);
      // Set platform from URL params since API response might simplify it
      setProfile({
        ...data,
        platform: platform as Platform,
      } as ProfileDetailsData);

      const isIos = platform === "ios";
      const isAndroid = platform === "android";

      // Handle iOS
      if (isIos) {
        const iosData = data as IosFullProfile;
        setPasscodePolicy(iosData.passCodePolicy || undefined);
        setWifiPolicy(iosData.wifiPolicy || undefined);
        setLockScreenMessagePolicy(iosData.lockScreenPolicy || null);
        setNotificationPolicy((iosData.notificationPolicies as any[]) || []);
        setScepPolicy(iosData.scepPolicy || undefined);
        setMdmPolicy(iosData.mdmPolicy || undefined);
        setMailPolicy(iosData.mailPolicy || undefined);
        setWebApplicationPolicy((iosData.webClipPolicies as any[]) || []);
        setApplicationPolicy((iosData.applicationPolicies as any[]) || []);
      }

      // Handle Android
      if (isAndroid) {
        const anyData = data as any;

        if (anyData.restrictions) {
          const restrictions = anyData.restrictions;
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
        } else setRestrictionsPolicy(undefined);

        setWebApplicationPolicy(anyData.webApplicationPolicies || []);
        setAndroidPasscodePolicy(anyData.passcodePolicy || undefined);
        setApplicationPolicy(anyData.applicationPolicies || []);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError(t('profiles.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, platform]);

  const { shouldRender } = usePlatformValidation(
    platform,
    profile?.platform,
    loading,
    (correctPlatform) => `/profiles/${correctPlatform}/${id}`
  );

  if (!shouldRender || loading) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center">
          <LoadingAnimation message={loading ? t('profiles.loadingDetails') : "Redirecting..."} />
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-muted-foreground">{error || t('profiles.profileNotFound')}</div>
      </MainLayout>
    );
  }

  const handlePublish = async () => {
    if (!platform || !id) return;
    setPublishing(true);
    try {
      const profileType = platform.toLowerCase() === "ios" ? "IosPublishProfile" : "AndroidPublishProfile";
      await ProfileService.publishProfile(platform as Platform, id, { profileType });
      toast({
        title: "Profile Published",
        description: `Profile "${profile?.name}" has been published successfully.`,
      });
      await fetchProfile();
    } catch (err) {
      console.error("Failed to publish profile:", err);
      toast({
        title: "Error",
        description: "Failed to publish profile",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const getPlatformIcon = (plat?: string) => {
    const iconClass = "w-8 h-8 object-contain";
    switch (plat?.toLowerCase()) {
      case "android": return <img src={getAssetUrl("Assets/android.png")} alt="Android" className={iconClass} />;
      case "ios": return <img src={getAssetUrl("Assets/apple.png")} alt="iOS" className={iconClass} />;
      case "windows": return <img src={getAssetUrl("Assets/microsoft.png")} alt="Windows" className={iconClass} />;
      case "macos": return <img src={getAssetUrl("Assets/mac_os.png")} alt="macOS" className={iconClass} />;
      default: return <img src={getAssetUrl("Assets/all_platforms.png")} alt="Platform" className={iconClass} />;
    }
  };

  const handlePolicyClick = (policyType: string) => {
    setSelectedPolicyType(policyType);
    setPolicyDialogOpen(true);
  };

  // Helper to render label-value rows
  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between py-2 border-b border-border/50 last:border-0 hover:bg-muted/30 px-2 rounded-sm transition-colors">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground break-words text-right max-w-[60%]">{value?.toString() ?? "-"}</span>
    </div>
  );

  const AuditInfo = ({ data }: { data: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="mt-4 pt-4 border-t border-border/50 bg-muted/20 p-3 rounded-lg">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            <Clock3 className="w-3 h-3" /> {t('profileDetails.auditInfo')}
          </span>
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
        </button>
        {isExpanded && (
          <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <InfoRow label={t('profiles.table.createdBy')} value={data.createdBy} />
            <InfoRow
              label={t('profileDetails.createdOn')}
              value={data.creationTime ? new Date(data.creationTime).toLocaleString() : "-"}
            />
            <InfoRow label={t('profiles.table.lastModifiedBy')} value={data.lastModifiedBy} />
            <InfoRow
              label={t('profileDetails.lastModified')}
              value={data.modificationTime ? new Date(data.modificationTime).toLocaleString() : "-"}
            />
          </div>
        )}
      </div>
    );
  };

  const renderPolicyDialogContent = () => {
    if (!selectedPolicyType) return null;

    if (isIosProfile(profile)) {
      switch (selectedPolicyType) {
        case "passcode": return profile.passCodePolicy ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <InfoRow label="Min Length" value={profile.passCodePolicy.minLength} />
              <InfoRow label="Allow Simple" value={profile.passCodePolicy.allowSimple ? "Yes" : "No"} />
              <InfoRow label="Require Passcode" value={profile.passCodePolicy.requirePassCode ? "Yes" : "No"} />
              <InfoRow label="Alphanumeric" value={profile.passCodePolicy.requireAlphanumericPasscode ? "Yes" : "No"} />
              <InfoRow label="Complex Passcode" value={profile.passCodePolicy.requireComplexPasscode ? "Yes" : "No"} />
              <InfoRow label="Max Failed Attempts" value={profile.passCodePolicy.maximumFailedAttempts} />
              <InfoRow label="Grace Period (min)" value={profile.passCodePolicy.maximumGracePeriodInMinutes} />
              <InfoRow label="Max Inactivity (min)" value={profile.passCodePolicy.maximumInactivityInMinutes} />
              <InfoRow label="Passcode Age (days)" value={profile.passCodePolicy.maximumPasscodeAgeInDays} />
            </div>
            <AuditInfo data={profile.passCodePolicy} />
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Passcode Policy Configured</p>;

        case "wifi": return profile.wifiPolicy ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <InfoRow label="SSID" value={profile.wifiPolicy.ssid} />
              <InfoRow label="Visibility" value={profile.wifiPolicy.hiddenNetwork ? "Hidden" : "Visible"} />
              <InfoRow label="Auto Join" value={profile.wifiPolicy.autoJoin ? "Yes" : "No"} />
              <InfoRow label="Encryption" value={profile.wifiPolicy.encryptionType} />
              <InfoRow label="Proxy Type" value={profile.wifiPolicy.proxyType} />
              {profile.wifiPolicy.proxyServer && (
                <>
                  <InfoRow label="Proxy Server" value={`${profile.wifiPolicy.proxyServer}:${profile.wifiPolicy.proxyServerPort}`} />
                </>
              )}
            </div>
            <AuditInfo data={profile.wifiPolicy} />
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No WiFi Policy Configured</p>;

        case "mdm": return profile.mdmPolicy ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <InfoRow label="Server URL" value={profile.mdmPolicy.serverURL} />
              <InfoRow label="Access Rights" value={profile.mdmPolicy.accessRights} />
              <InfoRow label="Check-In Interval" value={profile.mdmPolicy.checkInInterval} />
              <InfoRow label="Sign Message" value={profile.mdmPolicy.signMessage ? "Yes" : "No"} />
              <InfoRow label="Server Capabilities" value={profile.mdmPolicy.serverCapabilities?.join(", ")} />
              <InfoRow label="Topic" value={profile.mdmPolicy.topic} />
              <InfoRow label="Identity Cert UUID" value={profile.mdmPolicy.identityCertificateUUID} />
            </div>
            <AuditInfo data={profile.mdmPolicy} />
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No MDM Policy Configured</p>;

        case "mail": return profile.mailPolicy ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <InfoRow label="Account Type" value={profile.mailPolicy.emailAccountType} />
              <InfoRow label="Account Name" value={profile.mailPolicy.emailAccountName} />
              <InfoRow label="Email Address" value={profile.mailPolicy.emailAddress} />
              <InfoRow label="Incoming Server" value={`${profile.mailPolicy.incomingMailServerHostName}:${profile.mailPolicy.incomingMailServerPortNumber}`} />
              <InfoRow label="Outgoing Server" value={`${profile.mailPolicy.outgoingMailServerHostName}:${profile.mailPolicy.outgoingMailServerPortNumber}`} />
              <InfoRow label="Prevent Move" value={profile.mailPolicy.preventMove ? "Yes" : "No"} />
              <InfoRow label="Recent Sync Days" value={profile.mailPolicy.disableMailRecentsSyncing ? "Disabled" : "Enabled"} />
            </div>
            <AuditInfo data={profile.mailPolicy} />
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Email Policy Configured</p>;

        case "webclips": return (profile.webClipPolicies && profile.webClipPolicies.length > 0) ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {profile.webClipPolicies.map((clip, index) => (
              <div key={index} className="bg-muted/30 p-3 rounded-lg border border-border/50 space-y-1">
                <h4 className="font-semibold text-sm mb-2 text-primary">{clip.label || `Web Clip #${index + 1}`}</h4>
                <InfoRow label="URL" value={clip.url} />
                <InfoRow label="Removable" value={clip.isRemovable ? "Yes" : "No"} />
                <InfoRow label="Fullscreen" value={clip.fullScreen ? "Yes" : "No"} />
                <InfoRow label="Precomposed" value={clip.precomposed ? "Yes" : "No"} />
              </div>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Web Clips Configured</p>;

        case "notifications": return (profile.notificationPolicies && profile.notificationPolicies.length > 0) ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {profile.notificationPolicies.map((notif, index) => (
              <div key={index} className="bg-muted/30 p-3 rounded-lg border border-border/50 space-y-1">
                <h4 className="font-semibold text-sm mb-2 text-primary">{notif.bundleIdentifier}</h4>
                <InfoRow label="Enabled" value={notif.eventsEnabled ? "Yes" : "No"} />
                <InfoRow label="Show in Lock Screen" value={notif.showInLockScreen ? "Yes" : "No"} />
                <InfoRow label="Show in Notification Center" value={notif.showInNotificationCenter ? "Yes" : "No"} />
                <InfoRow label="Badges" value={notif.badgesEnabled ? "Yes" : "No"} />
                <InfoRow label="Sounds" value={notif.soundsEnabled ? "Yes" : "No"} />
                <InfoRow label="Alert Type" value={notif.alertType} />
              </div>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Notification Policies Configured</p>;

        case "apps": return (profile.applicationPolicies && profile.applicationPolicies.length > 0) ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {profile.applicationPolicies.map((app, index) => (
              <div key={index} className="bg-muted/30 p-3 rounded-lg border border-border/50 space-y-1">
                <h4 className="font-semibold text-sm mb-2 text-primary">{app.bundleIdentifier || `App #${index + 1}`}</h4>
                <InfoRow label="Install Type" value={app.installType} />
                <InfoRow label="Prevent Backup" value={app.preventBackup ? "Yes" : "No"} />
                <InfoRow label="Remove on Unenroll" value={app.removeOnUnenroll ? "Yes" : "No"} />
              </div>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Application Policies Configured</p>;

        case "restrictions": return profile.lockScreenPolicy ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <InfoRow label="Allow Camera" value={"Yes"} /> {/* Placeholder as iOS restrictions are scattered */}
              <InfoRow label="Allow Screenshot" value={"Yes"} />
            </div>
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Restrictions Configured</p>;

        default: return <p>Policy details not implemented for {selectedPolicyType}</p>;
      }
    }

    if (isAndroidProfile(profile)) {
      const restrictions = profile.restrictions;

      // Handle Android Restrictions sub-categories
      if (selectedPolicyType.startsWith("restriction_")) {
        const restrictionType = selectedPolicyType.replace("restriction_", "") as keyof AndroidProfileRestrictions;
        const restrictionData = restrictions?.[restrictionType];

        if (!restrictionData) return <p className="text-muted-foreground text-center py-4">No {restrictionType} configuration</p>;

        return (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              {Object.entries(restrictionData).map(([key, val]) => {
                if (key === 'id' || key === 'devicePolicyType') return null;
                return <InfoRow key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} value={typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val} />;
              })}
            </div>
            {/* Audit info not always available on nested restrictions objects directly in schema, check API */}
          </div>
        );
      }

      switch (selectedPolicyType) {
        case "enrollment": return profile.enrollmentPolicy ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <InfoRow label="Kiosk Mode" value={profile.enrollmentPolicy.isKioskMode ? "Enabled" : "Disabled"} />
            <InfoRow label="Initial WiFi SSID" value={profile.enrollmentPolicy.wifiHotspot?.ssid} />
            <InfoRow label="Use Mobile Data" value={profile.enrollmentPolicy.useMobileData ? "Yes" : "No"} />
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Enrollment Policy</p>;

        case "theme": return profile.deviceThemePolicy ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <InfoRow label="Background Color" value={profile.deviceThemePolicy.backgroundColor} />
            <InfoRow label="Icon Size" value={profile.deviceThemePolicy.iconSize} />
            <InfoRow label="Orientation" value={profile.deviceThemePolicy.screenOrientation} />
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Theme Policy</p>;

        case "common": return profile.commonSettingsPolicy ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <InfoRow label="Location Tracking" value={profile.commonSettingsPolicy.locationTracking ? "Enabled" : "Disabled"} />
            <InfoRow label="Screen Capture" value={profile.commonSettingsPolicy.disableScreenCapture ? "Disabled" : "Enabled"} />
            <InfoRow label="App Auto-Updates" value={JSON.stringify(profile.commonSettingsPolicy.appUpdateSchedule)} />
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Common Settings</p>;

        case "apps": return (profile.applicationPolicies && profile.applicationPolicies.length > 0) ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {profile.applicationPolicies.map((app, index) => (
              <div key={index} className="bg-muted/30 p-3 rounded-lg border border-border/50 space-y-1">
                <h4 className="font-semibold text-sm mb-2 text-primary">{app.packageName || `App #${index + 1}`}</h4>
                <InfoRow label="Install Type" value={app.installType} />
                <InfoRow label="Auto Update" value={app.autoUpdateMode} />
                <InfoRow label="Default Config" value={app.defaultConfiguration ? "Yes" : "No"} />
              </div>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Application Policies Configured</p>;

        case "webapps": return (profile.webApplicationPolicies && profile.webApplicationPolicies.length > 0) ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {profile.webApplicationPolicies.map((app, index) => (
              <div key={index} className="bg-muted/30 p-3 rounded-lg border border-border/50 space-y-1">
                <h4 className="font-semibold text-sm mb-2 text-primary">{app.title || `Web App #${index + 1}`}</h4>
                <InfoRow label="URL" value={app.url} />
                <InfoRow label="Display Mode" value={app.displayMode} />
                <InfoRow label="Icon" value={app.icon ? "Yes" : "No"} />
              </div>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Web App Policies Configured</p>;

        case "passcode": return profile.passcodePolicy?.work ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-semibold text-sm text-primary">Work Profile Passcode</h4>
            <div className="space-y-1">
              <InfoRow label="Complexity" value={profile.passcodePolicy.work.complexity} />
              <InfoRow label="History Length" value={profile.passcodePolicy.work.historyLength} />
              <InfoRow label="Max Failed Attempts to Wipe" value={profile.passcodePolicy.work.maxFailedAttemptsToWipe} />
              <InfoRow label="Password Expiry (seconds)" value={profile.passcodePolicy.work.changeAfterSeconds} />
              <InfoRow label="Strong Auth Timeout" value={profile.passcodePolicy.work.strongAuthRequiredTimeout} />
              <InfoRow label="Separate Lock" value={profile.passcodePolicy.work.separateLock ? "Yes" : "No"} />
            </div>
            {profile.passcodePolicy.enforcement && (
              <>
                <h4 className="font-semibold text-sm text-primary mt-4">Enforcement</h4>
                <div className="space-y-1">
                  <InfoRow label="Block After Days" value={profile.passcodePolicy.enforcement.blockAfterDays} />
                  <InfoRow label="Wipe After Days" value={profile.passcodePolicy.enforcement.wipeAfterDays} />
                </div>
              </>
            )}
            <AuditInfo data={profile.passcodePolicy.work} />
          </div>
        ) : <p className="text-muted-foreground text-center py-4">No Passcode Policy Configured</p>;

        default: return <p>Policy details not implemented</p>;
      }
    }

    return null;
  };

  // Policy Card Component
  const PolicyCard = ({ title, icon: Icon, type, isActive, overview }: { title: string; icon: any; type: string; isActive: boolean; overview?: string }) => (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md group overflow-hidden relative h-full flex flex-col",
        isActive
          ? "bg-primary/5 border-primary shadow-sm"
          : "bg-background border-dashed border-border/60 hover:border-primary/40 hover:bg-muted/30 opacity-70 hover:opacity-100"
      )}
      onClick={() => handlePolicyClick(type)}
    >
      <CardContent className="p-4 flex flex-col items-center text-center gap-3 flex-grow justify-center">
        <div className={cn(
          "p-3 rounded-full transition-colors duration-200",
          isActive
            ? "bg-primary/20 text-primary"
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <h3 className={cn("font-semibold text-sm", !isActive && "text-muted-foreground group-hover:text-foreground")}>{title}</h3>
          <p className={cn("text-xs transition-colors", isActive ? "text-primary/80 font-medium" : "text-muted-foreground/60")}>
            {isActive ? "Configured" : "Not Configured"}
          </p>
          {overview && (
            <p className="text-xs text-muted-foreground mt-1 px-2 py-1 bg-background/50 rounded-md truncate w-full border border-border/20">
              {overview}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );



  return (
    <MainLayout>


      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/profiles')} className="w-fit -ml-2 text-muted-foreground hover:text-foreground gap-1">
            <ArrowLeft className="w-4 h-4" /> {t('profiles.actions.backToProfiles')}
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-6">

              <div className="flex items-center gap-4">
                <div className="bg-background p-3 rounded-xl shadow-sm border border-border/50">
                  {getPlatformIcon(profile.platform)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                      {profile.name}
                    </h1>
                    <Badge variant={profile.status === 'PUBLISHED' ? "secondary" : "outline"} className={cn("ml-1 font-normal", profile.status === 'PUBLISHED' ? "bg-green-100 text-green-700 border-green-200" : "")}>
                      {profile.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">{profile.description}</p>

                </div>
              </div>

              {/* Publish Button (Left, Circular, Animated) */}
              {profile.status !== "PUBLISHED" && (
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  size="icon"
                  className={cn(
                    "rounded-full h-14 w-14 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-2 border-white/20 dark:border-slate-800",
                    "transition-all duration-300 hover:scale-105 active:scale-95",
                    publishing ? "animate-pulse" : "animate-in zoom-in slide-in-from-left-4 duration-500"
                  )}
                  title={t('profiles.publish.publish')}
                >
                  <Send className={cn("w-6 h-6 ml-0.5", publishing && "animate-spin")} />
                </Button>
              )}
            </div>

            {/* Edit Policy Button (Top Right) */}

          </div>
        </div>

        <Separator />

        {/* Stats / Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('profileDetails.status')}</p>
                <h3 className="text-2xl font-bold mt-1 capitalize">{profile.status}</h3>
              </div>
              <CheckCircle className={cn("w-8 h-8 opacity-20", profile.status === 'PUBLISHED' ? "text-green-500" : "text-yellow-500")} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('profileDetails.deployedDevices')}</p>
                <h3 className="text-2xl font-bold mt-1">{profile.deployedDevices || 0}</h3>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-20" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance</p>
                <h3 className="text-2xl font-bold mt-1">100%</h3>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500 opacity-20" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Version</p>
                <h3 className="text-2xl font-bold mt-1">v{profile.version || 1.0}</h3>
              </div>
              <Clock className="w-8 h-8 text-purple-500 opacity-20" />
            </CardContent>
          </Card>
        </div>



        {/* Policies (New Layout with Editors) */}
        {/* Policies */}
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
          onSelectPolicy={(type) => navigate(`/profiles/${platform}/${id}/policy/${type}`)}
        />

        <Separator />

        {/* Bottom Audit Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100/50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Created By</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{profile.createdBy || 'System'}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{profile.creationTime ? new Date(profile.creationTime).toLocaleString() : '-'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:justify-end">
            <div className="flex flex-col md:items-end">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Last Modified</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{profile.lastModifiedBy || 'System'}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{profile.modificationTime ? new Date(profile.modificationTime).toLocaleString() : 'Never'}</span>
              </div>
            </div>
            <div className="p-2 rounded-full bg-purple-100/50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Edit className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
