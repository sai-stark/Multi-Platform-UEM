import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Accessibility, Bell, Globe, Search, User } from 'lucide-react';
import { useState } from 'react';
import { CommandPalette } from './CommandPalette';

export function AppHeader() {
  const { language, setLanguage, t } = useLanguage();
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 h-14 bg-card/70 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-4"
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

        {/* Global search trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-border/60 bg-muted/40 text-sm text-muted-foreground hover:bg-muted hover:border-border transition-colors w-56 lg:w-72"
          aria-label="Open command palette (Ctrl+K)"
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left">Search pages…</span>
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-background/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

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
              <Bell className="w-5 h-5 animate-shake text-primary origin-top" aria-hidden="true" />
              <span
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse"
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

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
