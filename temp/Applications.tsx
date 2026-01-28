import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Column, DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { authenticatedPrefixPath } from "@/config/env";
import { getEnterpriseWebToken } from "@/services/orgAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Package,
  Plus,
  Settings,
  Shield,
  Smartphone,
  Tag,
  Trash2,
  User,
  XCircle
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Google API types
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      iframes: {
        CROSS_ORIGIN_IFRAMES_FILTER: any;
        getContext: () => {
          openChild: (options: {
            url: string;
            where: HTMLElement;
            attributes: { style: string; scrolling: string };
          }) => {
            on: (event: string, callback: (data?: any) => void) => void;
            register: (
              event: string,
              callback: (data?: any) => void,
              filter?: any
            ) => void;
          };
        };
      };
    };
  }
}

import { useToast } from "@/hooks/use-toast";
import { applicationAPI } from "@/services/applicationAPI";
import {
  AppAction,
  Application,
  ApplicationRequest,
  AppVersion,
  ContentRating
} from "@/types";

interface ApplicationFormData {
  apkFile?: File;
  apkUrl?: string;
}

// Function to get iframe token from localStorage or API
const getIframeToken = async (
  forceRefresh: boolean = false
): Promise<string | null> => {
  try {
    const TOKEN_REFRESH_INTERVAL = 60 * 60 * 1000; // 60 minutes in milliseconds
    const now = Date.now();

    // Check if we should refresh based on time (every 60 minutes)
    const lastRefreshTime = localStorage.getItem("iFrameWebTokenRefreshTime");
    const shouldRefreshByTime = lastRefreshTime
      ? now - parseInt(lastRefreshTime) > TOKEN_REFRESH_INTERVAL
      : true;

    // First, try to get token from localStorage (unless forcing refresh or time-based refresh needed)
    if (!forceRefresh && !shouldRefreshByTime) {
      const storedToken = localStorage.getItem("iFrameWebToken");
      if (storedToken) {
        console.log("Using stored iframe token");
        return storedToken;
      }
    }

    // If no token in localStorage, forcing refresh, or time-based refresh needed
    const enterpriseName = localStorage.getItem("mdm_enterprise_display_name");
    if (!enterpriseName) {
      console.error("No enterprise display name found in localStorage");
      return null;
    }

    const refreshReason = forceRefresh
      ? "forced refresh"
      : shouldRefreshByTime
        ? "time-based refresh (60 minutes)"
        : "no stored token";

    console.log(
      `Fetching new iframe token from API for enterprise: ${enterpriseName} (${refreshReason})`
    );

    // Fetch new token from API
    const response = await getEnterpriseWebToken(enterpriseName);
    console.log("API response:", response);
    if (response?.webToken) {
      // Store the new token and refresh time in localStorage
      localStorage.setItem("iFrameWebToken", response.webToken);
      localStorage.setItem("iFrameWebTokenRefreshTime", now.toString());
      console.log("New token stored and returned:", response.webToken);
      return response.webToken;
    }

    console.error("No webToken received from API");
    return null;
  } catch (error) {
    console.error("Error getting iframe token:", error);
    return null;
  }
};

