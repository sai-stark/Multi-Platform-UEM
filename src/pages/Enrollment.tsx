import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Smartphone, 
  Laptop, 
  Server,
  Download,
  Copy,
  Check,
  Info
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

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
    
    // ARIA-live feedback
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

  // Generate QR code placeholder (in production, use a proper QR library)
  const qrCodeData = `https://enroll.cdot.in/${selectedPlatform}/${currentProfile.id}`;

  return (
    <MainLayout>
    <div className="space-y-6">
      {/* Page Header */}
      <header>
        <h1 className="text-2xl font-semibold text-foreground">
          {t('enrollment.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('enrollment.subtitle')}
        </p>
      </header>

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

        {(['android', 'ios', 'windows', 'macos', 'linux'] as Platform[]).map((platform) => (
          <TabsContent key={platform} value={platform} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: QR Code & Actions */}
              <div className="space-y-6">
                {/* Profile Selection */}
                <div className="panel">
                  <label htmlFor="profile-select" className="block text-sm font-medium mb-2">
                    {t('enrollment.selectProfile')}
                  </label>
                  <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                    <SelectTrigger id="profile-select" className="w-full">
                      <SelectValue placeholder={t('enrollment.selectProfile')} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border">
                      {profiles[platform].map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentProfile.description}
                  </p>
                </div>

                {/* QR Code Display */}
                <div className="panel text-center">
                  <h3 className="text-lg font-semibold mb-4">{t('enrollment.qrCode')}</h3>
                  <div 
                    className="mx-auto w-48 h-48 bg-background border-2 border-border rounded-lg flex items-center justify-center"
                    role="img"
                    aria-label={`${t('enrollment.qrCodeAlt')} ${currentProfile.name}`}
                  >
                    {/* QR Code Placeholder - In production use qrcode.react */}
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
                <div className="flex flex-col sm:flex-row gap-3">
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

              {/* Right Column: Profile Info & Steps */}
              <div className="space-y-6">
                {/* Profile Configuration */}
                <div className="panel">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" aria-hidden="true" />
                    {t('enrollment.profileInfo')}
                  </h3>
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
                    <div className="py-2 border-b border-border">
                      <dt className="text-muted-foreground mb-2">{t('enrollment.mandatoryApps')}</dt>
                      <dd>
                        <ul className="list-disc list-inside text-foreground">
                          {currentProfile.config.mandatoryApps.map((app, i) => (
                            <li key={i}>{app}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-muted-foreground mb-2">{t('enrollment.restrictions')}</dt>
                      <dd>
                        <ul className="list-disc list-inside text-foreground">
                          {currentProfile.config.restrictions.map((restriction, i) => (
                            <li key={i}>{restriction}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Enrollment Steps */}
                <div className="panel">
                  <h3 className="text-lg font-semibold mb-4">
                    {t('enrollment.stepsTitle')}
                  </h3>
                  <ol className="space-y-3" role="list">
                    {steps.map((step, index) => (
                      <li 
                        key={index} 
                        className="flex gap-3 text-sm"
                      >
                        <span 
                          className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium"
                          aria-hidden="true"
                        >
                          {index + 1}
                        </span>
                        <span className="pt-0.5">{step[language]}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
    </MainLayout>
  );
}
