import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { FullProfile, Platform } from "@/types/models";
import { ProfileService } from "@/api/services/profiles";

import {
  Apple,
  ArrowLeft,
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Layout,
  Mail,
  Monitor,
  Send,
  Shield,
  Smartphone,
  Users,
  Wifi,
  Key,
  Server,
  Globe,
  Bell,
  Package,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Extended type for UI display (API may not return these fields)
type ProfileDetailsData = FullProfile & {
  deployedDevices?: number;
  complianceRate?: number;
  category?: string;
};

export default function ProfileDetails() {
  const { platform, id } = useParams<{ platform: string; id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState<string | null>(
    null
  );
  const [publishing, setPublishing] = useState(false);

  const fetchProfile = async () => {
    if (!platform || !id) {
      setError("Invalid profile parameters");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await ProfileService.getProfile(platform as Platform, id);
      // Set platform from URL params since API response may not include it
      setProfile({
        ...data,
        platform: platform as Platform,
      } as ProfileDetailsData);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, platform]);

  const handlePublish = async () => {
    if (!platform || !id) return;

    setPublishing(true);
    try {
      const profileType =
        platform.toLowerCase() === "ios"
          ? "IosPublishProfile"
          : "AndroidPublishProfile";

      await ProfileService.publishProfile(platform as Platform, id, {
        profileType,
      });

      toast({
        title: "Profile Published",
        description: `Profile "${profile?.name}" has been published successfully.`,
      });

      // Refresh profile data to update status
      await fetchProfile();
    } catch (err) {
      console.error("Failed to publish profile:", err);
      toast({
        title: "Error",
        description: "Failed to publish profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center">
          <LoadingAnimation message="Loading profile details..." />
        </div>
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

  if (!profile) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-muted-foreground">
          Profile not found.
        </div>
      </MainLayout>
    );
  }

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

  const handlePolicyClick = (policyType: string) => {
    setSelectedPolicyType(policyType);
    setPolicyDialogOpen(true);
  };

  const renderPolicyDetails = () => {
    if (!profile || !selectedPolicyType) return null;

    const renderInfoRow = (label: string, value: any) => (
      <div className="grid grid-cols-[140px_1fr] gap-4 py-2 border-b last:border-b-0">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span className="text-sm break-words">{value ?? "-"}</span>
      </div>
    );

    const renderAuditInfo = (policy: any) => (
      <div className="mt-4 pt-4 border-t space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground mb-2">
          Audit Information
        </h4>
        {renderInfoRow("Created By", policy.createdBy)}
        {renderInfoRow(
          "Created On",
          policy.creationTime
            ? new Date(policy.creationTime).toLocaleString()
            : "-"
        )}
        {renderInfoRow("Last Modified By", policy.lastModifiedBy)}
        {renderInfoRow(
          "Last Modified",
          policy.modificationTime
            ? new Date(policy.modificationTime).toLocaleString()
            : "-"
        )}
      </div>
    );

    switch (selectedPolicyType) {
      case "passcode":
        if (!profile.passCodePolicy) return null;
        return (
          <div className="space-y-2">
            {renderInfoRow("Min Length", profile.passCodePolicy.minLength)}
            {renderInfoRow(
              "Allow Simple",
              profile.passCodePolicy.allowSimple ? "Yes" : "No"
            )}
            {renderInfoRow(
              "Require Passcode",
              profile.passCodePolicy.requirePassCode ? "Yes" : "No"
            )}
            {renderInfoRow(
              "Alphanumeric",
              profile.passCodePolicy.requireAlphanumericPasscode ? "Yes" : "No"
            )}
            {renderInfoRow(
              "Complex Passcode",
              profile.passCodePolicy.requireComplexPasscode ? "Yes" : "No"
            )}
            {renderInfoRow(
              "Min Complex Characters",
              profile.passCodePolicy.minimumComplexCharacters
            )}
            {renderInfoRow(
              "Max Failed Attempts",
              profile.passCodePolicy.maximumFailedAttempts
            )}
            {renderInfoRow(
              "Max Grace Period (min)",
              profile.passCodePolicy.maximumGracePeriodInMinutes
            )}
            {renderInfoRow(
              "Max Inactivity (min)",
              profile.passCodePolicy.maximumInactivityInMinutes
            )}
            {renderInfoRow(
              "Max Passcode Age (days)",
              profile.passCodePolicy.maximumPasscodeAgeInDays
            )}
            {renderInfoRow(
              "Passcode Reuse Limit",
              profile.passCodePolicy.passCodeReuseLimit
            )}
            {renderInfoRow(
              "Change at Next Auth",
              profile.passCodePolicy.changeAtNextAuth ? "Yes" : "No"
            )}
            {renderAuditInfo(profile.passCodePolicy)}
          </div>
        );

      case "wifi":
        if (!profile.wifiPolicy) return null;
        return (
          <div className="space-y-2">
            {renderInfoRow("SSID", profile.wifiPolicy.ssid)}
            {renderInfoRow("Name", profile.wifiPolicy.name)}
            {renderInfoRow(
              "Encryption Type",
              profile.wifiPolicy.encryptionType
            )}
            {renderInfoRow(
              "Auto Join",
              profile.wifiPolicy.autoJoin ? "Yes" : "No"
            )}
            {renderInfoRow(
              "Hidden Network",
              profile.wifiPolicy.hiddenNetwork ? "Yes" : "No"
            )}
            {renderInfoRow("Domain Name", profile.wifiPolicy.domainName)}
            {renderInfoRow(
              "Displayed Operator",
              profile.wifiPolicy.displayedOperatorName
            )}
            {renderInfoRow("Proxy Type", profile.wifiPolicy.proxyType)}
            {renderInfoRow("Proxy Server", profile.wifiPolicy.proxyServer)}
            {renderInfoRow("Proxy Port", profile.wifiPolicy.proxyServerPort)}
            {profile.wifiPolicy.eapClientConfiguration && (
              <>
                {renderInfoRow(
                  "EAP Types",
                  profile.wifiPolicy.eapClientConfiguration.acceptEAPTypes?.join(
                    ", "
                  )
                )}
                {renderInfoRow(
                  "User Name",
                  profile.wifiPolicy.eapClientConfiguration.userName
                )}
                {renderInfoRow(
                  "TLS Min Version",
                  profile.wifiPolicy.eapClientConfiguration.tlsMinimumVersion
                )}
                {renderInfoRow(
                  "TLS Max Version",
                  profile.wifiPolicy.eapClientConfiguration.tlsMaximumVersion
                )}
              </>
            )}
            {renderAuditInfo(profile.wifiPolicy)}
          </div>
        );

      case "scep":
        if (!profile.scepPolicy) return null;
        return (
          <div className="space-y-2">
            {renderInfoRow(
              "Name",
              (profile.scepPolicy as any).scepName ||
                (profile.scepPolicy as any).name
            )}
            {renderInfoRow("URL", (profile.scepPolicy as any).url)}
            {renderInfoRow("Key Size", (profile.scepPolicy as any).keysize)}
            {renderInfoRow("Key Type", (profile.scepPolicy as any).keyType)}
            {renderInfoRow("Key Usage", (profile.scepPolicy as any).keyUsage)}
            {renderInfoRow("Challenge", (profile.scepPolicy as any).challenge)}
            {(profile.scepPolicy as any).subjectAltName?.dNSName &&
              renderInfoRow(
                "DNS Name",
                (profile.scepPolicy as any).subjectAltName.dNSName
              )}
            {renderAuditInfo(profile.scepPolicy)}
          </div>
        );

      case "mdm":
        if (!profile.mdmPolicy) return null;
        return (
          <div className="space-y-2">
            {renderInfoRow("Server URL", profile.mdmPolicy.serverURL)}
            {renderInfoRow("Check-in URL", profile.mdmPolicy.checkInURL)}
            {renderInfoRow("Topic", profile.mdmPolicy.topic)}
            {renderInfoRow(
              "Identity Certificate UUID",
              profile.mdmPolicy.identityCertificateUUID
            )}
            {renderInfoRow(
              "Sign Message",
              profile.mdmPolicy.signMessage ? "Yes" : "No"
            )}
            {renderInfoRow("Access Rights", profile.mdmPolicy.accessRights)}
            {renderInfoRow(
              "Use Development APNS",
              profile.mdmPolicy.useDevelopmentAPNS ? "Yes" : "No"
            )}
            {renderInfoRow(
              "Server Capabilities",
              profile.mdmPolicy.serverCapabilities?.join(", ")
            )}
            {renderInfoRow(
              "Check Out When Removed",
              profile.mdmPolicy.checkOutWhenRemoved ? "Yes" : "No"
            )}
            {renderInfoRow(
              "Prompt Bootstrap Token",
              profile.mdmPolicy.promptUserToAllowBootstrapTokenForAuthentication
                ? "Yes"
                : "No"
            )}
            {renderAuditInfo(profile.mdmPolicy)}
          </div>
        );

      case "webclip":
        // Handle iOS webClipPolicies or Android webApplicationPolicies
        const webPolicies =
          profile.webClipPolicies ||
          (profile as any).webApplicationPolicies ||
          [];
        if (webPolicies.length === 0) return null;
        return (
          <div className="space-y-4">
            {webPolicies.map((webApp: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">
                  {profile.platform?.toLowerCase() === "ios"
                    ? `Web Clip ${index + 1}`
                    : `Web Application ${index + 1}`}
                </h4>
                {renderInfoRow("Label", webApp.label || webApp.title)}
                {renderInfoRow("URL", webApp.url)}
                {webApp.isRemovable !== undefined &&
                  renderInfoRow(
                    "Is Removable",
                    webApp.isRemovable ? "Yes" : "No"
                  )}
                {webApp.precomposed !== undefined &&
                  renderInfoRow(
                    "Precomposed",
                    webApp.precomposed ? "Yes" : "No"
                  )}
                {renderAuditInfo(webApp)}
              </div>
            ))}
          </div>
        );

      case "notification":
        if (
          !profile.notificationPolicies ||
          profile.notificationPolicies.length === 0
        )
          return null;
        return (
          <div className="space-y-4">
            {profile.notificationPolicies.map((notif, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">
                  Notification Policy {index + 1}
                </h4>
                {renderInfoRow("Bundle Identifier", notif.bundleIdentifier)}
                {renderInfoRow("Enabled", notif.enabled ? "Yes" : "No")}
                {renderInfoRow(
                  "Show in Notification Center",
                  notif.showInNotificationCenter ? "Yes" : "No"
                )}
                {renderInfoRow(
                  "Show in Lock Screen",
                  notif.showInLockScreen ? "Yes" : "No"
                )}
                {renderInfoRow("Alert Style", notif.alertStyle)}
                {renderAuditInfo(notif)}
              </div>
            ))}
          </div>
        );

      case "application":
        if (
          !profile.applicationPolicies ||
          profile.applicationPolicies.length === 0
        )
          return null;
        return (
          <div className="space-y-4">
            {profile.applicationPolicies.map((app, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">
                  Application Policy {index + 1}
                </h4>
                {renderInfoRow("Name", app.name)}
                {renderInfoRow("Bundle Identifier", app.bundleIdentifier)}
                {renderInfoRow("Action", app.action)}
                {renderInfoRow("Removable", app.removable ? "Yes" : "No")}
                {renderInfoRow("Purchase Method", app.purchaseMethod)}
                {renderAuditInfo(app)}
              </div>
            ))}
          </div>
        );

      case "mail":
        if (!profile.mailPolicy) return null;
        return (
          <div className="space-y-2">
            {renderInfoRow("Account Name", profile.mailPolicy.emailAccountName)}
            {renderInfoRow(
              "Account Description",
              profile.mailPolicy.emailAccountDescription
            )}
            {renderInfoRow("Email Address", profile.mailPolicy.emailAddress)}
            {renderInfoRow("Account Type", profile.mailPolicy.emailAccountType)}
            {renderInfoRow(
              "Incoming Server",
              profile.mailPolicy.incomingMailServerHostName
            )}
            {renderInfoRow(
              "Incoming Port",
              profile.mailPolicy.incomingMailServerPortNumber
            )}
            {renderInfoRow(
              "Incoming SSL",
              profile.mailPolicy.incomingMailServerUseSSL ? "Yes" : "No"
            )}
            {renderInfoRow(
              "Incoming Auth",
              profile.mailPolicy.incomingMailServerAuthentication
            )}
            {renderInfoRow(
              "Outgoing Server",
              profile.mailPolicy.outgoingMailServerHostName
            )}
            {renderInfoRow(
              "Outgoing Port",
              profile.mailPolicy.outgoingMailServerPortNumber
            )}
            {renderInfoRow(
              "Outgoing SSL",
              profile.mailPolicy.outgoingMailServerUseSSL ? "Yes" : "No"
            )}
            {renderInfoRow(
              "Outgoing Auth",
              profile.mailPolicy.outgoingMailServerAuthentication
            )}
            {renderInfoRow(
              "SMIME Enabled",
              profile.mailPolicy.smimeEnabled ? "Yes" : "No"
            )}
            {renderInfoRow(
              "Prevent Move",
              profile.mailPolicy.preventMove ? "Yes" : "No"
            )}
            {renderAuditInfo(profile.mailPolicy)}
          </div>
        );

      case "lockscreen":
        if (!profile.lockScreenPolicy) return null;
        return (
          <div className="space-y-2">
            {renderInfoRow(
              "Asset Tag Information",
              profile.lockScreenPolicy.assetTagInformation
            )}
            {renderInfoRow(
              "Lock Screen Footnote",
              profile.lockScreenPolicy.lockScreenFootnote
            )}
            {renderInfoRow(
              "If Lost Return To",
              profile.lockScreenPolicy.ifLostReturnTo
            )}
            {renderAuditInfo(profile.lockScreenPolicy)}
          </div>
        );

      case "restrictions":
        const restrictions = (profile as any).restrictions;
        if (!restrictions) return null;
        return (
          <div className="space-y-4">
            {restrictions.security && (
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Security Restrictions</h4>
                {renderInfoRow(
                  "Allow Camera",
                  restrictions.security.allowCamera ? "Yes" : "No"
                )}
                {renderInfoRow(
                  "Allow Screen Capture",
                  restrictions.security.allowScreenCapture ? "Yes" : "No"
                )}
              </div>
            )}
            {restrictions.passcode && (
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Passcode Restrictions</h4>
                {renderInfoRow("Min Length", restrictions.passcode.minLength)}
                {renderInfoRow(
                  "Require Alphanumeric",
                  restrictions.passcode.requireAlphanumeric ? "Yes" : "No"
                )}
              </div>
            )}
            {restrictions.kiosk && (
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Kiosk Restrictions</h4>
                {renderInfoRow(
                  "Enabled",
                  restrictions.kiosk.enabled ? "Yes" : "No"
                )}
              </div>
            )}
            {restrictions.network && (
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Network Restrictions</h4>
                {renderInfoRow(
                  "Allow WiFi",
                  restrictions.network.allowWifi ? "Yes" : "No"
                )}
                {renderInfoRow(
                  "Allow Bluetooth",
                  restrictions.network.allowBluetooth ? "Yes" : "No"
                )}
              </div>
            )}
          </div>
        );

      default:
        return <div>Policy details not available</div>;
    }
  };

  const getPolicyTitle = () => {
    const titles: Record<string, string> = {
      passcode: "Passcode Policy",
      wifi: "WiFi Configuration",
      scep: "SCEP Policy",
      mdm: "MDM Policy",
      webclip: "Web Clip Policies",
      notification: "Notification Policies",
      application: "Application Policies",
      mail: "Mail Policy",
      lockscreen: "Lock Screen Policy",
      restrictions: "Device Restrictions",
    };
    return titles[selectedPolicyType || ""] || "Policy Details";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profiles")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {getPlatformIcon(profile.platform)}
              {profile.name}
            </h1>
            <p className="text-muted-foreground">
              {profile.description || "No description provided"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-2 mr-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate(`/profiles/${platform}/${id}/policies`)}
              >
                <Edit className="w-4 h-4" />
                Edit Policies
              </Button>
              {profile.status !== "PUBLISHED" && (
                <Button
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white"
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  <Send className="w-4 h-4" />
                  {publishing ? "Publishing..." : "Publish"}
                </Button>
              )}
            </div>
            <Badge
              variant="outline"
              className="capitalize px-3 py-1 text-sm bg-background"
            >
              {profile.platform}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${
              profile.platform?.toLowerCase() === "ios"
                ? "lg:grid-cols-2"
                : "lg:grid-cols-4"
            } gap-4`}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {profile.status}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current profile state
                </p>
              </CardContent>
            </Card>
            {/* Deployed Devices - not shown for iOS per OpenAPI spec */}
            {profile.platform?.toLowerCase() !== "ios" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Deployed Devices
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {profile.deviceCount || profile.deployedDevices || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active installations
                  </p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compliance
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile.complianceRate || "-"}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Device compliance rate
                </p>
              </CardContent>
            </Card>
            {/* Version - not shown for iOS per OpenAPI spec */}
            {profile.platform?.toLowerCase() !== "ios" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Version</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    v{profile.version || "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current revision
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Profile Name
                  </span>
                  <span className="font-medium">{profile.name}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Description
                  </span>
                  <span className="text-sm">{profile.description}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Platform
                  </span>
                  <span className="capitalize">{profile.platform}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Category
                  </span>
                  <span className="capitalize">{profile.category}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Created By
                  </span>
                  <span>{profile.createdBy}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Created On
                  </span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {profile.creationTime
                      ? new Date(profile.creationTime).toLocaleString()
                      : "-"}
                  </div>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Last Modified By
                  </span>
                  <span>{profile.lastModifiedBy}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Last Modified
                  </span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {profile.modificationTime
                      ? new Date(profile.modificationTime).toLocaleString()
                      : "-"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Configured Policies Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Configured Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Passcode Policy */}
            {profile.passCodePolicy && (
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handlePolicyClick("passcode")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Passcode Policy
                  </CardTitle>
                  <Badge variant="secondary">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Min Length:</span>
                      <span className="font-medium text-foreground">
                        {profile.passCodePolicy.minLength}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alphanumeric:</span>
                      <span className="font-medium text-foreground">
                        {profile.passCodePolicy.requireAlphanumericPasscode
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Attempts:</span>
                      <span className="font-medium text-foreground">
                        {profile.passCodePolicy.maximumFailedAttempts}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* WiFi Policy */}
            {profile.wifiPolicy && (
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handlePolicyClick("wifi")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-info" />
                    WiFi Configuration
                  </CardTitle>
                  <Badge variant="secondary">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>SSID:</span>
                      <span className="font-medium text-foreground">
                        {profile.wifiPolicy.ssid}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Encryption:</span>
                      <span className="font-medium text-foreground">
                        {profile.wifiPolicy.encryptionType || "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SCEP Policy */}
            {profile.scepPolicy && (
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handlePolicyClick("scep")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Key className="w-4 h-4 text-warning" />
                    SCEP Policy
                  </CardTitle>
                  <Badge variant="secondary">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium text-foreground">
                        {profile.scepPolicy.scepName || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>URL:</span>
                      <span
                        className="font-medium text-foreground truncate max-w-[150px]"
                        title={profile.scepPolicy.url}
                      >
                        {profile.scepPolicy.url || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Key Size:</span>
                      <span className="font-medium text-foreground">
                        {profile.scepPolicy.keysize || "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* MDM Policy */}
            {profile.mdmPolicy && (
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handlePolicyClick("mdm")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Server className="w-4 h-4 text-success" />
                    MDM Policy
                  </CardTitle>
                  <Badge variant="secondary">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Server URL:</span>
                      <span
                        className="font-medium text-foreground truncate max-w-[150px]"
                        title={profile.mdmPolicy.serverURL}
                      >
                        {profile.mdmPolicy.serverURL || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Topic:</span>
                      <span
                        className="font-medium text-foreground truncate max-w-[150px]"
                        title={profile.mdmPolicy.topic}
                      >
                        {profile.mdmPolicy.topic || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-in URL:</span>
                      <span
                        className="font-medium text-foreground truncate max-w-[150px]"
                        title={profile.mdmPolicy.checkInURL}
                      >
                        {profile.mdmPolicy.checkInURL || "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Web Clip Policies */}
            {profile.webClipPolicies && profile.webClipPolicies.length > 0 && (
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handlePolicyClick("webclip")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    Web Clip Policies
                  </CardTitle>
                  <Badge variant="secondary">
                    {profile.webClipPolicies.length}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Count:</span>
                      <span className="font-medium text-foreground">
                        {profile.webClipPolicies.length} configured
                      </span>
                    </div>
                    {profile.webClipPolicies[0] && (
                      <>
                        <div className="flex justify-between">
                          <span>First:</span>
                          <span
                            className="font-medium text-foreground truncate max-w-[150px]"
                            title={
                              profile.webClipPolicies[0].label ||
                              profile.webClipPolicies[0].url
                            }
                          >
                            {profile.webClipPolicies[0].label ||
                              profile.webClipPolicies[0].url ||
                              "-"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Policies */}
            {profile.notificationPolicies &&
              profile.notificationPolicies.length > 0 && (
                <Card
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handlePolicyClick("notification")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-500" />
                      Notification Policies
                    </CardTitle>
                    <Badge variant="secondary">
                      {profile.notificationPolicies.length}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Count:</span>
                        <span className="font-medium text-foreground">
                          {profile.notificationPolicies.length} configured
                        </span>
                      </div>
                      {profile.notificationPolicies[0] && (
                        <div className="flex justify-between">
                          <span>First:</span>
                          <span
                            className="font-medium text-foreground truncate max-w-[150px]"
                            title={
                              profile.notificationPolicies[0].bundleIdentifier
                            }
                          >
                            {profile.notificationPolicies[0].bundleIdentifier ||
                              "-"}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Application Policies */}
            {profile.applicationPolicies &&
              profile.applicationPolicies.length > 0 && (
                <Card
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handlePolicyClick("application")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Package className="w-4 h-4 text-orange-500" />
                      Application Policies
                    </CardTitle>
                    <Badge variant="secondary">
                      {profile.applicationPolicies.length}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Count:</span>
                        <span className="font-medium text-foreground">
                          {profile.applicationPolicies.length} configured
                        </span>
                      </div>
                      {profile.applicationPolicies[0] && (
                        <div className="flex justify-between">
                          <span>First:</span>
                          <span
                            className="font-medium text-foreground truncate max-w-[150px]"
                            title={
                              profile.applicationPolicies[0].bundleIdentifier ||
                              profile.applicationPolicies[0].name
                            }
                          >
                            {profile.applicationPolicies[0].name ||
                              profile.applicationPolicies[0].bundleIdentifier ||
                              "-"}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Mail Policy */}
            {profile.mailPolicy && (
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handlePolicyClick("mail")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Mail Policy
                  </CardTitle>
                  <Badge variant="secondary">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Account:</span>
                      <span className="font-medium text-foreground">
                        {profile.mailPolicy.emailAccountName ||
                          profile.mailPolicy.emailAddress ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium text-foreground">
                        {profile.mailPolicy.emailAccountType || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Server:</span>
                      <span
                        className="font-medium text-foreground truncate max-w-[150px]"
                        title={profile.mailPolicy.incomingMailServerHostName}
                      >
                        {profile.mailPolicy.incomingMailServerHostName || "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lock Screen Policy */}
            {profile.lockScreenPolicy && (
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handlePolicyClick("lockscreen")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-600" />
                    Lock Screen Policy
                  </CardTitle>
                  <Badge variant="secondary">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {profile.lockScreenPolicy.assetTagInformation && (
                      <div className="flex justify-between">
                        <span>Asset Tag:</span>
                        <span
                          className="font-medium text-foreground truncate max-w-[150px]"
                          title={profile.lockScreenPolicy.assetTagInformation}
                        >
                          {profile.lockScreenPolicy.assetTagInformation}
                        </span>
                      </div>
                    )}
                    {profile.lockScreenPolicy.lockScreenFootnote && (
                      <div className="flex justify-between">
                        <span>Footnote:</span>
                        <span
                          className="font-medium text-foreground truncate max-w-[150px]"
                          title={profile.lockScreenPolicy.lockScreenFootnote}
                        >
                          {profile.lockScreenPolicy.lockScreenFootnote}
                        </span>
                      </div>
                    )}
                    {profile.lockScreenPolicy.ifLostReturnTo && (
                      <div className="flex justify-between">
                        <span>If Lost Return To:</span>
                        <span
                          className="font-medium text-foreground truncate max-w-[150px]"
                          title={profile.lockScreenPolicy.ifLostReturnTo}
                        >
                          {profile.lockScreenPolicy.ifLostReturnTo}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Android Restrictions (only for Android platform) */}
            {profile.platform?.toLowerCase() === "android" &&
              (profile as any).restrictions && (
                <Card
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handlePolicyClick("restrictions")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Ban className="w-4 h-4 text-destructive" />
                      Device Restrictions
                    </CardTitle>
                    <Badge variant="secondary">Active</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {(profile as any).restrictions.security && (
                        <div className="flex justify-between">
                          <span>Security:</span>
                          <span className="font-medium text-foreground">
                            Configured
                          </span>
                        </div>
                      )}
                      {(profile as any).restrictions.passcode && (
                        <div className="flex justify-between">
                          <span>Passcode:</span>
                          <span className="font-medium text-foreground">
                            Configured
                          </span>
                        </div>
                      )}
                      {(profile as any).restrictions.kiosk && (
                        <div className="flex justify-between">
                          <span>Kiosk Mode:</span>
                          <span className="font-medium text-foreground">
                            Configured
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Android Web Application Policies (webApplicationPolicies) */}
            {profile.platform?.toLowerCase() === "android" &&
              (profile as any).webApplicationPolicies &&
              (profile as any).webApplicationPolicies.length > 0 && (
                <Card
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handlePolicyClick("webclip")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      Web Applications
                    </CardTitle>
                    <Badge variant="secondary">
                      {(profile as any).webApplicationPolicies.length}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium text-foreground">
                          {(profile as any).webApplicationPolicies.length}{" "}
                          configured
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Empty State */}
            {!profile.passCodePolicy &&
              !profile.wifiPolicy &&
              !profile.scepPolicy &&
              !profile.mdmPolicy &&
              (!profile.webClipPolicies ||
                profile.webClipPolicies.length === 0) &&
              (!(profile as any).webApplicationPolicies ||
                (profile as any).webApplicationPolicies.length === 0) &&
              (!profile.notificationPolicies ||
                profile.notificationPolicies.length === 0) &&
              (!profile.applicationPolicies ||
                profile.applicationPolicies.length === 0) &&
              !profile.mailPolicy &&
              !profile.lockScreenPolicy &&
              !(profile as any).restrictions && (
                <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No policies configured.
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Policy Details Dialog */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPolicyType === "passcode" && (
                <Shield className="w-5 h-5 text-primary" />
              )}
              {selectedPolicyType === "wifi" && (
                <Wifi className="w-5 h-5 text-info" />
              )}
              {selectedPolicyType === "scep" && (
                <Key className="w-5 h-5 text-warning" />
              )}
              {selectedPolicyType === "mdm" && (
                <Server className="w-5 h-5 text-success" />
              )}
              {selectedPolicyType === "webclip" && (
                <Globe className="w-5 h-5 text-blue-500" />
              )}
              {selectedPolicyType === "notification" && (
                <Bell className="w-5 h-5 text-purple-500" />
              )}
              {selectedPolicyType === "application" && (
                <Package className="w-5 h-5 text-orange-500" />
              )}
              {selectedPolicyType === "mail" && (
                <Mail className="w-5 h-5 text-blue-600" />
              )}
              {selectedPolicyType === "lockscreen" && (
                <Shield className="w-5 h-5 text-gray-600" />
              )}
              {selectedPolicyType === "restrictions" && (
                <Ban className="w-5 h-5 text-destructive" />
              )}
              {getPolicyTitle()}
            </DialogTitle>
            <DialogDescription>
              View complete details of this policy configuration
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">{renderPolicyDetails()}</div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPolicyDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setPolicyDialogOpen(false);
                navigate(
                  `/profiles/${platform}/${id}/policies?type=${selectedPolicyType}`
                );
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Policy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
