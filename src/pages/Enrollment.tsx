import { StatCard } from '@/components/dashboard/StatCard';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
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
  UserPlus
} from 'lucide-react';
import { useState } from 'react';

type Platform = 'android' | 'ios' | 'windows' | 'macos' | 'linux';

interface EnrollmentProfile {
  id: string;
  name: string;
  description: string;
  config: {
    wifiSSID: string;
    vpnEnabled: boolean;
    vpnServer?: string;
    mandatoryApps: string[];
    restrictions: string[];
  };
}

const profiles: Record<Platform, EnrollmentProfile[]> = {
  android: [
    {
      id: 'android-standard',
      name: 'Standard Enterprise',
      description: 'Default Android enterprise profile',
      config: {
        wifiSSID: 'CDOT-Enterprise',
        vpnEnabled: true,
        vpnServer: 'vpn.cdot.in',
        mandatoryApps: ['Microsoft Outlook', 'Microsoft Teams', 'Company Portal'],
        restrictions: ['Camera disabled in work profile', 'USB debugging disabled'],
      },
    },
    {
      id: 'android-kiosk',
      name: 'Kiosk Mode',
      description: 'Locked-down single-app mode',
      config: {
        wifiSSID: 'CDOT-Kiosk',
        vpnEnabled: false,
        mandatoryApps: ['Kiosk App'],
        restrictions: ['Single app mode', 'Navigation disabled', 'Status bar hidden'],
      },
    },
  ],
  ios: [
    {
      id: 'ios-standard',
      name: 'Standard Enterprise',
      description: 'Default iOS enterprise profile',
      config: {
        wifiSSID: 'CDOT-Enterprise',
        vpnEnabled: true,
        vpnServer: 'vpn.cdot.in',
        mandatoryApps: ['Microsoft Outlook', 'Microsoft Teams'],
        restrictions: ['iCloud backup disabled', 'App Store restricted'],
      },
    },
  ],
  windows: [
    {
      id: 'windows-standard',
      name: 'Domain Join',
      description: 'Azure AD join with Autopilot',
      config: {
        wifiSSID: 'CDOT-Enterprise',
        vpnEnabled: true,
        vpnServer: 'vpn.cdot.in',
        mandatoryApps: ['Microsoft 365', 'Defender', 'Company Portal'],
        restrictions: ['BitLocker required', 'Windows Hello required'],
      },
    },
  ],
  macos: [
    {
      id: 'macos-standard',
      name: 'Standard Enterprise',
      description: 'Default macOS enterprise profile',
      config: {
        wifiSSID: 'CDOT-Enterprise',
        vpnEnabled: true,
        vpnServer: 'vpn.cdot.in',
        mandatoryApps: ['Microsoft 365', 'Company Portal'],
        restrictions: ['FileVault required', 'Gatekeeper enabled'],
      },
    },
  ],
  linux: [
    {
      id: 'linux-standard',
      name: 'Standard Workstation',
      description: 'Ubuntu/RHEL workstation profile',
      config: {
        wifiSSID: 'CDOT-Enterprise',
        vpnEnabled: true,
        vpnServer: 'vpn.cdot.in',
        mandatoryApps: ['Intune Agent', 'OpenVPN'],
        restrictions: ['Root access restricted', 'USB storage disabled'],
      },
    },
  ],
};

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

const platformIcons: Record<Platform, React.ElementType> = {
  android: Smartphone,
  ios: Smartphone,
  windows: Laptop,
  macos: Laptop,
  linux: Server,
};

export default function Enrollment() {
  const { t, language } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('android');
  const [selectedProfile, setSelectedProfile] = useState<string>(profiles.android[0].id);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentProfiles = profiles[selectedPlatform];
  const currentProfile = currentProfiles.find(p => p.id === selectedProfile) || currentProfiles[0];
  const steps = enrollmentSteps[selectedPlatform];

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform as Platform);
    setSelectedProfile(profiles[platform as Platform][0].id);
  };

  const handleCopyEnrollmentData = async () => {
    const data = {
      platform: selectedPlatform,
      profile: currentProfile.name,
      enrollmentUrl: `https://enroll.cdot.in/${selectedPlatform}/${currentProfile.id}`,
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

  const handleDownloadQR = () => {
    toast({
      title: t('enrollment.downloading'),
      description: t('enrollment.downloadingDesc'),
    });
  };

  const qrCodeData = `https://enroll.cdot.in/${selectedPlatform}/${currentProfile.id}`;

  // Stats for the enrollment module
  const stats = {
    totalProfiles: Object.values(profiles).flat().length,
    platforms: 5,
    pendingEnrollments: 12,
    completedToday: 8,
  };

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
        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Enrollment statistics">
          <StatCard
            title="Total Profiles"
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
              const Icon = platformIcons[platform];
              return (
                <TabsTrigger
                  key={platform}
                  value={platform}
                  className="flex items-center gap-2 data-[state=active]:bg-background"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Filters */}
          {/* Profile Selection */}
          <div className="mt-6">
            <Select value={selectedProfile} onValueChange={setSelectedProfile}>
              <SelectTrigger id="profile-filter" className="w-[300px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {currentProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(['android', 'ios', 'windows', 'macos', 'linux'] as Platform[]).map((platform) => (
            <TabsContent key={platform} value={platform} className="mt-6">
              <div className="space-y-6">
                {/* Top Row: QR Code & Profile Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* QR Code Display */}
                  <section className="panel" aria-label="QR Code">
                    <div className="panel__header">
                      <h3 className="panel__title flex items-center gap-2">
                        <QrCode className="w-5 h-5" aria-hidden="true" />
                        {t('enrollment.qrCode')}
                      </h3>
                    </div>
                    <div className="panel__content">
                      <div className="text-center">
                        <div
                          className="mx-auto w-48 h-48 bg-background border-2 border-border rounded-lg flex items-center justify-center"
                          role="img"
                          aria-label={`${t('enrollment.qrCodeAlt')} ${currentProfile.name}`}
                        >
                          <div className="w-40 h-40 bg-foreground p-2">
                            <div className="w-full h-full bg-background grid grid-cols-8 gap-0.5">
                              {Array.from({ length: 64 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`${Math.random() > 0.5 ? 'bg-foreground' : 'bg-background'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 font-mono break-all">
                          {qrCodeData}
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
                          <dd className="font-mono">{currentProfile.config.wifiSSID}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="text-muted-foreground">{t('enrollment.vpnStatus')}</dt>
                          <dd>{currentProfile.config.vpnEnabled ? t('enrollment.enabled') : t('enrollment.disabled')}</dd>
                        </div>
                        {currentProfile.config.vpnServer && (
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
                          {currentProfile.config.mandatoryApps.map((app, i) => (
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
                        {currentProfile.config.restrictions.map((restriction, i) => (
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
