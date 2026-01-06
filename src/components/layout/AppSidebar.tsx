import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AppWindow,
  Box,
  FileBarChart,
  Folder,
  Globe,
  Layout,
  LayoutDashboard,
  MapPin,
  Monitor,
  Server,
  Settings,
  Shield,
  UserPlus,
  Users
} from 'lucide-react';

const mainNavItems = [
  { titleKey: 'nav.dashboard', url: '/', icon: LayoutDashboard },
  { titleKey: 'nav.enrollment', url: '/enrollment', icon: UserPlus },
  { titleKey: 'nav.devices', url: '/devices', icon: Monitor },
  { titleKey: 'Groups', url: '/groups', icon: Folder },
  { titleKey: 'Profiles', url: '/profiles', icon: Layout },
  { titleKey: 'nav.applications', url: '/applications', icon: AppWindow },
  { titleKey: 'nav.webApplications', url: '/web-applications', icon: Globe },
  { titleKey: 'nav.policies', url: '/policies', icon: Shield },
  { titleKey: 'nav.users', url: '/users', icon: Users },
  { titleKey: 'Inventory', url: '/inventory', icon: Box },
  { titleKey: 'Repositories', url: '/repositories', icon: Server },
  { titleKey: 'Geofences', url: '/geofences', icon: MapPin },
  { titleKey: 'nav.reports', url: '/reports', icon: FileBarChart },
];

export function AppSidebar() {
  const { t } = useLanguage();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar
      className="border-r border-sidebar-border"
      collapsible="icon"
    >
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded bg-sidebar-primary flex items-center justify-center"
            aria-hidden="true"
          >
            <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-semibold text-sidebar-foreground">
                UEM Console
              </h1>
              <p className="text-xs text-sidebar-foreground/70">
                Enterprise Management
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-2">
            {!collapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="flex items-center gap-3 py-2.5 px-3 text-sidebar-foreground hover:bg-sidebar-accent rounded transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-5 h-5" aria-hidden="true" />
                      {!collapsed && <span>{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 py-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className="flex items-center gap-3 py-2.5 px-3 text-sidebar-foreground hover:bg-sidebar-accent rounded transition-colors"
                activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
              >
                <Settings className="w-5 h-5" aria-hidden="true" />
                {!collapsed && <span>{t('nav.settings')}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
