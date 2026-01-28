// Main i18n module - exports LanguageProvider and useLanguage hook
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { Language, LanguageContextType } from './types';

// Combined translations object
const translations: Record<Language, Record<string, string>> = {
  en,
  hi,
};

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language Provider component
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
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Re-export types
export type { Language, LanguageContextType } from './types';
