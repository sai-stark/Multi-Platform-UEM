import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Volume2, HelpCircle, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AccessibilityPanel() {
  const { 
    settings, 
    setFontSize, 
    toggleGreyscale, 
    toggleUnderlineLinks, 
    toggleDarkMode,
    toggleHighContrast,
    resetToDefaults,
    speakText 
  } = useAccessibility();
  const { t } = useLanguage();

  const handleReadAloud = () => {
    const mainContent = document.querySelector('main')?.textContent || '';
    speakText(mainContent.slice(0, 500));
  };

  return (
    <div className="p-4" role="region" aria-label={t('accessibility.title')}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          {t('accessibility.title')}
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8"
              aria-label={t('accessibility.help')}
            >
              <HelpCircle className="w-4 h-4" aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-popover border-border">
            <DialogHeader>
              <DialogTitle>{t('accessibility.help')}</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-3 text-sm text-muted-foreground mt-4">
                  <p><strong>Font Size:</strong> Adjust text size for better readability.</p>
                  <p><strong>Greyscale View:</strong> Display content without colors.</p>
                  <p><strong>Underline Links:</strong> Makes all links underlined for easier identification.</p>
                  <p><strong>Dark Mode:</strong> Switch between light and dark color schemes.</p>
                  <p><strong>High Contrast:</strong> Increases contrast for better visibility.</p>
                  <p><strong>Read Aloud:</strong> Uses text-to-speech to read page content.</p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1">
        {/* Font Size Control */}
        <div className="a11y-control">
          <span className="a11y-control__label">{t('accessibility.fontSize')}</span>
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Font size selection">
            <Button
              variant={settings.fontSize === 'small' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFontSize('small')}
              aria-pressed={settings.fontSize === 'small'}
              className="text-xs px-2.5 h-8"
            >
              A-
            </Button>
            <Button
              variant={settings.fontSize === 'medium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFontSize('medium')}
              aria-pressed={settings.fontSize === 'medium'}
              className="text-sm px-2.5 h-8"
            >
              A
            </Button>
            <Button
              variant={settings.fontSize === 'large' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFontSize('large')}
              aria-pressed={settings.fontSize === 'large'}
              className="text-base px-2.5 h-8"
            >
              A+
            </Button>
          </div>
        </div>

        {/* Greyscale Toggle */}
        <div className="a11y-control">
          <span className="a11y-control__label">{t('accessibility.greyscale')}</span>
          <Switch
            checked={settings.greyscale}
            onCheckedChange={toggleGreyscale}
            aria-label={`Greyscale view: ${settings.greyscale ? 'enabled' : 'disabled'}`}
          />
        </div>

        {/* Underline Links Toggle */}
        <div className="a11y-control">
          <span className="a11y-control__label">{t('accessibility.underlineLinks')}</span>
          <Switch
            checked={settings.underlineLinks}
            onCheckedChange={toggleUnderlineLinks}
            aria-label={`Underline links: ${settings.underlineLinks ? 'enabled' : 'disabled'}`}
          />
        </div>

        {/* Dark Mode Toggle */}
        <div className="a11y-control">
          <span className="a11y-control__label">{t('accessibility.darkMode')}</span>
          <Switch
            checked={settings.darkMode}
            onCheckedChange={toggleDarkMode}
            aria-label={`Dark mode: ${settings.darkMode ? 'enabled' : 'disabled'}`}
          />
        </div>

        {/* High Contrast Toggle */}
        <div className="a11y-control">
          <span className="a11y-control__label">{t('accessibility.highContrast')}</span>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={toggleHighContrast}
            aria-label={`High contrast: ${settings.highContrast ? 'enabled' : 'disabled'}`}
          />
        </div>

        {/* Read Aloud Button */}
        <div className="a11y-control">
          <span className="a11y-control__label">{t('accessibility.readAloud')}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReadAloud}
            aria-label="Read page content aloud"
            className="h-8"
          >
            <Volume2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Play
          </Button>
        </div>

        {/* Reset Button */}
        <div className="pt-3 mt-3 border-t border-border">
          <Button
            variant="outline"
            className="w-full h-9"
            onClick={resetToDefaults}
            aria-label="Reset all accessibility settings to default values"
          >
            <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('accessibility.reset')}
          </Button>
        </div>
      </div>
    </div>
  );
}
