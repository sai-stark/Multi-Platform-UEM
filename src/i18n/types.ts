// Translation types for i18n system

export type Language = 'en' | 'hi';

export interface TranslationRecord {
    [key: string]: string;
}

export interface Translations {
    common: TranslationRecord;
    navigation: TranslationRecord;
    dashboard: TranslationRecord;
    profiles: TranslationRecord;
    policies: TranslationRecord;
    validation: TranslationRecord;
}

export interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}
