import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Application, ApplicationService, AppActionType } from '@/api/services/applications';
import { IosApplication, AppRequest } from '@/types/application';
import { ITunesSearchService, ITunesSearchResult } from '@/api/services/itunesSearch';
// Commented out: Original AddApplicationDialog import
// import { AddApplicationDialog } from '@/components/applications/AddApplicationDialog';
import { Platform } from '@/types/models';
import { getAssetUrl } from '@/config/env';
import { EnterpriseService } from '@/api/services/enterprise';
import { useAndroidFeaturesEnabled } from '@/contexts/EnterpriseContext';
import { 
  Package, 
  Plus, 
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Shield,
  AlertTriangle,
  Smartphone,
  Apple,
  Monitor,
  Loader2,
  AlertCircle,
  Eye,
  Search,
  Star,
  ExternalLink,
  Link2,
  Ban,
  Layout,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataTable, Column } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Google API types for iframe integration
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

const actionConfig: Record<AppActionType, { label: string; icon: typeof CheckCircle; className: string }> = {
  MANDATORY: { label: 'Mandatory', icon: CheckCircle, className: 'status-badge--compliant' },
  OPTIONAL: { label: 'Optional', icon: Clock, className: 'status-badge--pending' },
  BLOCKED: { label: 'Blocked', icon: XCircle, className: 'status-badge--non-compliant' },
};

// Platform configuration for tabs
const platformConfig: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  disabled?: boolean;
  image?: string;
}> = {
  android: {
    label: 'Android',
    icon: Smartphone,
    color: 'text-success',
    image: getAssetUrl('/Assets/android.png'),
  },
  ios: {
    label: 'iOS',
    icon: Apple,
    color: 'text-muted-foreground',
    image: getAssetUrl('/Assets/apple.png'),
  },
  windows: {
    label: 'Windows',
    icon: Monitor,
    color: 'text-info',
    disabled: true,
    image: getAssetUrl('/Assets/microsoft.png'),
  },
  linux: {
    label: 'Linux',
    icon: Monitor,
    color: 'text-info',
    disabled: true,
    image: getAssetUrl('/Assets/linux.png'),
  },
};

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
    const response = await EnterpriseService.generateEnterpriseWebToken('android', { parentFrameUrl: enterpriseName });
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

