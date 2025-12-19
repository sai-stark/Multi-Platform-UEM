import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'nav.devices': { en: 'Devices', hi: 'उपकरण' },
  'nav.deviceManagement': { en: 'Device Management', hi: 'उपकरण प्रबंधन' },
  'nav.enrollment': { en: 'Enrollment', hi: 'नामांकन' },
  'nav.applications': { en: 'Applications', hi: 'अनुप्रयोग' },
  'nav.webApplications': { en: 'Web Applications', hi: 'वेब अनुप्रयोग' },
  'nav.policies': { en: 'Policies', hi: 'नीतियाँ' },
  'nav.users': { en: 'Users', hi: 'उपयोगकर्ता' },
  'nav.reports': { en: 'Reports', hi: 'रिपोर्ट' },
  'nav.settings': { en: 'Settings', hi: 'सेटिंग्स' },
  
  // Dashboard
  'dashboard.title': { en: 'UEM Dashboard', hi: 'UEM डैशबोर्ड' },
  'dashboard.totalDevices': { en: 'Total Devices', hi: 'कुल उपकरण' },
  'dashboard.compliant': { en: 'Compliant', hi: 'अनुपालक' },
  'dashboard.nonCompliant': { en: 'Non-Compliant', hi: 'गैर-अनुपालक' },
  'dashboard.pending': { en: 'Pending', hi: 'लंबित' },
  'dashboard.platformDistribution': { en: 'Platform Distribution', hi: 'प्लेटफ़ॉर्म वितरण' },
  'dashboard.complianceOverview': { en: 'Compliance Overview', hi: 'अनुपालन अवलोकन' },
  'dashboard.recentActivity': { en: 'Recent Activity', hi: 'हाल की गतिविधि' },
  'dashboard.storageUsage': { en: 'Storage Usage', hi: 'स्टोरेज उपयोग' },
  
  // Filters
  'filter.platform': { en: 'Platform', hi: 'प्लेटफ़ॉर्म' },
  'filter.compliance': { en: 'Compliance', hi: 'अनुपालन' },
  'filter.status': { en: 'Status', hi: 'स्थिति' },
  'filter.all': { en: 'All', hi: 'सभी' },
  
  // Accessibility
  'accessibility.title': { en: 'Accessibility Options', hi: 'पहुँच विकल्प' },
  'accessibility.fontSize': { en: 'Font Size', hi: 'फ़ॉन्ट आकार' },
  'accessibility.greyscale': { en: 'Greyscale View', hi: 'ग्रेस्केल दृश्य' },
  'accessibility.underlineLinks': { en: 'Underline Links', hi: 'लिंक रेखांकित करें' },
  'accessibility.darkMode': { en: 'Dark Mode', hi: 'डार्क मोड' },
  'accessibility.highContrast': { en: 'High Contrast', hi: 'उच्च कंट्रास्ट' },
  'accessibility.readAloud': { en: 'Read Aloud', hi: 'जोर से पढ़ें' },
  'accessibility.reset': { en: 'Reset to Default', hi: 'डिफ़ॉल्ट पर रीसेट' },
  'accessibility.help': { en: 'Accessibility Help', hi: 'पहुँच सहायता' },
  
  // Table Headers
  'table.deviceName': { en: 'Device Name', hi: 'उपकरण का नाम' },
  'table.platform': { en: 'Platform', hi: 'प्लेटफ़ॉर्म' },
  'table.owner': { en: 'Owner', hi: 'मालिक' },
  'table.lastSync': { en: 'Last Sync', hi: 'अंतिम सिंक' },
  'table.complianceStatus': { en: 'Compliance Status', hi: 'अनुपालन स्थिति' },
  
  // Device Management Module
  'deviceMgmt.title': { en: 'Device Management', hi: 'उपकरण प्रबंधन' },
  'deviceMgmt.subtitle': { en: 'Monitor and manage all enrolled endpoints', hi: 'सभी नामांकित एंडपॉइंट्स की निगरानी और प्रबंधन करें' },
  'deviceMgmt.platformFilter': { en: 'Filter by platform', hi: 'प्लेटफ़ॉर्म द्वारा फ़िल्टर करें' },
  'deviceMgmt.kpiSection': { en: 'Key Performance Indicators', hi: 'प्रमुख प्रदर्शन संकेतक' },
  'deviceMgmt.chartsSection': { en: 'Data Visualization', hi: 'डेटा विज़ुअलाइज़ेशन' },
  'deviceMgmt.totalDevices': { en: 'Total Devices', hi: 'कुल उपकरण' },
  'deviceMgmt.online': { en: 'Online', hi: 'ऑनलाइन' },
  'deviceMgmt.offline': { en: 'Offline', hi: 'ऑफ़लाइन' },
  'deviceMgmt.nonCompliant': { en: 'Non-Compliant', hi: 'गैर-अनुपालक' },
  'deviceMgmt.pendingActions': { en: 'Pending Actions', hi: 'लंबित कार्रवाइयाँ' },
  'deviceMgmt.complianceDistribution': { en: 'Compliance Distribution', hi: 'अनुपालन वितरण' },
  'deviceMgmt.osVersionSpread': { en: 'OS Version Spread', hi: 'OS संस्करण विस्तार' },
  'deviceMgmt.deviceList': { en: 'Device List', hi: 'उपकरण सूची' },
  'deviceMgmt.deviceId': { en: 'Device ID', hi: 'उपकरण आईडी' },
  'deviceMgmt.userOwner': { en: 'User/Owner', hi: 'उपयोगकर्ता/मालिक' },
  'deviceMgmt.osVersion': { en: 'OS Version', hi: 'OS संस्करण' },
  'deviceMgmt.complianceStatus': { en: 'Compliance Status', hi: 'अनुपालन स्थिति' },
  'deviceMgmt.lastSync': { en: 'Last Sync', hi: 'अंतिम सिंक' },
  'deviceMgmt.actions': { en: 'Actions', hi: 'कार्रवाइयाँ' },
  'deviceMgmt.actionsFor': { en: 'Actions for', hi: 'के लिए कार्रवाइयाँ' },
  'deviceMgmt.viewDetails': { en: 'View Details', hi: 'विवरण देखें' },
  'deviceMgmt.lockDevice': { en: 'Lock Device', hi: 'उपकरण लॉक करें' },
  'deviceMgmt.wipeDevice': { en: 'Wipe Device', hi: 'उपकरण मिटाएं' },
  'deviceMgmt.viewAsTable': { en: 'View as table', hi: 'तालिका के रूप में देखें' },
  'deviceMgmt.status': { en: 'Status', hi: 'स्थिति' },
  'deviceMgmt.count': { en: 'Count', hi: 'गिनती' },
  'deviceMgmt.percentage': { en: 'Percentage', hi: 'प्रतिशत' },
  'deviceMgmt.deviceCount': { en: 'Device Count', hi: 'उपकरण गिनती' },
  'deviceMgmt.osVersionTable': { en: 'OS Version Distribution Table', hi: 'OS संस्करण वितरण तालिका' },
  'deviceMgmt.complianceChartAlt': { en: 'Donut chart showing device compliance distribution', hi: 'उपकरण अनुपालन वितरण दिखाने वाला डोनट चार्ट' },
  'deviceMgmt.osChartAlt': { en: 'Bar chart showing OS version distribution', hi: 'OS संस्करण वितरण दिखाने वाला बार चार्ट' },
  
  // Enrollment Module
  'enrollment.title': { en: 'Device Enrollment', hi: 'उपकरण नामांकन' },
  'enrollment.subtitle': { en: 'Provision and onboard new enterprise devices', hi: 'नए एंटरप्राइज़ उपकरणों का प्रावधान और ऑनबोर्डिंग' },
  'enrollment.selectProfile': { en: 'Select Enrollment Profile', hi: 'नामांकन प्रोफ़ाइल चुनें' },
  'enrollment.qrCode': { en: 'Enrollment QR Code', hi: 'नामांकन QR कोड' },
  'enrollment.qrCodeAlt': { en: 'QR code for enrolling devices with profile', hi: 'प्रोफ़ाइल के साथ उपकरण नामांकित करने के लिए QR कोड' },
  'enrollment.downloadQR': { en: 'Download QR (PNG)', hi: 'QR डाउनलोड करें (PNG)' },
  'enrollment.copyData': { en: 'Copy Enrollment Data', hi: 'नामांकन डेटा कॉपी करें' },
  'enrollment.copied': { en: 'Copied!', hi: 'कॉपी हो गया!' },
  'enrollment.copiedDesc': { en: 'Enrollment data copied to clipboard', hi: 'नामांकन डेटा क्लिपबोर्ड पर कॉपी हो गया' },
  'enrollment.downloading': { en: 'Downloading...', hi: 'डाउनलोड हो रहा है...' },
  'enrollment.downloadingDesc': { en: 'QR code will be downloaded shortly', hi: 'QR कोड जल्द ही डाउनलोड हो जाएगा' },
  'enrollment.profileInfo': { en: 'Profile Configuration', hi: 'प्रोफ़ाइल कॉन्फ़िगरेशन' },
  'enrollment.wifiSSID': { en: 'Wi-Fi SSID', hi: 'वाई-फाई SSID' },
  'enrollment.vpnStatus': { en: 'VPN', hi: 'VPN' },
  'enrollment.vpnServer': { en: 'VPN Server', hi: 'VPN सर्वर' },
  'enrollment.enabled': { en: 'Enabled', hi: 'सक्षम' },
  'enrollment.disabled': { en: 'Disabled', hi: 'अक्षम' },
  'enrollment.mandatoryApps': { en: 'Mandatory Apps', hi: 'अनिवार्य ऐप्स' },
  'enrollment.restrictions': { en: 'Restrictions', hi: 'प्रतिबंध' },
  'enrollment.stepsTitle': { en: 'Steps to Enroll', hi: 'नामांकन के चरण' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('uem-language');
    return (saved as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('uem-language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
