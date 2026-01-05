import { EnrollmentProfile, EnrollmentService } from '@/api/services/enrollmentService';
import { LoadingAnimation } from '@/components/common/LoadingAnimation';
import { StatCard } from '@/components/dashboard/StatCard';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { getAssetUrl } from '@/config/env';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Platform } from '@/types/models';
import {
  Check,
  Copy,
  Download,
  FileText,
  Info,
  Laptop,
  QrCode,
  Server,
  Settings2,
  Smartphone,
  UserPlus,
  ZoomIn
} from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

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
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('android');
  const [profiles, setProfiles] = useState<EnrollmentProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isQrVisible, setIsQrVisible] = useState(false);

  const steps = enrollmentSteps[selectedPlatform];
  const currentProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

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
      setIsQrVisible(false); // Reset QR visibility on profile change
    }
  }, [selectedProfileId, selectedPlatform]); // Depend on IDs, not the object itself to avoid loops if object references change

  const fetchProfiles = async (platform: Platform) => {
    setLoading(true);
    try {
      const data = await EnrollmentService.getProfiles(platform);
      setProfiles(data);
      if (data.length > 0) {
        setSelectedProfileId(data[0].id);
      } else {
        setSelectedProfileId('');
      }
    } catch (error) {
      console.error('Failed to fetch profiles', error);
      toast({
        title: "Error",
        description: "Failed to fetch enrollment profiles",
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
          return {
            ...p,
            ...details, // Merge details
            config: { // Map details to config for UI compatibility
              wifiSSID: details.wifiPolicy?.ssid || p.config?.wifiSSID || 'Not Configured',
              vpnEnabled: !!details.mailPolicy?.vpnUUID || !!details.wifiPolicy?.ssid || false, // Heuristic based on provided JSON
              vpnServer: details.mailPolicy?.incomingMailServerHostName || 'N/A', // Just a guess from sample
              mandatoryApps: details.applicationPolicies?.filter(app => app.action === 'INSTALL').map(app => app.bundleIdentifier || app.name || 'Unknown App') || [],
              restrictions: [
                details.passCodePolicy?.requirePassCode ? 'Passcode Required' : '',
                details.lockScreenPolicy?.lockScreenFootnote ? `Lock Screen: ${details.lockScreenPolicy.lockScreenFootnote}` : '',
                details.webClipPolicies?.length ? `${details.webClipPolicies.length} Web Clips` : ''
              ].filter(Boolean)
            }
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
      setQrCodeData(data);
    } catch (error) {
      console.error('Failed to fetch QR code', error);
    }
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform as Platform);
  };

  const handleCopyEnrollmentData = async () => {
    const data = {
      platform: selectedPlatform,
      profile: currentProfile?.name,
      enrollmentUrl: `https://enroll.cdot.in/${selectedPlatform}/${currentProfile?.id}`,
      // qrData: qrCodeData, // Optional: Include raw QR data if needed
      timestamp: new Date().toISOString(),
    };

    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);

    toast({
      title: t('enrollment.copied'),
      description: t('enrollment.copiedDesc'),
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    if (!currentProfile) return;

    try {
      toast({
        title: t('enrollment.downloading'),
        description: t('enrollment.downloadingDesc'),
      });

      const downloadUrl = await EnrollmentService.downloadProfile(selectedPlatform, currentProfile.id);
      // Create a temporary link to download
      const link = document.createElement('a');
      link.href = downloadUrl; // Assuming downloadUrl is a valid URL string or blob URL
      link.download = `profile-${currentProfile.id}.json`; // Or relevant extension
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
      toast({
        title: "Error",
        description: "Failed to download profile",
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
              className={`${Math.random() > 0.5 ? 'bg-gray-200' : 'bg-transparent'}`}
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
        <Tabs value={selectedPlatform} onValueChange={handlePlatformChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted">
            {(['android', 'ios', 'windows', 'macos', 'linux'] as Platform[]).map((platform) => {
              const config = platformConfig[platform];
              const Icon = config.icon;
              return (
                <TabsTrigger
                  key={platform}
                  value={platform}
                  className="flex items-center gap-2 data-[state=active]:bg-background"
                >
                  {config.asset ? (
                    <img src={config.asset} alt={config.label} className="w-4 h-4 object-contain" />
                  ) : (
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">
                    {config.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Filters */}
          <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Profile Selection */}
            <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
              <SelectTrigger id="profile-filter" className="w-[300px] bg-background" disabled={loading || profiles.length === 0}>
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

            {loading && <span className="text-sm text-muted-foreground animate-pulse">Fetching profiles...</span>}
          </div>

          <TabsContent value={selectedPlatform} className="mt-6">
            {loading ? (
              <LoadingAnimation message="Loading enrollment profiles..." className="min-h-[400px]" />
            ) : currentProfile ? (
              <div className="space-y-6">
                {/* Top Row: QR Code & Profile Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* QR Code Display */}
                  <section className="panel" aria-label="QR Code">
                    <div className="panel__header flex justify-between items-center">
                      <h3 className="panel__title flex items-center gap-2">
                        <QrCode className="w-5 h-5" aria-hidden="true" />
                        {t('enrollment.qrCode')}
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={!isQrVisible}>
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Enrollment QR Code</DialogTitle>
                          </DialogHeader>
                          <div className="flex items-center justify-center p-0">
                            <div className="w-96 h-96 bg-white">
                              {renderQrContent()}
                            </div>
                          </div>
                          <div className="text-center text-sm text-muted-foreground break-all">
                            {`https://enroll.cdot.in/${selectedPlatform}/${currentProfile.id}`}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="panel__content">
                      <div className="text-center relative">
                        <div className="relative mx-auto w-48 h-48 rounded-lg overflow-hidden group">
                          {/* Blurred Container */}
                          <div className={`w-full h-full transition-all duration-300 ${!isQrVisible ? 'blur-md opacity-50' : ''}`}>
                            {renderQrContent()}
                          </div>

                          {/* Generate Button Overlay */}
                          {!isQrVisible && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/20 z-10">
                              <Button onClick={() => setIsQrVisible(true)}>
                                Generate QR
                              </Button>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-3 font-mono break-all">
                          {`https://enroll.cdot.in/${selectedPlatform}/${currentProfile.id}`}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button
                          onClick={handleDownloadQR}
                          className="flex-1"
                          variant="outline"
                          disabled={!isQrVisible}
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

                  {/* Profile Configuration */}
                  <section className="panel" aria-label="Profile configuration">
                    <div className="panel__header">
                      <h3 className="panel__title flex items-center gap-2">
                        <Info className="w-5 h-5" aria-hidden="true" />
                        {t('enrollment.profileInfo')}
                      </h3>
                    </div>
                    <div className="panel__content">
                      <p className="text-sm text-muted-foreground mb-4">{currentProfile.description}</p>
                      <dl className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="text-muted-foreground">{t('enrollment.wifiSSID')}</dt>
                          <dd className="font-mono">{currentProfile.config?.wifiSSID || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="text-muted-foreground">{t('enrollment.vpnStatus')}</dt>
                          <dd>{currentProfile.config?.vpnEnabled ? t('enrollment.enabled') : t('enrollment.disabled')}</dd>
                        </div>
                        {currentProfile.config?.vpnServer && (
                          <div className="flex justify-between py-2 border-b border-border">
                            <dt className="text-muted-foreground">{t('enrollment.vpnServer')}</dt>
                            <dd className="font-mono">{currentProfile.config.vpnServer}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </section>
                </div>

                {/* Middle Row: Apps & Restrictions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                  {/* Restrictions */}
                  <section className="panel" aria-label="Restrictions">
                    <div className="panel__header">
                      <h3 className="panel__title">{t('enrollment.restrictions')}</h3>
                    </div>
                    <div className="panel__content">
                      <ul className="space-y-2">
                        {currentProfile.config?.restrictions?.map((restriction, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-warning" aria-hidden="true" />
                            {restriction}
                          </li>
                        ))}
                      </ul>
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
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No profiles available for this platform.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