const Applications = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { shouldBlock: shouldBlockAndroid } = useAndroidFeaturesEnabled();
  const [platform, setPlatform] = useState<Platform>(shouldBlockAndroid ? 'ios' : 'android');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; app: Application | null }>({
    open: false,
    app: null
  });

  // iOS-specific state
  const [iosApplications, setIosApplications] = useState<IosApplication[]>([]);
  const [iosAppUrl, setIosAppUrl] = useState('');
  const [iosRegistering, setIosRegistering] = useState(false);
  const [itunesSearchTerm, setItunesSearchTerm] = useState('');
  const [itunesSearchResults, setItunesSearchResults] = useState<ITunesSearchResult[]>([]);
  const [itunesSearching, setItunesSearching] = useState(false);
  const [iosAddMode, setIosAddMode] = useState<'url' | 'search'>('search');

  // Iframe-related state
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
  const handleIframeMessage = (event: MessageEvent) => {
    console.log("Received iframe message:", event);

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

        console.log("Parsed iframe data:", data);

        if (
          data &&
          data.s &&
          data.s.includes("onproductselect") &&
          data.a &&
          data.a.length > 0
        ) {
          const appData = data.a[0];
          console.log("App selection detected:", appData);

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
        console.log("Could not parse iframe message:", error);
      }
    }
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

    setTimeout(() => {
      if (isIframeLoading) {
        console.log("Fallback iframe loading timeout - hiding loading indicator");
        setIsIframeLoading(false);
      }
    }, 8000);

    fallbackIframe.onerror = async () => {
      console.error("Fallback iframe failed to load");
      setGoogleApiError("Failed to load Google Play for Work iframe");
      setIsIframeLoading(false);
    };

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
          console.error("Failed to create iframe, falling back to simple iframe");
          createFallbackIframe(container, options.url, token);
          return;
        }

        iframeInstanceRef.current = iframe;
        iframeCreatedRef.current = true;

        if (typeof iframe.on === "function") {
          iframe.on("ready", () => {
            console.log("Google Play for Work iframe loaded successfully");
            setIsIframeLoading(false);
          });

          iframe.on("error", async () => {
            setGoogleApiError("Failed to load Google Play for Work");
            setIsIframeLoading(false);
          });
        }

        // Fallback timeout
        setTimeout(() => {
          if (isIframeLoading) {
            console.log("Iframe loading timeout - hiding loading indicator");
            setIsIframeLoading(false);
          }
        }, 3000);

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
      createFallbackIframe(container, options.url, token);
    }
  };

  // Cleanup function to destroy existing iframe
  const cleanupIframe = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    iframeCreatedRef.current = false;
    iframeInstanceRef.current = null;
    tokenRefreshAttemptedRef.current = false;
    lastTokenRefreshTimeRef.current = null;

    setIsIframeLoading(false);

    window.removeEventListener("message", handleIframeMessage);
  };

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
    if (addDialogOpen && isGoogleApiLoaded && !iframeCreatedRef.current) {
      const initializePlayStoreIframe = async () => {
        try {
          const container = document.getElementById("play-store-container");
          if (!container) {
            console.error("Container not found");
            return;
          }

          containerRef.current = container;

          if (iframeCreatedRef.current || iframeInstanceRef.current) {
            console.log("Iframe already created, skipping...");
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
  }, [addDialogOpen, isGoogleApiLoaded]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!addDialogOpen) {
      cleanupIframe();
    }
  }, [addDialogOpen]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanupIframe();
    };
  }, []);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await ApplicationService.getApplications(platform);
      if (platform === 'ios') {
        // Cast to IosApplication[] for iOS platform
        setIosApplications((response.content || []) as unknown as IosApplication[]);
        setApplications([]);
      } else {
        setApplications(response.content || []);
        setIosApplications([]);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [platform]);

  // iOS: Register app via App Store URL
  const handleRegisterIosApp = async () => {
    if (!iosAppUrl.trim()) {
      toast({ title: 'Error', description: 'Please enter an App Store URL', variant: 'destructive' });
      return;
    }
    setIosRegistering(true);
    try {
      await ApplicationService.registerApplication('ios', { identifier: iosAppUrl.trim() });
      toast({ title: 'Success', description: 'iOS application registered successfully' });
      setIosAppUrl('');
      setAddDialogOpen(false);
      fetchApplications();
    } catch (error) {
      console.error('Failed to register iOS app:', error);
      toast({ title: 'Error', description: 'Failed to register iOS application', variant: 'destructive' });
    } finally {
      setIosRegistering(false);
    }
  };

  // iOS: Register app from iTunes search result
  const handleRegisterFromSearch = async (result: ITunesSearchResult) => {
    const url = `https://apps.apple.com/app/id${result.trackId}`;
    setIosRegistering(true);
    try {
      await ApplicationService.registerApplication('ios', { identifier: url });
      toast({ title: 'Success', description: `${result.trackName} registered successfully` });
      setItunesSearchTerm('');
      setItunesSearchResults([]);
      setAddDialogOpen(false);
      fetchApplications();
    } catch (error) {
      console.error('Failed to register iOS app:', error);
      toast({ title: 'Error', description: `Failed to register ${result.trackName}`, variant: 'destructive' });
    } finally {
      setIosRegistering(false);
    }
  };

  // iOS: iTunes search with debounce
  const itunesSearchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleItunesSearch = (term: string) => {
    setItunesSearchTerm(term);
    if (itunesSearchTimerRef.current) {
      clearTimeout(itunesSearchTimerRef.current);
    }
    if (term.trim().length < 2) {
      setItunesSearchResults([]);
      return;
    }
    itunesSearchTimerRef.current = setTimeout(async () => {
      setItunesSearching(true);
      try {
        const results = await ITunesSearchService.searchApps(term.trim());
        setItunesSearchResults(results);
      } catch (error) {
        console.error('iTunes search error:', error);
      } finally {
        setItunesSearching(false);
      }
    }, 400);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDialog.app?.id) return;
    
    try {
      await ApplicationService.deleteApplication(platform, deleteDialog.app.id);
      toast({
        title: 'Success',
        description: `${deleteDialog.app.name} has been deleted`
      });
      fetchApplications();
    } catch (error) {
      console.error('Failed to delete application:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete application',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialog({ open: false, app: null });
    }
  };

  // Handle action change
  const handleSetAction = async (app: Application, action: AppActionType) => {
    if (!app.id) return;
    
    // Build the correct request body based on action type
    let body: Record<string, any>;
    switch (action) {
      case 'MANDATORY':
        body = { isMandatory: true };
        break;
      case 'BLOCKED':
        body = { isBlocked: true };
        break;
      case 'OPTIONAL':
      default:
        body = { isMandatory: false, isBlocked: false };
        break;
    }

    try {
      await ApplicationService.setApplicationAction(platform, app.id, body);
      toast({
        title: 'Success',
        description: `${app.name} is now ${action.toLowerCase()}`
      });
      fetchApplications();
    } catch (error) {
      console.error('Failed to set action:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application action',
        variant: 'destructive'
      });
    }
  };

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

        await ApplicationService.createApplication(platform, {
          packageName: app.packageName,
        });
      } catch (error) {
        console.error(`Failed to add app ${app.packageName}:`, error);
      }
    }

    setSelectedApps([]);
    setAddDialogOpen(false);
    fetchApplications();

    toast({
      title: "Complete",
      description: `Finished processing ${selectedApps.length} application(s).`,
    });
  };

  // Stats
  const currentApps = platform === 'ios' ? iosApplications : applications;
  const stats = {
    total: currentApps.length,
    mandatory: applications.filter(a => a.action === 'MANDATORY').length,
    optional: applications.filter(a => a.action === 'OPTIONAL').length,
    blocked: applications.filter(a => a.action === 'BLOCKED').length,
  };

  // Android/generic table columns
  const columns: Column<Application>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (item) => item.name,
      sortable: true,
      searchable: true,
      render: (_, item) => (
        <span
          className="font-medium text-sky-500 hover:text-sky-400 hover:underline cursor-pointer transition-colors"
          onClick={() => navigate(`/applications/${platform}/${item.id}`)}
        >
          {item.name}
        </span>
      ),
    },
    {
      key: 'packageName',
      header: 'Package Name',
      accessor: (item) => item.packageName || '-',
      sortable: true,
      searchable: true,
      render: (value) => (
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
      ),
    },
    {
      key: 'flags',
      header: 'Flags',
      accessor: (item) => {
        const flags = [
          item.isEmmApp && 'EMM App',
          item.isEmmAgent && 'EMM Agent',
          item.isLauncher && 'Launcher',
          item.isMandatory && 'Mandatory',
          item.isBlocked && 'Blocked',
        ].filter(Boolean);
        return flags.length > 0 ? flags.join(', ') : 'None';
      },
      render: (_, item) => {
        const flagDefs = [
          { key: 'isEmmApp', label: 'EMM App', value: item.isEmmApp, activeImg: getAssetUrl('/Assets/App_True.png'), inactiveImg: getAssetUrl('/Assets/App.png') },
          { key: 'isEmmAgent', label: 'EMM Agent', value: item.isEmmAgent, activeImg: getAssetUrl('/Assets/Agent_True.png'), inactiveImg: getAssetUrl('/Assets/Agent.png') },
          { key: 'isLauncher', label: 'Launcher', value: item.isLauncher, activeImg: getAssetUrl('/Assets/Launcher_True.png'), inactiveImg: getAssetUrl('/Assets/Launcher.png') },
          { key: 'isMandatory', label: 'Mandatory', value: item.isMandatory, activeImg: getAssetUrl('/Assets/Mandatory_True.png'), inactiveImg: getAssetUrl('/Assets/Mandatory.png') },
          { key: 'isBlocked', label: 'Blocked', value: item.isBlocked, activeImg: getAssetUrl('/Assets/Block_True.png'), inactiveImg: getAssetUrl('/Assets/Block.png') },
        ];
        return (
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-1">
              {flagDefs.map((flag) => (
                <Tooltip key={flag.key}>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-opacity">
                      <img
                        src={flag.value ? flag.activeImg : flag.inactiveImg}
                        alt={flag.label}
                        className={cn(
                          'w-5 h-5 object-contain',
                          !flag.value && 'opacity-30'
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">{flag.label}: {flag.value ? 'Yes' : 'No'}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (item) => item.description || '-',
      sortable: true,
      render: (value) => (
        <p className="text-sm text-muted-foreground max-w-[250px] truncate" title={String(value)}>
          {value}
        </p>
      ),
    },
    {
      key: 'versions',
      header: 'Versions',
      accessor: (item) => item.versions?.length || 0,
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      accessor: (item) => item.author || '-',
      sortable: true,
      render: (value) => (
        <span className="text-sm">{value}</span>
      ),
    },
    // {
    //   key: 'contentRating',
    //   header: 'Content Rating',
    //   accessor: (item) => item.contentRating || '-',
    //   sortable: true,
    //   render: (value) => (
    //     value !== '-' ? (
    //       <Badge variant="outline" className="text-xs">{String(value).replace(/_/g, ' ')}</Badge>
    //     ) : <span className="text-muted-foreground">-</span>
    //   ),
    // },
  ];

  // iOS table columns
  const iosColumns: Column<IosApplication>[] = [
    {
      key: 'name',
      header: 'Application',
      accessor: (item) => item.trackName || item.name,
      sortable: true,
      searchable: true,
      render: (_, item) => (
        <div className="flex items-center gap-3">
          {item.artworkUrl60 || item.artworkUrl100 ? (
            <img 
              src={item.artworkUrl60 || item.artworkUrl100} 
              alt="" 
              className="w-10 h-10 rounded-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Apple className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{item.trackName || item.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{item.bundleId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      accessor: (item) => item.version || '-',
      sortable: true,
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'sellerName',
      header: 'Seller',
      accessor: (item) => item.sellerName || '-',
      sortable: true,
    },
    {
      key: 'primaryGenreName',
      header: 'Category',
      accessor: (item) => item.primaryGenreName || '-',
      sortable: true,
      render: (value) => value !== '-' ? (
        <Badge variant="outline" className="text-xs">{value}</Badge>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'averageUserRating',
      header: 'Rating',
      accessor: (item) => item.averageUserRating ?? '-',
      sortable: true,
      render: (value) => value !== '-' ? (
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{Number(value).toFixed(1)}</span>
        </div>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'enrollmentStatus',
      header: 'Status',
      accessor: (item) => item.enrollmentStatus || 'REGISTERED',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'REGISTERED' ? 'default' : 'secondary'} className="text-xs">
          {value}
        </Badge>
      ),
    },
  ];

  // Row actions (Android/generic)
  const rowActions = (app: Application) => (
    <>
      <DropdownMenuItem onClick={() => handleSetAction(app, 'MANDATORY')}>
        <Shield className="w-4 h-4 mr-2 text-success" />
        Set Mandatory
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleSetAction(app, 'OPTIONAL')}>
        <Clock className="w-4 h-4 mr-2 text-warning" />
        Set Optional
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleSetAction(app, 'BLOCKED')}>
        <AlertTriangle className="w-4 h-4 mr-2 text-destructive" />
        Block App
      </DropdownMenuItem>

      <DropdownMenuItem>Manage Versions</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem 
        className="text-destructive"
        onClick={() => setDeleteDialog({ open: true, app })}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </DropdownMenuItem>
    </>
  );

  // iOS row actions
  const iosRowActions = (app: IosApplication) => (
    <>
      <DropdownMenuItem onClick={() => navigate(`/applications/ios/${app.id}`)}>
        <Eye className="w-4 h-4 mr-2" />
        View Details
      </DropdownMenuItem>
      {app.trackViewUrl && (
        <DropdownMenuItem onClick={() => window.open(app.trackViewUrl, '_blank')}>
          <ExternalLink className="w-4 h-4 mr-2" />
          View on App Store
        </DropdownMenuItem>
      )}
    </>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Applications
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage mobile applications for your device fleet
            </p>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Application
          </Button>
        </header>

        {/* Platform Tabs */}
        <section
          className="grid grid-cols-4 w-full rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm p-1.5 shadow-sm"
          role="tablist"
          aria-label="Filter by platform"
        >
          {Object.keys(platformConfig).map((platformKey) => {
            const config = platformConfig[platformKey];
            const Icon = config.icon;
            const isActive = platform === platformKey;
            const isDisabled = config.disabled;
            return (
              <button
                key={platformKey}
                role="tab"
                aria-selected={isActive}
                aria-disabled={isDisabled}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  if (platformKey === 'android' && shouldBlockAndroid) {
                    toast({
                      title: 'Enterprise Setup Required',
                      description: 'Android Enterprise must be configured before using Android features.',
                      variant: 'destructive',
                    });
                    navigate('/android/enterprise/setup?returnTo=/applications');
                    return;
                  }
                  setPlatform(platformKey as Platform);
                }}
                className={cn(
                  "relative inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive && "bg-background text-foreground shadow-md border border-border/50 backdrop-blur-md",
                  !isActive &&
                    !isDisabled &&
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isDisabled &&
                    "text-muted-foreground/50 cursor-not-allowed opacity-50"
                )}
              >
                {config.image ? (
                  <img
                    src={config.image}
                    alt={config.label}
                    className={cn(
                      "w-5 h-5 object-contain",
                      isDisabled && "opacity-50"
                    )}
                  />
                ) : (
                  <Icon
                    className={cn("w-4 h-4", isActive ? config.color : "")}
                  />
                )}
                {config.label}
              </button>
            );
          })}
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Application statistics">
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-info" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Apps</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.mandatory}</p>
                <p className="text-sm text-muted-foreground">Mandatory</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.optional}</p>
                <p className="text-sm text-muted-foreground">Optional</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.blocked}</p>
                <p className="text-sm text-muted-foreground">Blocked</p>
              </div>
            </div>
          </article>
        </section>

        {/* Applications Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          {platform === 'ios' ? (
            <DataTable
              data={iosApplications}
              columns={iosColumns}
              loading={loading}
              globalSearchPlaceholder="Search iOS applications..."
              emptyMessage={loading ? "Loading applications..." : "No iOS applications found. Click 'Add Application' to register apps."}
              rowActions={iosRowActions}
              defaultPageSize={10}
              showExport={true}
              exportTitle="iOS Applications Report"
              exportFilename="ios-applications"
            />
          ) : (
            <DataTable
              data={applications}
              columns={columns}
              loading={loading}
              globalSearchPlaceholder="Search applications..."
              emptyMessage={loading ? "Loading applications..." : "No applications found."}
              rowActions={rowActions}
              defaultPageSize={10}
              showExport={true}
              exportTitle="Applications Report"
              exportFilename="applications"
            />
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, app: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteDialog.app?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Application Dialog - Platform Aware */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className={cn(
            "overflow-y-auto flex flex-col",
            platform === 'android' 
              ? "w-[80vw] max-w-[80vw] max-h-[90vh]" 
              : platform === 'ios'
                ? "w-[70vw] max-w-[70vw] max-h-[85vh]"
                : "sm:max-w-[500px]"
          )}>
            <DialogHeader>
              <DialogTitle>
                {platform === 'android' 
                  ? 'Add Applications from Google Play for Work'
                  : platform === 'ios'
                    ? 'Add iOS Application'
                    : 'Add Application'}
              </DialogTitle>
              <DialogDescription>
                {platform === 'android' 
                  ? 'Select applications from Google Play for Work to add to your organization.'
                  : platform === 'ios'
                    ? 'Add iOS applications via App Store or enterprise IPA files.'
                    : 'Add applications for your selected platform.'}
              </DialogDescription>
            </DialogHeader>
            
            {/* Platform-specific content */}
            {platform === 'android' ? (
              /* Android: Google Play for Work Container */
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
            ) : platform === 'ios' ? (
              /* iOS: App Store URL + iTunes Search */
              <div className="flex-1 flex flex-col space-y-4">
                {/* Mode Toggle */}
                <div className="flex gap-2 border-b pb-3">
                  <Button
                    variant={iosAddMode === 'search' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIosAddMode('search')}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search iTunes
                  </Button>
                  <Button
                    variant={iosAddMode === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIosAddMode('url')}
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    App Store URL
                  </Button>
                </div>

                {iosAddMode === 'url' ? (
                  /* URL Input Mode */
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>App Store URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://apps.apple.com/us/app/example/id123456789"
                          value={iosAppUrl}
                          onChange={(e) => setIosAppUrl(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleRegisterIosApp}
                          disabled={!iosAppUrl.trim() || iosRegistering}
                        >
                          {iosRegistering ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Register'
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Paste the full App Store URL for the iOS application you want to register.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* iTunes Search Mode */
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="space-y-2">
                      <Label>Search iTunes Store</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search for iOS apps..."
                          value={itunesSearchTerm}
                          onChange={(e) => handleItunesSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {/* Search Results */}
                    {itunesSearching && (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                      </div>
                    )}

                    {!itunesSearching && itunesSearchResults.length > 0 && (
                      <div className="border rounded-lg">
                        {itunesSearchResults.map((result) => (
                          <div
                            key={result.trackId}
                            className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                          >
                            {result.artworkUrl60 ? (
                              <img
                                src={result.artworkUrl60}
                                alt=""
                                className="w-10 h-10 rounded-lg flex-shrink-0"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <Apple className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{result.trackName}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {result.sellerName} · {result.primaryGenreName}
                                {result.formattedPrice && ` · ${result.formattedPrice}`}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono truncate">{result.bundleId}</p>
                            </div>
                            {result.averageUserRating != null && (
                              <div className="flex items-center gap-1 flex-shrink-0 mr-2">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">{result.averageUserRating.toFixed(1)}</span>
                              </div>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRegisterFromSearch(result)}
                              disabled={iosRegistering}
                              className="flex-shrink-0"
                            >
                              {iosRegistering ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Plus className="w-3 h-3 mr-1" />
                              )}
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {!itunesSearching && itunesSearchTerm.length >= 2 && itunesSearchResults.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground">No apps found for "{itunesSearchTerm}"</p>
                      </div>
                    )}

                    {!itunesSearching && itunesSearchTerm.length < 2 && (
                      <div className="text-center py-6">
                        <Apple className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Other platforms placeholder */
              <div className="border border-border rounded-lg bg-muted/30 p-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Platform Not Supported
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Application management for this platform is not yet available.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddDialogOpen(false);
                  setSelectedApps([]);
                  setIosAppUrl('');
                  setItunesSearchTerm('');
                  setItunesSearchResults([]);
                  iframeCreatedRef.current = false;
                }}
              >
                {platform === 'android' ? 'Cancel' : 'Close'}
              </Button>
              {platform === 'android' && (
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
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Commented out: Original AddApplicationDialog
        <AddApplicationDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onApplicationAdded={fetchApplications}
          platform={platform}
        />
        */}
      </div>
    </MainLayout>
  );
};

export default Applications;