export default function Applications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteVersionDialogOpen, setIsDeleteVersionDialogOpen] =
    useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<AppVersion | null>(
    null
  );
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false);
  const [googleApiError, setGoogleApiError] = useState<string | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [selectedApps, setSelectedApps] = useState<
    Array<{
      packageName: string;
      productId: string;
      action: string;
    }>
  >([]);

  // Use refs to prevent duplicate iframe creation
  const iframeCreatedRef = useRef(false);
  const iframeInstanceRef = useRef<any>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const tokenRefreshAttemptedRef = useRef(false);
  const lastTokenRefreshTimeRef = useRef<number | null>(null);

  const [formData, setFormData] = useState<ApplicationFormData>({
    apkFile: undefined,
    apkUrl: "",
  });

  const { toast } = useToast();

  // Initialize token refresh time tracking from localStorage
  useEffect(() => {
    const storedRefreshTime = localStorage.getItem("iFrameWebTokenRefreshTime");
    if (storedRefreshTime) {
      lastTokenRefreshTimeRef.current = parseInt(storedRefreshTime);
    }
  }, []);

  // Function to detect 404 response and handle token refresh
  const handleIframeError = async (
    error: any,
    currentToken: string,
    container: HTMLElement
  ) => {
    console.error("Iframe error detected:", error);

    // Check if this looks like a 404 response or token-related error
    const isTokenError =
      error?.status === 404 ||
      error?.message?.includes("404") ||
      error?.message?.includes("unauthorized") ||
      error?.message?.includes("token") ||
      error?.message?.includes("expired");

    if (isTokenError) {
      const now = Date.now();
      const TOKEN_REFRESH_INTERVAL = 60 * 60 * 1000; // 60 minutes in milliseconds

      // Check if we should attempt refresh based on session or time
      const shouldAttemptRefresh =
        !tokenRefreshAttemptedRef.current || // First attempt in this session
        (lastTokenRefreshTimeRef.current &&
          now - lastTokenRefreshTimeRef.current > TOKEN_REFRESH_INTERVAL); // 60 minutes passed

      if (shouldAttemptRefresh) {
        console.log("Detected token-related error, attempting refresh...");
        tokenRefreshAttemptedRef.current = true;
        lastTokenRefreshTimeRef.current = now;

        try {
          setIsIframeLoading(true);
          const freshToken = await getIframeToken(true); // Force refresh

          if (freshToken && freshToken !== currentToken) {
            console.log("Got fresh token, retrying iframe creation");
            // Clear the current iframe and retry
            container.innerHTML = "";

            // Reset the iframe creation flag to allow retry
            iframeCreatedRef.current = false;
            iframeInstanceRef.current = null;

            // Retry with new token
            await initializeIframeWithToken(container, freshToken);
            return true; // Success
          } else {
            console.error("Failed to get fresh token");
            setGoogleApiError("Failed to refresh token");
            setIsIframeLoading(false);
            return false;
          }
        } catch (refreshError) {
          console.error("Error during token refresh:", refreshError);
          setGoogleApiError("Failed to refresh token");
          setIsIframeLoading(false);
          return false;
        }
      } else {
        console.log("Token refresh already attempted recently, skipping...");
      }
    }

    return false; // No refresh attempted or failed
  };

  // Helper function to create fallback iframe
  const createFallbackIframe = (
    container: HTMLElement,
    url: string,
    currentToken: string
  ) => {
    const fallbackIframe = document.createElement("iframe");
    fallbackIframe.src = url;
    fallbackIframe.style.cssText =
      "width: 100%; min-height: 400px; border: none;";
    fallbackIframe.scrolling = "yes";

    fallbackIframe.onload = () => {
      console.log("Fallback iframe loaded successfully");
      setIsIframeLoading(false);
    };

    // Fallback timeout for fallback iframe
    setTimeout(() => {
      if (isIframeLoading) {
        console.log(
          "Fallback iframe loading timeout - hiding loading indicator"
        );
        setIsIframeLoading(false);
      }
    }, 8000); // 8 second timeout for fallback

    fallbackIframe.onerror = async () => {
      console.error("Fallback iframe failed to load");
      console.log("Current token being used:", currentToken);

      // Use the new error handling function for token refresh
      const refreshSuccess = await handleIframeError(
        { status: 404, message: "Fallback iframe failed to load" },
        currentToken,
        container
      );

      if (!refreshSuccess) {
        setGoogleApiError("Failed to load Google Play for Work iframe");
        setIsIframeLoading(false);
      }
    };

    // Store iframe reference
    iframeInstanceRef.current = fallbackIframe;
    container.appendChild(fallbackIframe);
  };

  // Function to initialize iframe with a specific token
  const initializeIframeWithToken = async (
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
          console.error(
            "Failed to create iframe, falling back to simple iframe"
          );
          createFallbackIframe(container, options.url, token);
          return;
        }

        iframeInstanceRef.current = iframe;
        iframeCreatedRef.current = true;

        // Set up event handlers
        if (typeof iframe.on === "function") {
          iframe.on("ready", () => {
            console.log("Google Play for Work iframe loaded successfully");
            setIsIframeLoading(false);
          });

          iframe.on("error", async (error: any) => {
            const refreshSuccess = await handleIframeError(
              error,
              token,
              container
            );
            if (!refreshSuccess) {
              setGoogleApiError("Failed to load Google Play for Work");
              setIsIframeLoading(false);
            }
          });
        }

        // Additional check: Look for the actual iframe element in the DOM
        // This provides a more reliable way to detect when the iframe is ready
        const checkIframeReady = () => {
          const iframeElement = container.querySelector("iframe");
          if (iframeElement && iframeElement.contentDocument) {
            console.log("Iframe element detected as ready");
            setIsIframeLoading(false);
            return true;
          }
          return false;
        };

        // Check immediately and then periodically
        if (!checkIframeReady()) {
          const intervalId = setInterval(() => {
            if (checkIframeReady()) {
              clearInterval(intervalId);
            }
          }, 500); // Check every 500ms

          // Clear interval after 5 seconds
          setTimeout(() => clearInterval(intervalId), 5000);
        }

        // Fallback: Hide loading after a reasonable timeout
        // This ensures loading doesn't stay forever if the ready event doesn't fire
        setTimeout(() => {
          if (isIframeLoading) {
            console.log("Iframe loading timeout - hiding loading indicator");
            setIsIframeLoading(false);
          }
        }, 3000); // 3 second timeout

        // Register for product selection events
        if (
          typeof iframe.register === "function" &&
          window.gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER
        ) {
          iframe.register(
            "onproductselect",
            function (event: any) {
              console.log("Product selected:", event);

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
      // Fallback: Create simple iframe
      createFallbackIframe(container, options.url, token);
    }
  };

  // Cleanup function to destroy existing iframe
  const cleanupIframe = () => {
    // Remove any existing iframe
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    // Reset refs
    iframeCreatedRef.current = false;
    iframeInstanceRef.current = null;
    tokenRefreshAttemptedRef.current = false; // Reset token refresh flag
    lastTokenRefreshTimeRef.current = null; // Reset time tracking

    // Reset loading state
    setIsIframeLoading(false);

    // Remove message listener
    window.removeEventListener("message", handleIframeMessage);
  };

  // Function to remove selected app
  const removeSelectedApp = (index: number) => {
    setSelectedApps((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle iframe messages for app selection
  const handleIframeMessage = (event: MessageEvent) => {
    console.log("Received iframe message:", event);

    // Check if the message is from Google Play
    if (event.origin.includes("play.google.com")) {
      try {
        // Parse the message data - it starts with "!_{" and contains JSON
        let data;
        if (typeof event.data === "string" && event.data.startsWith("!_{")) {
          const jsonStr = event.data.substring(2); // Remove "!_{" prefix
          data = JSON.parse(jsonStr);
        } else {
          data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
        }

        console.log("Parsed iframe data:", data);

        // Check if this is a product selection event
        if (
          data &&
          data.s &&
          data.s.includes("onproductselect") &&
          data.a &&
          data.a.length > 0
        ) {
          const appData = data.a[0]; // Get the first app from the array
          console.log("App selection detected:", appData);

          if (appData.packageName) {
            // Add to selected apps list
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

            // Try to communicate back to the iframe to update its visual state
            try {
              const iframe = document.querySelector(
                "#play-store-container iframe"
              ) as HTMLIFrameElement;
              if (iframe && iframe.contentWindow) {
                // Send a message back to the iframe to update the UI
                iframe.contentWindow.postMessage(
                  {
                    type: "appSelected",
                    packageName: appData.packageName,
                    productId: appData.productId,
                    action: "selected",
                  },
                  "https://play.google.com"
                );
              }
            } catch (error) {
              console.log("Could not communicate with iframe:", error);
            }
          }
        }
      } catch (error) {
        console.log("Could not parse iframe message:", error);
      }
    }
  };

  // Load Google API script
  useEffect(() => {
    const loadGoogleAPI = () => {
      // Check if Google API is already loaded
      if (window.gapi) {
        setIsGoogleApiLoaded(true);
        return;
      }

      // Create script element
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.gapi) {
          try {
            window.gapi.load("gapi.iframes", () => {
              // Additional check to ensure iframes API is properly loaded
              if (window.gapi.iframes && window.gapi.iframes.getContext) {
                setIsGoogleApiLoaded(true);
                setGoogleApiError(null);
              } else {
                console.warn(
                  "Google iframes API not fully loaded, using fallback"
                );
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
    if (isAddDialogOpen && isGoogleApiLoaded && !iframeCreatedRef.current) {
      const initializePlayStoreIframe = async () => {
        try {
          const container = document.getElementById("play-store-container");
          if (!container) {
            console.error("Container not found");
            return;
          }

          // Store container reference
          containerRef.current = container;

          // Prevent multiple iframe creation
          if (iframeCreatedRef.current || iframeInstanceRef.current) {
            console.log("Iframe already created, skipping...");
            return;
          }

          // Clear any existing content first
          container.innerHTML = "";

          // Mark as created immediately to prevent race conditions
          iframeCreatedRef.current = true;

          // Set loading state
          setIsIframeLoading(true);
          setGoogleApiError(null);

          // Add message listener once
          window.addEventListener("message", handleIframeMessage);

          // Get the iframe token
          const token = await getIframeToken();
          if (!token) {
            console.error("Failed to get iframe token");
            setGoogleApiError("Failed to get iframe token");
            setIsIframeLoading(false);
            return;
          }

          // Initialize iframe with the token
          await initializeIframeWithToken(container, token);
        } catch (error) {
          console.error("Error initializing Google Play for Work:", error);
          // Reset flags on error
          iframeCreatedRef.current = false;
          iframeInstanceRef.current = null;
          setGoogleApiError("Failed to initialize Google Play for Work");
          setIsIframeLoading(false);
        }
      };

      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(initializePlayStoreIframe, 100);

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeoutId);
    }
  }, [isAddDialogOpen, isGoogleApiLoaded]); // Removed googleApiError from dependencies

  // Cleanup when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen) {
      cleanupIframe();
    }
  }, [isAddDialogOpen]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanupIframe();
    };
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Fetch applications with pagination
  const {
    data: applicationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["applications", currentPage, pageSize],
    queryFn: () =>
      applicationAPI.getApplications(undefined, {
        pageNumber: currentPage,
        pageSize: pageSize,
      }),
  });

  const applications = applicationsData?.content || [];
  const totalElements = applicationsData?.page?.totalElements || 0;
  const totalPages = applicationsData?.page?.totalPages || 0;

  // Create application mutation
  const createMutation = useMutation({
    mutationFn: (appData: ApplicationRequest) =>
      applicationAPI.createApplication(appData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setIsAddDialogOpen(false);
      setFormData({
        apkFile: undefined,
        apkUrl: "",
      });
      toast({
        title: "Success",
        description: "Application created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Application creation error:", error);
      let errorMessage = "Failed to upload application";

      if (error?.response?.status === 404) {
        errorMessage =
          "API endpoint not found. Please check if the backend service is running.";
      } else if (error?.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error?.message?.includes("JSON.parse")) {
        errorMessage =
          "Invalid response from server. Please check the API configuration.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => applicationAPI.deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setIsDeleteDialogOpen(false);
      setSelectedApp(null);
      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    },
  });

  // Delete application version mutation
  const deleteVersionMutation = useMutation({
    mutationFn: ({ appId, versionId }: { appId: string; versionId: string }) =>
      applicationAPI.deleteApplicationVersion(appId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setIsDeleteVersionDialogOpen(false);
      setSelectedVersion(null);
      toast({
        title: "Success",
        description: "Application version deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete application version",
        variant: "destructive",
      });
    },
  });

  // Set application action mutation
  const setActionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: AppAction }) =>
      applicationAPI.setApplicationAction(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({
        title: "Success",
        description: "Application action updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application action",
        variant: "destructive",
      });
    },
  });

  const handleAddApplication = async () => {
    // Validate form before submission
    const validation = validateForm();
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    // Check if any apps are selected
    if (selectedApps.length === 0) {
      toast({
        title: "No Apps Selected",
        description:
          "Please select applications from the Google Play for Work interface above.",
        variant: "destructive",
      });
      return;
    }

    // Process selected apps
    console.log("Adding selected apps:", selectedApps);

    // Show processing message
    toast({
      title: "Processing",
      description: `Processing ${selectedApps.length} selected application(s)...`,
    });

    // For each selected app, create an application request
    for (let i = 0; i < selectedApps.length; i++) {
      const app = selectedApps[i];
      // Extract app name from package name (e.g., "com.ludo.king" -> "ludo")
      const packageParts = app.packageName.split(".");
      const appName =
        packageParts.length > 1 ? packageParts[1] : app.packageName;

      const appData: ApplicationRequest = {
        playStorePackageName: app.packageName,
      };

      try {
        // Add a small delay between requests to avoid overwhelming the API
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        await createMutation.mutateAsync(appData);
      } catch (error) {
        console.error(`Failed to add app ${app.packageName}:`, error);
        // Continue with other apps even if one fails
      }
    }

    // Clear selected apps after processing
    setSelectedApps([]);

    toast({
      title: "Complete",
      description: `Finished processing ${selectedApps.length} application(s).`,
    });
  };

  const handleDeleteApplication = () => {
    if (!selectedApp) return;
    deleteMutation.mutate(selectedApp.id);
  };

  const handleDeleteVersion = () => {
    if (!selectedApp || !selectedVersion) return;
    deleteVersionMutation.mutate({
      appId: selectedApp.id,
      versionId: selectedVersion.id,
    });
  };

  const openDeleteDialog = (app: Application) => {
    setSelectedApp(app);
    setIsDeleteDialogOpen(true);
  };

  const openDeleteVersionDialog = (app: Application, version: AppVersion) => {
    setSelectedApp(app);
    setSelectedVersion(version);
    setIsDeleteVersionDialogOpen(true);
  };

  const toggleAppExpansion = (appId: string) => {
    const newExpanded = new Set(expandedApps);
    if (newExpanded.has(appId)) {
      newExpanded.delete(appId);
    } else {
      // Close all other apps and open only this one
      newExpanded.clear();
      newExpanded.add(appId);
    }
    setExpandedApps(newExpanded);
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // For Google Play for Work, we just need to ensure the API is loaded
    if (!isGoogleApiLoaded) {
      errors.push("Google API is still loading. Please wait...");
    }

    if (googleApiError) {
      errors.push(googleApiError);
    }

    return { isValid: errors.length === 0, errors };
  };

  const toggleAppAction = (
    app: Application,
    action: "mandatory" | "blocked"
  ) => {
    const newValue = action === "mandatory" ? !app.isMandatory : !app.isBlocked;
    const appAction: AppAction = {
      [action]: newValue,
    };
    setActionMutation.mutate({ id: app.id, action: appAction });
  };

  const getAppIcon = (app: Application) => {
    if (app.isEmmApp) return <Shield className="h-6 w-6 text-blue-500" />;
    if (app.isEmmAgent) return <Settings className="h-6 w-6 text-green-500" />;
    if (app.isLauncher)
      return <Smartphone className="h-6 w-6 text-purple-500" />;
    return <Package className="h-6 w-6 text-gray-500" />;
  };

  const getAppTypeBadge = (app: Application) => {
    if (app.isEmmApp) return <Badge variant="secondary">EMM App</Badge>;
    if (app.isEmmAgent) return <Badge variant="outline">EMM Agent</Badge>;
    if (app.isLauncher) return <Badge variant="default">Launcher</Badge>;
    return <Badge variant="secondary">Standard</Badge>;
  };

  const getContentRatingBadge = (rating?: ContentRating) => {
    if (!rating) return null;
    const ratingConfig: Record<
      ContentRating,
      { label: string; color: string }
    > = {
      [ContentRating.THREE_YEARS]: {
        label: "3+",
        color: "bg-green-100 text-green-800",
      },
      [ContentRating.SEVEN_YEARS]: {
        label: "7+",
        color: "bg-blue-100 text-blue-800",
      },
      [ContentRating.TWELVE_YEARS]: {
        label: "12+",
        color: "bg-yellow-100 text-yellow-800",
      },
      [ContentRating.SIXTEEN_YEARS]: {
        label: "16+",
        color: "bg-orange-100 text-orange-800",
      },
      [ContentRating.EIGHTEEN_YEARS]: {
        label: "18+",
        color: "bg-red-100 text-red-800",
      },
    };
    const config = ratingConfig[rating];
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Data table columns
  const columns: Column<Application>[] = [
    {
      key: "name",
      header: "App Name",
      accessor: (item) => item.name,
      sortable: true,
      render: (value, item) => (
        <button
          onClick={() =>
            navigate(`/${authenticatedPrefixPath}/applications/${item.id}`)
          }
          className="text-left transition-colors"
        >
          <div className="flex flex-col gap-1">
            <div className="font-medium text-blue-600 hover:text-blue-800">
              {item.name}
            </div>
            {item.description && (
              <div
                className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]"
                title={item.description}
              >
                {item.description}
              </div>
            )}
          </div>
        </button>
      ),
    },
    {
      key: "author",
      header: "Author",
      accessor: (item) => item.author || "",
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{item.author || "—"}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      accessor: (item) => item.category || "",
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-2">
          {item.category ? (
            <>
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
    },
    {
      key: "contentRating",
      header: "Rating",
      accessor: (item) => item.contentRating || "",
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-1">
          {item.contentRating ? (
            getContentRatingBadge(item.contentRating)
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
    },
    {
      key: "details",
      header: "Status",
      accessor: (item) => {
        const details = [];
        if (item.isEmmApp) details.push("EMM App");
        if (item.isEmmAgent) details.push("EMM Agent");
        if (item.isLauncher) details.push("Launcher");
        if (item.isMandatory) details.push("Mandatory");
        if (item.isBlocked) details.push("Blocked");
        return details.join(", ") || "Standard";
      },
      sortable: false,
      render: (value, item) => (
        <div className="flex flex-wrap gap-1">
          {item.isEmmApp && (
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              EMM
            </Badge>
          )}
          {item.isEmmAgent && (
            <Badge variant="outline" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Agent
            </Badge>
          )}
          {item.isLauncher && (
            <Badge className="text-xs bg-purple-100 text-purple-800">
              <Smartphone className="h-3 w-3 mr-1" />
              Launcher
            </Badge>
          )}
          {item.isMandatory && (
            <Badge className="text-xs bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Mandatory
            </Badge>
          )}
          {item.isBlocked && (
            <Badge variant="destructive" className="text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              Blocked
            </Badge>
          )}
          {!item.isEmmApp &&
            !item.isEmmAgent &&
            !item.isLauncher &&
            !item.isMandatory &&
            !item.isBlocked && (
              <Badge variant="secondary" className="text-xs">
                Standard
              </Badge>
            )}
        </div>
      ),
    },
    {
      key: "latestVersion",
      header: "Latest Version",
      accessor: (item) => {
        // Sort versions and get the latest one
        const sortedVersions = [...item.versions].sort((a, b) =>
          b.version.localeCompare(a.version, undefined, { numeric: true })
        );
        return sortedVersions.length > 0 ? sortedVersions[0].version : "";
      },
      sortable: true,
      render: (value, item) => {
        // Sort versions to get the latest one
        const sortedVersions = [...item.versions].sort((a, b) =>
          b.version.localeCompare(a.version, undefined, { numeric: true })
        );
        const latestVersion =
          sortedVersions.length > 0 ? sortedVersions[0] : null;

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">
                {latestVersion ? latestVersion.version : "N/A"}
              </div>
              {item.versions.length > 1 && (
                <button
                  onClick={() => toggleAppExpansion(item.id)}
                  className="p-1 rounded"
                >
                  {expandedApps.has(item.id) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>

            {/* Expanded versions table */}
            {expandedApps.has(item.id) && item.versions.length > 1 && (
              <div className="mt-2">
                <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground border-b border-border">
                          Version
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground border-b border-border">
                          Code
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground border-b border-border">
                          Track
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground border-b border-border">
                          Devices
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-muted-foreground border-b border-border">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background">
                      {sortedVersions.map((version) => (
                        <tr
                          key={version.id}
                          className="border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-3 py-2 text-foreground">
                            v{version.version}
                          </td>
                          <td className="px-3 py-2 text-foreground font-mono">
                            {version.versionCode || "—"}
                          </td>
                          <td className="px-3 py-2 text-foreground">
                            {version.isProduction ? (
                              <Badge className="text-[10px] bg-green-100 text-green-800">
                                Production
                              </Badge>
                            ) : version.trackIds &&
                              version.trackIds.length > 0 ? (
                              <Badge variant="outline" className="text-[10px]">
                                {version.trackIds[0]}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-3 py-2 text-foreground">
                            {version.deviceCount}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() =>
                                openDeleteVersionDialog(item, version)
                              }
                              disabled={
                                version.deviceCount > 0 ||
                                item.versions.length <= 1
                              }
                              title={
                                version.deviceCount > 0
                                  ? "Cannot delete version with active devices"
                                  : item.versions.length <= 1
                                    ? "Cannot delete the last version"
                                    : "Delete version"
                              }
                              className="p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "deviceCount",
      header: "Device Count",
      accessor: (item) => {
        try {
          if (!item.versions || !Array.isArray(item.versions)) {
            return "0";
          }
          const totalDevices = item.versions.reduce(
            (sum, v) => sum + (v.deviceCount || 0),
            0
          );
          return totalDevices.toString();
        } catch (error) {
          console.error("Error calculating device count:", error, item);
          return "0";
        }
      },
      sortable: true,
      render: (value, item) => (
        <div className="text-sm font-medium">
          {item.versions.reduce((sum, v) => sum + v.deviceCount, 0)}
        </div>
      ),
    },
    {
      key: "delete",
      header: "Delete",
      accessor: (item) => "", // Empty string for export
      sortable: false,
      width: 110,
      exportable: false, // Exclude from exports
      render: (value, item) => {
        const totalDevices = item.versions.reduce(
          (sum, v) => sum + v.deviceCount,
          0
        );
        return (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDeleteDialog(item)}
            disabled={totalDevices > 0}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading applications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Error loading applications
          </h3>
          <p className="text-muted-foreground mb-4">
            Failed to load applications. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground mt-2">
            Manage mobile applications for your organization
          </p>
        </div>
        <Button
          className="bg-gradient-primary text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Applications
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElements}</div>
            <p className="text-xs text-muted-foreground">
              {totalElements > 0
                ? "mobile applications"
                : "no applications yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Versions
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.reduce((sum, app) => sum + app.versions.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">across all apps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Installs
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.reduce(
                (sum, app) =>
                  sum +
                  app.versions.reduce((vSum, v) => vSum + v.deviceCount, 0),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all devices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mandatory Apps
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter((app) => app.isMandatory).length}
            </div>
            <p className="text-xs text-muted-foreground">required apps</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <DataTable<Application>
            data={applications}
            columns={columns}
            globalSearch
            globalSearchPlaceholder="Search Applications"
            emptyMessage="No applications found"
            sortable
            searchable
            showExport
            exportFilename="applications"
            exportTitle="Applications Report"
            userName="Admin User"
            pagination={true}
            pageSize={pageSize}
            currentPage={currentPage + 1} // DataTable uses 1-based pages
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={(page) => setCurrentPage(page - 1)} // Convert back to 0-based
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            defaultPageSize={20}
            serverSidePagination={true}
          />
        </CardContent>
      </Card>

      {/* Add Application Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[80vw] max-w-[80vw] h-[90vh] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add Applications from Google Play for Work
            </DialogTitle>
            <DialogDescription>
              Select applications from Google Play for Work to add to your
              organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Google Play for Work Container */}
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
                          // Reload the Google API instead of the entire page
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
                            setGoogleApiError(
                              "Failed to load Google API script"
                            );
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-gray-600">
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
                <div className="mt-3 p-3 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <h4 className="text-sm font-medium text-green-800">
                        Selected ({selectedApps.length})
                      </h4>
                    </div>
                    <p className="text-xs text-green-600">Ready to add</p>
                  </div>

                  {/* Compact grid layout for selected apps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {selectedApps.map((app, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white p-2 rounded border border-green-200 text-xs"
                      >
                        <span
                          className="font-mono text-gray-700 truncate flex-1 mr-2"
                          title={app.packageName}
                        >
                          {app.packageName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelectedApp(index)}
                          className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
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
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setSelectedApps([]);
                iframeCreatedRef.current = false;
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddApplication}
              disabled={
                !isGoogleApiLoaded ||
                !!googleApiError ||
                createMutation.isPending ||
                selectedApps.length === 0
              }
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Add Selected Applications{" "}
              {selectedApps.length > 0 && `(${selectedApps.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedApp?.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteApplication}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Version Confirmation Dialog */}
      <Dialog
        open={isDeleteVersionDialogOpen}
        onOpenChange={setIsDeleteVersionDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Application Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete version "
              {selectedVersion?.version}" of "{selectedApp?.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteVersionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVersion}
              disabled={deleteVersionMutation.isPending}
            >
              {deleteVersionMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
