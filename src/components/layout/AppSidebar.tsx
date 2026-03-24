import { NavLink } from "@/components/NavLink";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
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
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

// ── Navigation definitions ──

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

// ── Main component ──

export function AppSidebar() {
  const { t } = useLanguage();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [enrollmentOpen, setEnrollmentOpen] = useState(true);
  const [configurationOpen, setConfigurationOpen] = useState(true);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 28 };

  return (
    <Sidebar variant="floating" collapsible="icon">
      {/* ── Main Navigation — flex-1 takes middle space ── */}
      <SidebarContent className="flex-1 px-2 py-3 overflow-hidden">
        {!collapsed && (
          <p className="text-[10px] font-semibold tracking-widest text-sidebar-foreground/40 uppercase px-2 mb-2">
            {t("nav.mainNavigation")}
          </p>
        )}
        {collapsed && (
          <span className="sr-only">{t("nav.mainNavigation")}</span>
        )}
        <SidebarMenu className="gap-0.5">
          {mainNavItems.map((item) => {
            const isActive = isNavActive(item.url, location.pathname);
            return (
              <SidebarMenuItem key={item.titleKey}>
                <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg transition-colors duration-150",
                      "text-[13px] text-sidebar-foreground/70 hover:text-sidebar-foreground",
                      collapsed ? "justify-center px-0 py-2.5" : "px-2 py-2",
                      !isActive && "hover:bg-sidebar-accent",
                    )}
                    activeClassName="!text-sidebar-foreground font-medium"
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-lg bg-sidebar-accent"
                        transition={springTransition}
                        aria-hidden="true"
                      />
                    )}
                    <item.icon
                      size={16}
                      className={cn(
                        "relative z-10 flex-shrink-0 transition-colors duration-150",
                        isActive
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground/50",
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && (
                      <span className="relative z-10 flex-1 truncate">
                        {t(item.titleKey)}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* ── Setup & Configuration — pinned to bottom ── */}
      <div className="mt-auto flex-shrink-0">
        <Separator className="bg-sidebar-border/60" />
        <SidebarMenu className="px-2 py-3">
          {!collapsed && (
            <p className="text-[10px] font-semibold tracking-widest text-sidebar-foreground/40 uppercase px-2 mb-2">
              {t("nav.setupAndConfig")}
            </p>
          )}

          {collapsed ? (
            <>
              {/* Enrollment Dropdown (Collapsed) */}
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      tooltip={t("nav.enrollment")}
                      className="justify-center px-0 py-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <UserPlus size={16} className="text-sidebar-foreground/50" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="center" sideOffset={16} className="w-56 rounded-lg border-sidebar-border shadow-lg">
                    {enrollmentSubItems.map((subItem) => (
                      <DropdownMenuItem asChild key={subItem.url} className="cursor-pointer font-medium p-2 text-sm text-foreground hover:bg-muted/50 focus:bg-muted/50">
                        <NavLink to={subItem.url} className={({ isActive }) => cn("flex items-center gap-2", isActive && "text-primary")}>
                          <subItem.icon size={15} className="text-muted-foreground mr-1" />
                          {t(subItem.titleKey)}
                        </NavLink>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>

              {/* Configuration Dropdown (Collapsed) */}
              <SidebarMenuItem className="mt-0.5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      tooltip={t("nav.configuration")}
                      className="justify-center px-0 py-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <Settings size={16} className="text-sidebar-foreground/50" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="center" sideOffset={16} className="w-56 rounded-lg border-sidebar-border shadow-lg">
                    {configurationSubItems.map((subItem) => (
                      <DropdownMenuItem asChild key={subItem.url} className="cursor-pointer font-medium p-2 text-sm text-foreground hover:bg-muted/50 focus:bg-muted/50">
                        <NavLink to={subItem.url} className={({ isActive }) => cn("flex items-center gap-2", isActive && "text-primary")}>
                          <subItem.icon size={15} className="text-muted-foreground mr-1" />
                          {t(subItem.titleKey)}
                        </NavLink>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </>
          ) : (
            <>
              {/* Enrollment Collapsible (Expanded) */}
              <Collapsible
                open={enrollmentOpen}
                onOpenChange={setEnrollmentOpen}
                className="w-full group/enrollment"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                        "px-2 py-2 text-[13px] transition-colors duration-150"
                      )}
                    >
                      <UserPlus size={16} className="flex-shrink-0 text-sidebar-foreground/50" />
                      <span className="flex-1 text-left">{t("nav.enrollment")}</span>
                      <ChevronDown
                        size={13}
                        className={cn(
                          "flex-shrink-0 text-sidebar-foreground/40 transition-transform duration-200",
                          enrollmentOpen && "rotate-180"
                        )}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-0.5 space-y-0.5">
                    {enrollmentSubItems.map((subItem) => {
                      const isActive = isNavActive(subItem.url, location.pathname);
                      return (
                        <SidebarMenuButton asChild key={subItem.url} tooltip={t(subItem.titleKey)}>
                          <NavLink
                            to={subItem.url}
                            className={cn(
                              "relative flex items-center gap-3 rounded-lg transition-colors duration-150",
                              "text-[13px] text-sidebar-foreground/60 hover:text-sidebar-foreground",
                              "px-2 py-1.5 pl-8",
                              !isActive && "hover:bg-sidebar-accent"
                            )}
                            activeClassName="!text-sidebar-foreground font-medium"
                          >
                            {isActive && (
                              <motion.div
                                layoutId="sidebar-sub-active-pill"
                                className="absolute inset-0 rounded-lg bg-sidebar-accent"
                                transition={springTransition}
                                aria-hidden="true"
                              />
                            )}
                            <subItem.icon
                              size={14}
                              className={cn(
                                "relative z-10 flex-shrink-0 transition-colors duration-150",
                                isActive ? "text-sidebar-primary" : "text-sidebar-foreground/40"
                              )}
                            />
                            <span className="relative z-10 flex-1 truncate">
                              {t(subItem.titleKey)}
                            </span>
                          </NavLink>
                        </SidebarMenuButton>
                      );
                    })}
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Configuration Collapsible (Expanded) */}
              <Collapsible
                open={configurationOpen}
                onOpenChange={setConfigurationOpen}
                className="w-full group/configuration mt-0.5"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                        "px-2 py-2 text-[13px] transition-colors duration-150"
                      )}
                    >
                      <Settings size={16} className="flex-shrink-0 text-sidebar-foreground/50" />
                      <span className="flex-1 text-left">{t("nav.configuration")}</span>
                      <ChevronDown
                        size={13}
                        className={cn(
                          "flex-shrink-0 text-sidebar-foreground/40 transition-transform duration-200",
                          configurationOpen && "rotate-180"
                        )}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-0.5 space-y-0.5">
                    {configurationSubItems.map((subItem) => {
                      const isActive = isNavActive(subItem.url, location.pathname);
                      return (
                        <SidebarMenuButton asChild key={subItem.url} tooltip={t(subItem.titleKey)}>
                          <NavLink
                            to={subItem.url}
                            className={cn(
                              "relative flex items-center gap-3 rounded-lg transition-colors duration-150",
                              "text-[13px] text-sidebar-foreground/60 hover:text-sidebar-foreground",
                              "px-2 py-1.5 pl-8",
                              !isActive && "hover:bg-sidebar-accent"
                            )}
                            activeClassName="!text-sidebar-foreground font-medium"
                          >
                            {isActive && (
                               <motion.div
                                 layoutId="sidebar-sub-active-pill"
                                 className="absolute inset-0 rounded-lg bg-sidebar-accent"
                                 transition={springTransition}
                                 aria-hidden="true"
                               />
                             )}
                            <subItem.icon
                              size={14}
                              className={cn(
                                "relative z-10 flex-shrink-0 transition-colors duration-150",
                                isActive ? "text-sidebar-primary" : "text-sidebar-foreground/40"
                              )}
                            />
                            <span className="relative z-10 flex-1 truncate">
                              {t(subItem.titleKey)}
                            </span>
                          </NavLink>
                        </SidebarMenuButton>
                      );
                    })}
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </>
          )}
        </SidebarMenu>

        {/* ── Footer: Settings ── */}
        <Separator className="bg-sidebar-border/60" />
        <SidebarFooter className="px-2 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t("nav.settings")}>
                <NavLink
                  to="/settings"
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg transition-colors duration-150",
                    "text-[13px] text-sidebar-foreground/70 hover:text-sidebar-foreground",
                    collapsed ? "justify-center px-0 py-2.5" : "px-2 py-2",
                    !isNavActive("/settings", location.pathname) &&
                      "hover:bg-sidebar-accent",
                  )}
                  activeClassName="!text-sidebar-foreground font-medium"
                >
                  {isNavActive("/settings", location.pathname) && (
                    <motion.div
                      layoutId="sidebar-footer-active-pill"
                      className="absolute inset-0 rounded-lg bg-sidebar-accent"
                      transition={springTransition}
                      aria-hidden="true"
                    />
                  )}
                  <Settings
                    size={16}
                    className={cn(
                      "relative z-10 flex-shrink-0 transition-colors duration-150",
                      isNavActive("/settings", location.pathname)
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/50",
                    )}
                  />
                  {!collapsed && (
                    <span className="relative z-10 flex-1 truncate">
                      {t("nav.settings")}
                    </span>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
