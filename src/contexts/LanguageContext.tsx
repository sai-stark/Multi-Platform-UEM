import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

const translations: Translations = {
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'nav.devices': { en: 'Devices', hi: 'उपकरण' },
  'nav.applications': { en: 'Applications', hi: 'अनुप्रयोग' },
  'nav.policies': { en: 'Policies', hi: 'नीतियाँ' },
  'nav.users': { en: 'Users', hi: 'उपयोगकर्ता' },
  'nav.reports': { en: 'Reports', hi: 'रिपोर्ट' },
  'nav.settings': { en: 'Settings', hi: 'सेटिंग्स' },
  'dashboard.title': { en: 'UEM Dashboard', hi: 'UEM डैशबोर्ड' },
  'dashboard.totalDevices': { en: 'Total Devices', hi: 'कुल उपकरण' },
  'dashboard.compliant': { en: 'Compliant', hi: 'अनुपालक' },
  'dashboard.nonCompliant': { en: 'Non-Compliant', hi: 'गैर-अनुपालक' },
  'dashboard.pending': { en: 'Pending', hi: 'लंबित' },
  'dashboard.platformDistribution': { en: 'Platform Distribution', hi: 'प्लेटफ़ॉर्म वितरण' },
  'dashboard.complianceOverview': { en: 'Compliance Overview', hi: 'अनुपालन अवलोकन' },
  'dashboard.recentActivity': { en: 'Recent Activity', hi: 'हाल की गतिविधि' },
  'dashboard.storageUsage': { en: 'Storage Usage', hi: 'स्टोरेज उपयोग' },
  'filter.platform': { en: 'Platform', hi: 'प्लेटफ़ॉर्म' },
  'filter.compliance': { en: 'Compliance', hi: 'अनुपालन' },
  'filter.status': { en: 'Status', hi: 'स्थिति' },
  'filter.all': { en: 'All', hi: 'सभी' },
  'accessibility.title': { en: 'Accessibility Options', hi: 'पहुँच विकल्प' },
  'accessibility.fontSize': { en: 'Font Size', hi: 'फ़ॉन्ट आकार' },
  'accessibility.greyscale': { en: 'Greyscale View', hi: 'ग्रेस्केल दृश्य' },
  'accessibility.underlineLinks': { en: 'Underline Links', hi: 'लिंक रेखांकित करें' },
  'accessibility.darkMode': { en: 'Dark Mode', hi: 'डार्क मोड' },
  'accessibility.highContrast': { en: 'High Contrast', hi: 'उच्च कंट्रास्ट' },
  'accessibility.readAloud': { en: 'Read Aloud', hi: 'जोर से पढ़ें' },
  'accessibility.reset': { en: 'Reset to Default', hi: 'डिफ़ॉल्ट पर रीसेट' },
  'accessibility.help': { en: 'Accessibility Help', hi: 'पहुँच सहायता' },
  'table.deviceName': { en: 'Device Name', hi: 'उपकरण का नाम' },
  'table.platform': { en: 'Platform', hi: 'प्लेटफ़ॉर्म' },
  'table.owner': { en: 'Owner', hi: 'मालिक' },
  'table.lastSync': { en: 'Last Sync', hi: 'अंतिम सिंक' },
  'table.complianceStatus': { en: 'Compliance Status', hi: 'अनुपालन स्थिति' },
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
