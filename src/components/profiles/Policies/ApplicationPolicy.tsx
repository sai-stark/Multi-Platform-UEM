import {
  ITunesSearchResult,
  ITunesSearchService,
} from "@/api/services/itunesSearch";
import {
  DeviceApplication,
  MobileApplicationService,
} from "@/api/services/mobileApps";
import { PolicyService } from "@/api/services/policies";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  AndroidApplicationPolicy,
  ApplicationAction,
  ApplicationPolicy,
  IosApplicationPolicy,
  Platform,
} from "@/types/models";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ApplicationPolicyProps {
  profileId: string;
  platform: Platform;
  initialData?: ApplicationPolicy[];
  onSave: () => void;
  onCancel: () => void;
}

// Type guards
const isIosApplicationPolicy = (
  policy: ApplicationPolicy
): policy is IosApplicationPolicy => {
  return (
    policy.devicePolicyType === "IosApplicationPolicy" ||
    ("bundleIdentifier" in policy && !("applicationVersionId" in policy))
  );
};

const isAndroidApplicationPolicy = (
  policy: ApplicationPolicy
): policy is AndroidApplicationPolicy => {
  return (
    policy.devicePolicyType === "AndroidApplicationPolicy" ||
    ("applicationVersionId" in policy && !("bundleIdentifier" in policy))
  );
};

