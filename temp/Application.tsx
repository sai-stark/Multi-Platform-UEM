import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { applicationAPI } from "@/services/applicationAPI";
import { policyAPI } from "@/services/policyAPI";
import { Application, ApplicationPermission } from "@/types/application";
import {
  AutoUpdateMode,
  CrossProfileDataSharing,
  InstallType,
  PermissionPolicy,
} from "@/types/base";
import { ApplicationPolicy } from "@/types/policy";
import {
  AlertTriangle,
  Award,
  Ban,
  ChevronDown,
  ChevronRight,
  Download,
  Key,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Shield,
  Trash2,
  Unlock,
  Users,
  UserX,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface ApplicationPoliciesProps {
  profileId: string;
  applicationPolicies: ApplicationPolicy[];
  onUpdate: (policies: ApplicationPolicy[]) => void;
  onSave?: () => void;
  onCancel?: () => void;
  isInitializing?: boolean;
}

type ExtendedApplicationPolicy = ApplicationPolicy & {
  isNew?: boolean;
  remark?: string;
  displayName?: string;
  displayVersion?: string;
};

// Compact display helpers
const getInstallTypeDisplay = (type: InstallType) => {
  const map: Partial<Record<
    InstallType,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  >> = {
    [InstallType.INSTALL_REMOVABLE]: {
      label: "Removable",
      variant: "secondary",
    },
    [InstallType.INSTALL_NONREMOVABLE]: { label: "Non-Removable", variant: "default" },
    [InstallType.UNINSTALL]: { label: "Uninstall", variant: "destructive" },
    [InstallType.AVAILABLE]: { label: "Available", variant: "secondary" },
  };
  return map[type] || { label: type, variant: "outline" as const };
};

const getAutoUpdateDisplay = (mode: AutoUpdateMode) => {
  const map: Partial<Record<AutoUpdateMode, { icon: React.ReactNode; label: string }>> =
  {
    [AutoUpdateMode.POSTPONE]: {
      icon: <Ban className="h-3 w-3" />,
      label: "Postponed",
    },
    [AutoUpdateMode.HIGH_PRIORITY]: {
      icon: <Download className="h-3 w-3 text-green-500" />,
      label: "High",
    },
  };
  return (
    map[mode] || { icon: <RefreshCw className="h-3 w-3" />, label: "Default" }
  );
};

const getPermissionDisplay = (perm: PermissionPolicy) => {
  const map: Partial<Record<
    PermissionPolicy,
    { icon: React.ReactNode; label: string; className: string }
  >> = {
    [PermissionPolicy.PROMPT]: {
      icon: <Unlock className="h-3 w-3" />,
      label: "Prompt",
      className: "text-yellow-500",
    },
    [PermissionPolicy.GRANT]: {
      icon: <Lock className="h-3 w-3" />,
      label: "Grant",
      className: "text-green-500",
    },
    [PermissionPolicy.DENY]: {
      icon: <Ban className="h-3 w-3" />,
      label: "Deny",
      className: "text-red-500",
    },
  };
  return (
    map[perm] || {
      icon: <MoreHorizontal className="h-3 w-3" />,
      label: "Unset",
      className: "text-muted-foreground",
    }
  );
};

const getCrossProfileDisplay = (sharing: CrossProfileDataSharing) => {
  const map: Partial<Record<
    CrossProfileDataSharing,
    { icon: React.ReactNode; label: string }
  >> = {
    [CrossProfileDataSharing.DENY]: {
      icon: <UserX className="h-3 w-3 text-red-500" />,
      label: "Deny",
    },
    [CrossProfileDataSharing.ALLOW_WITH_USER_CONSENT]: {
      icon: <Users className="h-3 w-3 text-green-500" />,
      label: "Allow",
    },
  };
  return (
    map[sharing] || {
      icon: <Users className="h-3 w-3 text-muted-foreground" />,
      label: "Unset",
    }
  );
};

export const ApplicationPolicies: React.FC<ApplicationPoliciesProps> = ({
  profileId,
  applicationPolicies: initialPolicies = [],
  onUpdate,
  onSave,
  onCancel,
  isInitializing = false,
}) => {
  const { toast } = useToast();

  // State
  const [applicationPolicies, setApplicationPolicies] = useState<
    ExtendedApplicationPolicy[]
  >(initialPolicies || []);
  const [availableApps, setAvailableApps] = useState<Application[]>([]);
  const [changedPolicies, setChangedPolicies] = useState<
    ExtendedApplicationPolicy[]
  >([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [componentKey, setComponentKey] = useState<number>(Date.now());

  // Modal States
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [appToDelete, setAppToDelete] =
    useState<ExtendedApplicationPolicy | null>(null);

  // Add Application Modal States
  const [selectedAppName, setSelectedAppName] = useState<string>("");
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [selectedInstallType, setSelectedInstallType] = useState<InstallType>(
    InstallType.INSTALL_REMOVABLE
  );

  // Permissions Dialog States
  const [openPermissionDialogFor, setOpenPermissionDialogFor] =
    useState<string | null>(null);
  const [permissionList, setPermissionList] = useState<
    ApplicationPermission[]
  >([]);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [permissionSelections, setPermissionSelections] = useState<
    Record<string, PermissionPolicy | undefined>
  >({});
  // Only collect changed permission values per policyId
  const [permissionEdits, setPermissionEdits] = useState<
    Record<string, Record<string, PermissionPolicy>>
  >({});

  // Fetch available applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await applicationAPI.getApplications();
        setAvailableApps(response.content);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
        });
      }
    };
    fetchApplications();
  }, [toast]);

  // Get available app names
  const getAvailableAppNames = () => {
    const usedVersionIds = new Set(
      applicationPolicies
        .map((policy) => policy.applicationVersionId)
        .filter((id): id is string => id !== undefined)
    );
    return availableApps
      .map((app) => {
        const availableVersions = app.versions.filter(
          (version) => !usedVersionIds.has(version.id)
        );
        return { ...app, availableVersions };
      })
      .filter((app) => app.availableVersions.length > 0)
      .map((app) => ({
        name: app.name,
        packageName: app.packageName,
        displayName: `${app.name} - ${app.packageName}`,
      }));
  };

  // Get available versions for selected app
  const getAvailableVersionsForApp = (appName: string) => {
    const app = availableApps.find((a) => a.name === appName);
    if (!app) return [];
    const usedVersionIds = new Set(
      applicationPolicies
        .map((policy) => policy.applicationVersionId)
        .filter((id): id is string => id !== undefined)
    );
    return app.versions
      .filter((version) => !usedVersionIds.has(version.id))
      .map((version) => ({ id: version.id, version: version.version }));
  };

  // Get application display info
  const getAppDisplayInfo = (applicationVersionId: string) => {
    for (const app of availableApps) {
      const version = app.versions.find((v) => v.id === applicationVersionId);
      if (version) {
        return {
          name: app.name,
          version: version.version,
          packageName: app.packageName,
        };
      }
    }
    return { name: "Unknown", version: "Unknown", packageName: "" };
  };

  // Reset add application modal state
  const resetAddModalState = () => {
    setSelectedAppName("");
    setSelectedVersion("");
    setSelectedVersionId("");
    setSelectedInstallType(InstallType.INSTALL_REMOVABLE);
  };

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Handle field change
  const handleFieldChange = (
    id: string,
    field: keyof ApplicationPolicy,
    value: boolean | string | number | undefined
  ) => {
    setApplicationPolicies((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
    setChangedPolicies((prev) => {
      const rowToUpdate = applicationPolicies.find((r) => r.id === id);
      if (!rowToUpdate) return prev;
      const updatedRow = { ...rowToUpdate, [field]: value };
      if (prev.find((r) => r.id === id)) {
        return prev.map((r) => (r.id === id ? updatedRow : r));
      }
      return [...prev, updatedRow];
    });
  };

  // Add application handler
  const handleAddApplication = () => {
    if (!selectedAppName || !selectedVersion || !selectedVersionId) {
      toast({
        title: "Error",
        description: "Please select both app name and version",
        variant: "destructive",
      });
      return;
    }

    const selectedApp = availableApps.find((app) =>
      app.versions.some((v) => v.id === selectedVersionId)
    );

    if (!selectedApp) {
      toast({
        title: "Error",
        description: "Selected application not found",
        variant: "destructive",
      });
      return;
    }

    const newPolicy: ExtendedApplicationPolicy = {
      id: selectedApp.id,
      applicationVersionId: selectedVersionId,
      installType: selectedInstallType,
      disabled: false,
      defaultPermission: PermissionPolicy.PROMPT,
      // autoUpdateMode is optional and no default value in new Enum
      isNew: true,
      displayName: selectedAppName,
      displayVersion: selectedVersion,
      createdBy: "",
      lastModifiedBy: "",
      creationTime: "",
      modificationTime: "",
    };

    setChangedPolicies((prev) => [...prev, newPolicy]);
    setApplicationPolicies((prev) => [...prev, newPolicy]);
    setOpenAddModal(false);
    resetAddModalState();
  };

  // Resolve applicationId from a policy (via its applicationVersionId)
  const getApplicationIdForPolicy = (policy: ExtendedApplicationPolicy) => {
    for (const app of availableApps) {
      if (app.versions.some((v) => v.id === policy.applicationVersionId)) {
        return app.id;
      }
    }
    return undefined;
  };

  // Open permissions dialog for a policy row
  const openPermissionDialog = async (policy: ExtendedApplicationPolicy, initialAppId: string) => {
    // Try to resolve the current application ID from the available apps list
    // This handles cases where the policy might have a stale ID or we want to be sure
    const resolvedAppId = getApplicationIdForPolicy(policy);
    const appId = resolvedAppId || initialAppId;

    if (!appId) {
      toast({
        title: "Error",
        description: "Unable to resolve application for this policy.",
        variant: "destructive",
      });
      return;
    }
    setPermissionLoading(true);
    try {
      // console.log("calling getApplicationPermissions");
      const perms = await applicationAPI.getApplicationPermissions(appId);
      // console.log(perms);
      setPermissionList(perms || []);
      const existing: Record<string, PermissionPolicy | undefined> = {};
      (policy.permissionGrants || []).forEach((pg) => {
        existing[pg.permission] = pg.permissionGrant;
      });
      setPermissionSelections(existing);
      setOpenPermissionDialogFor(policy.id);
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to fetch application permissions.",
        variant: "destructive",
      });
    } finally {
      setPermissionLoading(false);
    }
  };

  // Persist permission selection changes locally (not sending yet)
  const savePermissionDialog = (policyId: string) => {
    const row = applicationPolicies.find((r) => r.id === policyId);
    const currentMap: Record<string, PermissionPolicy | undefined> = {};
    (row?.permissionGrants || []).forEach((pg) => {
      currentMap[pg.permission] = pg.permissionGrant;
    });
    const delta: Record<string, PermissionPolicy> = {};
    for (const [permId, val] of Object.entries(permissionSelections)) {
      if (val !== undefined && currentMap[permId] !== val) {
        delta[permId] = val;
      }
    }
    setPermissionEdits((prev) => ({ ...prev, [policyId]: delta }));
    setOpenPermissionDialogFor(null);
    toast({
      title: "Permissions prepared",
      description:
        Object.keys(delta).length > 0
          ? "Changes will be applied on Save."
          : "No permission changes detected.",
    });
  };

  // Delete application handler
  const handleDeleteApplication = (policy: ExtendedApplicationPolicy) => {
    setAppToDelete(policy);
    setOpenDeleteModal(true);
  };

  const confirmDeleteApplication = async () => {
    if (!appToDelete) return;
    try {
      await policyAPI.deleteApplicationPolicy(profileId, appToDelete.id);
      setApplicationPolicies((prev) =>
        prev.filter((p) => p.id !== appToDelete.id)
      );
      toast({
        title: "Success",
        description: "Application policy deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete application policy",
        variant: "destructive",
      });
    }
    setOpenDeleteModal(false);
    setAppToDelete(null);
  };

  // Save handler
  const handleSaveApplicationPolicies = async (): Promise<void> => {
    try {
      const promises: Promise<unknown>[] = [];
      const newPolicies = changedPolicies.filter((policy) => policy.isNew);
      for (const policy of newPolicies) {
        const { isNew, remark, displayName, displayVersion, ...policyData } =
          policy;
        // attach only edited permission grants for new policies (if any)
        if (permissionEdits[policy.id]) {
          (policyData as any).permissionGrants = Object.entries(
            permissionEdits[policy.id]
          ).map(([permission, permissionGrant]) => ({ permission, permissionGrant }));
        }
        promises.push(policyAPI.createApplicationPolicy(profileId, policyData));
      }
      const updatedPolicies = changedPolicies.filter((policy) => !policy.isNew);
      for (const policy of updatedPolicies) {
        const { isNew, remark, displayName, displayVersion, ...policyData } =
          policy;
        // include only changed permission grants
        if (permissionEdits[policy.id]) {
          (policyData as any).permissionGrants = Object.entries(
            permissionEdits[policy.id]
          ).map(([permission, permissionGrant]) => ({ permission, permissionGrant }));
        } else {
          delete (policyData as any).permissionGrants;
        }
        promises.push(
          policyAPI.updateApplicationPolicy(profileId, policy.id, policyData)
        );
      }
      const deletedPolicyIds = (initialPolicies || [])
        .map((policy) => policy.id)
        .filter((id) => !applicationPolicies.some((p) => p.id === id));
      for (const policyId of deletedPolicyIds) {
        promises.push(policyAPI.deleteApplicationPolicy(profileId, policyId));
      }
      await Promise.all(promises);
      onUpdate(applicationPolicies);
      if (onSave) onSave();
      setChangedPolicies([]);
      toast({
        title: "Success",
        description: "Application policies saved successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving application policies:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving application policies.",
        variant: "destructive",
      });
    }
  };

  const confirmSave = async () => {
    setOpenSaveDialog(false);
    await handleSaveApplicationPolicies();
  };

  const handleCancelChanges = () => {
    if (isInitializing) {
      setApplicationPolicies([]);
      setChangedPolicies([]);
      setComponentKey(Date.now());
      if (onCancel) onCancel();
    } else {
      setApplicationPolicies(initialPolicies || []);
      setChangedPolicies([]);
      setExpandedRows(new Set());
      setEditingRow(null);
      setComponentKey(Date.now());
      if (onCancel) onCancel();
    }
  };

  return (
    <div className="space-y-4" key={componentKey}>
      {getAvailableAppNames().length === 0 &&
        applicationPolicies.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No application exists. Please add an application before setting
              the policy.
            </AlertDescription>
          </Alert>
        )}

      {applicationPolicies.length > 0 && (
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="max-h-[60vh] overflow-auto">
            {/* Scrollable table with minimum column widths */}
            <table className="w-full min-w-[900px]">
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr className="border-b">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[200px]">
                    Application
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[140px]">
                    Install Type
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[130px]">
                    Update
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[120px]">
                    Permission
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[130px]">
                    Cross-Profile
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[100px]">
                    Security
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[80px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applicationPolicies.map((policy) => {
                  const appInfo = {
                    name:
                      policy.applicationName ||
                      policy.displayName ||
                      getAppDisplayInfo(policy.applicationVersionId).name,
                    version:
                      policy.applicationVersion ||
                      policy.displayVersion ||
                      getAppDisplayInfo(policy.applicationVersionId).version,
                    packageName:
                      policy.packageName ||
                      getAppDisplayInfo(policy.applicationVersionId).packageName,
                  };
                  const isExpanded = expandedRows.has(policy.id);
                  const isEditing = editingRow === policy.id;
                  const installDisplay = getInstallTypeDisplay(
                    policy.installType || InstallType.AVAILABLE
                  );
                  const updateDisplay = getAutoUpdateDisplay(
                    policy.autoUpdateMode as AutoUpdateMode
                  );
                  const permDisplay = getPermissionDisplay(
                    policy.defaultPermission || PermissionPolicy.PROMPT
                  );
                  const crossDisplay = getCrossProfileDisplay(
                    policy.communicateWithPersonalApp ||
                    CrossProfileDataSharing.DENY
                  );

                  return (
                    <React.Fragment key={policy.id}>
                      {/* Main Row */}
                      <tr
                        className={cn(
                          "hover:bg-muted/30 transition-colors",
                          isExpanded && "bg-muted/20"
                        )}
                      >
                        {/* Application */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRowExpansion(policy.id)}
                              className="p-1 hover:bg-muted rounded shrink-0"
                              aria-label={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <div className="min-w-0">
                              <p
                                className="text-sm font-medium"
                                title={appInfo.name}
                              >
                                {appInfo.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                v{appInfo.version}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Install Type */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {policy.disabled && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Ban className="h-4 w-4 text-red-500 shrink-0" />
                                  </TooltipTrigger>
                                  <TooltipContent>Disabled</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <Badge
                              variant={installDisplay.variant}
                              className="text-xs px-2 py-0.5"
                            >
                              {installDisplay.label}
                            </Badge>
                          </div>
                        </td>

                        {/* Update Policy */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            {updateDisplay.icon}
                            <span>{updateDisplay.label}</span>
                          </div>
                        </td>

                        {/* Permission Posture */}
                        <td className="px-4 py-3">
                          <div
                            className={cn(
                              "flex items-center gap-2 text-sm",
                              permDisplay.className
                            )}
                          >
                            {permDisplay.icon}
                            <span>{permDisplay.label}</span>
                          </div>
                        </td>

                        {/* Cross-Profile */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            {crossDisplay.icon}
                            <span>{crossDisplay.label}</span>
                          </div>
                        </td>

                        {/* Security Capabilities */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "p-1.5 rounded",
                                      policy.isCredentialProvider
                                        ? "text-blue-500 bg-blue-500/10"
                                        : "text-muted-foreground/40"
                                    )}
                                  >
                                    <Key className="h-4 w-4" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Credential Provider:{" "}
                                  {policy.isCredentialProvider ? "Yes" : "No"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "p-1.5 rounded",
                                      policy.canInstallCertificate
                                        ? "text-green-500 bg-green-500/10"
                                        : "text-muted-foreground/40"
                                    )}
                                  >
                                    <Award className="h-4 w-4" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Can Install Cert:{" "}
                                  {policy.canInstallCertificate ? "Yes" : "No"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      setEditingRow(
                                        isEditing ? null : policy.id
                                      )
                                    }
                                  >
                                    <Pencil
                                      className={cn(
                                        "h-3.5 w-3.5",
                                        isEditing && "text-primary"
                                      )}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() =>
                                      handleDeleteApplication(policy)
                                    }
                                    disabled={
                                      policy.isNew ||
                                      applicationPolicies.filter(
                                        (r) => !r.isNew
                                      ).length === 1
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {applicationPolicies.length === 1
                                    ? "Cannot delete the last row"
                                    : "Delete"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row - Inline details */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={7}
                            className="bg-muted/10 border-t border-dashed"
                          >
                            <div className="px-4 py-3 pl-10">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                {/* Install Type Editor */}
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                                    Install Type
                                  </label>
                                  {isEditing ? (
                                    <Select
                                      value={
                                        policy.installType || InstallType.AVAILABLE
                                      }
                                      onValueChange={(v) =>
                                        handleFieldChange(
                                          policy.id,
                                          "installType",
                                          v as InstallType
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.values(InstallType)
                                          .map((type) => (
                                            <SelectItem
                                              key={type}
                                              value={type}
                                              className="text-xs"
                                            >
                                              {type
                                                .replace(
                                                  /INSTALL_TYPE_|_/g,
                                                  " "
                                                )
                                                .trim()}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <p className="text-xs">
                                      {(policy.installType || InstallType.AVAILABLE)
                                        .replace(/INSTALL_TYPE_|_/g, " ")
                                        .trim()}
                                    </p>
                                  )}
                                </div>

                                {/* Auto Update Mode */}
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                                    Auto Update Mode
                                  </label>
                                  {isEditing ? (
                                    <Select
                                      value={
                                        policy.autoUpdateMode ||
                                        AutoUpdateMode.POSTPONE
                                      }
                                      onValueChange={(v) =>
                                        handleFieldChange(
                                          policy.id,
                                          "autoUpdateMode",
                                          v as AutoUpdateMode
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.values(AutoUpdateMode)
                                          .map((mode) => (
                                            <SelectItem
                                              key={mode}
                                              value={mode}
                                              className="text-xs"
                                            >
                                              {mode
                                                .replace(
                                                  /AUTO_UPDATE_MODE_|AUTO_UPDATE_|_/g,
                                                  " "
                                                )
                                                .trim()}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <p className="text-xs">
                                      {(policy.autoUpdateMode || AutoUpdateMode.POSTPONE)
                                        .replace(
                                          /AUTO_UPDATE_MODE_|AUTO_UPDATE_|_/g,
                                          " "
                                        )
                                        .trim()}
                                    </p>
                                  )}
                                </div>

                                {/* Default Permission */}
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                                    Default Permission
                                  </label>
                                  {isEditing ? (
                                    <Select
                                      value={
                                        policy.defaultPermission ||
                                        PermissionPolicy.PROMPT
                                      }
                                      onValueChange={(v) =>
                                        handleFieldChange(
                                          policy.id,
                                          "defaultPermission",
                                          v as PermissionPolicy
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[PermissionPolicy.PROMPT,
                                        PermissionPolicy.GRANT,
                                        PermissionPolicy.DENY].map((perm) => (
                                          <SelectItem
                                            key={perm}
                                            value={perm}
                                            className="text-xs"
                                          >
                                            {perm
                                              .replace(
                                                /PERMISSION_POLICY_|_/g,
                                                " "
                                              )
                                              .trim()}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <p className="text-xs">
                                      {(policy.defaultPermission || "PROMPT")
                                        .replace(/PERMISSION_POLICY_|_/g, " ")
                                        .trim()}
                                    </p>
                                  )}
                                </div>

                                {/* Cross-Profile Communication */}
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                                    Cross-Profile Communication
                                  </label>
                                  {isEditing ? (
                                    <Select
                                      value={
                                        policy.communicateWithPersonalApp ||
                                        CrossProfileDataSharing.DENY
                                      }
                                      onValueChange={(v) =>
                                        handleFieldChange(
                                          policy.id,
                                          "communicateWithPersonalApp",
                                          v as CrossProfileDataSharing
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.values(CrossProfileDataSharing)
                                          .map((s) => (
                                            <SelectItem
                                              key={s}
                                              value={s}
                                              className="text-xs"
                                            >
                                              {s
                                                .replace(
                                                  /CROSS_PROFILE_DATA_SHARING_|_/g,
                                                  " "
                                                )
                                                .trim()}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <p className="text-xs">
                                      {(policy.communicateWithPersonalApp || CrossProfileDataSharing.DENY)
                                        .replace(
                                          /CROSS_PROFILE_DATA_SHARING_|_/g,
                                          " "
                                        )
                                        .trim()}
                                    </p>
                                  )}
                                </div>

                                {/* Minimum Version Code */}
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                                    Minimum Version Code
                                  </label>
                                  {isEditing ? (
                                    <Select
                                      value={
                                        policy.minimumVersionCode?.toString() ||
                                        "any"
                                      }
                                      onValueChange={(v) =>
                                        handleFieldChange(
                                          policy.id,
                                          "minimumVersionCode",
                                          v === "any" ? undefined : Number(v)
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Any" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="any" className="text-xs">
                                          Any
                                        </SelectItem>
                                        {(() => {
                                          const appId =
                                            getApplicationIdForPolicy(policy);
                                          const app = availableApps.find(
                                            (a) => a.id === appId
                                          );
                                          const versions =
                                            app?.versions.sort(
                                              (a, b) =>
                                                b.versionCode - a.versionCode
                                            ) || [];
                                          return versions.map((v) => (
                                            <SelectItem
                                              key={v.id}
                                              value={v.versionCode.toString()}
                                              className="text-xs"
                                            >
                                              {v.version} ({v.versionCode})
                                            </SelectItem>
                                          ));
                                        })()}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <p className="text-xs">
                                      {(() => {
                                        if (
                                          policy.minimumVersionCode ===
                                          undefined
                                        )
                                          return "Any";
                                        const appId =
                                          getApplicationIdForPolicy(policy);
                                        const app = availableApps.find(
                                          (a) => a.id === appId
                                        );
                                        const version = app?.versions.find(
                                          (v) =>
                                            v.versionCode ===
                                            policy.minimumVersionCode
                                        );
                                        return version
                                          ? `${version.version} (${version.versionCode})`
                                          : policy.minimumVersionCode;
                                      })()}
                                    </p>
                                  )}
                                </div>

                                {/* Security Options */}
                                <div className="col-span-2 md:col-span-3">
                                  <label className="text-xs font-medium text-muted-foreground block mb-2">
                                    Security & Capabilities
                                  </label>
                                  <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 text-xs">
                                      <Switch
                                        checked={policy.disabled ?? false}
                                        onCheckedChange={(v) =>
                                          handleFieldChange(
                                            policy.id,
                                            "disabled",
                                            v
                                          )
                                        }
                                        disabled={!isEditing}
                                        className="scale-90"
                                      />
                                      <span>Disabled</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs">
                                      <Switch
                                        checked={
                                          policy.isCredentialProvider ?? false
                                        }
                                        onCheckedChange={(v) =>
                                          handleFieldChange(
                                            policy.id,
                                            "isCredentialProvider",
                                            v
                                          )
                                        }
                                        disabled={!isEditing}
                                        className="scale-90"
                                      />
                                      <span>Credential Provider</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs">
                                      <Switch
                                        checked={
                                          policy.canInstallCertificate ?? false
                                        }
                                        onCheckedChange={(v) =>
                                          handleFieldChange(
                                            policy.id,
                                            "canInstallCertificate",
                                            v
                                          )
                                        }
                                        disabled={!isEditing}
                                        className="scale-90"
                                      />
                                      <span>Can Install Certificate</span>
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* Additional fields placeholder */}
                              {(policy.configuration ||
                                policy.accessibleTrackIds?.length ||
                                policy.permissionGrants?.length) && (
                                  <div className="mt-4 pt-3 border-t border-dashed">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                      Advanced Configuration
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                      {policy.accessibleTrackIds &&
                                        policy.accessibleTrackIds.length > 0 && (
                                          <div>
                                            <span className="text-muted-foreground">
                                              Track IDs:{" "}
                                            </span>
                                            <span>
                                              {policy.accessibleTrackIds.join(
                                                ", "
                                              )}
                                            </span>
                                          </div>
                                        )}
                                      {policy.permissionGrants &&
                                        policy.permissionGrants.length > 0 && (
                                          <div>
                                            <span className="text-muted-foreground">
                                              Permission Grants:{" "}
                                            </span>
                                            <span>
                                              {policy.permissionGrants.length}{" "}
                                              configured
                                            </span>
                                          </div>
                                        )}
                                      {policy.configuration && (
                                        <div>
                                          <span className="text-muted-foreground">
                                            Configuration:{" "}
                                          </span>
                                          <span>
                                            {
                                              Object.keys(policy.configuration)
                                                .length
                                            }{" "}
                                            keys
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Permissions editor button */}
                              <div className="mt-4 flex justify-end">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => openPermissionDialog(policy, policy.id)}
                                >
                                  <Settings2 className="h-4 w-4 mr-2" />
                                  Set Permissions
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenAddModal(true)}
          disabled={
            getAvailableAppNames().length === 0 ||
            changedPolicies.some((p) => p.isNew)
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelChanges}
            disabled={!isInitializing && changedPolicies.length === 0}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => setOpenSaveDialog(true)}
            disabled={!isInitializing && changedPolicies.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Add Application Modal */}
      <Dialog
        open={openAddModal}
        onOpenChange={(open) => {
          setOpenAddModal(open);
          if (!open) resetAddModalState();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Application Policy</DialogTitle>
            <DialogDescription>
              Select an application and configure its initial policy settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {getAvailableAppNames().length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  All available applications have been added to this policy.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Application
                    </label>
                    <Select
                      value={selectedAppName}
                      onValueChange={(value) => {
                        setSelectedAppName(value);
                        setSelectedVersion("");
                        setSelectedVersionId("");
                        const versions = getAvailableVersionsForApp(value);
                        if (versions.length === 1) {
                          setSelectedVersion(versions[0].version);
                          setSelectedVersionId(versions[0].id);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select application" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableAppNames().map((app) => (
                          <SelectItem key={app.name} value={app.name}>
                            <span className="font-medium">{app.name}</span>
                            <span className="text-muted-foreground ml-2 text-xs">
                              {app.packageName}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Version
                    </label>
                    <Select
                      value={selectedVersion}
                      onValueChange={(value) => {
                        const versionData = getAvailableVersionsForApp(
                          selectedAppName
                        ).find((v) => v.version === value);
                        setSelectedVersion(value);
                        setSelectedVersionId(versionData?.id || "");
                      }}
                      disabled={
                        !selectedAppName ||
                        getAvailableVersionsForApp(selectedAppName).length === 1
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableVersionsForApp(selectedAppName).map(
                          (version) => (
                            <SelectItem
                              key={version.id}
                              value={version.version}
                            >
                              Version {version.version}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Install Type
                    </label>
                    <Select
                      value={selectedInstallType}
                      onValueChange={(v) =>
                        setSelectedInstallType(v as InstallType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(InstallType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/INSTALL_TYPE_|_/g, " ").trim()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setOpenAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddApplication}
                    disabled={
                      !selectedAppName || !selectedVersion || !selectedVersionId
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Application Policy?
            </DialogTitle>
            <DialogDescription>
              {appToDelete &&
                (() => {
                  const appInfo = appToDelete.displayName
                    ? {
                      name: appToDelete.displayName,
                      version: appToDelete.displayVersion,
                    }
                    : getAppDisplayInfo(appToDelete.applicationVersionId);
                  return (
                    <>
                      Are you sure you want to delete the policy for{" "}
                      <strong>{appInfo.name}</strong> (v{appInfo.version})? This
                      action cannot be undone.
                    </>
                  );
                })()}
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Associated settings will also be removed.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteApplication}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Modal */}
      <Dialog open={openSaveDialog} onOpenChange={setOpenSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save Application Policies
            </DialogTitle>
            <DialogDescription>
              Do you want to save the changes to the Application policy?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog
        open={openPermissionDialogFor !== null}
        onOpenChange={(open) => !open && setOpenPermissionDialogFor(null)}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Set Application Permissions
            </DialogTitle>
            <DialogDescription>
              Select how each permission should be handled for this app
              (Prompt/Grant/Deny). Only changed entries will be sent on save.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            {permissionLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : permissionList.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No permissions available.
              </div>
            ) : (
              <div className="space-y-3">
                {permissionList.map((p) => (
                  <div
                    key={p.permissionId}
                    className="flex items-start justify-between gap-4 border rounded p-3"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {p.name || p.permissionId}
                      </div>
                      {p.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {p.description}
                        </div>
                      )}
                    </div>
                    <div className="w-[180px]">
                      <Select
                        value={permissionSelections[p.permissionId]}
                        onValueChange={(v) =>
                          setPermissionSelections((prev) => ({
                            ...prev,
                            [p.permissionId]: v as PermissionPolicy,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[PermissionPolicy.PROMPT,
                          PermissionPolicy.GRANT,
                          PermissionPolicy.DENY].map((perm) => (
                            <SelectItem key={perm} value={perm}>
                              {perm}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenPermissionDialogFor(null)}
            >
              Cancel
            </Button>
            {openPermissionDialogFor && (
              <Button onClick={() => savePermissionDialog(openPermissionDialogFor)}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
