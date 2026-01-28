// Re-export from the new i18n module for backward compatibility
// This allows existing imports from '@/contexts/LanguageContext' to continue working

export { LanguageProvider, useLanguage } from '@/i18n';
export type { Language, LanguageContextType } from '@/i18n';
