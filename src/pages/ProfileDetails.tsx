import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { ProfileService } from "@/api/services/profiles";
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlatformValidation } from "@/hooks/usePlatformValidation";
import {
  AndroidFullProfile,
  AndroidProfileRestrictions,
  FullProfile,
  IosFullProfile,
  Platform
} from "@/types/models";

import { getAssetUrl } from "@/config/env";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Apple,
  ArrowLeft,
  Bell,
  Bluetooth,
  Box,
  CheckCircle,
  ChevronDown,
  Clock,
  Clock3,
  Database,
  Disc,
  Edit,
  FileText,
  Globe,
  Image as ImageIcon,
  Lock,
  Mail,
  MapPin,
  Monitor,
  Phone,
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

export default function ProfileDetails() {
  const { platform, id } = useParams<{ platform: string; id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

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
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              {selectedPolicyType?.replace(/_/g, ' ').toUpperCase() || "Details"}
            </DialogTitle>
            <DialogDescription>
              Configuration details for this policy section.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {renderPolicyDialogContent()}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/profiles')} className="w-fit -ml-2 text-muted-foreground hover:text-foreground gap-1">
            <ArrowLeft className="w-4 h-4" /> {t('profiles.actions.backToProfiles')}
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-background p-3 rounded-xl shadow-sm border border-border/50">
                {getPlatformIcon(profile.platform)}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  {profile.name}
                  <Badge variant={profile.status === 'PUBLISHED' ? "secondary" : "outline"} className={cn("ml-2 font-normal", profile.status === 'PUBLISHED' ? "bg-green-100 text-green-700 hover:bg-green-100" : "")}>
                    {profile.status}
                  </Badge>
                </h1>
                <p className="text-muted-foreground mt-1 max-w-2xl">{profile.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate(`/profiles/${platform}/${id}/policies`)} className="gap-2 shadow-sm">
                <Edit className="w-4 h-4" />
                {t('profiles.actions.editPolicies')}
              </Button>
              {profile.status !== "PUBLISHED" && (
                <Button onClick={handlePublish} disabled={publishing} className="gap-2 shadow-sm bg-primary hover:bg-primary/90">
                  <Send className="w-4 h-4" />
                  {publishing ? t('profiles.publish.publishing') : t('profiles.publish.publish')}
                </Button>
              )}
            </div>
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

          {/* Conditional Stats */}
          {!isIosProfile(profile) && (
            <Card className="shadow-sm border-border/60">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('profileDetails.deployedDevices')}</p>
                  <h3 className="text-2xl font-bold mt-1">{profile.deviceCount || 0}</h3>
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-20" />
              </CardContent>
            </Card>
          )}

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

        {/* Profile Overview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Profile Overview</h2>
          <Card className="shadow-sm border-border/60 overflow-hidden bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">

                {/* Main Identity Column */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">{profile.name}</h3>
                        <Badge variant="outline" className={cn(
                          "gap-1.5 py-1 px-2.5",
                          isAndroidProfile(profile) ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-700 bg-slate-50 border-slate-200"
                        )}>
                          {isAndroidProfile(profile) ? <Smartphone className="w-3.5 h-3.5" /> : <Apple className="w-3.5 h-3.5" />}
                          {profile.profileType === 'Android_Full_Profile' ? 'Android Profile' : 'iOS Profile'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm max-w-2xl">
                        {profile.description || "No description provided for this profile."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary" className="font-mono text-xs text-muted-foreground bg-muted/50 hover:bg-muted border-border/50 gap-1.5 py-1">
                      <Disc className="w-3 h-3" /> {profile.id}
                    </Badge>
                    {profile.version && (
                      <Badge variant="secondary" className="font-mono text-xs text-muted-foreground bg-muted/50 hover:bg-muted border-border/50 gap-1.5 py-1">
                        <Clock className="w-3 h-3" /> v{profile.version}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="font-mono text-xs text-muted-foreground bg-muted/50 hover:bg-muted border-border/50 gap-1.5 py-1">
                      <ShieldCheck className="w-3 h-3" /> Compliance: 100%
                    </Badge>
                  </div>
                </div>

                {/* Meta Info Grid */}
                <div className="md:w-auto md:min-w-[300px] grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 md:border-l md:border-border/50 md:pl-8">

                  {/* Created Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="p-1.5 rounded-md bg-amber-100/50 text-amber-600">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider">Created</span>
                    </div>
                    <div className="pl-9">
                      <p className="text-sm font-medium text-foreground">{profile.createdBy || 'System'}</p>
                      <p className="text-xs text-muted-foreground">{profile.creationTime ? new Date(profile.creationTime).toLocaleString() : '-'}</p>
                    </div>
                  </div>

                  {/* Modified Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="p-1.5 rounded-md bg-purple-100/50 text-purple-600">
                        <Edit className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider">Modified</span>
                    </div>
                    <div className="pl-9">
                      <p className="text-sm font-medium text-foreground">{profile.lastModifiedBy || 'System'}</p>
                      <p className="text-xs text-muted-foreground">{profile.modificationTime ? new Date(profile.modificationTime).toLocaleString() : 'Never'}</p>
                    </div>
                  </div>

                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policies Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Configuration Policies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

            {/* iOS Policies - Alphabetically sorted */}
            {isIosProfile(profile) && (
              <>
                <PolicyCard
                  title="Apps"
                  icon={Box}
                  type="apps"
                  isActive={!!profile.applicationPolicies?.length}
                  overview={profile.applicationPolicies?.length ? `${profile.applicationPolicies.length} Apps` : undefined}
                />
                <PolicyCard
                  title="Email"
                  icon={Mail}
                  type="mail"
                  isActive={!!profile.mailPolicy}
                  overview={profile.mailPolicy ? `Account: ${profile.mailPolicy.emailAccountName || '-'}` : undefined}
                />
                <PolicyCard
                  title="MDM Config"
                  icon={Server}
                  type="mdm"
                  isActive={!!profile.mdmPolicy}
                  overview={profile.mdmPolicy ? `Server: ${profile.mdmPolicy.serverURL?.substring(0, 20)}...` : undefined}
                />
                <PolicyCard
                  title="Notifications"
                  icon={Bell}
                  type="notifications"
                  isActive={!!profile.notificationPolicies?.length}
                  overview={profile.notificationPolicies?.length ? `${profile.notificationPolicies.length} Apps` : undefined}
                />
                <PolicyCard
                  title="Passcode"
                  icon={Lock}
                  type="passcode"
                  isActive={!!profile.passCodePolicy}
                  overview={profile.passCodePolicy ? `Min Length: ${profile.passCodePolicy.minLength || '-'}` : undefined}
                />
                <PolicyCard
                  title="Restrictions"
                  icon={Shield}
                  type="restrictions"
                  isActive={!!profile.lockScreenPolicy}
                  overview={profile.lockScreenPolicy ? "Configured" : undefined}
                />
                <PolicyCard
                  title="Web Clips"
                  icon={Globe}
                  type="webclips"
                  isActive={!!profile.webClipPolicies?.length}
                  overview={profile.webClipPolicies?.length ? `${profile.webClipPolicies.length} Clips` : undefined}
                />
                <PolicyCard
                  title="Wi-Fi"
                  icon={Wifi}
                  type="wifi"
                  isActive={!!profile.wifiPolicy}
                  overview={profile.wifiPolicy ? `SSID: ${profile.wifiPolicy.ssid || '-'}` : undefined}
                />
              </>
            )}

            {/* Android Policies - Alphabetically sorted */}
            {isAndroidProfile(profile) && (
              <>
                <PolicyCard
                  title="Apps"
                  icon={Box}
                  type="apps"
                  isActive={!!profile.applicationPolicies?.length}
                  overview={profile.applicationPolicies?.length ? `${profile.applicationPolicies.length} Apps` : undefined}
                />
                <PolicyCard
                  title="Common"
                  icon={Settings}
                  type="common"
                  isActive={!!profile.commonSettingsPolicy}
                  overview={profile.commonSettingsPolicy ? (profile.commonSettingsPolicy.disableScreenCapture ? "Screen Capture: Off" : "Screen Capture: On") : undefined}
                />
                {/* ============================================================
                   WP-ONLY RESTRICTIONS - Location and Security are WP-compatible
                   ============================================================ */}
                <PolicyCard title="Location" icon={MapPin} type="restriction_location" isActive={!!profile.restrictions?.location} overview={profile.restrictions?.location ? "Configured" : undefined} />
                <PolicyCard
                  title="Passcode"
                  icon={Lock}
                  type="passcode"
                  isActive={!!profile.passcodePolicy?.work}
                  overview={profile.passcodePolicy?.work ? `Complexity: ${profile.passcodePolicy.work.complexity || '-'}` : undefined}
                />
                <PolicyCard title="Security" icon={Shield} type="restriction_security" isActive={!!profile.restrictions?.security} overview={profile.restrictions?.security ? "Configured" : undefined} />
                <PolicyCard
                  title="Web Apps"
                  icon={Globe}
                  type="webapps"
                  isActive={!!profile.webApplicationPolicies?.length}
                  overview={profile.webApplicationPolicies?.length ? `${profile.webApplicationPolicies.length} Apps` : undefined}
                />
                {/* ============================================================
                   DO-ONLY POLICIES AND RESTRICTIONS
                   TODO: Uncomment when Device Owner mode is implemented
                   ============================================================ */}
                {/* <PolicyCard title="Connectivity" icon={Bluetooth} type="restriction_connectivity" isActive={!!profile.restrictions?.connectivity} overview={profile.restrictions?.connectivity ? "Configured" : undefined} /> */}
                {/* <PolicyCard title="Date/Time" icon={Clock} type="restriction_dateTime" isActive={!!profile.restrictions?.dateTime} overview={profile.restrictions?.dateTime ? "Configured" : undefined} /> */}
                {/* <PolicyCard title="Display" icon={Monitor} type="restriction_display" isActive={!!profile.restrictions?.display} overview={profile.restrictions?.display ? "Configured" : undefined} /> */}
                {/* <PolicyCard
                  title="Enrollment"
                  icon={FileText}
                  type="enrollment"
                  isActive={!!profile.enrollmentPolicy}
                  overview={profile.enrollmentPolicy ? `Kiosk: ${profile.enrollmentPolicy.isKioskMode ? 'Yes' : 'No'}` : undefined}
                /> */}
                {/* <PolicyCard title="Kiosk" icon={TabletSmartphone} type="restriction_kiosk" isActive={!!profile.restrictions?.kiosk} overview={profile.restrictions?.kiosk ? "Configured" : undefined} /> */}
                {/* <PolicyCard title="Network" icon={WifiOff} type="restriction_network" isActive={!!profile.restrictions?.network} overview={profile.restrictions?.network ? "Configured" : undefined} /> */}
                {/* <PolicyCard title="Phone" icon={Phone} type="restriction_phone" isActive={!!profile.restrictions?.phone} overview={profile.restrictions?.phone ? "Configured" : undefined} /> */}
                {/* <PolicyCard title="Storage" icon={Database} type="restriction_syncStorage" isActive={!!profile.restrictions?.syncStorage} overview={profile.restrictions?.syncStorage ? "Configured" : undefined} /> */}
                {/* <PolicyCard
                  title="Theme"
                  icon={ImageIcon}
                  type="theme"
                  isActive={!!profile.deviceThemePolicy}
                  overview={profile.deviceThemePolicy ? `Color: ${profile.deviceThemePolicy.backgroundColor || '-'}` : undefined}
                /> */}
              </>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
