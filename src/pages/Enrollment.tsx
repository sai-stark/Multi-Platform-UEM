import { EnrollmentProfile, EnrollmentService } from '@/api/services/enrollmentService';
import { LoadingAnimation } from '@/components/common/LoadingAnimation';
import { StatCard } from '@/components/dashboard/StatCard';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAssetUrl } from '@/config/env';
import { useAndroidFeaturesEnabled } from '@/contexts/EnterpriseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Platform } from '@/types/models';
import { getErrorMessage } from '@/utils/errorUtils';
import {
  Check,
  Copy,
  Download,
  FileSearch,
  FileText,
  Info,
  Laptop,
  MousePointer2,
  QrCode,
  RefreshCw,
  Server,
  Settings2,
  Smartphone,
  UserPlus,
  ZoomIn
} from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';

const enrollmentSteps: Record<Platform, { en: string; hi: string }[]> = {
  android: [
    { en: 'Navigate to Settings → Accounts → Add Work Account', hi: 'सेटिंग्स → खाते → कार्य खाता जोड़ें पर जाएं' },
    { en: 'Scan the QR code displayed on screen', hi: 'स्क्रीन पर प्रदर्शित QR कोड स्कैन करें' },
    { en: 'Sign in with your enterprise credentials (mdmadmin@cdot.in)', hi: 'अपने एंटरप्राइज़ क्रेडेंशियल्स से साइन इन करें (mdmadmin@cdot.in)' },
    { en: 'Accept the terms and conditions', hi: 'नियम और शर्तें स्वीकार करें' },
    { en: 'Wait for profile installation to complete', hi: 'प्रोफ़ाइल इंस्टॉलेशन पूरा होने की प्रतीक्षा करें' },
    { en: 'Restart the device when prompted', hi: 'संकेत मिलने पर डिवाइस पुनः प्रारंभ करें' },
  ],
  ios: [
    { en: 'Open Camera app and scan the QR code', hi: 'कैमरा ऐप खोलें और QR कोड स्कैन करें' },
    { en: 'Tap the notification to open enrollment page', hi: 'एनरोलमेंट पेज खोलने के लिए नोटिफिकेशन टैप करें' },
    { en: 'Sign in with your enterprise credentials (mdmadmin@cdot.in)', hi: 'अपने एंटरप्राइज़ क्रेडेंशियल्स से साइन इन करें (mdmadmin@cdot.in)' },
    { en: 'Install the management profile when prompted', hi: 'संकेत मिलने पर प्रबंधन प्रोफ़ाइल इंस्टॉल करें' },
    { en: 'Trust the enterprise certificate in Settings', hi: 'सेटिंग्स में एंटरप्राइज़ प्रमाणपत्र पर भरोसा करें' },
  ],
  windows: [
    { en: 'Press Win + I to open Settings', hi: 'सेटिंग्स खोलने के लिए Win + I दबाएं' },
    { en: 'Navigate to Accounts → Access work or school', hi: 'खाते → कार्य या स्कूल तक पहुंच पर जाएं' },
    { en: 'Click Connect and select "Join this device to Azure AD"', hi: 'कनेक्ट पर क्लिक करें और "इस डिवाइस को Azure AD में शामिल करें" चुनें' },
    { en: 'Enter your enterprise credentials (mdmadmin@cdot.in)', hi: 'अपने एंटरप्राइज़ क्रेडेंशियल्स दर्ज करें (mdmadmin@cdot.in)' },
    { en: 'Complete multi-factor authentication if prompted', hi: 'यदि संकेत मिले तो बहु-कारक प्रमाणीकरण पूरा करें' },
    { en: 'Restart the device to complete enrollment', hi: 'एनरोलमेंट पूरा करने के लिए डिवाइस पुनः प्रारंभ करें' },
  ],
  macos: [
    { en: 'Open System Preferences → Profiles', hi: 'सिस्टम प्राथमिकताएं → प्रोफ़ाइल खोलें' },
    { en: 'Click the + button to add a new profile', hi: 'नई प्रोफ़ाइल जोड़ने के लिए + बटन पर क्लिक करें' },
    { en: 'Enter the enrollment URL or scan QR code', hi: 'एनरोलमेंट URL दर्ज करें या QR कोड स्कैन करें' },
    { en: 'Authenticate with enterprise credentials (mdmadmin@cdot.in)', hi: 'एंटरप्राइज़ क्रेडेंशियल्स से प्रमाणित करें (mdmadmin@cdot.in)' },
    { en: 'Approve the MDM profile installation', hi: 'MDM प्रोफ़ाइल इंस्टॉलेशन स्वीकृत करें' },
  ],
  linux: [
    { en: 'Open Terminal and run the enrollment script', hi: 'टर्मिनल खोलें और एनरोलमेंट स्क्रिप्ट चलाएं' },
    { en: 'Enter sudo password when prompted', hi: 'संकेत मिलने पर sudo पासवर्ड दर्ज करें' },
    { en: 'Authenticate with enterprise credentials (mdmadmin@cdot.in)', hi: 'एंटरप्राइज़ क्रेडेंशियल्स से प्रमाणित करें (mdmadmin@cdot.in)' },
    { en: 'Wait for agent installation to complete', hi: 'एजेंट इंस्टॉलेशन पूरा होने की प्रतीक्षा करें' },
    { en: 'Reboot the system to apply policies', hi: 'नीतियां लागू करने के लिए सिस्टम रीबूट करें' },
  ],
};

