import { ErrorFallback } from "@/components/ErrorFallback";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { deploymentPrefixPath } from "@/config/env";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { EnrollmentGuard, EnterpriseProvider } from "@/contexts/EnterpriseContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const ApplicationDetails = React.lazy(() => import("./pages/ApplicationDetails"));
const Applications = React.lazy(() => import("./pages/Applications"));
const DeviceDetails = React.lazy(() => import("./pages/DeviceDetails"));
const Devices = React.lazy(() => import("./pages/Devices"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Enrollment = React.lazy(() => import("./pages/Enrollment"));
const EnterpriseSetup = React.lazy(() => import("./pages/EnterpriseSetup"));
const GeofenceEditor = React.lazy(() => import("./pages/GeofenceEditor"));
const Geofences = React.lazy(() => import("./pages/Geofences"));
const GroupDetails = React.lazy(() => import("./pages/GroupDetails"));
const Groups = React.lazy(() => import("./pages/Groups"));
const Inventory = React.lazy(() => import("./pages/Inventory"));
const InventoryEditor = React.lazy(() => import("./pages/InventoryEditor"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Policies = React.lazy(() => import("./pages/Policies"));
const PolicyConfigurationPage = React.lazy(() => import("./pages/PolicyConfigurationPage"));
const ProfileDetails = React.lazy(() => import("./pages/ProfileDetails"));
const Profiles = React.lazy(() => import("./pages/Profiles"));
const Repositories = React.lazy(() => import("./pages/Repositories"));
const RepositoryDetails = React.lazy(() => import("./pages/RepositoryDetails"));
const WebApplications = React.lazy(() => import("./pages/WebApplications"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Separate component for routes so EnrollmentGuard can use router hooks
function AppRoutes() {
  return (
    <EnrollmentGuard>
      <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/applications/:platform/:id" element={<ApplicationDetails />} />
        <Route path="/web-applications" element={<WebApplications />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/enrollment" element={<Enrollment />} />
        <Route path="/android/enterprise/setup" element={<EnterpriseSetup />} />
        <Route path="/android/enterprise/callback" element={<EnterpriseSetup />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/devices/:platform" element={<Devices />} />
        <Route path="/devices/:platform/:id" element={<DeviceDetails />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetails />} />
        <Route path="/geofences" element={<Geofences />} />
        <Route path="/geofences/new" element={<GeofenceEditor />} />
        <Route path="/geofences/:id" element={<GeofenceEditor />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/new" element={<InventoryEditor />} />
        <Route path="/inventory/:id" element={<InventoryEditor />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/profiles/:platform/:id" element={<ProfileDetails />} />
        <Route path="/profiles/:platform/:id/policy/:policyType" element={<PolicyConfigurationPage />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/repositories/:platform/:repoId" element={<RepositoryDetails />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </EnrollmentGuard>
  );
}

const App = () => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => {
      window.location.href = '/';
    }}
  >
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={deploymentPrefixPath}>
              <BreadcrumbProvider>
                <EnterpriseProvider>
                  <SidebarProvider defaultOpen={true}>
                    <AppRoutes />
                  </SidebarProvider>
                </EnterpriseProvider>
              </BreadcrumbProvider>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

