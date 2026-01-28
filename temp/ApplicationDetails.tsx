import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Loader2,
  Package,
  Shield,
  Settings,
  Download,
  Calendar,
  Users,
  Plus,
  Trash2,
  Edit,
  User,
  Tag,
  Star,
  Info,
  Lock,
  Play,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { applicationAPI } from "@/services/applicationAPI";
import { 
  Application, 
  AppAction, 
  ApplicationConfiguration, 
  ApplicationPermission,
  ContentRating,
  AppVersion,
} from "@/types";
import { authenticatedPrefixPath } from "@/config/env";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState<string | null>(
    null
  );
  const [hoveredCopyButton, setHoveredCopyButton] = useState<string | null>(
    null
  );
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    type: "app" | "version";
    action: "mandatory" | "blocked";
    versionId?: string;
    versionName?: string;
  }>({
    isOpen: false,
    type: "app",
    action: "mandatory",
  });
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [versionConfigurations, setVersionConfigurations] = useState<
    ApplicationConfiguration[]
  >([]);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  // Fetch application details
  const {
    data: application,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["application", id],
    queryFn: () => applicationAPI.getApplication(id!),
    enabled: !!id,
  });

  // Fetch application permissions
  const { data: permissions = [] } = useQuery({
    queryKey: ["applicationPermissions", id],
    queryFn: () => applicationAPI.getApplicationPermissions(id!),
    enabled: !!id,
  });

  // Application action mutation
  const applicationActionMutation = useMutation({
    mutationFn: (action: AppAction) =>
      applicationAPI.setApplicationAction(id!, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
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

  // Version action mutation
  const versionActionMutation = useMutation({
    mutationFn: ({
      versionId,
      action,
    }: {
      versionId: string;
      action: AppAction;
    }) => applicationAPI.setApplicationVersionAction(id!, versionId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({
        title: "Success",
        description: "Version action updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update version action",
        variant: "destructive",
      });
    },
  });

  // Configuration mutations
  const updateConfigurationsMutation = useMutation({
    mutationFn: ({
      versionId,
      configurations,
    }: {
      versionId: string;
      configurations: ApplicationConfiguration[];
    }) =>
      applicationAPI.updateApplicationVersionConfigurations(
        id!,
        versionId,
        configurations
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({
        title: "Success",
        description: "Configurations updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update configurations",
        variant: "destructive",
      });
    },
  });

  const deleteConfigurationsMutation = useMutation({
    mutationFn: (versionId: string) =>
      applicationAPI.deleteApplicationVersionConfigurations(id!, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setVersionConfigurations([]);
      toast({
        title: "Success",
        description: "Configurations deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete configurations",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setShowCopiedTooltip(fieldName);
      setTimeout(() => {
        setCopiedField(null);
        setShowCopiedTooltip(null);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedField(fieldName);
      setShowCopiedTooltip(fieldName);
      setTimeout(() => {
        setCopiedField(null);
        setShowCopiedTooltip(null);
      }, 2000);
    }
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
    const ratingConfig: Record<ContentRating, { label: string; color: string }> = {
      [ContentRating.THREE_YEARS]: { label: "3+", color: "bg-green-100 text-green-800" },
      [ContentRating.SEVEN_YEARS]: { label: "7+", color: "bg-blue-100 text-blue-800" },
      [ContentRating.TWELVE_YEARS]: { label: "12+", color: "bg-yellow-100 text-yellow-800" },
      [ContentRating.SIXTEEN_YEARS]: { label: "16+", color: "bg-orange-100 text-orange-800" },
      [ContentRating.EIGHTEEN_YEARS]: { label: "18+", color: "bg-red-100 text-red-800" },
    };
    const config = ratingConfig[rating];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isMandatory: boolean, isBlocked: boolean) => {
    if (isBlocked) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Blocked
        </Badge>
      );
    }
    if (isMandatory) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Mandatory
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Optional
      </Badge>
    );
  };

  const handleApplicationAction = (action: "mandatory" | "blocked") => {
    if (!application) return;

    setConfirmationDialog({
      isOpen: true,
      type: "app",
      action,
    });
  };

  const handleVersionAction = (
    versionId: string,
    action: "mandatory" | "blocked"
  ) => {
    if (!application) return;

    const version = application.versions.find((v) => v.id === versionId);
    if (!version) return;

    setConfirmationDialog({
      isOpen: true,
      type: "version",
      action,
      versionId,
      versionName: version.version,
    });
  };

  const confirmAction = () => {
    if (!application) return;

    const { type, action, versionId } = confirmationDialog;

    if (type === "app") {
      const newValue =
        action === "mandatory"
          ? !application.isMandatory
          : !application.isBlocked;
      const appAction: AppAction = {
        [action === "mandatory" ? "isMandatory" : "isBlocked"]: newValue,
      };
      applicationActionMutation.mutate(appAction);
    } else if (type === "version" && versionId) {
      const version = application.versions.find((v) => v.id === versionId);
      if (!version) return;

      const newValue =
        action === "mandatory" ? !version.isMandatory : !version.isBlocked;
      const appAction: AppAction = {
        [action === "mandatory" ? "isMandatory" : "isBlocked"]: newValue,
      };
      versionActionMutation.mutate({ versionId, action: appAction });
    }

    setConfirmationDialog({
      isOpen: false,
      type: "app",
      action: "mandatory",
    });
  };

  const cancelAction = () => {
    setConfirmationDialog({
      isOpen: false,
      type: "app",
      action: "mandatory",
    });
  };

  // Configuration management functions
  const openConfigDialog = async (versionId: string) => {
    setSelectedVersionId(versionId);
    try {
      const configs = await applicationAPI.getApplicationVersionConfigurations(
        id!,
        versionId
      );
      setVersionConfigurations(configs);
    } catch (error) {
      // If no configurations exist, start with empty array
      setVersionConfigurations([]);
    }
    setIsConfigDialogOpen(true);
  };

  const addConfiguration = () => {
    setVersionConfigurations([
      ...versionConfigurations,
      { key: "", valueType: "string" },
    ]);
  };

  const removeConfiguration = (index: number) => {
    setVersionConfigurations(
      versionConfigurations.filter((_, i) => i !== index)
    );
  };

  const updateConfiguration = (
    index: number,
    field: keyof ApplicationConfiguration,
    value: string
  ) => {
    const updatedConfigs = [...versionConfigurations];
    updatedConfigs[index] = { ...updatedConfigs[index], [field]: value };
    setVersionConfigurations(updatedConfigs);
  };

  const saveConfigurations = () => {
    if (!selectedVersionId) return;
    updateConfigurationsMutation.mutate({
      versionId: selectedVersionId,
      configurations: versionConfigurations,
    });
    setIsConfigDialogOpen(false);
  };

  const deleteAllConfigurations = () => {
    if (!selectedVersionId) return;
    deleteConfigurationsMutation.mutate(selectedVersionId);
    setIsConfigDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading application details...</span>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Error loading application
          </h3>
          <p className="text-muted-foreground mb-4">
            Failed to load application details. Please try again.
          </p>
          <Button onClick={() => navigate(`/${authenticatedPrefixPath}/applications`)}>
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const totalDevices = application.versions.reduce(
    (sum, v) => sum + v.deviceCount,
    0
  );

  return (
    <TooltipProvider>
      <div className="space-y-6 min-h-screen flex flex-col">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Application Details</h1>
          <p className="text-muted-foreground mt-2">
            Detailed information about "{application.name}"
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Application Name
                  </label>
                  <p className="text-sm font-medium">{application.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Package Name
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono">{application.packageName}</p>
                    <Tooltip
                      open={
                        showCopiedTooltip === "packageName" ||
                        hoveredCopyButton === "packageName"
                      }
                    >
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              application.packageName,
                              "packageName"
                            )
                          }
                          onMouseEnter={() =>
                            setHoveredCopyButton("packageName")
                          }
                          onMouseLeave={() => setHoveredCopyButton(null)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {showCopiedTooltip === "packageName"
                            ? "Copied!"
                            : "Copy Package Name"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Author
                  </label>
                  <p className="text-sm">{application.author || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Category
                  </label>
                  {application.category ? (
                    <Badge variant="outline" className="mt-1">{application.category}</Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Content Rating
                  </label>
                  <div className="mt-1">
                    {application.contentRating ? (
                      getContentRatingBadge(application.contentRating)
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Total Devices
                  </label>
                  <p className="text-sm font-medium">{totalDevices}</p>
                </div>
              </div>

              {application.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Description
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">{application.description}</p>
                </div>
              )}

              {application.appTracks && application.appTracks.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    App Tracks
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {application.appTracks.map((track) => (
                      <Badge key={track.trackId} variant="secondary" className="text-xs">
                        {track.trackAlias}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(
                      application.isMandatory,
                      application.isBlocked
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Actions
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplicationAction("mandatory")}
                          disabled={applicationActionMutation.isPending}
                          className={`h-7 w-7 p-0 ${
                            application.isMandatory
                              ? "bg-blue-100 text-blue-600 border-blue-300"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          {applicationActionMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {application.isMandatory
                            ? "Remove Mandatory"
                            : "Set Mandatory"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplicationAction("blocked")}
                          disabled={applicationActionMutation.isPending}
                          className={`h-7 w-7 p-0 ${
                            application.isBlocked
                              ? "bg-red-100 text-red-600 border-red-300"
                              : "hover:bg-red-50"
                          }`}
                        >
                          {applicationActionMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{application.isBlocked ? "Unblock" : "Block"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Version Information
              </CardTitle>
              <CardDescription>
                {application.versions.length} version{application.versions.length !== 1 ? 's' : ''} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {application.versions.length > 0 ? (
                <div className="space-y-3">
                  {application.versions.map((version, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              Version {version.version}
                            </p>
                            {version.versionCode && (
                              <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                Code: {version.versionCode}
                              </span>
                            )}
                            {version.isProduction && (
                              <Badge className="text-xs bg-green-100 text-green-800">
                                Production
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {version.deviceCount} devices installed • {version.profileCount} profiles
                          </p>
                          {version.trackIds && version.trackIds.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-muted-foreground">Tracks:</span>
                              {version.trackIds.map((trackId) => (
                                <Badge key={trackId} variant="outline" className="text-xs">
                                  {trackId}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {version.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(version.url, "_blank")}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Status:
                          </span>
                          {getStatusBadge(
                            version.isMandatory,
                            version.isBlocked
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleVersionAction(version.id, "mandatory")
                                }
                                disabled={versionActionMutation.isPending}
                                className={`h-7 w-7 p-0 ${
                                  version.isMandatory
                                    ? "bg-blue-100 text-blue-600 border-blue-300"
                                    : "hover:bg-blue-50"
                                }`}
                              >
                                {versionActionMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {version.isMandatory
                                  ? "Remove Mandatory"
                                  : "Set Mandatory"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleVersionAction(version.id, "blocked")
                                }
                                disabled={versionActionMutation.isPending}
                                className={`h-7 w-7 p-0 ${
                                  version.isBlocked
                                    ? "bg-red-100 text-red-600 border-red-300"
                                    : "hover:bg-red-50"
                                }`}
                              >
                                {versionActionMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{version.isBlocked ? "Unblock" : "Block"}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openConfigDialog(version.id)}
                                className="h-7 w-7 p-0 hover:bg-gray-50"
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Manage Configurations</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No versions available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Device Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Device Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalDevices > 0 ? (
                <div className="space-y-4">
                  {application.versions.map((version, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 text-sm">v{version.version}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (version.deviceCount / totalDevices) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {version.deviceCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No devices have this application installed
                </p>
              )}
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription>
                {permissions.length} permission{permissions.length !== 1 ? 's' : ''} required
              </CardDescription>
            </CardHeader>
            <CardContent>
              {permissions.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {permissions.map((permission, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg space-y-1"
                    >
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" title={permission.permissionId}>
                            {permission.name || permission.permissionId}
                          </p>
                          {permission.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {permission.description}
                            </p>
                          )}
                          {permission.name && (
                            <p className="text-xs text-muted-foreground font-mono mt-1 truncate" title={permission.permissionId}>
                              {permission.permissionId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No permissions information available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Back Button - Bottom Right */}
        <div className="flex justify-end mt-auto pt-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/${authenticatedPrefixPath}/applications`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </div>

        {/* Configuration Management Dialog */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Configurations</DialogTitle>
              <DialogDescription>
                Configure application settings for this version. These settings
                will be applied to devices when this version is installed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Configurations</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addConfiguration}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Configuration
                  </Button>
                  {versionConfigurations.length > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={deleteAllConfigurations}
                      disabled={deleteConfigurationsMutation.isPending}
                      className="h-8"
                    >
                      {deleteConfigurationsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Delete All
                    </Button>
                  )}
                </div>
              </div>

              {versionConfigurations.length > 0 ? (
                <div className="space-y-3">
                  {versionConfigurations.map((config, index) => (
                    <div
                      key={index}
                      className="flex items-end space-x-2 p-3 border rounded-lg"
                      style={{ backgroundColor: "hsl(var(--muted))" }}
                    >
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <Label
                            htmlFor={`config-key-${index}`}
                            className="text-xs"
                          >
                            Key
                          </Label>
                          <Input
                            id={`config-key-${index}`}
                            placeholder="configuration_key"
                            value={config.key}
                            onChange={(e) =>
                              updateConfiguration(index, "key", e.target.value)
                            }
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor={`config-type-${index}`}
                            className="text-xs"
                          >
                            Value Type
                          </Label>
                          <Select
                            value={config.valueType}
                            onValueChange={(value) =>
                              updateConfiguration(index, "valueType", value)
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="integer">Integer</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeConfiguration(index)}
                        className="h-8 w-8 p-0 flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Click "Add Configuration" to add application-specific
                  settings.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfigDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={saveConfigurations}
                disabled={updateConfigurationsMutation.isPending}
              >
                {updateConfigurationsMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Configurations
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmationDialog.isOpen} onOpenChange={cancelAction}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {confirmationDialog.action === "mandatory"
                  ? "Mandatory"
                  : "Block"}{" "}
                Action
              </DialogTitle>
              <DialogDescription>
                {confirmationDialog.type === "app" ? (
                  <>
                    Are you sure you want to{" "}
                    {confirmationDialog.action === "mandatory"
                      ? application?.isMandatory
                        ? "remove mandatory status from"
                        : "set as mandatory"
                      : application?.isBlocked
                      ? "unblock"
                      : "block"}{" "}
                    the application "{application?.name}"?
                  </>
                ) : (
                  <>
                    Are you sure you want to{" "}
                    {confirmationDialog.action === "mandatory"
                      ? application?.versions.find(
                          (v) => v.id === confirmationDialog.versionId
                        )?.isMandatory
                        ? "remove mandatory status from"
                        : "set as mandatory"
                      : application?.versions.find(
                          (v) => v.id === confirmationDialog.versionId
                        )?.isBlocked
                      ? "unblock"
                      : "block"}{" "}
                    version "{confirmationDialog.versionName}" of "
                    {application?.name}"?
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={cancelAction}>
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={
                  applicationActionMutation.isPending ||
                  versionActionMutation.isPending
                }
                variant={
                  confirmationDialog.action === "blocked"
                    ? "destructive"
                    : "default"
                }
              >
                {(applicationActionMutation.isPending ||
                  versionActionMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {confirmationDialog.action === "mandatory"
                  ? confirmationDialog.type === "app"
                    ? application?.isMandatory
                      ? "Remove Mandatory"
                      : "Set Mandatory"
                    : application?.versions.find(
                        (v) => v.id === confirmationDialog.versionId
                      )?.isMandatory
                    ? "Remove Mandatory"
                    : "Set Mandatory"
                  : confirmationDialog.type === "app"
                  ? application?.isBlocked
                    ? "Unblock"
                    : "Block"
                  : application?.versions.find(
                      (v) => v.id === confirmationDialog.versionId
                    )?.isBlocked
                  ? "Unblock"
                  : "Block"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
