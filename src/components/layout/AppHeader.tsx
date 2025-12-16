import { Menu, Bell, User, Globe, Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function AppHeader() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header 
      className="h-14 bg-card border-b border-border flex items-center justify-between px-4"
      role="banner"
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger 
          className="text-foreground hover:bg-muted p-2 rounded"
          aria-label="Toggle sidebar navigation"
        />
        <h2 className="text-lg font-semibold text-foreground sr-only md:not-sr-only">
          {t('dashboard.title')}
        </h2>
      </div>

      <nav className="flex items-center gap-2" aria-label="Header actions">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              aria-label={`Current language: ${language === 'en' ? 'English' : 'Hindi'}. Click to change language`}
            >
              <Globe className="w-5 h-5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem 
              onClick={() => setLanguage('en')}
              className={language === 'en' ? 'bg-accent' : ''}
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLanguage('hi')}
              className={language === 'hi' ? 'bg-accent' : ''}
            >
              हिन्दी (Hindi)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Accessibility Panel */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              aria-label="Open accessibility options"
            >
              <Accessibility className="w-5 h-5" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            align="end" 
            className="w-80 bg-popover border-border p-0"
            aria-label="Accessibility settings panel"
          >
            <AccessibilityPanel />
          </PopoverContent>
        </Popover>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon"
          aria-label="View notifications (3 unread)"
        >
          <div className="relative">
            <Bell className="w-5 h-5" aria-hidden="true" />
            <span 
              className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              3
            </span>
          </div>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              aria-label="User menu"
            >
              <User className="w-5 h-5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-foreground">MDM Admin</p>
              <p className="text-xs text-muted-foreground">mdmadmin@cdot.in</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}
