import { ProfileService } from "@/api/services/profiles";
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { MainLayout } from "@/components/layout/MainLayout";

import { PolicyEditDialog } from "@/components/profiles/PolicyEditDialog";
import { PublishProfileDialog } from "@/components/profiles/PublishProfileDialog";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getAssetUrl } from "@/config/env";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlatformValidation } from "@/hooks/usePlatformValidation";
import { cn } from "@/lib/utils";
import { IosGlobalHttpProxyPolicy, IosHomeScreenLayoutPolicy, IosMdmConfiguration, IosPerAppVpnPolicy, IosPerDomainVpnPolicy, IosRelayPolicy, IosScepConfiguration, IosVpnPolicy, IosWebContentFilterPolicy } from "@/types/ios";
import {
  AndroidFullProfile,
  AndroidProfileRestrictions,
  ApplicationPolicy,
  CommonSettingsPolicy,
  DeviceThemePolicy,
  EnrollmentPolicy,
  FullProfile,
  IosFullProfile,
  IosMailPolicy,
  IosPasscodeRestrictionPolicy,
  IosWiFiConfiguration,
  LockScreenMessagePolicy as LockScreenMessagePolicyType,
  NotificationPolicy as NotificationPolicyType,
  PasscodeRestrictionPolicy,
  Platform,
  Profile,
  ProfileType,
  RestrictionsComposite,
  WebApplicationPolicy
} from "@/types/models";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Ban,
  Bell,
  Bluetooth,
  CheckCircle,
  Clock,
  Database,
  Edit,
  FileText,
  Filter,
  Globe,
  Grid,
  Image as ImageIcon,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Monitor,
  Pencil,
  Phone,
  Plus,
  Radio,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
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
  webContentFilterPolicy?: IosWebContentFilterPolicy;
  globalHttpProxyPolicy?: IosGlobalHttpProxyPolicy;
  vpnPolicy?: IosVpnPolicy;
  perAppVpnPolicy?: IosPerAppVpnPolicy;
  perDomainVpnPolicy?: IosPerDomainVpnPolicy;
  relayPolicy?: IosRelayPolicy;
  homeScreenLayoutPolicy?: IosHomeScreenLayoutPolicy;
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
  webContentFilterPolicy,
  globalHttpProxyPolicy,
  vpnPolicy,
  perAppVpnPolicy,
  perDomainVpnPolicy,
  relayPolicy,
  homeScreenLayoutPolicy,
  onSelect,
}: AddPolicyDropdownProps) {
  const dropdownItems: { label: string; id: string; icon: React.ReactNode }[] = [];

  if (!passcodePolicy) dropdownItems.push({ id: "passcode", label: "Passcode Policy", icon: <Shield className="w-4 h-4 mr-2" /> });
  if (!wifiPolicy) dropdownItems.push({ id: "wifi", label: "WiFi Configuration", icon: <Wifi className="w-4 h-4 mr-2" /> });
  if (platform === "ios" && !mailPolicy) dropdownItems.push({ id: "mail", label: "Mail Configuration", icon: <Mail className="w-4 h-4 mr-2" /> });
  if (!restrictionsPolicy) dropdownItems.push({ id: "restrictions", label: "Device Restrictions", icon: <Ban className="w-4 h-4 mr-2" /> });
  if (applicationPolicy.length === 0) dropdownItems.push({ id: "applications", label: "Application Policy", icon: <Grid className="w-4 h-4 mr-2" /> });
  if (webApplicationPolicy.length === 0) dropdownItems.push({ id: "webApps", label: "Web Application Policy", icon: <Globe className="w-4 h-4 mr-2" /> });
  if (notificationPolicy.length === 0) dropdownItems.push({ id: "notifications", label: "Notification Policy", icon: <Bell className="w-4 h-4 mr-2" /> });
  if (!lockScreenMessagePolicy) dropdownItems.push({ id: "lockScreenMessage", label: "Lock Screen Message", icon: <MessageSquare className="w-4 h-4 mr-2" /> });
  if (platform === "ios" && !webContentFilterPolicy) dropdownItems.push({ id: "webContentFilter", label: "Web Content Filter", icon: <Filter className="w-4 h-4 mr-2" /> });
  if (platform === "ios" && !globalHttpProxyPolicy) dropdownItems.push({ id: "globalHttpProxy", label: "Global HTTP Proxy", icon: <Globe className="w-4 h-4 mr-2" /> });
  if (platform === "ios" && !vpnPolicy) dropdownItems.push({ id: "vpn", label: "VPN", icon: <Lock className="w-4 h-4 mr-2" /> });
  if (platform === "ios" && !perAppVpnPolicy) dropdownItems.push({ id: "perAppVpn", label: "Per-App VPN", icon: <Lock className="w-4 h-4 mr-2" /> });
  if (platform === "ios" && !perDomainVpnPolicy) dropdownItems.push({ id: "perDomainVpn", label: "Per-Domain VPN", icon: <Lock className="w-4 h-4 mr-2" /> });
  if (platform === "ios" && !relayPolicy) dropdownItems.push({ id: "relay", label: "Relay", icon: <Radio className="w-4 h-4 mr-2" /> });
  if (platform === "ios" && !homeScreenLayoutPolicy) dropdownItems.push({ id: "homeScreenLayout", label: "Home Screen Layout", icon: <Smartphone className="w-4 h-4 mr-2" /> });

  dropdownItems.sort((a, b) => a.label.localeCompare(b.label));

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
        {dropdownItems.map(item => (
          <DropdownMenuItem key={item.id} onClick={() => onSelect(item.id)}>
            {item.icon} {item.label}
          </DropdownMenuItem>
        ))}
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
  onSelectPolicy,
}: PolicyCardGridProps) {
  const isIos = platform === "ios";
  const isAndroid = platform === "android";
  const { t } = useLanguage();
  const [policySearchQuery, setPolicySearchQuery] = useState("");

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
    allPolicies.push({
      id: "webContentFilter",
      title: "Web Content Filter",
      description: "Filter and restrict web content access.",
      statusText: webContentFilterPolicy ? `Filter: ${webContentFilterPolicy.filterType || 'BuiltIn'}` : undefined,
      icon: <Filter className="w-5 h-5" />,
      isConfigured: !!webContentFilterPolicy,
      colorClass: "text-orange-500",
      borderClass: "border-t-orange-500",
    });
    allPolicies.push({
      id: "globalHttpProxy",
      title: "Global HTTP Proxy",
      description: "Route HTTP traffic through a proxy server.",
      statusText: globalHttpProxyPolicy ? `Type: ${globalHttpProxyPolicy.proxyType}` : undefined,
      icon: <Globe className="w-5 h-5" />,
      isConfigured: !!globalHttpProxyPolicy,
      colorClass: "text-cyan-600",
      borderClass: "border-t-cyan-600",
    });
    allPolicies.push({
      id: "vpn",
      title: "VPN",
      description: "Configure VPN connections.",
      statusText: vpnPolicy ? `${vpnPolicy.vpnType} • ${vpnPolicy.remoteAddress}` : undefined,
      icon: <Lock className="w-5 h-5" />,
      isConfigured: !!vpnPolicy,
      colorClass: "text-violet-600",
      borderClass: "border-t-violet-600",
    });
    allPolicies.push({
      id: "perAppVpn",
      title: "Per-App VPN",
      description: "Route specific app traffic through VPN.",
      statusText: perAppVpnPolicy ? `${perAppVpnPolicy.applicationIds?.length || 0} apps configured` : undefined,
      icon: <Lock className="w-5 h-5" />,
      isConfigured: !!perAppVpnPolicy,
      colorClass: "text-fuchsia-600",
      borderClass: "border-t-fuchsia-600",
    });
    allPolicies.push({
      id: "perDomainVpn",
      title: "Per-Domain VPN",
      description: "Route specific domain traffic through VPN.",
      statusText: perDomainVpnPolicy ? `${(perDomainVpnPolicy.safariDomains?.length || 0) + (perDomainVpnPolicy.associatedDomains?.length || 0)} domains` : undefined,
      icon: <Lock className="w-5 h-5" />,
      isConfigured: !!perDomainVpnPolicy,
      colorClass: "text-rose-600",
      borderClass: "border-t-rose-600",
    });
    allPolicies.push({
      id: "relay",
      title: "Relay",
      description: "Configure network relay settings.",
      statusText: relayPolicy ? `${relayPolicy.matchDomains?.length || 0} match domains` : undefined,
      icon: <Radio className="w-5 h-5" />,
      isConfigured: !!relayPolicy,
      colorClass: "text-amber-600",
      borderClass: "border-t-amber-600",
    });
    allPolicies.push({
      id: "homeScreenLayout",
      title: "Home Screen Layout",
      description: "Define the home screen layout for managed devices.",
      statusText: homeScreenLayoutPolicy ? `${homeScreenLayoutPolicy.configuration?.Pages?.length || 0} pages configured` : undefined,
      icon: <Smartphone className="w-5 h-5" />,
      isConfigured: !!homeScreenLayoutPolicy,
      colorClass: "text-teal-600",
      borderClass: "border-t-teal-600",
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

    // TODO: When DO (Device Owner) support is added, toggle this based on profile type
    const isWorkProfile = true; // Currently only WP is supported

    const androidItems = [
      // -- WP-supported Policies --
      { id: "androidPasscode", title: "Passcode Policy", icon: <Shield className="w-5 h-5" />, check: !!androidPasscodePolicy, desc: "Password complexity settings.", status: "Complexity settings active", wpSupported: true },
      { id: "commonSettings", title: "Common", icon: <Settings className="w-5 h-5" />, check: !!commonSettingsPolicy, desc: "Common global settings.", status: commonSettingsPolicy ? "Common settings active" : "", wpSupported: true },
      { id: "androidWebApp", title: "Web Apps", icon: <Globe className="w-5 h-5" />, check: webApplicationPolicy.length > 0, desc: "Web shortcuts.", status: `${webApplicationPolicy.length} Web Apps`, wpSupported: true },

      // -- WP-supported Restrictions --
      { id: "securityRestriction", title: "Security", icon: <Shield className="w-5 h-5" />, check: !!androidRestrictions?.security, desc: "Device security settings.", status: "Security restrictions active", wpSupported: true },
      { id: "networkRestriction", title: "Network", icon: <WifiOff className="w-5 h-5" />, check: !!androidRestrictions?.network, desc: "Network restrictions.", status: "Network restrictions active", wpSupported: true },
      { id: "locationRestriction", title: "Location", icon: <MapPin className="w-5 h-5" />, check: !!androidRestrictions?.location, desc: "Location services.", status: "Location settings active", wpSupported: true },
      // { id: "miscRestriction", title: "Miscellaneous", icon: <Settings className="w-5 h-5" />, check: !!androidRestrictions?.miscellaneous, desc: "System-level controls.", status: "Miscellaneous settings active", wpSupported: true },

      // -- DO-only Policies (hidden for WP) --
      { id: "enrollment", title: "Enrollment", icon: <FileText className="w-5 h-5" />, check: !!enrollmentPolicy, desc: "Enrollment settings.", status: enrollmentPolicy ? "Enrollment settings active" : "", wpSupported: false },
      { id: "deviceTheme", title: "Theme", icon: <ImageIcon className="w-5 h-5" />, check: !!deviceThemePolicy, desc: "Device theme settings.", status: deviceThemePolicy ? "Theme settings active" : "", wpSupported: false },

      // -- DO-only Restrictions (hidden for WP) --
      { id: "kioskRestriction", title: "Kiosk", icon: <TabletSmartphone className="w-5 h-5" />, check: !!androidRestrictions?.kiosk, desc: "Kiosk mode settings.", status: "Kiosk mode active", wpSupported: true },
      { id: "tetheringRestriction", title: "Tethering", icon: <Bluetooth className="w-5 h-5" />, check: !!androidRestrictions?.tethering, desc: "Bluetooth & tethering.", status: "Tethering settings active", wpSupported: false },
      { id: "phoneRestriction", title: "Phone", icon: <Phone className="w-5 h-5" />, check: !!androidRestrictions?.phone, desc: "Telephony restrictions.", status: "Phone restrictions active", wpSupported: false },
      { id: "dateTimeRestriction", title: "Date/Time", icon: <Clock className="w-5 h-5" />, check: !!androidRestrictions?.dateTime, desc: "Date and time settings.", status: "Date/Time settings active", wpSupported: false },
      { id: "displayRestriction", title: "Display", icon: <Monitor className="w-5 h-5" />, check: !!androidRestrictions?.display, desc: "Display settings.", status: "Display settings active", wpSupported: false },
      { id: "storageRestriction", title: "Storage", icon: <Database className="w-5 h-5" />, check: !!androidRestrictions?.syncStorage, desc: "Storage & Sync.", status: "Storage settings active", wpSupported: true },
      // { id: "connectivityRestriction", title: "Connectivity", icon: <Bluetooth className="w-5 h-5" />, check: !!androidRestrictions?.connectivity, desc: "Bluetooth & NFC.", status: "Connectivity settings active", wpSupported: false },
    ];

    // Filter based on current profile mode
    const visibleItems = isWorkProfile
      ? androidItems.filter(item => item.wpSupported)
      : androidItems;

    visibleItems.forEach(item => {
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
    id: isAndroid ? "androidApplication" : "applications",
    title: "Applications",
    description: "Install, remove, or manage apps.",
    statusText: applicationPolicy.length > 0 ? `${applicationPolicy.length} Apps configured.` : undefined,
    icon: <Grid className="w-5 h-5" />,
    isConfigured: applicationPolicy.length > 0,
    colorClass: "text-blue-600",
    borderClass: "border-t-blue-600",
    badgeText: `${applicationPolicy.length} Active`
  });



  allPolicies.sort((a, b) => a.title.localeCompare(b.title));

  const filteredPolicies = policySearchQuery.trim()
    ? allPolicies.filter(p =>
        p.title.toLowerCase().includes(policySearchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(policySearchQuery.toLowerCase())
      )
    : allPolicies;

  const configuredPolicies = filteredPolicies.filter(p => p.isConfigured);
  const availablePolicies = filteredPolicies.filter(p => !p.isConfigured);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-20 space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
        <h2 className="text-xl font-semibold tracking-tight">Configuration Policies</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
          <Input
            placeholder="Search policies..."
            value={policySearchQuery}
            onChange={(e) => setPolicySearchQuery(e.target.value)}
            className="pl-9 h-9 border-2 border-primary/40 bg-muted/40 focus-visible:border-primary/60"
          />
        </div>
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
              webContentFilterPolicy={webContentFilterPolicy}
              globalHttpProxyPolicy={globalHttpProxyPolicy}
              vpnPolicy={vpnPolicy}
              perAppVpnPolicy={perAppVpnPolicy}
              perDomainVpnPolicy={perDomainVpnPolicy}
              relayPolicy={relayPolicy}
              homeScreenLayoutPolicy={homeScreenLayoutPolicy}
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

      {policySearchQuery.trim() && configuredPolicies.length === 0 && availablePolicies.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No policies found</p>
          <p className="text-sm">No policies match "{policySearchQuery}"</p>
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
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [activePolicyType, setActivePolicyType] = useState<string | null>(null);

  // Single field edit state
  const [editingField, setEditingField] = useState<'name' | 'description' | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingField, setSavingField] = useState(false);

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
  const [commonSettingsPolicy, setCommonSettingsPolicy] = useState<CommonSettingsPolicy | undefined>(undefined);
  const [deviceThemePolicy, setDeviceThemePolicy] = useState<DeviceThemePolicy | undefined>(undefined);
  const [enrollmentPolicy, setEnrollmentPolicy] = useState<EnrollmentPolicy | undefined>(undefined);

  // Phase 2 iOS policy state
  const [webContentFilterPolicy, setWebContentFilterPolicy] = useState<IosWebContentFilterPolicy | undefined>(undefined);
  const [globalHttpProxyPolicy, setGlobalHttpProxyPolicy] = useState<IosGlobalHttpProxyPolicy | undefined>(undefined);
  const [vpnPolicy, setVpnPolicy] = useState<IosVpnPolicy | undefined>(undefined);
  const [perAppVpnPolicy, setPerAppVpnPolicy] = useState<IosPerAppVpnPolicy | undefined>(undefined);
  const [perDomainVpnPolicy, setPerDomainVpnPolicy] = useState<IosPerDomainVpnPolicy | undefined>(undefined);
  const [relayPolicy, setRelayPolicy] = useState<IosRelayPolicy | undefined>(undefined);
  const [homeScreenLayoutPolicy, setHomeScreenLayoutPolicy] = useState<IosHomeScreenLayoutPolicy | undefined>(undefined);

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

  const fetchProfile = async (silent = false) => {
    if (!platform || !id) {
      setError(t('profiles.invalidParameters'));
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
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

        // Phase 2 policies
        setWebContentFilterPolicy((iosData as any).webContentFilterPolicy || undefined);
        setGlobalHttpProxyPolicy((iosData as any).globalHttpProxyPolicy || undefined);
        setVpnPolicy((iosData as any).vpnPolicy || undefined);
        setPerAppVpnPolicy((iosData as any).perAppVpnPolicy || undefined);
        setPerDomainVpnPolicy((iosData as any).perDomainVpnPolicy || undefined);
        setRelayPolicy((iosData as any).relayPolicy || undefined);
        setHomeScreenLayoutPolicy((iosData as any).homeScreenLayoutPolicy || undefined);
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
        setCommonSettingsPolicy(anyData.commonSettingsPolicy || undefined);
        setDeviceThemePolicy(anyData.deviceThemePolicy || undefined);
        setEnrollmentPolicy(anyData.enrollmentPolicy || undefined);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      if (!silent) setError(t('profiles.failedToLoad'));
    } finally {
      if (!silent) setLoading(false);
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

  const handlePublish = () => {
    if (!platform || !id) return;
    setPublishDialogOpen(true);
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

  const openEditDialog = (field: 'name' | 'description', value: string) => {
    setEditingField(field);
    setEditValue(value || "");
  };

  const handleSaveField = async () => {
    if (!profile || !platform || !id || !editingField) return;

    setSavingField(true);
    try {
      // Map platform to profileType for API payload
      const profileTypeMap: Record<string, ProfileType> = {
        android: "AndroidProfile",
        ios: "IosProfile",
      };

      const updatedProfile: Profile = {
        id: profile.id,
        name: editingField === 'name' ? editValue : profile.name,
        description: editingField === 'description' ? editValue : (profile.description || ""),
        profileType: profileTypeMap[profile.platform] || profile.profileType,
        status: profile.status,
        creationTime: profile.creationTime,
        modificationTime: profile.modificationTime,
        createdBy: profile.createdBy,
        lastModifiedBy: profile.lastModifiedBy,
        // Include platform as it's part of the Profile interface (UI field)
        platform: profile.platform
      };

      // Map platform to profileType for API payload if needed, generic update
      await ProfileService.updateProfile(platform as Platform, id, updatedProfile);

      await fetchProfile();
      setEditingField(null);
    } catch (err) {
      console.error("Failed to update profile:", err);
      // You might want to show a toast here
    } finally {
      setSavingField(false);
    }
  };


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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                      onClick={() => openEditDialog('name', profile.name)}
                      title={t('profiles.edit.title')}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Badge variant={profile.status === 'PUBLISHED' ? "secondary" : "outline"} className={cn("ml-1 font-normal", profile.status === 'PUBLISHED' ? "bg-green-100 text-green-700 border-green-200" : "")}>
                      {profile.status}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-2 group">
                    <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">{profile.description}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-6 h-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground hover:bg-muted -mt-1"
                      onClick={() => openEditDialog('description', profile.description || "")}
                      title="Edit Description"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>

                </div>
              </div>

              {/* Publish Button (Left, Circular, Animated) */}
              {profile.status !== "PUBLISHED" && (
                <Button
                  onClick={handlePublish}
                  size="icon"
                  className={cn(
                    "rounded-full h-14 w-14 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-2 border-white/20 dark:border-slate-800",
                    "transition-all duration-300 hover:scale-105 active:scale-95",
                    "animate-in zoom-in slide-in-from-left-4 duration-500"
                  )}
                  title={t('profiles.publish.publish')}
                >
                  <Send className={cn("w-6 h-6 ml-0.5")} />
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
          webContentFilterPolicy={webContentFilterPolicy}
          globalHttpProxyPolicy={globalHttpProxyPolicy}
          vpnPolicy={vpnPolicy}
          perAppVpnPolicy={perAppVpnPolicy}
          perDomainVpnPolicy={perDomainVpnPolicy}
          relayPolicy={relayPolicy}
          homeScreenLayoutPolicy={homeScreenLayoutPolicy}
          commonSettingsPolicy={commonSettingsPolicy}
          deviceThemePolicy={deviceThemePolicy}
          enrollmentPolicy={enrollmentPolicy}
          onSelectPolicy={setActivePolicyType}
        />

        <PolicyEditDialog
          open={!!activePolicyType}
          onOpenChange={(open) => !open && setActivePolicyType(null)}
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
          homeScreenLayoutPolicy={homeScreenLayoutPolicy}
          commonSettingsPolicy={commonSettingsPolicy}
          deviceThemePolicy={deviceThemePolicy}
          enrollmentPolicy={enrollmentPolicy}
          onSave={() => {
            setActivePolicyType(null);
            setLoading(true);
            // Wait for server to propagate changes, then refetch
            setTimeout(() => fetchProfile(), 1500);
          }}
        />

        <PublishProfileDialog
          open={publishDialogOpen}
          onOpenChange={setPublishDialogOpen}
          profile={profile}
          onProfilePublished={fetchProfile}
        />

        <Dialog open={!!editingField} onOpenChange={(open) => !open && setEditingField(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {editingField === 'name' ? 'Name' : 'Description'}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="edit-field" className="mb-2 block">
                {editingField === 'name' ? 'Profile Name' : 'Profile Description'}
              </Label>
              {editingField === 'name' ? (
                <Input
                  id="edit-field"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Enter profile name"
                />
              ) : (
                <Textarea
                  id="edit-field"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Enter profile description"
                  rows={4}
                />
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingField(null)} disabled={savingField}>
                Cancel
              </Button>
              <Button onClick={handleSaveField} disabled={savingField || !editValue.trim()}>
                {savingField ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
