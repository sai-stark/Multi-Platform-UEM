import { ProfileService } from "@/api/services/profiles";
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ApplicationPolicyEditor } from "@/components/profiles/IosPolicies/ApplicationPolicy";
import { LockScreenMessagePolicy } from "@/components/profiles/IosPolicies/LockScreenMessagePolicy";
import { MailPolicy } from "@/components/profiles/IosPolicies/MailPolicy";
import { NotificationPolicy } from "@/components/profiles/IosPolicies/NotificationPolicy";
import { PasscodePolicy } from "@/components/profiles/IosPolicies/PasscodePolicy";
import {
  RestrictionsComposite,
  RestrictionsPolicy,
} from "@/components/profiles/IosPolicies/RestrictionsPolicy";
import { WebApplicationPolicyEditor } from "@/components/profiles/IosPolicies/WebApplicationPolicy";
import { WifiPolicy } from "@/components/profiles/IosPolicies/WifiPolicy";
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
import { IosMdmConfiguration, IosScepConfiguration } from "@/types/ios";
import {
  ApplicationPolicy,
  FullProfile,
  IosMailPolicy,
  IosPasscodeRestrictionPolicy,
  IosWiFiConfiguration,
  LockScreenMessagePolicy as LockScreenMessagePolicyType,
  NotificationPolicy as NotificationPolicyType,
  PasscodeRestrictionPolicy,
  Platform,
  WebApplicationPolicy,
} from "@/types/models";
import { AnimatePresence, motion } from "framer-motion";
import {
  Apple,
  ArrowLeft,
  Ban,
  Bell,
  Globe,
  Grid,
  Key,
  Layout,
  Mail,
  MessageSquare,
  Monitor,
  Plus,
  Server,
  Shield,
  Smartphone,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
        <LoadingAnimation message="Fetching profile policies..." />
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-muted-foreground">
          Profile not found.
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
              Edit Policies: {profile.name}
            </h1>
            <p className="text-muted-foreground">
              Configure device restrictions, applications, and security
              policies.
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
              wifiPolicy={wifiPolicy}
              mailPolicy={mailPolicy}
              restrictionsPolicy={restrictionsPolicy}
              applicationPolicy={applicationPolicy}
              webApplicationPolicy={webApplicationPolicy}
              notificationPolicy={notificationPolicy}
              lockScreenMessagePolicy={lockScreenMessagePolicy}
              scepPolicy={scepPolicy}
              mdmPolicy={mdmPolicy}
              onSave={handlePolicySave}
              onCancel={handleCloseEditor}
            />
          ) : (
            <PolicyCardGrid
              platform={platform}
              passcodePolicy={passcodePolicy}
              wifiPolicy={wifiPolicy}
              mailPolicy={mailPolicy}
              restrictionsPolicy={restrictionsPolicy}
              applicationPolicy={applicationPolicy}
              webApplicationPolicy={webApplicationPolicy}
              notificationPolicy={notificationPolicy}
              lockScreenMessagePolicy={lockScreenMessagePolicy}
              scepPolicy={scepPolicy}
              mdmPolicy={mdmPolicy}
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
  wifiPolicy?: IosWiFiConfiguration;
  mailPolicy?: IosMailPolicy;
  restrictionsPolicy?: RestrictionsComposite;
  applicationPolicy: ApplicationPolicy[];
  webApplicationPolicy: WebApplicationPolicy[];
  notificationPolicy: NotificationPolicyType[];
  lockScreenMessagePolicy: LockScreenMessagePolicyType | null;
  scepPolicy?: IosScepConfiguration;
  mdmPolicy?: IosMdmConfiguration;
  onSave: () => void;
  onCancel: () => void;
}

function PolicyEditor({
  activePolicyType,
  platform,
  profileId,
  passcodePolicy,
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
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ------ Policy Card Grid ------
interface PolicyCardGridProps {
  platform?: string;
  passcodePolicy?: PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy;
  wifiPolicy?: IosWiFiConfiguration;
  mailPolicy?: IosMailPolicy;
  restrictionsPolicy?: RestrictionsComposite;
  applicationPolicy?: ApplicationPolicy[];
  webApplicationPolicy: WebApplicationPolicy[];
  notificationPolicy: NotificationPolicyType[];
  lockScreenMessagePolicy: LockScreenMessagePolicyType | null;
  scepPolicy?: IosScepConfiguration;
  mdmPolicy?: IosMdmConfiguration;
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
  wifiPolicy,
  mailPolicy,
  restrictionsPolicy,
  applicationPolicy = [],
  webApplicationPolicy,
  notificationPolicy,
  lockScreenMessagePolicy,
  scepPolicy,
  mdmPolicy,
  onSelectPolicy,
}: PolicyCardGridProps) {
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

  // Determine which policies are available based on platform
  const isIos = platform === 'ios';
  const isAndroid = platform === 'android';

  // Count active policies
  const activePolicies = [
    hasPasscode, hasWifi, hasMail, hasRestrictions, hasScep, hasMdm,
    hasWebApps, hasNotifications, hasLockScreen
  ].filter(Boolean).length;

  // Determine available policies that are not configured
  const availablePolicies: { type: string; title: string; description: string; icon: React.ReactNode; show: boolean }[] = [
    { type: 'passcode', title: 'Passcode', description: 'Security requirements', icon: <Shield className="w-5 h-5 text-muted-foreground" />, show: !hasPasscode },
    { type: 'wifi', title: 'WiFi', description: 'Network configuration', icon: <Wifi className="w-5 h-5 text-muted-foreground" />, show: !hasWifi },
    { type: 'mail', title: 'Mail', description: 'Email configuration', icon: <Mail className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasMail },
    { type: 'restrictions', title: 'Restrictions', description: 'Device restrictions', icon: <Ban className="w-5 h-5 text-muted-foreground" />, show: !hasRestrictions },
    { type: 'webApps', title: 'Web Apps', description: 'Web application links', icon: <Globe className="w-5 h-5 text-muted-foreground" />, show: !hasWebApps },
    { type: 'notifications', title: 'Notifications', description: 'Notification settings', icon: <Bell className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasNotifications },
    { type: 'lockScreenMessage', title: 'Lock Screen', description: 'Lock screen message', icon: <MessageSquare className="w-5 h-5 text-muted-foreground" />, show: isIos && !hasLockScreen },
  ].filter(p => p.show);

  return (
    <motion.div
      key="list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Active Policies Section */}
      {activePolicies > 0 && (
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

            {/* Applications Policy Card - always shown */}
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

      {/* Available Policies Section (grayed out) */}
      {availablePolicies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">Available Policies</h3>
          <p className="text-sm text-muted-foreground/70">Click on a policy to configure it</p>
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

      {/* Show applications card in available section if no active policies exist */}
      {activePolicies === 0 && (
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
    </motion.div>
  );
}
