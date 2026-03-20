import { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
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

  const containerRef = useRef<HTMLElement | null>(null);
  const iframeCreatedRef = useRef(false);

  const cleanupIframe = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
    iframeCreatedRef.current = false;
    setIsIframeLoading(false);
  }, []);

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
  }, [open, isGoogleApiLoaded, app]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

          <div id="manage-config-container" className="w-full h-full overflow-y-auto" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
