import { MainLayout } from "@/components/layout/MainLayout";
import { AddProfileDialog } from "@/components/profiles/AddProfileDialog";
import { CloneProfileDialog } from "@/components/profiles/CloneProfileDialog";
import { DeleteProfileDialog } from "@/components/profiles/DeleteProfileDialog";
import { EditProfileDialog } from "@/components/profiles/EditProfileDialog";
import { ProfilePlatformChart } from "@/components/profiles/ProfilePlatformChart";
import { PublishProfileDialog } from "@/components/profiles/PublishProfileDialog";
import { Button } from "@/components/ui/button";
import { Column, DataTable } from "@/components/ui/data-table";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAssetUrl } from "@/config/env";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Profile } from "@/types/models";
import {
  Apple,
  CheckCircle,
  Copy,
  Edit,
  FileText,
  Layout,
  Monitor,
  Pencil,
  Plus,
  Send,
  Shield,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileService } from "@/api/services/profiles";
import { Platform } from "@/types/models";
import { useAndroidFeaturesEnabled } from "@/contexts/EnterpriseContext";
import { toast } from "@/hooks/use-toast";

const platformConfig: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    disabled?: boolean;
    image?: string;
  }
> = {
  all: {
    label: "All Platforms",
    icon: Layout,
    color: "text-primary",
    image: getAssetUrl("/Assets/all_platforms.png"),
  },
  android: {
    label: "Android",
    icon: Smartphone,
    color: "text-success",
    image: getAssetUrl("/Assets/android.png"),
  },
  ios: {
    label: "iOS",
    icon: Apple,
    color: "text-muted-foreground",
    image: getAssetUrl("/Assets/apple.png"),
  },
  windows: {
    label: "Windows",
    icon: Monitor,
    color: "text-info",
    disabled: true,
    image: getAssetUrl("/Assets/microsoft.png"),
  },
  macos: {
    label: "macOS",
    icon: Monitor,
    color: "text-info",
    disabled: true,
    image: getAssetUrl("/Assets/mac_os.png"),
  },
  linux: {
    label: "Linux",
    icon: Monitor,
    color: "text-info",
    disabled: true,
    image: getAssetUrl("/Assets/linux.png"),
  },
};

