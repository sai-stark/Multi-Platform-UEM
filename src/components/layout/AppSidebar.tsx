import { NavLink } from "@/components/NavLink";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
} from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AppWindow,
  Box,
  ChevronDown,
  Folder,
  Globe,
  Layout,
  LayoutDashboard,
  MapPin,
  Monitor,
  QrCode,
  Server,
  Settings,
  Shield,
  UserPlus
} from "lucide-react";

// MAIN NAVIGATION items
const mainNavItems = [
  { titleKey: "nav.dashboard", url: "/", icon: LayoutDashboard },
  { titleKey: "Profiles", url: "/profiles", icon: Layout },
  { titleKey: "nav.applications", url: "/applications", icon: AppWindow },
  { titleKey: "nav.webApplications", url: "/web-applications", icon: Globe },
  { titleKey: "nav.devices", url: "/devices", icon: Monitor },
  { titleKey: "Inventory", url: "/inventory", icon: Box },
  { titleKey: "Groups", url: "/groups", icon: Folder },
  { titleKey: "Geofences", url: "/geofences", icon: MapPin },
  { titleKey: "Repositories", url: "/repositories", icon: Server },
];


// SETUP & CONFIGURATION items
const enrollmentSubItems = [
  { title: "QR Enrollment", url: "/enrollment", icon: QrCode },
];

const configurationSubItems = [
  { title: "Passcode Policy", url: "/policies", icon: Shield },
  { title: "Geo Fence Policy", url: "/geofences/policy", icon: MapPin },
];

export function AppSidebar() {
  const { t } = useLanguage();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-sidebar-border" collapsible="icon">
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
        {/* MAIN NAVIGATION */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-2">
            {!collapsed && "Main Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
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

        {/* SETUP & CONFIGURATION */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-2">
            {!collapsed && "Setup & Configuration"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Enrollment */}
              <SidebarMenuItem>
                <Collapsible defaultOpen className="w-full">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full justify-between hover:bg-sidebar-accent"
                      aria-expanded="true"
                    >
                      <span className="flex items-center gap-3">
                        <UserPlus className="w-5 h-5" aria-hidden="true" />
                        {!collapsed && <span>{t("nav.enrollment")}</span>}
                      </span>
                      {!collapsed && (
                        <ChevronDown
                          className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                          aria-hidden="true"
                        />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu className="ml-4 mt-1 border-l border-sidebar-border pl-3">
                      {enrollmentSubItems.map((subItem) => (
                        <SidebarMenuItem key={subItem.url}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={subItem.url}
                              className="flex items-center gap-3 py-2 px-3 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent rounded transition-colors"
                              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                            >
                              <subItem.icon
                                className="w-4 h-4"
                                aria-hidden="true"
                              />
                              {!collapsed && <span>{subItem.title}</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {/* Configuration */}
              <SidebarMenuItem>
                <Collapsible defaultOpen className="w-full">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full justify-between hover:bg-sidebar-accent"
                      aria-expanded="true"
                    >
                      <span className="flex items-center gap-3">
                        <Settings className="w-5 h-5" aria-hidden="true" />
                        {!collapsed && <span>Configuration</span>}
                      </span>
                      {!collapsed && (
                        <ChevronDown
                          className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                          aria-hidden="true"
                        />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu className="ml-4 mt-1 border-l border-sidebar-border pl-3">
                      {configurationSubItems.map((subItem) => (
                        <SidebarMenuItem key={subItem.url}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={subItem.url}
                              className="flex items-center gap-3 py-2 px-3 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent rounded transition-colors"
                              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                            >
                              <subItem.icon
                                className="w-4 h-4"
                                aria-hidden="true"
                              />
                              {!collapsed && <span>{subItem.title}</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
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
                {!collapsed && <span>{t("nav.settings")}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
