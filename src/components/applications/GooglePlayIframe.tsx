import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ApplicationService } from '@/api/services/applications';
import { useToast } from '@/hooks/use-toast';
import { getIframeToken } from './applicationConstants';

interface SelectedApp {
  packageName: string;
  productId: string;
  action: string;
}

interface GooglePlayIframeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppsAdded: () => void;
}

export const GooglePlayIframe = ({ open, onOpenChange, onAppsAdded }: GooglePlayIframeProps) => {
  const { toast } = useToast();

  // Iframe-related state
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false);
  const [googleApiError, setGoogleApiError] = useState<string | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [selectedApps, setSelectedApps] = useState<SelectedApp[]>([]);

  // Refs for iframe management
  const iframeCreatedRef = useRef(false);
  const iframeInstanceRef = useRef<any>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const tokenRefreshAttemptedRef = useRef(false);
  const lastTokenRefreshTimeRef = useRef<number | null>(null);

  // Initialize token refresh time tracking from localStorage
  useEffect(() => {
    const storedRefreshTime = localStorage.getItem("iFrameWebTokenRefreshTime");
    if (storedRefreshTime) {
      lastTokenRefreshTimeRef.current = parseInt(storedRefreshTime);
    }
  }, []);

  // Handle iframe messages for app selection
  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (import.meta.env.DEV) console.log("Received iframe message:", event);

    // Check if the message is from Google Play
    if (event.origin.includes("play.google.com")) {
      try {
        let data;
        if (typeof event.data === "string" && event.data.startsWith("!_{")) {
          const jsonStr = event.data.substring(2);
          data = JSON.parse(jsonStr);
        } else {
          data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
        }

        if (import.meta.env.DEV) console.log("Parsed iframe data:", data);

        if (
          data &&
          data.s &&
          data.s.includes("onproductselect") &&
          data.a &&
          data.a.length > 0
        ) {
          const appData = data.a[0];
          if (import.meta.env.DEV) console.log("App selection detected:", appData);

          if (appData.packageName) {
            setSelectedApps((prev) => {
              const exists = prev.some(
                (app) => app.packageName === appData.packageName
              );
              if (!exists) {
                return [
                  ...prev,
                  {
                    packageName: appData.packageName,
                    productId: appData.productId || appData.packageName,
                    action: appData.action || "selected",
                  },
                ];
              }
              return prev;
            });
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) console.log("Could not parse iframe message:", error);
      }
    }
  }, []);

  // Helper function to create fallback iframe
  const createFallbackIframe = useCallback((
    container: HTMLElement,
    url: string,
    _currentToken: string
  ) => {
    const fallbackIframe = document.createElement("iframe");
    fallbackIframe.src = url;
    fallbackIframe.style.cssText =
      "width: 100%; min-height: 400px; border: none;";
    fallbackIframe.scrolling = "yes";

    fallbackIframe.onload = () => {
      if (import.meta.env.DEV) console.log("Fallback iframe loaded successfully");
      setIsIframeLoading(false);
    };

    setTimeout(() => {
      setIsIframeLoading(false);
    }, 8000);

    fallbackIframe.onerror = async () => {
      console.error("Fallback iframe failed to load");
      setGoogleApiError("Failed to load Google Play for Work iframe");
      setIsIframeLoading(false);
    };

    iframeInstanceRef.current = fallbackIframe;
    container.appendChild(fallbackIframe);
  }, []);

  // Function to initialize iframe with a specific token
  const initializeIframeWithToken = useCallback(async (
    container: HTMLElement,
    token: string
  ) => {
    const options = {
      url: `https://play.google.com/work/embedded/search?token=${token}&mode=SELECT`,
      where: container,
      attributes: {
        style: "width: 100%; min-height: 400px; border: none;",
        scrolling: "yes",
      },
    };

    if (window.gapi && window.gapi.iframes && window.gapi.iframes.getContext) {
      try {
        const iframe = window.gapi.iframes.getContext().openChild(options);

        if (!iframe) {
          console.error("Failed to create iframe, falling back to simple iframe");
          createFallbackIframe(container, options.url, token);
          return;
        }

        iframeInstanceRef.current = iframe;
        iframeCreatedRef.current = true;

        if (typeof iframe.on === "function") {
          iframe.on("ready", () => {
            if (import.meta.env.DEV) console.log("Google Play for Work iframe loaded successfully");
            setIsIframeLoading(false);
          });

          iframe.on("error", async () => {
            setGoogleApiError("Failed to load Google Play for Work");
            setIsIframeLoading(false);
          });
        }

        // Fallback timeout
        setTimeout(() => {
          setIsIframeLoading(false);
        }, 3000);

        // Register for product selection events
        if (
          typeof iframe.register === "function" &&
          window.gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER
        ) {
          iframe.register(
            "onproductselect",
            function (event: any) {
              if (import.meta.env.DEV) console.log("Product selected:", event);

              if (event.action === "selected" && event.packageName) {
                setSelectedApps((prev) => {
                  const exists = prev.some(
                    (app) => app.packageName === event.packageName
                  );
                  if (!exists) {
                    return [
                      ...prev,
                      {
                        packageName: event.packageName,
                        productId: event.productId || event.packageName,
                        action: event.action,
                      },
                    ];
                  }
                  return prev;
                });
              }
            },
            window.gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER
          );
        }
      } catch (iframeError) {
        console.error("Error creating Google API iframe:", iframeError);
        createFallbackIframe(container, options.url, token);
      }
    } else {
      createFallbackIframe(container, options.url, token);
    }
  }, [createFallbackIframe]);

  // Cleanup function to destroy existing iframe
  const cleanupIframe = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    iframeCreatedRef.current = false;
    iframeInstanceRef.current = null;
    tokenRefreshAttemptedRef.current = false;
    lastTokenRefreshTimeRef.current = null;

    setIsIframeLoading(false);

    window.removeEventListener("message", handleIframeMessage);
  }, [handleIframeMessage]);

  // Function to remove selected app
  const removeSelectedApp = (index: number) => {
    setSelectedApps((prev) => prev.filter((_, i) => i !== index));
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
                console.warn("Google iframes API not fully loaded, using fallback");
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

    loadGoogleAPI();
  }, []);

  // Initialize Google Play for Work iframe when dialog opens
  useEffect(() => {
    if (open && isGoogleApiLoaded && !iframeCreatedRef.current) {
      const initializePlayStoreIframe = async () => {
        try {
          const container = document.getElementById("play-store-container");
          if (!container) {
            console.error("Container not found");
            return;
          }

          containerRef.current = container;

          if (iframeCreatedRef.current || iframeInstanceRef.current) {
            if (import.meta.env.DEV) console.log("Iframe already created, skipping...");
            return;
          }

          container.innerHTML = "";
          iframeCreatedRef.current = true;

          setIsIframeLoading(true);
          setGoogleApiError(null);

          window.addEventListener("message", handleIframeMessage);

          const token = await getIframeToken();
          if (!token) {
            console.error("Failed to get iframe token");
            setGoogleApiError("Failed to get iframe token");
            setIsIframeLoading(false);
            return;
          }

          await initializeIframeWithToken(container, token);
        } catch (error) {
          console.error("Error initializing Google Play for Work:", error);
          iframeCreatedRef.current = false;
          iframeInstanceRef.current = null;
          setGoogleApiError("Failed to initialize Google Play for Work");
          setIsIframeLoading(false);
        }
      };

      const timeoutId = setTimeout(initializePlayStoreIframe, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [open, isGoogleApiLoaded, handleIframeMessage, initializeIframeWithToken]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      cleanupIframe();
    }
  }, [open, cleanupIframe]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanupIframe();
    };
  }, [cleanupIframe]);

  // Handle adding selected apps from iframe
  const handleAddSelectedApps = async () => {
    if (selectedApps.length === 0) {
      toast({
        title: "No Apps Selected",
        description: "Please select applications from the Google Play for Work interface above.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Processing",
      description: `Processing ${selectedApps.length} selected application(s)...`,
    });

    for (let i = 0; i < selectedApps.length; i++) {
      const app = selectedApps[i];
      try {
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        await ApplicationService.createApplication('android', {
          packageName: app.packageName,
        });
      } catch (error) {
        console.error(`Failed to add app ${app.packageName}:`, error);
      }
    }

    setSelectedApps([]);
    onOpenChange(false);
    onAppsAdded();

    toast({
      title: "Complete",
      description: `Finished processing ${selectedApps.length} application(s).`,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedApps([]);
    iframeCreatedRef.current = false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto flex flex-col w-[80vw] max-w-[80vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Applications from Google Play for Work</DialogTitle>
          <DialogDescription>
            Select applications from Google Play for Work to add to your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Google Play for Work</Label>
              <p className="text-xs text-muted-foreground">
                Click "Select" on apps to add them to your selection
              </p>
            </div>
            <div className="border border-border rounded-lg bg-card p-4">
              {!isGoogleApiLoaded && !googleApiError && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Loading Google Play for Work...
                    </span>
                  </div>
                </div>
              )}

              {googleApiError && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      Error Loading Google Play for Work
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {googleApiError}
                    </p>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setGoogleApiError(null);
                        setIsGoogleApiLoaded(false);
                        const script = document.createElement("script");
                        script.src = "https://apis.google.com/js/api.js";
                        script.async = true;
                        script.defer = true;

                        script.onload = () => {
                          if (window.gapi) {
                            window.gapi.load("gapi.iframes", () => {
                              setIsGoogleApiLoaded(true);
                              setGoogleApiError(null);
                            });
                          } else {
                            setGoogleApiError("Failed to load Google API");
                          }
                        };

                        script.onerror = () => {
                          setGoogleApiError("Failed to load Google API script");
                        };

                        document.head.appendChild(script);
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              <div className="relative w-full">
                {isIframeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">
                        Loading Google Play Store...
                      </p>
                    </div>
                  </div>
                )}
                <div id="play-store-container" className="w-full" />
              </div>
            </div>

            {/* Selected Apps Display */}
            {selectedApps.length > 0 && (
              <div className="mt-3 p-3 border border-success/30 rounded-lg bg-success/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <h4 className="text-sm font-medium text-success">
                      Selected ({selectedApps.length})
                    </h4>
                  </div>
                  <p className="text-xs text-success">Ready to add</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {selectedApps.map((app, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-2 rounded border border-success/30 text-xs"
                    >
                      <span
                        className="font-mono text-foreground truncate flex-1 mr-2"
                        title={app.packageName}
                      >
                        {app.packageName}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSelectedApp(index)}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSelectedApps}
            disabled={
              !isGoogleApiLoaded ||
              !!googleApiError ||
              selectedApps.length === 0
            }
          >
            Add Selected Applications{" "}
            {selectedApps.length > 0 && `(${selectedApps.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
