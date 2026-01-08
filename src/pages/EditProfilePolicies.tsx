import { ProfileService } from "@/api/services/profiles";
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ApplicationPolicyEditor } from "@/components/profiles/Policies/ApplicationPolicy";
import { LockScreenMessagePolicy } from "@/components/profiles/Policies/LockScreenMessagePolicy";
import { MailPolicy } from "@/components/profiles/Policies/MailPolicy";
import { NotificationPolicy } from "@/components/profiles/Policies/NotificationPolicy";
import { PasscodePolicy } from "@/components/profiles/Policies/PasscodePolicy";
import {
  RestrictionsComposite,
  RestrictionsPolicy,
} from "@/components/profiles/Policies/RestrictionsPolicy";
import { WebApplicationPolicyEditor } from "@/components/profiles/Policies/WebApplicationPolicy";
import { WifiPolicy } from "@/components/profiles/Policies/WifiPolicy";
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
} from "@/components/profiles/PolicyCards";
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
  Layout,
  Mail,
  MessageSquare,
  Monitor,
  Plus,
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
          {!activePolicyType && (
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
              onSelect={setActivePolicyType}
            />
          )}
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
  webApplicationPolicy: WebApplicationPolicy[];
  notificationPolicy: NotificationPolicyType[];
  lockScreenMessagePolicy: LockScreenMessagePolicyType | null;
  scepPolicy?: IosScepConfiguration;
  mdmPolicy?: IosMdmConfiguration;
  onSelectPolicy: (type: string) => void;
}

function PolicyCardGrid({
  platform,
  passcodePolicy,
  wifiPolicy,
  mailPolicy,
  restrictionsPolicy,
  webApplicationPolicy,
  notificationPolicy,
  lockScreenMessagePolicy,
  scepPolicy,
  mdmPolicy,
  onSelectPolicy,
}: PolicyCardGridProps) {
  return (
    <motion.div
      key="list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {passcodePolicy && (
        <PasscodePolicyCard
          policy={passcodePolicy}
          onClick={() => onSelectPolicy("passcode")}
        />
      )}

      {wifiPolicy && (
        <WifiPolicyCard
          policy={wifiPolicy}
          onClick={() => onSelectPolicy("wifi")}
        />
      )}

      {platform === "ios" && mailPolicy && (
        <MailPolicyCard
          policy={mailPolicy}
          onClick={() => onSelectPolicy("mail")}
        />
      )}

      {restrictionsPolicy && (
        <RestrictionsPolicyCard
          policy={restrictionsPolicy}
          onClick={() => onSelectPolicy("restrictions")}
        />
      )}

      {scepPolicy && (
        <ScepPolicyCard
          policy={scepPolicy}
          onClick={() => onSelectPolicy("scep")}
        />
      )}

      {mdmPolicy && (
        <MdmPolicyCard
          policy={mdmPolicy}
          restrictionsPolicy={restrictionsPolicy}
          onClick={() => onSelectPolicy("mdm")}
        />
      )}

      <ApplicationsPolicyCard onClick={() => onSelectPolicy("applications")} />

      {webApplicationPolicy && webApplicationPolicy.length > 0 && (
        <WebApplicationsPolicyCard
          policies={webApplicationPolicy}
          onClick={() => onSelectPolicy("webApps")}
        />
      )}

      {notificationPolicy && notificationPolicy.length > 0 && (
        <NotificationsPolicyCard
          policies={notificationPolicy}
          onClick={() => onSelectPolicy("notifications")}
        />
      )}

      {lockScreenMessagePolicy && (
        <LockScreenMessagePolicyCard
          policy={lockScreenMessagePolicy}
          onClick={() => onSelectPolicy("lockScreenMessage")}
        />
      )}
    </motion.div>
  );
}
