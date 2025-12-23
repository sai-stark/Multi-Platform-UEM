import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Applications from "./pages/Applications";
import Devices from "./pages/Devices";
import Enrollment from "./pages/Enrollment";
import GeofenceEditor from "./pages/GeofenceEditor";
import Geofences from "./pages/Geofences";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import InventoryEditor from "./pages/InventoryEditor";
import NotFound from "./pages/NotFound";
import Policies from "./pages/Policies";
import WebApplications from "./pages/WebApplications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccessibilityProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/web-applications" element={<WebApplications />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/enrollment" element={<Enrollment />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/devices/:platform" element={<Devices />} />
              <Route path="/geofences" element={<Geofences />} />
              <Route path="/geofences/new" element={<GeofenceEditor />} />
              <Route path="/geofences/:id" element={<GeofenceEditor />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/new" element={<InventoryEditor />} />
              <Route path="/inventory/:id" element={<InventoryEditor />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AccessibilityProvider>
  </QueryClientProvider>
);

export default App;
