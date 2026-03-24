import { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, Trash2, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Application, ApplicationService, AndroidManagedConfigProfile } from '@/api/services/applications';
import { getIframeToken } from './applicationConstants';
import { useToast } from '@/hooks/use-toast';

interface ManageConfigurationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: Application | null;
}

export const ManageConfigurationsDialog = ({ open, onOpenChange, app }: ManageConfigurationsDialogProps) => {
  const { toast } = useToast();
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false);
  const [googleApiError, setGoogleApiError] = useState<string | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(false);

  // Config templates from API
  const [configTemplates, setConfigTemplates] = useState<AndroidManagedConfigProfile[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState<string | null>(null);

  const containerRef = useRef<HTMLElement | null>(null);
  const iframeCreatedRef = useRef(false);
  const lastEventRef = useRef<{ key: string; time: number } | null>(null);

  // Fetch config templates from API
  const fetchConfigTemplates = useCallback(async () => {
    if (!app?.id) return;
    setIsLoadingTemplates(true);
    try {
      const templates = await ApplicationService.getConfigTemplates('android', app.id);
      setConfigTemplates(templates);
    } catch (error: any) {
      // 204 No Content is fine — means no templates exist
      if (error?.response?.status !== 204) {
        if (import.meta.env.DEV) console.log("Error fetching config templates:", error);
      }
      setConfigTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [app?.id]);

  // Delete a config template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!app?.id) return;
    setIsDeletingTemplate(templateId);
    try {
      await ApplicationService.deleteConfigTemplate('android', app.id, templateId);
      toast({
        title: "Configuration Deleted",
        description: "The managed configuration profile has been deleted.",
      });
      await fetchConfigTemplates();
    } catch (error) {
      console.error("Error deleting config template:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the configuration profile.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingTemplate(null);
    }
  };

  // Debounced event handler — prevents the same iframe event from triggering
  // a refetch twice (from iframe.register and postMessage) within 1s
  const handleConfigEvent = useCallback((type: string, mcmId: string) => {
    const key = `${type}:${mcmId}`;
    const now = Date.now();
    if (lastEventRef.current && lastEventRef.current.key === key && now - lastEventRef.current.time < 1000) {
      return;
    }
    lastEventRef.current = { key, time: now };
    if (import.meta.env.DEV) console.log(`Config ${type} event for mcmId: ${mcmId}, refetching templates...`);
    fetchConfigTemplates();
  }, [fetchConfigTemplates]);

  // Handle iframe postMessage events
  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (import.meta.env.DEV) console.log("Received iframe message:", event);

    if (event.origin.includes("play.google.com")) {
      try {
        let data;
        if (typeof event.data === "string" && event.data.startsWith("!_{")) {
          const jsonStr = event.data.substring(2);
          data = JSON.parse(jsonStr);
        } else {
          data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        }

        if (import.meta.env.DEV) console.log("Parsed iframe data:", data);

        if (data && data.s && data.s.includes("onconfigupdated") && data.a && data.a.length > 0) {
          handleConfigEvent('updated', data.a[0].mcmId);
        }

        if (data && data.s && data.s.includes("onconfigdeleted") && data.a && data.a.length > 0) {
          handleConfigEvent('deleted', data.a[0].mcmId);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.log("Could not parse config iframe message:", error);
      }
    }
  }, [handleConfigEvent]);

  const cleanupIframe = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
    iframeCreatedRef.current = false;
    setIsIframeLoading(false);
    window.removeEventListener("message", handleIframeMessage);
  }, [handleIframeMessage]);

  const handleClose = () => {
    onOpenChange(false);
    setConfigTemplates([]);
  };

  // Load Google API script
  useEffect(() => {
    const loadGoogleAPI = () => {
      if (window.gapi) {
        setIsGoogleApiLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.gapi) {
          try {
            window.gapi.load("gapi.iframes", () => {
              if (window.gapi.iframes && window.gapi.iframes.getContext) {
                setIsGoogleApiLoaded(true);
                setGoogleApiError(null);
              } else {
                console.warn("Google iframes API not fully loaded");
                setIsGoogleApiLoaded(true);
                setGoogleApiError(null);
              }
            });
          } catch (loadError) {
            console.error("Error loading gapi.iframes:", loadError);
            setGoogleApiError("Failed to load Google iframes API");
          }
        } else {
          setGoogleApiError("Failed to load Google API");
        }
      };

      script.onerror = () => {
        setGoogleApiError("Failed to load Google API script");
      };

      document.head.appendChild(script);
    };

    if (open) {
      loadGoogleAPI();
    }
  }, [open]);

  // Fetch templates when dialog opens
  useEffect(() => {
    if (open && app?.id) {
      fetchConfigTemplates();
    }
  }, [open, app?.id, fetchConfigTemplates]);

  useEffect(() => {
    if (!open) {
      cleanupIframe();
    }
  }, [open, cleanupIframe]);

  useEffect(() => {
    if (open && isGoogleApiLoaded && app?.packageName && !iframeCreatedRef.current) {
      const initializePlayStoreIframe = async () => {
        try {
          const container = document.getElementById("manage-config-container");
          if (!container) return;

          containerRef.current = container;
          container.innerHTML = "";
          iframeCreatedRef.current = true;
          setIsIframeLoading(true);
          setGoogleApiError(null);

          // Add postMessage listener as fallback
          window.addEventListener("message", handleIframeMessage);

          const token = await getIframeToken();
          if (!token) {
            setGoogleApiError("Failed to get iframe token");
            setIsIframeLoading(false);
            return;
          }

          const options = {
            url: `https://play.google.com/managed/mcm?token=${token}&packageName=${app.packageName}`,
            where: container,
            attributes: { style: "height:1000px; width:100%; border:none;", scrolling: "yes" }
          };

          if (window.gapi && window.gapi.iframes && window.gapi.iframes.getContext) {
            try {
              const iframe = window.gapi.iframes.getContext().openChild(options);
              if (iframe && typeof iframe.on === 'function') {
                iframe.on('ready', () => {
                  setIsIframeLoading(false);
                });
                iframe.on('error', () => {
                  setGoogleApiError("Failed to load Google Play configurations");
                  setIsIframeLoading(false);
                });
                // Fallback timeout
                setTimeout(() => setIsIframeLoading(false), 3000);

                if (typeof iframe.register === "function" && window.gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER) {
                  iframe.register('onconfigupdated', function(event: any) {
                    if (import.meta.env.DEV) console.log("Config updated event:", event);
                    handleConfigEvent('updated', event.mcmId);
                  }, window.gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);

                  iframe.register('onconfigdeleted', function(event: any) {
                    if (import.meta.env.DEV) console.log("Config deleted event:", event);
                    handleConfigEvent('deleted', event.mcmId);
                  }, window.gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
                }
              } else {
                setTimeout(() => setIsIframeLoading(false), 2000);
              }
            } catch (iframeError) {
              console.error("Error creating Google API iframe:", iframeError);
              setGoogleApiError("Failed to create Google Play configurations iframe");
              setIsIframeLoading(false);
            }
          } else {
            setGoogleApiError("Google iframes API is not available");
            setIsIframeLoading(false);
          }
        } catch (error) {
          console.error("Error initializing Google Play for Work config:", error);
          setGoogleApiError("Failed to initialize Google Play configuration");
          setIsIframeLoading(false);
        }
      };

      const timeoutId = setTimeout(initializePlayStoreIframe, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [open, isGoogleApiLoaded, app, handleIframeMessage, handleConfigEvent]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="overflow-hidden flex flex-col w-[80vw] max-w-[80vw] h-[90vh] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Configurations - {app?.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 relative">
          {!isGoogleApiLoaded && !googleApiError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            </div>
          )}

          {googleApiError && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Error
                </h3>
                <p className="text-muted-foreground mb-4">
                  {googleApiError}
                </p>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
          
          {isIframeLoading && !googleApiError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading configurations...
                </p>
              </div>
            </div>
          )}

          <div className="relative w-full flex-1 min-h-0 overflow-hidden">
            <div id="manage-config-container" className="w-full h-full overflow-y-auto" />
          </div>

          {/* Saved Config Templates from API */}
          {(configTemplates.length > 0 || isLoadingTemplates) && (
            <div className="mt-3 p-3 border border-border rounded-lg bg-card flex-shrink-0 max-h-[30%] overflow-y-auto shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-foreground">
                    Saved Configuration Profiles ({configTemplates.length})
                  </h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchConfigTemplates}
                  disabled={isLoadingTemplates}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingTemplates ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {isLoadingTemplates && configTemplates.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                  <span className="text-xs text-muted-foreground">Loading templates...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {configTemplates.map((template) => (
                    <div
                      key={template.mcmId}
                      className="flex items-center justify-between bg-muted/50 p-2 rounded border border-border text-xs"
                    >
                      <div className="flex flex-col flex-1 min-w-0 mr-2">
                        <span className="font-medium text-foreground truncate">
                          {template.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground truncate" title={template.mcmId}>
                          ID: {template.mcmId}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.mcmId)}
                        disabled={isDeletingTemplate === template.mcmId}
                        className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      >
                        {isDeletingTemplate === template.mcmId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
