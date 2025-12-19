import { 
  LayoutDashboard, 
  Monitor, 
  AppWindow, 
  Shield, 
  Users, 
  FileBarChart,
  Settings,
  ChevronDown,
  Smartphone,
  Laptop,
  Server,
  UserPlus,
  Globe
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const mainNavItems = [
  { titleKey: 'nav.dashboard', url: '/', icon: LayoutDashboard },
  { titleKey: 'nav.enrollment', url: '/enrollment', icon: UserPlus },
  { titleKey: 'nav.devices', url: '/devices', icon: Monitor },
  { titleKey: 'nav.applications', url: '/applications', icon: AppWindow },
  { titleKey: 'nav.webApplications', url: '/web-applications', icon: Globe },
  { titleKey: 'nav.policies', url: '/policies', icon: Shield },
  { titleKey: 'nav.users', url: '/users', icon: Users },
  { titleKey: 'nav.reports', url: '/reports', icon: FileBarChart },
];

const deviceSubItems = [
  { title: 'Android', url: '/devices/android', icon: Smartphone },
  { title: 'iOS', url: '/devices/ios', icon: Smartphone },
  { title: 'Windows', url: '/devices/windows', icon: Laptop },
  { title: 'macOS', url: '/devices/macos', icon: Laptop },
  { title: 'Linux', url: '/devices/linux', icon: Server },
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
                  {item.titleKey === 'nav.devices' ? (
                    <Collapsible defaultOpen className="w-full">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          className="w-full justify-between hover:bg-sidebar-accent"
                          aria-expanded="true"
                        >
                          <span className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" aria-hidden="true" />
                            {!collapsed && <span>{t(item.titleKey)}</span>}
                          </span>
                          {!collapsed && (
                            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenu className="ml-4 mt-1 border-l border-sidebar-border pl-3">
                          {deviceSubItems.map((subItem) => (
                            <SidebarMenuItem key={subItem.url}>
                              <SidebarMenuButton asChild>
                                <NavLink
                                  to={subItem.url}
                                  className="flex items-center gap-3 py-2 px-3 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent rounded transition-colors"
                                  activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                                >
                                  <subItem.icon className="w-4 h-4" aria-hidden="true" />
                                  {!collapsed && <span>{subItem.title}</span>}
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
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
                  )}
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
