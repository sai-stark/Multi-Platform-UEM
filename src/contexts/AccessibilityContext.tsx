import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  greyscale: boolean;
  underlineLinks: boolean;
  darkMode: boolean;
  highContrast: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleGreyscale: () => void;
  toggleUnderlineLinks: () => void;
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
  resetToDefaults: () => void;
  speakText: (text: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'medium',
  greyscale: false,
  underlineLinks: false,
  darkMode: false,
  highContrast: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('uem-accessibility');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('uem-accessibility', JSON.stringify(settings));
    
    // Apply font size
    const root = document.documentElement;
    const fontSizes = { small: '14px', medium: '16px', large: '20px' };
    root.style.fontSize = fontSizes[settings.fontSize];
    
    // Apply greyscale
    root.style.filter = settings.greyscale ? 'grayscale(100%)' : 'none';
    
    // Apply dark mode
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply underline links
    if (settings.underlineLinks) {
      root.classList.add('underline-links');
    } else {
      root.classList.remove('underline-links');
    }

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [settings]);

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const toggleGreyscale = () => {
    setSettings(prev => ({ ...prev, greyscale: !prev.greyscale }));
  };

  const toggleUnderlineLinks = () => {
    setSettings(prev => ({ ...prev, underlineLinks: !prev.underlineLinks }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        setFontSize,
        toggleGreyscale,
        toggleUnderlineLinks,
        toggleDarkMode,
        toggleHighContrast,
        resetToDefaults,
        speakText,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
