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
  Box,
  ChevronDown,
  Folder,
  Globe,
  Layout,
  LayoutDashboard,
  MapPin,
  Monitor,
  Package,
  QrCode,
  Server,
  Settings,
  Shield,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

// MAIN NAVIGATION items
const mainNavItems = [
  { titleKey: "nav.dashboard", url: "/", icon: LayoutDashboard },
  { titleKey: "nav.profiles", url: "/profiles", icon: Layout },
  { titleKey: "nav.applications", url: "/applications", icon: Package },
  { titleKey: "nav.webApplications", url: "/web-applications", icon: Globe },
  { titleKey: "nav.devices", url: "/devices", icon: Monitor },
  { titleKey: "nav.inventory", url: "/inventory", icon: Box },
  { titleKey: "nav.groups", url: "/groups", icon: Folder },
  { titleKey: "nav.geofences", url: "/geofences", icon: MapPin },
  { titleKey: "nav.repositories", url: "/repositories", icon: Server },
];


// SETUP & CONFIGURATION items
const enrollmentSubItems = [
  { titleKey: "nav.qrEnrollment", url: "/enrollment", icon: QrCode },
];

const configurationSubItems = [
  { titleKey: "nav.geoFencePolicy", url: "/geofences/policy", icon: MapPin },
];

function isNavActive(itemUrl: string, pathname: string): boolean {
  if (itemUrl === "/") return pathname === "/";
  return pathname === itemUrl || pathname.startsWith(itemUrl + "/");
}

export function AppSidebar() {
  const { t } = useLanguage();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [enrollmentOpen, setEnrollmentOpen] = useState(true);
  const [configurationOpen, setConfigurationOpen] = useState(true);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

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
            {!collapsed && t("nav.mainNavigation")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = isNavActive(item.url, location.pathname);
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="relative flex items-center gap-3 py-2.5 px-3 text-sidebar-foreground hover:bg-sidebar-accent rounded transition-colors"
                        activeClassName="text-sidebar-primary font-medium"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute inset-0 rounded bg-sidebar-accent"
                            transition={
                              prefersReducedMotion
                                ? { duration: 0 }
                                : {
                                    type: "spring",
                                    stiffness: 350,
                                    damping: 30,
                                  }
                            }
                            aria-hidden="true"
                          />
                        )}
                        <item.icon className="relative z-10 w-5 h-5" aria-hidden="true" />
                        {!collapsed && <span className="relative z-10">{t(item.titleKey)}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SETUP & CONFIGURATION */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-2">
            {!collapsed && t("nav.setupAndConfig")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Enrollment */}
              <SidebarMenuItem>
                <Collapsible open={enrollmentOpen} onOpenChange={setEnrollmentOpen} className="w-full">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full justify-between hover:bg-sidebar-accent"
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
                      {enrollmentSubItems.map((subItem) => {
                        const isActive = isNavActive(subItem.url, location.pathname);
                        return (
                          <SidebarMenuItem key={subItem.url}>
                            <SidebarMenuButton asChild>
                              <NavLink
                                to={subItem.url}
                                className="relative flex items-center gap-3 py-2 px-3 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent rounded transition-colors"
                                activeClassName="text-sidebar-primary font-medium"
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="sidebar-sub-active-indicator"
                                    className="absolute inset-0 rounded bg-sidebar-accent"
                                    transition={
                                      prefersReducedMotion
                                        ? { duration: 0 }
                                        : {
                                            type: "spring",
                                            stiffness: 350,
                                            damping: 30,
                                          }
                                    }
                                    aria-hidden="true"
                                  />
                                )}
                                <subItem.icon
                                  className="relative z-10 w-4 h-4"
                                  aria-hidden="true"
                                />
                                {!collapsed && <span className="relative z-10">{t((subItem as any).titleKey)}</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {/* Configuration */}
              <SidebarMenuItem>
                <Collapsible open={configurationOpen} onOpenChange={setConfigurationOpen} className="w-full">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full justify-between hover:bg-sidebar-accent"
                    >
                      <span className="flex items-center gap-3">
                        <Settings className="w-5 h-5" aria-hidden="true" />
                        {!collapsed && <span>{t("nav.configuration")}</span>}
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
                      {configurationSubItems.map((subItem) => {
                        const isActive = isNavActive(subItem.url, location.pathname);
                        return (
                          <SidebarMenuItem key={subItem.url}>
                            <SidebarMenuButton asChild>
                              <NavLink
                                to={subItem.url}
                                className="relative flex items-center gap-3 py-2 px-3 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent rounded transition-colors"
                                activeClassName="text-sidebar-primary font-medium"
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="sidebar-sub-active-indicator"
                                    className="absolute inset-0 rounded bg-sidebar-accent"
                                    transition={
                                      prefersReducedMotion
                                        ? { duration: 0 }
                                        : {
                                            type: "spring",
                                            stiffness: 350,
                                            damping: 30,
                                          }
                                    }
                                    aria-hidden="true"
                                  />
                                )}
                                <subItem.icon
                                  className="relative z-10 w-4 h-4"
                                  aria-hidden="true"
                                />
                                {!collapsed && <span className="relative z-10">{t((subItem as any).titleKey)}</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
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
                className="relative flex items-center gap-3 py-2.5 px-3 text-sidebar-foreground hover:bg-sidebar-accent rounded transition-colors"
                activeClassName="text-sidebar-primary font-medium"
              >
                {isNavActive("/settings", location.pathname) && (
                  <motion.div
                    layoutId="sidebar-footer-active-indicator"
                    className="absolute inset-0 rounded bg-sidebar-accent"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }
                    }
                    aria-hidden="true"
                  />
                )}
                <Settings className="relative z-10 w-5 h-5" aria-hidden="true" />
                {!collapsed && <span className="relative z-10">{t("nav.settings")}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