const Profiles = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { shouldBlock: shouldBlockAndroid, isDebugMode } = useAndroidFeaturesEnabled();
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedPublishProfile, setSelectedPublishProfile] =
    useState<Profile | null>(null);
  const [selectedDeleteProfile, setSelectedDeleteProfile] =
    useState<Profile | null>(null);
  const [selectedCloneProfile, setSelectedCloneProfile] =
    useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    android: 0,
    ios: 0,
    windows: 0,
    published: 0,
    draft: 0,
  });

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      // In production, skip Android API call if enterprise is not set up
      const platforms: Platform[] = shouldBlockAndroid
        ? ["ios", "windows"]
        : ["android", "ios", "windows"];

      // Always fetch from all platforms for stats
      // Handle errors per platform to allow partial success
      const statsResults = await Promise.allSettled(
        platforms.map(async (platform) => {
          try {
            const result = await ProfileService.getProfiles(platform);
            // Ensure result and content exist
            if (!result || !result.content) {
              console.warn(
                `Invalid response structure for platform: ${platform}`
              );
              return { platform, profiles: [] };
            }
            return { platform, profiles: result.content || [] };
          } catch (error: any) {
            // Check if it's a "not supported" error
            const errorMessage =
              error.response?.data?.message ||
              error.response?.data ||
              error.message ||
              "";
            const isNotSupportedError =
              error.response?.status === 400 &&
              (typeof errorMessage === "string"
                ? errorMessage.includes("not supported")
                : false);

            if (isNotSupportedError) {
              console.warn(
                `Profile feature not supported for platform: ${platform}`
              );
              return { platform, profiles: [] };
            }
            // Re-throw other errors
            throw error;
          }
        })
      );

      // Extract successful results and handle failures
      const successfulResults = statsResults
        .map((result, index) => {
          if (result.status === "fulfilled") {
            // Ensure the value has the expected structure
            const value = result.value;
            if (
              value &&
              typeof value === "object" &&
              "platform" in value &&
              "profiles" in value
            ) {
              return {
                platform: value.platform,
                profiles: Array.isArray(value.profiles) ? value.profiles : [],
              };
            }
            // Fallback if structure is unexpected
            const platform = platforms[index];
            console.warn(
              `Unexpected response structure for platform: ${platform}`
            );
            return { platform, profiles: [] };
          } else {
            // Log error but continue with empty profiles for failed platform
            const platform = platforms[index];
            const errorReason = result.reason;
            const errorMessage =
              errorReason?.response?.data?.message ||
              errorReason?.message ||
              "Unknown error";
            console.error(`Error fetching ${platform} profiles:`, errorMessage);
            return { platform, profiles: [] };
          }
        })
        .filter(
          (result): result is { platform: Platform; profiles: Profile[] } =>
            result !== null &&
            result !== undefined &&
            typeof result === "object" &&
            "platform" in result &&
            "profiles" in result &&
            Array.isArray(result.profiles)
        );

      // Filter profiles based on platformFilter
      let allProfiles: Profile[] = [];
      if (platformFilter === "all") {
        // Use data already fetched for stats
        allProfiles = successfulResults.flatMap(({ platform, profiles }) =>
          profiles.map((profile) => ({
            ...profile,
            platform,
          }))
        );
      } else if (
        platformFilter === "android" ||
        platformFilter === "ios" ||
        platformFilter === "windows"
      ) {
        // Use data already fetched for stats
        const platformData = successfulResults.find(
          (r) => r.platform === platformFilter
        );
        if (platformData) {
          allProfiles = platformData.profiles.map((profile) => ({
            ...profile,
            platform: platformFilter as Platform,
          }));
        }
      }

      setProfiles(allProfiles);

      // Calculate stats from already fetched data
      let androidCount = 0;
      let iosCount = 0;
      let windowsCount = 0;
      let publishedCount = 0;
      let draftCount = 0;

      successfulResults.forEach(({ platform, profiles }) => {
        if (platform === "android") {
          androidCount = profiles.length;
        } else if (platform === "ios") {
          iosCount = profiles.length;
        } else if (platform === "windows") {
          windowsCount = profiles.length;
        }

        profiles.forEach((profile) => {
          if (profile.status === "PUBLISHED") {
            publishedCount++;
          } else if (profile.status === "DRAFT") {
            draftCount++;
          }
        });
      });

      setStats({
        total: successfulResults.reduce(
          (sum, { profiles }) => sum + profiles.length,
          0
        ),
        android: androidCount,
        ios: iosCount,
        windows: windowsCount,
        published: publishedCount,
        draft: draftCount,
      });
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [platformFilter]);

  const getPlatformIcon = (platform?: string, filled = false) => {
    const config = platformConfig[platform?.toLowerCase() || "all"];
    const Icon = config.icon;
    return (
      <Icon
        className={cn("w-5 h-5", config.color)}
        fill={filled ? "currentColor" : "none"}
        strokeWidth={filled ? 1.5 : 2}
      />
    );
  };

  const columns = useMemo<Column<Profile>[]>(() => {
    const baseColumns: Column<Profile>[] = [
      {
        key: "name",
        header: t('profiles.table.name'),
        accessor: (item) => item.name,
        render: (_, item) => (
          <p
            className="font-medium text-blue-500 hover:text-blue-600 cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profiles/${item.platform}/${item.id}`);
            }}
          >
            {item.name}
          </p>
        ),
      },
      {
        key: "description",
        header: t('profiles.table.description'),
        accessor: (item) => item.description,
        render: (value) => (
          <p className="text-sm text-muted-foreground truncate max-w-[280px]">
            {value || "-"}
          </p>
        ),
      },
      {
        key: "platform",
        header: t('profiles.table.platform'),
        accessor: (item) => item.platform || "",
        render: (_, item) => {
          const config = platformConfig[item.platform?.toLowerCase() || "all"];
          return (
            <span className="inline-flex items-center justify-center cursor-default">
              {config.image ? (
                <img
                  src={config.image}
                  alt={config.label}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                getPlatformIcon(item.platform, true)
              )}
            </span>
          );
        },
      },
      {
        key: "status",
        header: t('profiles.table.status'),
        accessor: (item) => item.status || "DRAFT",
        render: (value) => {
          const statusConfig: Record<
            string,
            { icon: React.ElementType; color: string; label: string }
          > = {
            PUBLISHED: {
              icon: CheckCircle,
              color: "text-success",
              label: "Published",
            },
            DRAFT: {
              icon: FileText,
              color: "text-warning",
              label: "Draft",
            },
          };
          const config = statusConfig[value] || statusConfig.DRAFT;
          const Icon = config.icon;
          return (
            <span className="inline-flex items-center justify-center cursor-default">
              <Icon className={cn("w-5 h-5", config.color)} />
            </span>
          );
        },
      },
      {
        key: "version",
        header: t('profiles.table.version'),
        accessor: (item) => item.version || 0,
        filterType: "number",
        render: (value) => (
          <span className="text-muted-foreground font-mono text-sm">
            {value || "-"}
          </span>
        ),
      },
      {
        key: "deviceCount",
        header: t('profiles.table.devices'),
        accessor: (item) => item.deviceCount || 0,
        filterType: "number",
        render: (value) => (
          <span className="text-muted-foreground">{value || 0}</span>
        ),
      },
      {
        key: "modificationTime",
        header: t('profiles.table.lastModified'),
        accessor: (item) => item.modificationTime || "",
        hidden: true,
        filterType: "date",
        render: (value) => (
          <span className="text-muted-foreground font-mono text-sm">
            {value ? new Date(value).toLocaleDateString() : "-"}
          </span>
        ),
      },
      {
        key: "creationTime",
        header: t('profiles.table.created'),
        accessor: (item) => item.creationTime || "",
        hidden: true,
        filterType: "date",
        render: (value) => (
          <span className="text-muted-foreground font-mono text-sm">
            {value ? new Date(value).toLocaleDateString() : "-"}
          </span>
        ),
      },
      {
        key: "createdBy",
        header: t('profiles.table.createdBy'),
        accessor: (item) => item.createdBy || "",
        hidden: true,
        render: (value) => (
          <span className="text-muted-foreground font-mono text-xs truncate max-w-[120px]">
            {value || "-"}
          </span>
        ),
      },
      {
        key: "lastModifiedBy",
        header: t('profiles.table.lastModifiedBy'),
        accessor: (item) => item.lastModifiedBy || "",
        hidden: true,
        render: (value) => (
          <span className="text-muted-foreground font-mono text-xs truncate max-w-[120px]">
            {value || "-"}
          </span>
        ),
      },
    ];



    return baseColumns;
  }, [platformFilter]);

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditDialogOpen(true);
  };

  const handlePublishProfile = (profile: Profile) => {
    setSelectedPublishProfile(profile);
    setPublishDialogOpen(true);
  };

  const handleDeleteProfile = (profile: Profile) => {
    setSelectedDeleteProfile(profile);
    setDeleteDialogOpen(true);
  };

  const handleCloneProfile = (profile: Profile) => {
    setSelectedCloneProfile(profile);
    setCloneDialogOpen(true);
  };

  const rowActions = (profile: Profile) => {
    const isDraft = profile.status === "DRAFT";
    const canDelete = (profile.deviceCount || 0) === 0;

    return (
      <>
        <DropdownMenuItem
          onClick={() => handlePublishProfile(profile)}
          disabled={!isDraft}
        >
          <Send className="w-4 h-4 mr-2" />
          {t('profiles.actions.publish')}
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => handleCloneProfile(profile)}>
          <Copy className="w-4 h-4 mr-2" />
          {t('profiles.actions.clone')}
        </DropdownMenuItem> */}
        <DropdownMenuItem
          onClick={() => handleDeleteProfile(profile)}
          disabled={!canDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {t('profiles.actions.delete')}
        </DropdownMenuItem>
      </>
    );
  };

  const quickActions = (profile: Profile) => (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              handleCloneProfile(profile);
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('profiles.actions.clone')}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profiles/${profile.platform}/${profile.id}`);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('profiles.actions.editPolicies')}</TooltipContent>
      </Tooltip>
    </>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('profiles.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('profiles.subtitle')}
            </p>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            {t('profiles.createProfile')}
          </Button>
        </header>

        {/* Platform Tabs */}
        <section
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm p-1.5 shadow-sm"
          role="tablist"
          aria-label="Filter by platform"
        >
          {Object.keys(platformConfig).map((platform) => {
            const config = platformConfig[platform];
            const Icon = config.icon;
            const isActive = platformFilter === platform;
            const isDisabled = config.disabled;
            return (
              <button
                key={platform}
                role="tab"
                aria-selected={isActive}
                aria-disabled={isDisabled}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  // If Android is selected and enterprise is not set up (production), redirect to setup
                  if (platform === 'android' && shouldBlockAndroid) {
                    toast({
                      title: 'Enterprise Setup Required',
                      description: 'Android Enterprise must be configured before using Android features.',
                      variant: 'destructive',
                    });
                    navigate('/android/enterprise/setup?returnTo=/profiles');
                    return;
                  }
                  setPlatformFilter(platform);
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
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layout className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('profiles.totalProfiles')}</p>
              </div>
            </div>
          </article>

          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.published.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('profiles.published')}</p>
              </div>
            </div>
          </article>

          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.draft.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('profiles.draft')}</p>
              </div>
            </div>
          </article>
        </section>

        {/* Dashboard Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProfilePlatformChart
            data={[
              {
                name: "Android",
                count: stats.android,
                fill: "hsl(var(--success))",
              },
              {
                name: "iOS",
                count: stats.ios,
                fill: "hsl(var(--muted-foreground))",
              },
              {
                name: "Windows",
                count: stats.windows,
                fill: "hsl(var(--info))",
              },
            ]}
          />
          <article className="panel flex items-center justify-center p-6 text-muted-foreground bg-muted/20 border-2 border-dashed">
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{t('profiles.complianceStats')}</p>
              <p className="text-xs text-muted-foreground/70">{t('profiles.comingSoon')}</p>
            </div>
          </article>
        </section>

        {/* Profiles Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          <DataTable
            data={profiles}
            columns={columns}
            loading={loading}
            globalSearchPlaceholder={t('profiles.searchPlaceholder')}
            emptyMessage={t('profiles.noProfilesFound')}
            quickActions={quickActions}
            rowActions={rowActions}
            defaultPageSize={10}
            showExport={true}
            exportTitle="Profiles Report"
            exportFilename="profiles"
          />
        </div>
      </div>

      <AddProfileDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onProfileAdded={fetchProfiles}
        defaultPlatform={
          platformFilter !== "all" && platformFilter !== "windows"
            ? (platformFilter as "android" | "ios")
            : "android"
        }
      />

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onProfileUpdated={fetchProfiles}
        profile={selectedProfile}
      />

      <PublishProfileDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        onProfilePublished={fetchProfiles}
        profile={selectedPublishProfile}
      />

      <DeleteProfileDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onProfileDeleted={fetchProfiles}
        profile={selectedDeleteProfile}
      />

      <CloneProfileDialog
        open={cloneDialogOpen}
        onOpenChange={setCloneDialogOpen}
        onProfileCloned={fetchProfiles}
        profile={selectedCloneProfile}
      />
    </MainLayout>
  );
};

export default Profiles;