// Deep equality check for policy comparison
const arePoliciesEqual = (
  a: ApplicationPolicy,
  b: ApplicationPolicy
): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const ApplicationPolicyEditor = ({
  profileId,
  platform,
  initialData,
  onSave,
  onCancel,
}: ApplicationPolicyProps) => {
  const { toast } = useToast();

  // Existing policies state
  const [existingPolicies, setExistingPolicies] = useState<ApplicationPolicy[]>(
    []
  );
  const [originalPolicies, setOriginalPolicies] = useState<ApplicationPolicy[]>(
    []
  );
  const [isFetching, setIsFetching] = useState(false);

  // Available apps (for Android)
  const [availableApps, setAvailableApps] = useState<DeviceApplication[]>([]);

  // New app staging state (for iOS)
  const [stagedNewApp, setStagedNewApp] = useState<IosApplicationPolicy | null>(
    null
  );

  // iTunes Search state (iOS only)
  const [itunesSearchTerm, setItunesSearchTerm] = useState("");
  const [itunesResults, setItunesResults] = useState<ITunesSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "create" | "edit" | "delete";
    title: string;
    description: string;
    onConfirm: () => void;
    loading?: boolean;
  }>({
    open: false,
    type: "create",
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Expanded policies state (for collapsible)
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(
    new Set()
  );

  // Edit state tracking
  const [editingPolicies, setEditingPolicies] = useState<
    Map<string, ApplicationPolicy>
  >(new Map());

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  useEffect(() => {
    loadApplications();
    if (initialData && initialData.length > 0) {
      const normalized = initialData.map((p) => ({
        ...p,
        devicePolicyType:
          p.devicePolicyType ||
          (platform === "ios"
            ? "IosApplicationPolicy"
            : "AndroidApplicationPolicy"),
      })) as ApplicationPolicy[];
      setExistingPolicies(normalized);
      setOriginalPolicies(JSON.parse(JSON.stringify(normalized)));
    } else {
      loadExistingPolicies();
    }
  }, [platform, profileId]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadApplications = async () => {
    try {
      const apps = await MobileApplicationService.getApplications(platform);
      setAvailableApps(apps);
    } catch (error) {
      console.error("Failed to load apps", error);
    }
  };

  const loadExistingPolicies = async () => {
    setIsFetching(true);
    try {
      const response = await PolicyService.getApplicationPolicies(
        platform,
        profileId
      );
      const normalizedPolicies = response.content.map((policy) => ({
        ...policy,
        devicePolicyType:
          policy.devicePolicyType ||
          (platform === "ios"
            ? "IosApplicationPolicy"
            : "AndroidApplicationPolicy"),
      })) as ApplicationPolicy[];
      setExistingPolicies(normalizedPolicies);
      setOriginalPolicies(JSON.parse(JSON.stringify(normalizedPolicies)));
    } catch (error) {
      console.error("Failed to load policies", error);
    } finally {
      setIsFetching(false);
    }
  };

  // ============================================================================
  // ITUNES SEARCH (iOS)
  // ============================================================================
  const searchITunes = useCallback(
    async (term: string) => {
      if (!term || term.trim().length < 2) {
        setItunesResults([]);
        setShowSearchResults(false);
        return;
      }
      setIsSearching(true);
      try {
        const results = await ITunesSearchService.searchApps(term);
        setItunesResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error("iTunes search failed:", error);
        toast({
          title: "Search Error",
          description: "Failed to search iTunes Store",
          variant: "destructive",
        });
        setItunesResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [toast]
  );

  const handleItunesSearchChange = (value: string) => {
    setItunesSearchTerm(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchITunes(value);
    }, 400);
  };

  const clearItunesSearch = () => {
    setItunesSearchTerm("");
    setItunesResults([]);
    setShowSearchResults(false);
  };

  // ============================================================================
  // STAGING NEW APP (before create)
  // ============================================================================
  const handleSelectItunesApp = (app: ITunesSearchResult) => {
    // Check if already exists
    const exists = existingPolicies.some(
      (p) => isIosApplicationPolicy(p) && p.bundleIdentifier === app.bundleId
    );
    if (exists) {
      toast({
        title: "App Already Exists",
        description: `${app.trackName} is already in your policies`,
        variant: "default",
      });
      return;
    }

    // Stage the new app with default values
    const now = new Date().toISOString();
    const newPolicy: IosApplicationPolicy = {
      creationTime: now,
      modificationTime: now,
      createdBy: "",
      lastModifiedBy: "",
      name: app.trackName,
      bundleIdentifier: app.bundleId,
      action: "INSTALL",
      purchaseMethod: 1,
      removable: true,
      requestRequiresNetworkTether: true,
      devicePolicyType: "IosApplicationPolicy",
    };

    setStagedNewApp(newPolicy);
    clearItunesSearch();
  };

  const updateStagedApp = (updates: Partial<IosApplicationPolicy>) => {
    if (stagedNewApp) {
      setStagedNewApp({ ...stagedNewApp, ...updates });
    }
  };

  const cancelStagedApp = () => {
    setStagedNewApp(null);
  };

  // ============================================================================
  // CREATE (POST)
  // ============================================================================
  const handleCreateConfirm = () => {
    if (!stagedNewApp) return;

    setConfirmDialog({
      open: true,
      type: "create",
      title: "Add Application Policy",
      description: `Are you sure you want to add "${stagedNewApp.name}" to the application policies?`,
      onConfirm: executeCreate,
    });
  };

  const executeCreate = async () => {
    if (!stagedNewApp) return;

    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await PolicyService.createApplicationPolicy(
        platform,
        profileId,
        stagedNewApp
      );
      toast({
        title: "Success",
        description: `${stagedNewApp.name} has been added to policies`,
      });
      setStagedNewApp(null);
      await loadExistingPolicies();
    } catch (error) {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description: "Failed to create application policy",
        variant: "destructive",
      });
    } finally {
      setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
    }
  };

  // ============================================================================
  // EDIT (PUT)
  // ============================================================================
  const getPolicyKey = (policy: ApplicationPolicy): string => {
    if (isIosApplicationPolicy(policy)) {
      return policy.id || policy.bundleIdentifier;
    }
    return policy.id || policy.applicationVersionId;
  };

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedPolicies);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedPolicies(newExpanded);
  };

  const startEditing = (policy: ApplicationPolicy) => {
    const key = getPolicyKey(policy);
    setEditingPolicies(
      new Map(editingPolicies).set(key, JSON.parse(JSON.stringify(policy)))
    );
  };

  const updateEditingPolicy = (
    key: string,
    updates: Partial<ApplicationPolicy>
  ) => {
    const current = editingPolicies.get(key);
    if (current) {
      const updated = {
        ...current,
        ...updates,
        modificationTime: new Date().toISOString(),
      };
      setEditingPolicies(
        new Map(editingPolicies).set(key, updated as ApplicationPolicy)
      );
    }
  };

  const cancelEditing = (key: string) => {
    const newEditing = new Map(editingPolicies);
    newEditing.delete(key);
    setEditingPolicies(newEditing);
  };

  const hasChanges = (key: string): boolean => {
    const edited = editingPolicies.get(key);
    const original = originalPolicies.find((p) => getPolicyKey(p) === key);
    if (!edited || !original) return false;
    return !arePoliciesEqual(edited, original);
  };

  const handleEditConfirm = (key: string) => {
    const editedPolicy = editingPolicies.get(key);
    if (!editedPolicy) return;

    const appName = isIosApplicationPolicy(editedPolicy)
      ? editedPolicy.name
      : "Application";

    setConfirmDialog({
      open: true,
      type: "edit",
      title: "Save Changes",
      description: `Are you sure you want to save changes to "${appName}"?`,
      onConfirm: () => executeEdit(key),
    });
  };

  const executeEdit = async (key: string) => {
    const editedPolicy = editingPolicies.get(key);
    if (!editedPolicy || !editedPolicy.id) return;

    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await PolicyService.updateApplicationPolicy(
        platform,
        profileId,
        editedPolicy.id,
        editedPolicy
      );
      toast({
        title: "Success",
        description: "Application policy updated successfully",
      });
      cancelEditing(key);
      await loadExistingPolicies();
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update application policy",
        variant: "destructive",
      });
    } finally {
      setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
    }
  };

  // ============================================================================
  // DELETE
  // ============================================================================
  const handleDeleteConfirm = (policy: ApplicationPolicy) => {
    const appName = isIosApplicationPolicy(policy)
      ? policy.name
      : "Application";

    setConfirmDialog({
      open: true,
      type: "delete",
      title: "Delete Application Policy",
      description: `Are you sure you want to delete "${appName}"? This action cannot be undone.`,
      onConfirm: () => executeDelete(policy),
    });
  };

  const executeDelete = async (policy: ApplicationPolicy) => {
    if (!policy.id) return;

    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await PolicyService.deleteApplicationPolicy(
        platform,
        profileId,
        policy.id
      );
      const appName = isIosApplicationPolicy(policy)
        ? policy.name
        : "Application";
      toast({
        title: "Success",
        description: `${appName} has been removed from policies`,
      });
      await loadExistingPolicies();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete application policy",
        variant: "destructive",
      });
    } finally {
      setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
    }
  };

  // ============================================================================
  // ANDROID: Add app from dropdown
  // ============================================================================
  const handleAddAndroidApp = (appId: string) => {
    const app = availableApps.find((a) => a.appId === appId);
    if (!app) return;

    const exists = existingPolicies.some(
      (p) =>
        isAndroidApplicationPolicy(p) &&
        p.applicationVersionId === app.appVersionId
    );
    if (exists) {
      toast({
        title: "App Already Exists",
        description: `${app.name} is already in your policies`,
      });
      return;
    }

    const now = new Date().toISOString();
    const newPolicy: AndroidApplicationPolicy = {
      creationTime: now,
      modificationTime: now,
      createdBy: "",
      lastModifiedBy: "",
      applicationVersionId: app.appVersionId,
      applicationVersion: app.appVersion,
      action: "INSTALL",
      devicePolicyType: "AndroidApplicationPolicy",
    };

    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      type: "create",
      title: "Add Application Policy",
      description: `Are you sure you want to add "${app.name}" to the application policies?`,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
          await PolicyService.createApplicationPolicy(
            platform,
            profileId,
            newPolicy
          );
          toast({
            title: "Success",
            description: `${app.name} has been added to policies`,
          });
          await loadExistingPolicies();
        } catch (error) {
          console.error("Create error:", error);
          toast({
            title: "Error",
            description: "Failed to create application policy",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({
            ...prev,
            open: false,
            loading: false,
          }));
        }
      },
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="space-y-8">
      {/* ================================================================ */}
      {/* SECTION 1: ADD NEW APPLICATION */}
      {/* ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-5 h-5" />
            Add New Application
          </CardTitle>
          <CardDescription>
            {platform === "ios"
              ? "Search the iTunes Store to find and add iOS applications"
              : "Select from available applications to add to your policy"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* iOS: iTunes Search */}
          {platform === "ios" && !stagedNewApp && (
            <div className="space-y-2" ref={searchContainerRef}>
              <Label
                htmlFor="itunes-search"
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search iTunes Store
              </Label>
              <div className="relative">
                <Input
                  id="itunes-search"
                  type="text"
                  placeholder="Search for apps (e.g., Amazon, Slack, Zoom)..."
                  value={itunesSearchTerm}
                  onChange={(e) => handleItunesSearchChange(e.target.value)}
                  onFocus={() =>
                    itunesResults.length > 0 && setShowSearchResults(true)
                  }
                  className="pr-16"
                  aria-label="Search iTunes Store for iOS apps"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {isSearching && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  {itunesSearchTerm && !isSearching && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={clearItunesSearch}
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && itunesResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[320px] overflow-y-auto">
                    <div className="p-2 text-xs text-muted-foreground border-b sticky top-0 bg-popover">
                      {itunesResults.length} app
                      {itunesResults.length !== 1 ? "s" : ""} found — Click to
                      select
                    </div>
                    <ul role="listbox" aria-label="iTunes search results">
                      {itunesResults.map((app) => {
                        const isAdded = existingPolicies.some(
                          (p) =>
                            isIosApplicationPolicy(p) &&
                            p.bundleIdentifier === app.bundleId
                        );
                        return (
                          <li
                            key={app.trackId}
                            role="option"
                            aria-selected={isAdded}
                          >
                            <button
                              type="button"
                              disabled={isAdded}
                              onClick={() => handleSelectItunesApp(app)}
                              className={`w-full flex items-center gap-3 p-3 text-left hover:bg-accent transition-colors border-b last:border-b-0 ${
                                isAdded
                                  ? "opacity-50 cursor-not-allowed bg-muted"
                                  : "cursor-pointer"
                              }`}
                            >
                              {app.artworkUrl60 && (
                                <img
                                  src={app.artworkUrl60}
                                  alt=""
                                  className="w-10 h-10 rounded-lg flex-shrink-0"
                                  loading="lazy"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {app.trackName}
                                  {isAdded && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      (Already added)
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {app.bundleId}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {app.sellerName} • {app.primaryGenreName}
                                </div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* No Results */}
                {showSearchResults &&
                  itunesResults.length === 0 &&
                  !isSearching &&
                  itunesSearchTerm.length >= 2 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                      No apps found for "{itunesSearchTerm}"
                    </div>
                  )}
              </div>
              <p className="text-xs text-muted-foreground">
                Type at least 2 characters to search. Select an app to configure
                its policy settings.
              </p>
            </div>
          )}

          {/* iOS: Staged New App Form */}
          {platform === "ios" && stagedNewApp && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{stagedNewApp.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {stagedNewApp.bundleIdentifier}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={cancelStagedApp}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staged-action">Action</Label>
                  <Select
                    value={stagedNewApp.action}
                    onValueChange={(val: "INSTALL") =>
                      updateStagedApp({ action: val })
                    }
                  >
                    <SelectTrigger id="staged-action">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INSTALL">Install</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staged-purchase">Purchase Method</Label>
                  <Select
                    value={stagedNewApp.purchaseMethod?.toString() ?? "1"}
                    onValueChange={(val) =>
                      updateStagedApp({ purchaseMethod: parseInt(val) })
                    }
                  >
                    <SelectTrigger id="staged-purchase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">
                        Free/VPP with redemption code
                      </SelectItem>
                      <SelectItem value="1">VPP app assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="staged-removable"
                    checked={stagedNewApp.removable ?? true}
                    onCheckedChange={(checked) =>
                      updateStagedApp({ removable: checked as boolean })
                    }
                  />
                  <Label htmlFor="staged-removable" className="cursor-pointer">
                    Removable
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="staged-network"
                    checked={stagedNewApp.requestRequiresNetworkTether ?? true}
                    onCheckedChange={(checked) =>
                      updateStagedApp({
                        requestRequiresNetworkTether: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="staged-network" className="cursor-pointer">
                    Requires Network Tether
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={cancelStagedApp}>
                  Cancel
                </Button>
                <Button onClick={handleCreateConfirm} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add to Policy
                </Button>
              </div>
            </div>
          )}

          {/* Android: Select from available apps */}
          {platform === "android" && (
            <div className="space-y-2">
              <Label htmlFor="android-app-select">Select Application</Label>
              <Select onValueChange={handleAddAndroidApp}>
                <SelectTrigger id="android-app-select">
                  <SelectValue placeholder="Choose an application to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availableApps.map((app) => {
                    const exists = existingPolicies.some(
                      (p) =>
                        isAndroidApplicationPolicy(p) &&
                        p.applicationVersionId === app.appVersionId
                    );
                    return (
                      <SelectItem
                        key={app.appId}
                        value={app.appId}
                        disabled={exists}
                      >
                        {app.name} ({app.appVersion})
                        {exists && " (Already added)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* SECTION 2: EXISTING APPLICATION POLICIES */}
      {/* ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Edit2 className="w-5 h-5" />
            Existing Application Policies
            {existingPolicies.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {existingPolicies.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            View, edit, or remove existing application policies. Click on an app
            to expand its details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="text-center p-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading policies...
            </div>
          ) : existingPolicies.length === 0 ? (
            <div className="text-center p-8 border rounded-lg text-muted-foreground border-dashed">
              No application policies configured yet. Use the search above to
              add applications.
            </div>
          ) : (
            <div className="space-y-3">
              {existingPolicies.map((policy) => {
                const key = getPolicyKey(policy);
                const isExpanded = expandedPolicies.has(key);
                const isEditing = editingPolicies.has(key);
                const editedPolicy = editingPolicies.get(key) || policy;
                const changed = hasChanges(key);
                const appDetails = isAndroidApplicationPolicy(policy)
                  ? availableApps.find(
                      (a) => a.appVersionId === policy.applicationVersionId
                    )
                  : null;

                return (
                  <Collapsible
                    key={key}
                    open={isExpanded}
                    onOpenChange={() => toggleExpanded(key)}
                  >
                    <div className="border rounded-lg overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <button
                          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                          aria-expanded={isExpanded}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <div>
                              <div className="font-medium">
                                {isIosApplicationPolicy(policy)
                                  ? policy.name
                                  : appDetails?.name || "Unknown App"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {isIosApplicationPolicy(policy)
                                  ? policy.bundleIdentifier
                                  : `Version: ${policy.applicationVersion}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{policy.action}</Badge>
                            {isEditing && changed && (
                              <Badge variant="secondary">Modified</Badge>
                            )}
                          </div>
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="border-t p-4 bg-muted/20">
                          {isIosApplicationPolicy(editedPolicy) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  value={
                                    (editedPolicy as IosApplicationPolicy)
                                      .name || ""
                                  }
                                  onChange={(e) => {
                                    if (!isEditing) startEditing(policy);
                                    updateEditingPolicy(key, {
                                      name: e.target.value,
                                    });
                                  }}
                                  onFocus={() =>
                                    !isEditing && startEditing(policy)
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Bundle Identifier</Label>
                                <Input
                                  value={
                                    (editedPolicy as IosApplicationPolicy)
                                      .bundleIdentifier || ""
                                  }
                                  disabled
                                  className="bg-muted"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Action</Label>
                                <Select
                                  value={
                                    (editedPolicy as IosApplicationPolicy)
                                      .action || "INSTALL"
                                  }
                                  onValueChange={(val: "INSTALL") => {
                                    if (!isEditing) startEditing(policy);
                                    updateEditingPolicy(key, { action: val });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="INSTALL">
                                      Install
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Purchase Method</Label>
                                <Select
                                  value={
                                    (
                                      editedPolicy as IosApplicationPolicy
                                    ).purchaseMethod?.toString() ?? "0"
                                  }
                                  onValueChange={(val) => {
                                    if (!isEditing) startEditing(policy);
                                    updateEditingPolicy(key, {
                                      purchaseMethod: parseInt(val),
                                    });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">
                                      Free/VPP with redemption code
                                    </SelectItem>
                                    <SelectItem value="1">
                                      VPP app assignment
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`removable-${key}`}
                                  checked={
                                    (editedPolicy as IosApplicationPolicy)
                                      .removable ?? true
                                  }
                                  onCheckedChange={(checked) => {
                                    if (!isEditing) startEditing(policy);
                                    updateEditingPolicy(key, {
                                      removable: checked as boolean,
                                    });
                                  }}
                                />
                                <Label
                                  htmlFor={`removable-${key}`}
                                  className="cursor-pointer"
                                >
                                  Removable
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`network-${key}`}
                                  checked={
                                    (editedPolicy as IosApplicationPolicy)
                                      .requestRequiresNetworkTether ?? false
                                  }
                                  onCheckedChange={(checked) => {
                                    if (!isEditing) startEditing(policy);
                                    updateEditingPolicy(key, {
                                      requestRequiresNetworkTether:
                                        checked as boolean,
                                    });
                                  }}
                                />
                                <Label
                                  htmlFor={`network-${key}`}
                                  className="cursor-pointer"
                                >
                                  Requires Network Tether
                                </Label>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Action</Label>
                                <Select
                                  value={
                                    (editedPolicy as AndroidApplicationPolicy)
                                      .action || "INSTALL"
                                  }
                                  onValueChange={(val: ApplicationAction) => {
                                    if (!isEditing) startEditing(policy);
                                    updateEditingPolicy(key, { action: val });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="INSTALL">
                                      Install
                                    </SelectItem>
                                    <SelectItem value="UNINSTALL">
                                      Uninstall
                                    </SelectItem>
                                    <SelectItem value="ALLOW">Allow</SelectItem>
                                    <SelectItem value="BLOCK">Block</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Application Version</Label>
                                <Input
                                  value={
                                    (editedPolicy as AndroidApplicationPolicy)
                                      .applicationVersion || ""
                                  }
                                  disabled
                                  className="bg-muted"
                                />
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteConfirm(policy)}
                              className="gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>

                            <div className="flex gap-2">
                              {isEditing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => cancelEditing(key)}
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                size="sm"
                                disabled={!isEditing || !changed}
                                onClick={() => handleEditConfirm(key)}
                                className="gap-2"
                              >
                                <Save className="w-4 h-4" />
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !confirmDialog.loading &&
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmDialog.loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog.onConfirm}
              disabled={confirmDialog.loading}
              className={
                confirmDialog.type === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmDialog.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : confirmDialog.type === "delete" ? (
                "Delete"
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
