import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Box,
  Folder,
  Globe,
  LayoutDashboard,
  Layout,
  MapPin,
  Monitor,
  Package,
  QrCode,
  Server,
  Settings,
  UserPlus,
} from 'lucide-react';

const navigationItems = [
  { title: 'Dashboard',        url: '/',                 icon: LayoutDashboard, shortcut: '' },
  { title: 'Profiles',         url: '/profiles',         icon: Layout,          shortcut: '' },
  { title: 'Applications',     url: '/applications',     icon: Package,         shortcut: '' },
  { title: 'Web Applications', url: '/web-applications', icon: Globe,           shortcut: '' },
  { title: 'Devices',          url: '/devices',          icon: Monitor,         shortcut: '' },
  { title: 'Inventory',        url: '/inventory',        icon: Box,             shortcut: '' },
  { title: 'Groups',           url: '/groups',           icon: Folder,          shortcut: '' },
  { title: 'Geofences',        url: '/geofences',        icon: MapPin,          shortcut: '' },
  { title: 'Repositories',     url: '/repositories',     icon: Server,          shortcut: '' },
];

const configItems = [
  { title: 'QR Enrollment',    url: '/enrollment',        icon: QrCode,   shortcut: '' },
  { title: 'Geofence Policy',  url: '/geofences/policy',  icon: MapPin,   shortcut: '' },
  { title: 'Settings',         url: '/settings',          icon: Settings, shortcut: '⌘,' },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  // ⌘K / Ctrl+K global toggle
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onOpenChange]);

  const runCommand = (url: string) => {
    onOpenChange(false);
    navigate(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.url}
              value={item.title}
              onSelect={() => runCommand(item.url)}
            >
              <item.icon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              {item.title}
              {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Setup & Configuration">
          {configItems.map((item) => (
            <CommandItem
              key={item.url}
              value={item.title}
              onSelect={() => runCommand(item.url)}
            >
              <item.icon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              {item.title}
              {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
