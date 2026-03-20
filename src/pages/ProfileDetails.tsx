import { ProfileService } from "@/api/services/profiles";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProfileDetailSkeleton } from "@/components/skeletons";

import { policyAPI as AndroidPolicyService } from "@/api/services/Androidpolicies";
import { restrictionAPI as AndroidRestrictionService } from "@/api/services/Androidrestrictions";
import { PolicyService } from "@/api/services/IOSpolicies";
import { PolicyEditDialog } from "@/components/profiles/PolicyEditDialog";
import { PublishProfileDialog } from "@/components/profiles/PublishProfileDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  DialogDescription,
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
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlatformValidation } from "@/hooks/usePlatformValidation";
import { cn } from "@/lib/utils";
import { IosAppLockPolicy, IosDeviceSettingsPolicy, IosGlobalHttpProxyPolicy, IosHomeScreenLayoutPolicy, IosMdmConfiguration, IosPerAppVpnPolicy, IosPerDomainVpnPolicy, IosRelayPolicy, IosScepConfiguration, IosVpnPolicy, IosWebContentFilterPolicy } from "@/types/ios";
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
  Ban,
  Bell,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Filter,
  Globe,
  Grid,
  Image as ImageIcon,
  KeyRound,
  Lock,
  Mail,
  MessageSquare,
  MoreVertical,
  Pencil,
  Plus,
  Radio,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2,
  Users,
  Wifi,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
  appLockPolicy?: IosAppLockPolicy;
  mdmPolicy?: IosMdmConfiguration;
  deviceSettingsPolicy?: IosDeviceSettingsPolicy;
  certificatesConfigured?: boolean;
  certificatesCount?: number;
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
  appLockPolicy,
  mdmPolicy,
  deviceSettingsPolicy,
  certificatesConfigured,
  certificatesCount,
  onSelect,
}: AddPolicyDropdownProps) {
  const dropdownItems: { label: string; id: string; icon: React.ReactNode }[] = [];

  const isIosOrMacos = platform === "ios" || platform === "macos";
  if (!passcodePolicy) dropdownItems.push({ id: "passcode", label: "Passcode Policy", icon: <Shield className="w-4 h-4 mr-2" /> });
  if (!wifiPolicy) dropdownItems.push({ id: "wifi", label: "WiFi Configuration", icon: <Wifi className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos && !mailPolicy) dropdownItems.push({ id: "mail", label: "Mail Configuration", icon: <Mail className="w-4 h-4 mr-2" /> });
  if (!restrictionsPolicy) dropdownItems.push({ id: "restrictions", label: "Device Restrictions", icon: <Ban className="w-4 h-4 mr-2" /> });
  if (applicationPolicy.length === 0) dropdownItems.push({ id: "applications", label: "Application Policy", icon: <Grid className="w-4 h-4 mr-2" /> });
  if (webApplicationPolicy.length === 0) dropdownItems.push({ id: "webApps", label: "Web Application Policy", icon: <Globe className="w-4 h-4 mr-2" /> });
  if (notificationPolicy.length === 0) dropdownItems.push({ id: "notifications", label: "Notification Policy", icon: <Bell className="w-4 h-4 mr-2" /> });
  if (!lockScreenMessagePolicy) dropdownItems.push({ id: "lockScreenMessage", label: "Lock Screen Message", icon: <MessageSquare className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos && !webContentFilterPolicy) dropdownItems.push({ id: "webContentFilter", label: "Web Content Filter", icon: <Filter className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos && !globalHttpProxyPolicy) dropdownItems.push({ id: "globalHttpProxy", label: "Global HTTP Proxy", icon: <Globe className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos && !vpnPolicy) dropdownItems.push({ id: "vpn", label: "VPN", icon: <Lock className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos && !perAppVpnPolicy) dropdownItems.push({ id: "perAppVpn", label: "Per-App VPN", icon: <Lock className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos && !perDomainVpnPolicy) dropdownItems.push({ id: "perDomainVpn", label: "Per-Domain VPN", icon: <Lock className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos && !relayPolicy) dropdownItems.push({ id: "relay", label: "Relay Configuration", icon: <Wifi className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos && !homeScreenLayoutPolicy) dropdownItems.push({ id: "homeScreenLayout", label: "Home Screen Layout", icon: <Smartphone className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos && !appLockPolicy) dropdownItems.push({ id: "appLock", label: "App Lock / Kiosk Mode", icon: <Lock className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos && !mdmPolicy) dropdownItems.push({ id: "mdm", label: "MDM Configuration", icon: <Server className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos && !deviceSettingsPolicy) dropdownItems.push({ id: "deviceSettings", label: "Device Settings", icon: <Settings className="w-4 h-4 mr-2" /> });
  if (isIosOrMacos) dropdownItems.push({ id: "certificates", label: "Certificates", icon: <Shield className="w-4 h-4 mr-2" /> });

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
        {dropdownItems.map(item => {
          const isDisabled = ["notifications", "perAppVpn", "relay"].includes(item.id);
          return (
            <DropdownMenuItem key={item.id} onClick={() => !isDisabled && onSelect(item.id)} disabled={isDisabled}>
              {item.icon} {item.label}
            </DropdownMenuItem>
          );
        })}
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
  certificatesCount?: number; // Added
  commonSettingsPolicy?: CommonSettingsPolicy;
  deviceThemePolicy?: DeviceThemePolicy;
  enrollmentPolicy?: EnrollmentPolicy;
  onSelectPolicy: (type: string) => void;
  onDeletePolicy?: (type: string, title: string) => void;
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
  isDisabled?: boolean;
}

function AvailablePolicyCard({ icon, title, description, onClick, isDisabled }: AvailablePolicyCardProps) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
      <Card
        className={cn(
          "h-full bg-muted/30 border-dashed border-2 flex flex-col transition-all",
          isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:bg-muted/50 hover:border-solid"
        )}
        onClick={() => !isDisabled && onClick()}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <Button variant="ghost" size="sm" className="w-full mt-2 border border-dashed" disabled={isDisabled}>
            {isDisabled ? "Disabled" : "Configure"}
          </Button>
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
  onEdit?: () => void;
  onDelete?: () => void;
  badgeText?: string;
  isDisabled?: boolean;
}

function ConfiguredPolicyCard({
  icon,
  title,
  description,
  statusText,
  colorClass = "text-primary",
  borderClass = "border-t-primary",
  onClick,
  onEdit,
  onDelete,
  badgeText = "Active",
  isDisabled
}: ConfiguredPolicyCardProps) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
      <Card
        className={cn(
          "transition-all h-full border-t-4 flex flex-col relative group",
          isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-lg",
          borderClass
        )}
        onClick={() => !isDisabled && onClick()}
      >
        {/* Actions dropdown */}
        {(onEdit || onDelete) && !isDisabled && (
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-lg flex items-center gap-2", colorClass)}>
            {icon}
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <Badge className="w-fit mb-2 bg-success/10 text-success hover:bg-success/20 border-success/30">{badgeText}</Badge>
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
  deviceSettingsPolicy,
  webContentFilterPolicy,
  globalHttpProxyPolicy,
  vpnPolicy,
  perAppVpnPolicy,
  perDomainVpnPolicy,
  relayPolicy,
  homeScreenLayoutPolicy,
  appLockPolicy, // Added
  certificatesConfigured,
  certificatesCount,
  commonSettingsPolicy,
  deviceThemePolicy,
  enrollmentPolicy,
  onSelectPolicy,
  onDeletePolicy,
}: PolicyCardGridProps) {
  const isIos = platform === "ios" || platform === "macos";
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
    description: string;
    statusText?: string;
    icon: React.ReactNode;
    isConfigured: boolean;
    colorClass?: string;
    borderClass?: string;
    badgeText?: string;
    hideActions?: boolean;
    hideDelete?: boolean;
    isDisabled?: boolean;
  };

  const allPolicies: PolicyItem[] = [];

  if (isIos) {

    allPolicies.push({
      id: "certificates",
      title: "Certificates",
      description: "Manage PEM, PKCS, and PKCS12 identities securely.",
      statusText: certificatesConfigured ? `${certificatesCount} identity profile(s) active.` : undefined,
      icon: <KeyRound className="w-5 h-5" />,
      isConfigured: !!certificatesConfigured,
      colorClass: "text-blue-500",
      borderClass: "border-t-blue-500",
      badgeText: certificatesCount ? `${certificatesCount} Active` : undefined
    });

    allPolicies.push({
      id: "passcode",

      title: "Passcode Policy",
      description: "Enforce password requirements and device locking.",
      statusText: passcodePolicy ? "Minimum length, complexity, and auto-lock settings configured." : undefined,
      icon: <Shield className="w-5 h-5" />,
      isConfigured: !!passcodePolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
    });
    allPolicies.push({
      id: "wifi",
      title: "WiFi Configuration",
      description: "Pre-configure WiFi networks for automatic connection.",
      statusText: wifiPolicy ? `SSID: ${wifiPolicy.ssid} • ${wifiPolicy.encryptionType}` : undefined,
      icon: <Wifi className="w-5 h-5" />,
      isConfigured: !!wifiPolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
    });
    allPolicies.push({
      id: "mail",
      title: "Mail Configuration",
      description: "Configure email accounts (Exchange, POP/IMAP).",
      statusText: mailPolicy ? `${mailPolicy.emailAccountName} • ${mailPolicy.emailAddress}` : undefined,
      icon: <Mail className="w-5 h-5" />,
      isConfigured: !!mailPolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
    });
    allPolicies.push({
      id: "restrictions",
      title: "Device Restrictions",
      description: "Restrict device features, apps, and content.",
      statusText: restrictionsPolicy ? "Camera, iCloud, App Store, and content restrictions configured." : undefined,
      icon: <Ban className="w-5 h-5" />,
      isConfigured: !!restrictionsPolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
    });
    allPolicies.push({
      id: "webApps",
      title: "Web Clips",
      description: "Add shortcuts to websites on the Home Screen.",
      statusText: webApplicationPolicy.length > 0 ? `${webApplicationPolicy.length} Web Clips configured.` : undefined,
      icon: <Globe className="w-5 h-5" />,
      isConfigured: webApplicationPolicy.length > 0,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
      badgeText: `${webApplicationPolicy.length} Active`
    });
    allPolicies.push({
      id: "notifications",
      title: "Notifications",
      description: "Control notification settings per app.",
      statusText: notificationPolicy.length > 0 ? `${notificationPolicy.length} Apps configured.` : undefined,
      icon: <Bell className="w-5 h-5" />,
      isConfigured: notificationPolicy.length > 0,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
      badgeText: `${notificationPolicy.length} Active`,
      isDisabled: true
    });
    allPolicies.push({
      id: "lockScreenMessage",
      title: "Lock Screen Msg",
      description: "Display 'If Lost' information.",
      statusText: lockScreenMessagePolicy ? "Custom text on the lock screen." : undefined,
      icon: <MessageSquare className="w-5 h-5" />,
      isConfigured: !!lockScreenMessagePolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
    });
    allPolicies.push({
      id: "webContentFilter",
      title: "Web Content Filter",
      description: "Filter and restrict web content access.",
      statusText: webContentFilterPolicy ? `Filter: ${webContentFilterPolicy.filterType || 'BuiltIn'}` : undefined,
      icon: <Filter className="w-5 h-5" />,
      isConfigured: !!webContentFilterPolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
    });
    allPolicies.push({
      id: "globalHttpProxy",
      title: "Global HTTP Proxy",
      description: "Route HTTP traffic through a proxy server.",
      statusText: globalHttpProxyPolicy ? `Type: ${globalHttpProxyPolicy.proxyType}` : undefined,
      icon: <Globe className="w-5 h-5" />,
      isConfigured: !!globalHttpProxyPolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
    });
    allPolicies.push({
      id: "vpn",
      title: "VPN",
      description: "Configure VPN connections.",
      statusText: vpnPolicy ? `${vpnPolicy.vpnType} • ${vpnPolicy.remoteAddress}` : undefined,
      icon: <Lock className="w-5 h-5" />,
      isConfigured: !!vpnPolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
    });
    allPolicies.push({
      id: "perAppVpn",
      title: "Per-App VPN",
      description: "Route specific app traffic through VPN.",
      statusText: perAppVpnPolicy ? `${perAppVpnPolicy.applicationIds?.length || 0} apps configured` : undefined,
      icon: <Lock className="w-5 h-5" />,
      isConfigured: !!perAppVpnPolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
      isDisabled: true
    });
    allPolicies.push({
      id: "perDomainVpn",
      title: "Per-Domain VPN",
      description: "Route specific domain traffic through VPN.",
      statusText: perDomainVpnPolicy ? `${(perDomainVpnPolicy.safariDomains?.length || 0) + (perDomainVpnPolicy.associatedDomains?.length || 0)} domains` : undefined,
      icon: <Lock className="w-5 h-5" />,
      isConfigured: !!perDomainVpnPolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
    });
    allPolicies.push({
      id: "relay",
      title: "Relay",
      description: "Configure network relay settings.",
      statusText: relayPolicy ? `${relayPolicy.matchDomains?.length || 0} match domains` : undefined,
      icon: <Radio className="w-5 h-5" />,
      isConfigured: !!relayPolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
      isDisabled: true
    });
    allPolicies.push({
      id: "homeScreenLayout",
      title: "Home Screen Layout",
      description: "Define the home screen layout for managed devices.",
      statusText: homeScreenLayoutPolicy ? `${homeScreenLayoutPolicy.configuration?.Pages?.length || 0} pages configured` : undefined,
      icon: <Smartphone className="w-5 h-5" />,
      isConfigured: !!homeScreenLayoutPolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
    });
    allPolicies.push({
      id: "appLock",
      title: "App Lock / Kiosk Mode",
      description: "Restrict device to a single application.",
      statusText: appLockPolicy ? `Locked to ${appLockPolicy.appLock?.App?.Identifier || 'App'}` : undefined,
      icon: <Lock className="w-5 h-5" />,
      isConfigured: !!appLockPolicy,
      colorClass: "text-primary",
      borderClass: "border-t-primary",
    });
    if (scepPolicy) {
      allPolicies.push({
        id: "scep",
        title: "SCEP",
        description: "Certificate enrollment.",
        statusText: "Certificate enrollment configured",
        icon: <FileText className="w-5 h-5" />,
        isConfigured: true,
        colorClass: "text-primary",
        borderClass: "border-t-primary",
        hideActions: true,
      });
    }

    allPolicies.push({
      id: "mdm",
      title: "MDM Configuration",
      description: "Apple MDM server, identity certificates & enrollment settings.",
      statusText: mdmPolicy ? `Server: ${mdmPolicy.serverURL?.substring(0, 30)}${(mdmPolicy.serverURL?.length || 0) > 30 ? '…' : ''}` : undefined,
      icon: <Server className="w-5 h-5" />,
      isConfigured: !!mdmPolicy,
      colorClass: "text-indigo-600",
      borderClass: "border-t-indigo-600",
      badgeText: "View Only",
      hideActions: true,
    });

    allPolicies.push({
      id: "deviceSettings",
      title: "Device Settings",
      description: "Configure iOS device settings like Bluetooth, device name, time zone & more.",
      statusText: deviceSettingsPolicy ? 'Settings configured' : undefined,
      icon: <Settings className="w-5 h-5" />,
      isConfigured: !!deviceSettingsPolicy,
      colorClass: "text-emerald-600",
      borderClass: "border-t-emerald-600"
    });
  }

  if (isAndroid) {
    const androidRestrictions = restrictionsPolicy as AndroidProfileRestrictions | undefined;

    // TODO: When DO (Device Owner) support is added, toggle this based on profile type
    const isWorkProfile = true; // Currently only WP is supported

    const androidItems = [
      // Policies
      { id: "androidPasscode", title: "Passcode Policy", icon: <Shield className="w-5 h-5" />, check: !!androidPasscodePolicy, desc: "Password complexity settings.", status: "Complexity settings active", wpSupported: true },
      { id: "commonSettings", title: "Common", icon: <Settings className="w-5 h-5" />, check: !!commonSettingsPolicy, desc: "Common global settings.", status: commonSettingsPolicy ? "Common settings active" : "", wpSupported: true },
      { id: "androidWebApp", title: "Web Apps", icon: <Globe className="w-5 h-5" />, check: webApplicationPolicy.length > 0, desc: "Web shortcuts.", status: `${webApplicationPolicy.length} Web Apps`, wpSupported: true },
      { id: "enrollment", title: "Enrollment", icon: <FileText className="w-5 h-5" />, check: !!enrollmentPolicy, desc: "Enrollment settings.", status: enrollmentPolicy ? "Enrollment settings active" : "", wpSupported: false },
      { id: "deviceTheme", title: "Theme", icon: <ImageIcon className="w-5 h-5" />, check: !!deviceThemePolicy, desc: "Device theme settings.", status: deviceThemePolicy ? "Theme settings active" : "", wpSupported: false },

      // Restrictions (consolidated into one card)
      {
        id: "androidDeviceRestriction",
        title: "Device Restrictions",
        icon: <Ban className="w-5 h-5" />,
        check: !!(
          androidRestrictions?.security || androidRestrictions?.network ||
          androidRestrictions?.location || androidRestrictions?.miscellaneous ||
          androidRestrictions?.kiosk || androidRestrictions?.tethering ||
          androidRestrictions?.phone || androidRestrictions?.dateTime ||
          androidRestrictions?.display || androidRestrictions?.syncStorage ||
          androidRestrictions?.connectivity
        ),
        desc: "Configure all device restrictions.",
        status: "Restrictions active",
        wpSupported: true,
      },
    ];

    const visibleItems = androidItems;

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
    colorClass: "text-primary",
    borderClass: "border-t-primary",
    badgeText: `${applicationPolicy.length} Active`,
    hideDelete: true,
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <Input
            placeholder="Search policies..."
            value={policySearchQuery}
            onChange={(e) => setPolicySearchQuery(e.target.value)}
            className="pl-9 pr-9 h-9 border-2 border-primary/40 bg-muted/40 focus-visible:border-primary/60"
          />
          {policySearchQuery && (
            <button
              onClick={() => setPolicySearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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
              appLockPolicy={appLockPolicy}
              mdmPolicy={mdmPolicy}
              deviceSettingsPolicy={deviceSettingsPolicy}
              certificatesConfigured={certificatesConfigured}
              certificatesCount={certificatesCount} // Added
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
                onEdit={policy.hideActions || policy.isDisabled ? undefined : () => onSelectPolicy(policy.id)}
                onDelete={onDeletePolicy && !policy.hideActions && !policy.hideDelete && !policy.isDisabled ? () => onDeletePolicy(policy.id, policy.title) : undefined}
                isDisabled={policy.isDisabled}
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
                isDisabled={policy.isDisabled}
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
  const location = useLocation();
  const fromPlatform = (location.state as any)?.fromPlatform;
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [activePolicyType, setActivePolicyType] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ policyType: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { setEntityName } = useBreadcrumb();

  // Set breadcrumb entity name when profile loads
  useEffect(() => {
    if (profile?.name) setEntityName(profile.name);
  }, [profile?.name, setEntityName]);

  // Profile edit state (name + description together)
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
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
  const [deviceSettingsPolicy, setDeviceSettingsPolicy] = useState<IosDeviceSettingsPolicy | undefined>(undefined);
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
  const [appLockPolicy, setAppLockPolicy] = useState<IosAppLockPolicy | undefined>(undefined);
  const [certificatesConfigured, setCertificatesConfigured] = useState<boolean>(false);
  const [certificatesCount, setCertificatesCount] = useState<number>(0); // Added
  const [setRootCertificatesConfigured] = useState<boolean>(false);
  const [setRootCertificatesCount] = useState<number>(0);

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
        id: data.id || id,
        platform: platform as Platform,
      } as ProfileDetailsData);

      const isIos = platform === "ios" || platform === "macos";
      const isAndroid = platform === "android";

      // Handle iOS / macOS
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
        setWebContentFilterPolicy((iosData as any).iosWebContentFilterPolicy || undefined);
        setGlobalHttpProxyPolicy((iosData as any).iosGlobalHttpProxyPolicy || undefined);
        setVpnPolicy((iosData as any).iosVpnPolicy || undefined);
        setPerAppVpnPolicy((iosData as any).iosPerAppVpnPolicy || undefined);
        setPerDomainVpnPolicy((iosData as any).iosPerDomainVpnPolicy || undefined);
        setRelayPolicy((iosData as any).iosRelayPolicy || undefined);
        setHomeScreenLayoutPolicy((iosData as any).iosHomeScreenLayoutPolicy || undefined);
        setAppLockPolicy((iosData as any).iosAppLockPolicy || undefined);
        setRestrictionsPolicy((iosData as any).iosDeviceRestrictionsPolicy || undefined);

        // Fetch Device Settings Policy
        try {
          const dsp = await PolicyService.getDeviceSettingsPolicy(id);
          setDeviceSettingsPolicy(dsp || undefined);
        } catch (e) { /* 404 = not configured */ }

        // Fetch Certificates to check configuration status
        let configCount = 0;

        try {
          const pem = await PolicyService.getCertPemPolicyList(id);
          if (pem && pem.content && pem.content.length > 0) {
            configCount += pem.content.length;
          }
        } catch (e) { /* ignore 404 */ }

        try {
          const pkcs = await PolicyService.getCertPkcsPolicyList(id);
          if (pkcs && pkcs.content && pkcs.content.length > 0) {
            configCount += pkcs.content.length;
          }
        } catch (e) { /* ignore 404 */ }

        try {
          const p12Resp = await PolicyService.getCertPkcs12PolicyList(id);
          if (p12Resp && p12Resp.content && p12Resp.content.length > 0) {
            configCount += p12Resp.content.length;
          }
        } catch (e) { /* ignore 404 */ }

        setCertificatesCount(configCount);
        setCertificatesConfigured(configCount > 0);

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
        <ProfileDetailSkeleton />
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
      case "android": return <img src={getAssetUrl("Assets/android.svg")} alt="Android" className={iconClass} />;
      case "ios": return <img src={getAssetUrl("Assets/apple.svg")} alt="iOS" className={iconClass} />;
      case "windows": return <img src={getAssetUrl("Assets/microsoft.svg")} alt="Windows" className={iconClass} />;
      case "macos": return <img src={getAssetUrl("Assets/mac_os.svg")} alt="macOS" className={iconClass} />;
      default: return <img src={getAssetUrl("Assets/all_platforms.svg")} alt="Platform" className={iconClass} />;
    }
  };

  const openEditDialog = () => {
    setEditName(profile?.name || "");
    setEditDescription(profile?.description || "");
    setEditDialogOpen(true);
  };

  const handleSaveField = async () => {
    if (!profile || !platform || !id) return;
    if (!editName.trim()) return;

    setSavingField(true);
    try {
      const profileTypeMap: Record<string, ProfileType> = {
        android: "AndroidProfile",
        ios: "IosProfile",
        macos: "IosProfile",
      };

      const updatedProfile = {
        name: editName,
        description: editDescription,
        profileType: profileTypeMap[profile.platform] || profile.profileType,
      };

      await ProfileService.updateProfile(platform as Platform, id, updatedProfile);

      await fetchProfile();
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSavingField(false);
    }
  };


  return (
    <MainLayout>


      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
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
                      onClick={openEditDialog}
                      title={t('profiles.edit.title')}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">{profile.description}</p>
                </div>
              </div>

              {/* Publish Button */}
              {profile.status !== "PUBLISHED" && (
                <Button
                  onClick={handlePublish}
                  className={cn(
                    "gap-2 px-5 h-10 shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white",
                    "transition-all duration-300 hover:scale-[1.02] active:scale-95",
                    "animate-in zoom-in slide-in-from-left-4 duration-500"
                  )}
                  title={t('profiles.publish.publish')}
                >
                  {t('profiles.publish.publish')}
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Management Mode — right end */}
            {profile.managementMode && (() => {
              const modeConfig: Record<string, { label: string; color: string }> = {
                BYOD: { label: "Work Profile (Personal Device)", color: "#06B6D4" },
                COPE: { label: "Work Profile (Company Device)", color: "#3B82F6" },
                COBO: { label: "Fully Managed Device", color: "#1E3A8A" },
                COSU: { label: "Dedicated Device (KIOSK)", color: "#2563EB" },
              };
              const cfg = modeConfig[profile.managementMode] || { label: profile.managementMode, color: "" };
              return (
                <div className="text-right shrink-0 self-center">
                  <p className="text-md font-bold tracking-tight leading-none" style={{ color: cfg.color || undefined }}>{cfg.label}</p>
                </div>
              );
            })()}

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
              <CheckCircle className={cn("w-8 h-8 opacity-20", profile.status === 'PUBLISHED' ? "text-success" : "text-warning")} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('profileDetails.deployedDevices')}</p>
                <h3 className="text-2xl font-bold mt-1">{profile.deployedDevices || 0}</h3>
              </div>
              <Users className="w-8 h-8 text-info opacity-20" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance</p>
                <h3 className="text-2xl font-bold mt-1">100%</h3>
              </div>
              <ShieldCheck className="w-8 h-8 text-success opacity-20" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Version</p>
                <h3 className="text-2xl font-bold mt-1">v{profile.version || 1.0}</h3>
              </div>
              <Clock className="w-8 h-8 text-accent opacity-20" />
            </CardContent>
          </Card>
        </div>

        {/* Support Messages (Android optional fields) */}
        {(profile.shortSupportMessage || profile.longSupportMessage) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.shortSupportMessage && (
              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardDescription className="text-xs font-medium uppercase tracking-wide">Short Support Message</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-sm text-foreground">{profile.shortSupportMessage}</p>
                </CardContent>
              </Card>
            )}
            {profile.longSupportMessage && (
              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardDescription className="text-xs font-medium uppercase tracking-wide">Long Support Message</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-sm text-foreground">{profile.longSupportMessage}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

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
          deviceSettingsPolicy={deviceSettingsPolicy}
          webContentFilterPolicy={webContentFilterPolicy}
          globalHttpProxyPolicy={globalHttpProxyPolicy}
          vpnPolicy={vpnPolicy}
          perAppVpnPolicy={perAppVpnPolicy}
          perDomainVpnPolicy={perDomainVpnPolicy}
          relayPolicy={relayPolicy}
          homeScreenLayoutPolicy={homeScreenLayoutPolicy}
          appLockPolicy={appLockPolicy}
          certificatesConfigured={certificatesConfigured}
          certificatesCount={certificatesCount}
          commonSettingsPolicy={commonSettingsPolicy}
          deviceThemePolicy={deviceThemePolicy}
          enrollmentPolicy={enrollmentPolicy}
          onSelectPolicy={setActivePolicyType}
          onDeletePolicy={(type, title) => setDeleteTarget({ policyType: type, title })}
        />

        <PolicyEditDialog
          open={!!activePolicyType}
          onOpenChange={(open) => !open && setActivePolicyType(null)}
          activePolicyType={activePolicyType}
          platform={platform as Platform}
          profileId={id!}
          managementMode={(profile as AndroidFullProfile)?.managementMode}
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
          deviceSettingsPolicy={deviceSettingsPolicy}
          webContentFilterPolicy={webContentFilterPolicy}
          globalHttpProxyPolicy={globalHttpProxyPolicy}
          vpnPolicy={vpnPolicy}
          perAppVpnPolicy={perAppVpnPolicy}
          perDomainVpnPolicy={perDomainVpnPolicy}
          relayPolicy={relayPolicy}
          homeScreenLayoutPolicy={homeScreenLayoutPolicy}
          appLockPolicy={appLockPolicy}
          certificatesConfigured={certificatesConfigured}
          certificatesCount={certificatesCount}
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

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-background">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                Edit Profile
              </DialogTitle>
              <DialogDescription>
                Update the name and description for this profile.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="flex items-center gap-1">
                  Profile Name
                  <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only">(Required)</span>
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter profile name"
                  maxLength={30}
                  className={!editName.trim() ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {!editName.trim() ? (
                    <p className="text-sm text-destructive" role="alert">Name is required</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">3-30 characters</p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {editName?.length || 0}/30
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="flex items-center gap-1">
                  Description
                  <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only">(Required)</span>
                </Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter profile description"
                  rows={3}
                  maxLength={100}
                  className={!editDescription.trim() ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {!editDescription.trim() ? (
                    <p className="text-sm text-destructive" role="alert">Description is required</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">5-100 characters</p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {editDescription?.length || 0}/100
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={savingField}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveField}
                disabled={savingField || !editName.trim() || !editDescription.trim()}
              >
                {savingField ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Policy Confirmation Dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-destructive" />
                Delete Policy
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the <strong>{deleteTarget?.title}</strong> policy? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
                onClick={async (e) => {
                  e.preventDefault();
                  if (!deleteTarget || !id) return;
                  setIsDeleting(true);
                  try {
                    const pt = deleteTarget.policyType;
                    // iOS / macOS policies
                    if (pt === "passcode") await PolicyService.deletePasscodeRestriction(platform as Platform, id);
                    else if (pt === "wifi") await PolicyService.deleteIosWiFiConfiguration(id);
                    else if (pt === "mail") await PolicyService.deleteIosMailPolicy(id);
                    else if (pt === "restrictions") await PolicyService.deleteRestrictionsPolicy(id);
                    else if (pt === "lockScreenMessage") await PolicyService.deleteLockScreenMessage(platform as Platform, id);
                    else if (pt === "webContentFilter") await PolicyService.deleteWebContentFilterPolicy(id);
                    else if (pt === "globalHttpProxy") await PolicyService.deleteGlobalHttpProxyPolicy(id);
                    else if (pt === "vpn") await PolicyService.deleteVpnPolicy(id);
                    else if (pt === "perAppVpn") await PolicyService.deletePerAppVpnPolicy(id);
                    else if (pt === "perDomainVpn") await PolicyService.deletePerDomainVpnPolicy(id);
                    else if (pt === "relay") await PolicyService.deleteRelayPolicy(id);
                    else if (pt === "homeScreenLayout") await PolicyService.deleteHomeScreenLayoutPolicy(id);
                    else if (pt === "appLock") await PolicyService.deleteAppLockPolicy(id);
                    else if (pt === "mdm") await PolicyService.deleteMdmPolicy(id);
                    else if (pt === "deviceSettings") await PolicyService.deleteDeviceSettingsPolicy(id);
                    // Android policies
                    else if (pt === "androidPasscode") await AndroidPolicyService.deletePasscodePolicy(platform as Platform, id);
                    else if (pt === "commonSettings") await AndroidPolicyService.deleteCommonSettingsPolicy(platform as Platform, id);
                    else if (pt === "enrollment") await AndroidPolicyService.deleteEnrollmentPolicy(platform as Platform, id);
                    else if (pt === "deviceTheme") await AndroidPolicyService.deleteDeviceThemePolicy(platform as Platform, id);
                    // Android restrictions (consolidated)
                    else if (pt === "androidDeviceRestriction") {
                      const r = restrictionsPolicy as AndroidProfileRestrictions;
                      const deletes: Promise<unknown>[] = [];
                      if (r?.security) deletes.push(AndroidRestrictionService.deleteSecurityRestriction(platform as Platform, id));
                      if (r?.network) deletes.push(AndroidRestrictionService.deleteNetworkRestriction(platform as Platform, id));
                      if (r?.location) deletes.push(AndroidRestrictionService.deleteLocationRestriction(platform as Platform, id));
                      if (r?.miscellaneous) deletes.push(AndroidRestrictionService.deleteMiscellaneousRestriction(platform as Platform, id));
                      if (r?.kiosk) deletes.push(AndroidRestrictionService.deleteKioskRestriction(platform as Platform, id));
                      if (r?.tethering) deletes.push(AndroidRestrictionService.deleteTetheringRestriction(platform as Platform, id));
                      if (r?.phone) deletes.push(AndroidRestrictionService.deletePhoneRestriction(platform as Platform, id));
                      if (r?.dateTime) deletes.push(AndroidRestrictionService.deleteDateTimeRestriction(platform as Platform, id));
                      if (r?.display) deletes.push(AndroidRestrictionService.deleteDisplayRestriction(platform as Platform, id));
                      if (r?.syncStorage) deletes.push(AndroidRestrictionService.deleteSyncStorageRestriction(platform as Platform, id));
                      if (r?.connectivity) deletes.push(AndroidRestrictionService.deleteConnectivityRestriction(platform as Platform, id));
                      await Promise.all(deletes);
                    }
                    else if (pt === "webApps" || pt === "androidWebApp") {
                      const response = await PolicyService.getWebApplicationPolicies(platform as Platform, id);
                      const items = response.content || [];
                      for (const item of items) {
                        if (item.id) await PolicyService.deleteWebApplicationPolicy(platform as Platform, id, item.id);
                      }
                    } else if (pt === "notifications") {
                      const response = await PolicyService.getNotificationPolicies(platform as Platform, id);
                      const items = response.content || [];
                      for (const item of items) {
                        if (item.id) await PolicyService.deleteNotificationPolicy(platform as Platform, id, item.id);
                      }
                    } else if (pt === "applications" || pt === "androidApplication") {
                      const response = await PolicyService.getApplicationPolicies(platform as Platform, id);
                      const items = (response as any).content || response || [];
                      for (const item of items) {
                        if (item.id) await PolicyService.deleteApplicationPolicy(platform as Platform, id, item.id);
                      }
                    }
                    setDeleteTarget(null);
                    fetchProfile();
                  } catch (err) {
                    console.error("Failed to delete policy:", err);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Separator />

        {/* Bottom Audit Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-warning/10 text-warning">
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
            <div className="p-2 rounded-full bg-accent/10 text-accent">
              <Edit className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
