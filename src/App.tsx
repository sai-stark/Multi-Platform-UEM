import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { deploymentPrefixPath } from "@/config/env";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { EnrollmentGuard, EnterpriseProvider } from "@/contexts/EnterpriseContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import ApplicationDetails from "./pages/ApplicationDetails";
import Applications from "./pages/Applications";
import DeviceDetails from "./pages/DeviceDetails";
import Devices from "./pages/Devices";

import Enrollment from "./pages/Enrollment";
import EnterpriseSetup from "./pages/EnterpriseSetup";
import GeofenceEditor from "./pages/GeofenceEditor";
import Geofences from "./pages/Geofences";
import GroupDetails from "./pages/GroupDetails";
import Groups from "./pages/Groups";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import InventoryEditor from "./pages/InventoryEditor";
import NotFound from "./pages/NotFound";
import Policies from "./pages/Policies";
import PolicyConfigurationPage from "./pages/PolicyConfigurationPage";
import ProfileDetails from "./pages/ProfileDetails";
import Profiles from "./pages/Profiles";
import Repositories from "./pages/Repositories";
import RepositoryDetails from "./pages/RepositoryDetails";
import WebApplications from "./pages/WebApplications";

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
    </EnrollmentGuard>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccessibilityProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={deploymentPrefixPath}>
            <BreadcrumbProvider>
              <EnterpriseProvider>
                <AppRoutes />
              </EnterpriseProvider>
            </BreadcrumbProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AccessibilityProvider>
  </QueryClientProvider>
);

export default App;