const platformConfig = {
  android: { label: 'Android', asset: getAssetUrl('/Assets/android.png'), icon: Smartphone },
  ios: { label: 'iOS', asset: getAssetUrl('/Assets/apple.png'), icon: Smartphone },
  windows: { label: 'Windows', asset: getAssetUrl('/Assets/microsoft.png'), icon: Laptop },
  macos: { label: 'macOS', asset: getAssetUrl('/Assets/mac_os.png'), icon: Laptop },
  linux: { label: 'Linux', asset: getAssetUrl('/Assets/linux.png'), icon: Server },
};

export default function Enrollment() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { shouldBlock: shouldBlockAndroid } = useAndroidFeaturesEnabled();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(shouldBlockAndroid ? 'ios' : 'android');
  const [profiles, setProfiles] = useState<EnrollmentProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isQrVisible, setIsQrVisible] = useState(false);

  const steps = enrollmentSteps[selectedPlatform];
  const currentProfile = profiles.find(p => p.id === selectedProfileId);

  useEffect(() => {
    fetchProfiles(selectedPlatform);
    setIsQrVisible(false); // Reset QR visibility on platform change
  }, [selectedPlatform]);

  useEffect(() => {
    if (currentProfile) {
      if (currentProfile.id) {
        fetchQrCode(selectedPlatform, currentProfile.id);
        fetchProfileDetails(selectedPlatform, currentProfile.id);
      }
    }
  }, [selectedProfileId, selectedPlatform]); // Depend on IDs, not the object itself to avoid loops if object references change

  const fetchProfiles = async (platform: Platform) => {
    setLoading(true);
    try {
      const data = await EnrollmentService.getProfiles(platform);
      const publishedProfiles = data.filter(p => p.status === 'PUBLISHED');
      setProfiles(publishedProfiles);
      setSelectedProfileId('');
    } catch (error) {
      console.error('Failed to fetch profiles', error);
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to fetch enrollment profiles"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileDetails = async (platform: Platform, profileId: string) => {
    try {
      const details = await EnrollmentService.getProfileDetails(platform, profileId);
      // Update the profiles list with the detailed info or store aside?
      // Simplest is to update the profiles state to include the config derived from details
      setProfiles(prev => prev.map(p => {
        if (p.id === profileId) {
          const isIos = details.profileType === 'IosFullProfile';

          // Build config based on platform-specific profile type
          const config = isIos
            ? {
              wifiSSID: details.wifiPolicy?.ssid || p.config?.wifiSSID || 'Not Configured',
              vpnEnabled: !!details.mailPolicy?.vpnUUID || !!details.wifiPolicy?.ssid || false,
              vpnServer: details.mailPolicy?.incomingMailServerHostName || 'N/A',
              mandatoryApps: details.applicationPolicies?.filter(app => app.action === 'INSTALL').map(app => app.name || 'Unknown App') || [],
              restrictions: [
                details.passCodePolicy?.requirePassCode ? 'Passcode Required' : '',
                details.lockScreenPolicy?.lockScreenFootnote ? `Lock Screen: ${details.lockScreenPolicy.lockScreenFootnote}` : '',
                details.webClipPolicies?.length ? `${details.webClipPolicies.length} Web Clips` : ''
              ].filter(Boolean)
            }
            : {
              // Android profile config
              wifiSSID: p.config?.wifiSSID || 'Not Configured',
              vpnEnabled: false,
              vpnServer: 'N/A',
              mandatoryApps: details.applicationPolicies?.filter(app => app.installType === 'INSTALL_NONREMOVABLE').map(app => app.applicationName || app.packageName || 'Unknown App') || [],
              restrictions: [
                details.passcodePolicy?.work?.complexity && details.passcodePolicy.work.complexity !== 'NONE' ? 'Passcode Required' : '',
              ].filter(Boolean)
            };

          return {
            ...p,
            ...details,
            config
          };
        }
        return p;
      }));
    } catch (error) {
      console.error("Failed to fetch profile details", error);
    }
  };

  const fetchQrCode = async (platform: Platform, profileId: string) => {
    try {
      const data = await EnrollmentService.getQrCode(platform, profileId);
      if (platform === 'ios' && data && typeof data === 'object' && 'apple.enrollment.url' in data) {
        setQrCodeData(data['apple.enrollment.url']);
      } else if (platform === 'android' && data && typeof data === 'object' && 'enrollmentUrl' in data) {
        setQrCodeData(data['enrollmentUrl']);
      } else {
        setQrCodeData(data);
      }
    } catch (error) {
      console.error('Failed to fetch QR code', error);
    }
  };

  const handlePlatformChange = (platform: string) => {
    if (platform === 'android' && shouldBlockAndroid) {
      toast({
        title: 'Enterprise Setup Required',
        description: 'Android Enterprise must be configured before using Android features.',
        variant: 'destructive',
      });
      navigate('/android/enterprise/setup?returnTo=/enrollment');
      return;
    }
    setSelectedPlatform(platform as Platform);
  };

  const getEnrollmentUrl = () => {
    if ((selectedPlatform === 'ios' || selectedPlatform === 'android') && typeof qrCodeData === 'string') {
      return qrCodeData;
    }
    return `https://enroll.cdot.in/${selectedPlatform}/${currentProfile?.id}`;
  };

  const handleCopyEnrollmentData = async () => {
    try {
      const textToCopy = getEnrollmentUrl();

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-secure contexts (HTTP)
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;

        // Ensure it's not visible but part of the DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
          throw new Error('Fallback copy failed');
        }

        document.body.removeChild(textArea);
      }

      setCopied(true);

      toast({
        title: t('enrollment.copied'),
        description: t('enrollment.copiedDesc'),
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      toast({
        title: "Error",
        description: getErrorMessage(err, "Failed to copy to clipboard"),
        variant: "destructive"
      });
    }
  };

  const handleDownloadQR = async () => {
    if (!currentProfile || !qrCodeData) return;

    try {
      const svg = document.querySelector('.panel__content svg');
      if (!svg) throw new Error('QR Code SVG not found');

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `enrollment-qr-${selectedPlatform}-${currentProfile.name}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast({
            title: "Success",
            description: "QR Code downloaded successfully",
          });
        }
      };

      img.src = url;

    } catch (error) {
      console.error("Download failed", error);
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to download QR code"),
        variant: "destructive"
      });
    }
  };


  // Stats for the enrollment module
  // TODO: Fetch real stats from dashboard or similar API if available
  const stats = {
    totalProfiles: profiles.length, // Only for current platform currently displayed
    platforms: 5,
    pendingEnrollments: 12,
    completedToday: 8,
  };

  const renderQrContent = () => (
    <div className="w-full h-full bg-white flex items-center justify-center">
      {qrCodeData ? (
        <div style={{ height: "100%", margin: "0 auto", maxWidth: "100%", width: "100%" }}>
          <QRCode
            size={256}
            style={{ height: "100%", maxWidth: "100%", width: "100%" }}
            value={typeof qrCodeData === 'string' ? qrCodeData : JSON.stringify(qrCodeData)}
            viewBox={`0 0 256 256`}
          />
        </div>
      ) : (
        <div className="w-full h-full grid grid-cols-8 gap-0.5 relative overflow-hidden">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className={`${Math.random() > 0.5 ? 'bg-muted' : 'bg-transparent'}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('enrollment.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('enrollment.subtitle')}
            </p>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Enrollment statistics">
          <StatCard
            title="Active Profiles"
            value={stats.totalProfiles}
            icon={FileText}
            variant="info"
          />
          <StatCard
            title="Platforms"
            value={stats.platforms}
            icon={Settings2}
            variant="success"
          />
          <StatCard
            title="Pending"
            value={stats.pendingEnrollments}
            icon={UserPlus}
            variant="warning"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon={QrCode}
            variant="default"
          />
        </section>

        {/* Platform Tabs */}
        <section
          className="flex flex-wrap w-full rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm p-1.5 shadow-sm gap-1"
          role="tablist"
          aria-label="Filter by platform"
        >
          {(['android', 'ios', 'windows', 'macos', 'linux'] as Platform[]).map((platform) => {
            const config = platformConfig[platform];
            const Icon = config.icon;
            const isActive = selectedPlatform === platform;
            return (
              <button
                key={platform}
                role="tab"
                aria-selected={isActive}
                onClick={() => handlePlatformChange(platform)}
                className={cn(
                  "flex-1 min-w-fit relative inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive && "bg-background text-foreground shadow-md border border-border/50 backdrop-blur-md",
                  !isActive &&
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {config.asset ? (
                  <img src={config.asset} alt={config.label} className="w-5 h-5 object-contain" />
                ) : (
                  <Icon className="w-4 h-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">
                  {config.label}
                </span>
              </button>
            );
          })}
        </section>

        {/* Filters */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Profile Selection */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">Select Profile:</span>
            <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
              <SelectTrigger id="profile-filter" className="w-full md:w-[300px] bg-background" disabled={loading || profiles.length === 0}>
                <SelectValue placeholder={loading ? "Loading..." : "Select Profile"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && <span className="text-sm text-muted-foreground animate-pulse">Fetching profiles...</span>}
        </div>

        <div className="mt-6">
          {loading ? (
            <LoadingAnimation message="Loading enrollment profiles..." className="min-h-[400px]" />
          ) : currentProfile ? (
            <div className="space-y-6">
              {/* Row 1: QR Code & Profile Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Code Display */}
                <section className="panel" aria-label="QR Code">
                  <div className="panel__header flex justify-between items-center">
                    <h3 className="panel__title flex items-center gap-2">
                      <QrCode className="w-5 h-5" aria-hidden="true" />
                      {t('enrollment.qrCode')}
                    </h3>
                  </div>
                  <div className="panel__content">
                    <div className="text-center relative">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative mx-auto w-48 h-48 rounded-lg overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-110 shadow-sm hover:shadow-md bg-white p-2">
                            <div className="w-full h-full">
                              {renderQrContent()}
                            </div>
                            {/* Hover overlay hint */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                              <ZoomIn className="w-8 h-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Enrollment QR Code</DialogTitle>
                          </DialogHeader>
                          <div className="flex items-center justify-center p-4">
                            <div className="w-96 h-96 bg-white">
                              {renderQrContent()}
                            </div>
                          </div>
                          <div className="text-center text-sm text-muted-foreground break-all px-4">
                            {getEnrollmentUrl()}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <p className="text-xs text-muted-foreground mt-3 font-mono break-all px-2">
                        {getEnrollmentUrl()}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <Button
                        onClick={handleDownloadQR}
                        className="flex-1"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                        {t('enrollment.downloadQR')}
                      </Button>
                      <Button
                        onClick={handleCopyEnrollmentData}
                        className="flex-1"
                        variant="outline"
                        aria-live="polite"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 mr-2" aria-hidden="true" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
                        )}
                        {copied ? t('enrollment.copied') : t('enrollment.copyData')}
                      </Button>
                    </div>
                  </div>
                </section>

                {/* Profile Details */}
                <section className="panel" aria-label="Profile details">
                  <div className="panel__header">
                    <h3 className="panel__title flex items-center gap-2">
                      <Info className="w-5 h-5" aria-hidden="true" />
                      Profile Details
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table" role="table">
                      <thead>
                        <tr>
                          <th scope="col">Field</th>
                          <th scope="col">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="text-muted-foreground">Name</td>
                          <td className="font-medium text-foreground">{currentProfile.name}</td>
                        </tr>
                        <tr>
                          <td className="text-muted-foreground">Description</td>
                          <td className="font-medium text-foreground">{currentProfile.description || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted-foreground">Status</td>
                          <td>
                            <span className="status-badge status-badge--compliant">
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              {(currentProfile as any).status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted-foreground">Version</td>
                          <td className="font-medium text-foreground">{(currentProfile as any).version ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted-foreground">Device Count</td>
                          <td className="font-medium text-foreground">{(currentProfile as any).deviceCount ?? 0}</td>
                        </tr>
                        <tr>
                          <td className="text-muted-foreground">Profile Type</td>
                          <td className="font-medium text-foreground">{(currentProfile as any).profileType || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* Row 2: Mandatory Apps & Enabled Policies */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enabled Policies */}
                <section className="panel" aria-label="Enabled policies">
                  <div className="panel__header">
                    <h3 className="panel__title">Enabled Policies</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table" role="table">
                      <thead>
                        <tr>
                          <th scope="col">Policy</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const policies: { label: string }[] = [];
                          const p = currentProfile as any;

                          if (p.passCodePolicy && typeof p.passCodePolicy === 'object' && Object.keys(p.passCodePolicy).length > 0)
                            policies.push({ label: p.passCodePolicy.name || 'Passcode Policy' });

                          if (p.scepPolicy && typeof p.scepPolicy === 'object' && Object.keys(p.scepPolicy).length > 0)
                            policies.push({ label: p.scepPolicy.scepName || p.scepPolicy.name || 'SCEP Policy' });

                          if (p.mdmPolicy && typeof p.mdmPolicy === 'object' && Object.keys(p.mdmPolicy).length > 0)
                            policies.push({ label: 'MDM Configuration' });

                          if (Array.isArray(p.applicationPolicies) && p.applicationPolicies.length > 0)
                            policies.push({ label: `Application Policies (${p.applicationPolicies.length})` });

                          if (Array.isArray(p.webClipPolicies) && p.webClipPolicies.length > 0)
                            policies.push({ label: `Web Clip Policies (${p.webClipPolicies.length})` });

                          if (Array.isArray(p.notificationPolicies) && p.notificationPolicies.length > 0)
                            policies.push({ label: `Notification Policies (${p.notificationPolicies.length})` });

                          if (Array.isArray(p.rootCertPolicies) && p.rootCertPolicies.length > 0)
                            policies.push({ label: `Root Certificate Policies (${p.rootCertPolicies.length})` });

                          if (Array.isArray(p.pkcs12Policies) && p.pkcs12Policies.length > 0)
                            policies.push({ label: `PKCS12 Policies (${p.pkcs12Policies.length})` });

                          if (Array.isArray(p.pemPolicies) && p.pemPolicies.length > 0)
                            policies.push({ label: `PEM Policies (${p.pemPolicies.length})` });

                          if (Array.isArray(p.pkcs1Policies) && p.pkcs1Policies.length > 0)
                            policies.push({ label: `PKCS1 Policies (${p.pkcs1Policies.length})` });

                          if (p.wifiPolicy && typeof p.wifiPolicy === 'object' && Object.keys(p.wifiPolicy).length > 0)
                            policies.push({ label: p.wifiPolicy.name || 'WiFi Policy' });

                          if (p.mailPolicy && typeof p.mailPolicy === 'object' && Object.keys(p.mailPolicy).length > 0)
                            policies.push({ label: p.mailPolicy.name || 'Mail Policy' });

                          if (p.lockScreenPolicy && typeof p.lockScreenPolicy === 'object' && Object.keys(p.lockScreenPolicy).length > 0)
                            policies.push({ label: p.lockScreenPolicy.name || 'Lock Screen Policy' });

                          if (policies.length === 0) {
                            return (
                              <tr>
                                <td colSpan={2} className="text-muted-foreground italic text-center">No policies enabled</td>
                              </tr>
                            );
                          }

                          return policies.map((pol, i) => (
                            <tr key={i}>
                              <td className="font-medium text-foreground">{pol.label}</td>
                              <td>
                                <span className="status-badge status-badge--compliant">
                                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                  Enabled
                                </span>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Mandatory Apps */}
                <section className="panel" aria-label="Mandatory applications">
                  <div className="panel__header">
                    <h3 className="panel__title">{t('enrollment.mandatoryApps')}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table" role="table">
                      <thead>
                        <tr>
                          <th scope="col">Application</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProfile.config?.mandatoryApps?.map((app, i) => (
                          <tr key={i}>
                            <td className="font-medium text-foreground">{app}</td>
                            <td>
                              <span className="status-badge status-badge--compliant">
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                Required
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* Bottom Row: Steps */}
              {/* Enrollment Steps */}
              <section className="panel" aria-label="Enrollment steps">
                <div className="panel__header">
                  <h3 className="panel__title">
                    {t('enrollment.stepsTitle')}
                  </h3>
                </div>
                <div className="panel__content">
                  <ol className="space-y-3" role="list">
                    {steps.map((step, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm"
                      >
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium"
                          aria-hidden="true"
                        >
                          {index + 1}
                        </span>
                        <span className="pt-0.5 text-foreground leading-relaxed">
                          {language === 'hi' ? step.hi : step.en}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            </div>
          ) : profiles.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/10 mx-auto max-w-2xl px-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <MousePointer2 className="w-12 h-12 text-primary opacity-80" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Select a Profile</h3>
              <p className="mb-6 max-w-md mx-auto leading-relaxed">
                Please select an enrollment profile from the dropdown menu above to view its details and configuration options.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/10 mx-auto max-w-2xl px-6">
              <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                <FileSearch className="w-12 h-12 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Profiles Found</h3>
              <p className="mb-6 max-w-md mx-auto leading-relaxed">
                There are currently no published enrollment profiles available for <span className="font-medium text-foreground">{platformConfig[selectedPlatform].label}</span>.
                Contact your administrator or create a new profile in the dashboard.
              </p>
              <Button
                variant="outline"
                onClick={() => fetchProfiles(selectedPlatform)}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh List
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout >
  );
}
