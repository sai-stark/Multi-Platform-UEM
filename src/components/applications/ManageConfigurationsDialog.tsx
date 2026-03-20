import { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, CheckCircle, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Application } from '@/api/services/applications';
import { getIframeToken } from './applicationConstants';

interface ManageConfigurationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: Application | null;
}

export const ManageConfigurationsDialog = ({ open, onOpenChange, app }: ManageConfigurationsDialogProps) => {
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false);
  const [googleApiError, setGoogleApiError] = useState<string | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [configEvents, setConfigEvents] = useState<{ type: string; mcmId: string; name?: string }[]>([]);

  const containerRef = useRef<HTMLElement | null>(null);
  const iframeCreatedRef = useRef(false);
  const lastEventRef = useRef<{ key: string; time: number } | null>(null);

  // Debounced event adder — prevents the same event from being added twice
  // (by iframe.register and postMessage) within 1s, but allows repeated saves
  const addConfigEvent = useCallback((type: string, mcmId: string, name?: string) => {
    const key = `${type}:${mcmId}`;
    const now = Date.now();
    if (lastEventRef.current && lastEventRef.current.key === key && now - lastEventRef.current.time < 1000) {
      // Same event within 1s — skip (duplicate from the other handler)
      return;
    }
    lastEventRef.current = { key, time: now };
    setConfigEvents(prev => [...prev, { type, mcmId, name }]);
  }, []);

  // Handle iframe postMessage events (fallback for config events)
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

        // Check for onconfigupdated
        if (data && data.s && data.s.includes("onconfigupdated") && data.a && data.a.length > 0) {
          const eventData = data.a[0];
          if (import.meta.env.DEV) console.log("Config updated via postMessage:", eventData);
          addConfigEvent('updated', eventData.mcmId, eventData.name);
        }

        // Check for onconfigdeleted
        if (data && data.s && data.s.includes("onconfigdeleted") && data.a && data.a.length > 0) {
          const eventData = data.a[0];
          if (import.meta.env.DEV) console.log("Config deleted via postMessage:", eventData);
          addConfigEvent('deleted', eventData.mcmId);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.log("Could not parse config iframe message:", error);
      }
    }
  }, [addConfigEvent]);

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
    setConfigEvents([]);
  };

  const removeConfigEvent = (index: number) => {
    setConfigEvents(prev => prev.filter((_, i) => i !== index));
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
                    addConfigEvent('updated', event.mcmId, event.name);
                  }, window.gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);

                  iframe.register('onconfigdeleted', function(event: any) {
                    if (import.meta.env.DEV) console.log("Config deleted event:", event);
                    addConfigEvent('deleted', event.mcmId);
                  }, window.gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
                }
              } else {
                // If openChild doesn't return correct object or fails to bind events
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
  }, [open, isGoogleApiLoaded, app, handleIframeMessage]);

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

          {configEvents.length > 0 && (
            <div className="mt-3 p-3 border border-success/30 rounded-lg bg-success/10 flex-shrink-0 max-h-[30%] overflow-y-auto shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <h4 className="text-sm font-medium text-success">
                    Configuration Events ({configEvents.length})
                  </h4>
                </div>
                <p className="text-xs text-success">Recently captured</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {configEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-card p-2 rounded border border-success/30 text-xs"
                  >
                    <div className="flex flex-col flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Settings className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-foreground truncate">
                          {event.type === 'updated' ? 'Updated / Created' : 'Deleted'}
                        </span>
                      </div>
                      {event.name && (
                        <span className="font-medium text-foreground truncate mb-0.5">
                          {event.name}
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-muted-foreground truncate" title={event.mcmId}>
                        ID: {event.mcmId}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConfigEvent(index)}
                      className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
