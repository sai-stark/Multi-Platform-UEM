import { MainLayout } from "@/components/layout/MainLayout";
import { AddProfileDialog } from "@/components/profiles/AddProfileDialog";
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileService } from "@/api/services/profiles";
import { Platform } from "@/types/models";

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
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedPublishProfile, setSelectedPublishProfile] =
    useState<Profile | null>(null);
  const [selectedDeleteProfile, setSelectedDeleteProfile] =
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
      const platforms: Platform[] = ["android", "ios", "windows"];

      // Always fetch from all platforms for stats
      const statsResults = await Promise.all(
        platforms.map(async (platform) => {
          const result = await ProfileService.getProfiles(platform);
          return { platform, profiles: result.content };
        })
      );

      // Filter profiles based on platformFilter
      let allProfiles: Profile[] = [];
      if (platformFilter === "all") {
        // Use data already fetched for stats
        allProfiles = statsResults.flatMap(({ platform, profiles }) =>
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
        const platformData = statsResults.find(
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

      statsResults.forEach(({ platform, profiles }) => {
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
        total: statsResults.reduce(
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

  const columns: Column<Profile>[] = [
    {
      key: "name",
      header: "Profile Name",
      accessor: (item) => item.name,
      sortable: true,
      searchable: true,
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
      header: "Description",
      accessor: (item) => item.description || "",
      sortable: false,
      searchable: true,
      render: (value) => (
        <p className="text-sm text-muted-foreground truncate max-w-[280px]">
          {value || "-"}
        </p>
      ),
    },
    {
      key: "platform",
      header: "Platform",
      accessor: (item) => item.platform || "",
      sortable: true,
      filterable: true,
      render: (_, item) => {
        const config = platformConfig[item.platform?.toLowerCase() || "all"];
        return (
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>{config.label}</p>
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      accessor: (item) => item.status || "DRAFT",
      sortable: true,
      filterable: true,
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
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center justify-center cursor-default">
                <Icon className={cn("w-5 h-5", config.color)} />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{config.label}</p>
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      key: "version",
      header: "Version",
      accessor: (item) => item.version || 0,
      sortable: true,
      render: (value) => (
        <span className="text-muted-foreground font-mono text-sm">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "deviceCount",
      header: "Devices",
      accessor: (item) => item.deviceCount || 0,
      sortable: true,
      render: (value) => (
        <span className="text-muted-foreground">{value || 0}</span>
      ),
    },
    {
      key: "modificationTime",
      header: "Last Modified",
      accessor: (item) => item.modificationTime || "",
      sortable: true,
      hidden: true,
      render: (value) => (
        <span className="text-muted-foreground font-mono text-sm">
          {value ? new Date(value).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "creationTime",
      header: "Created",
      accessor: (item) => item.creationTime || "",
      sortable: true,
      hidden: true,
      render: (value) => (
        <span className="text-muted-foreground font-mono text-sm">
          {value ? new Date(value).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      accessor: (item) => item.createdBy || "",
      sortable: true,
      hidden: true,
      render: (value) => (
        <span className="text-muted-foreground font-mono text-xs truncate max-w-[120px]">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "lastModifiedBy",
      header: "Last Modified By",
      accessor: (item) => item.lastModifiedBy || "",
      sortable: true,
      hidden: true,
      render: (value) => (
        <span className="text-muted-foreground font-mono text-xs truncate max-w-[120px]">
          {value || "-"}
        </span>
      ),
    },
  ];

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

  const rowActions = (profile: Profile) => {
    const isDraft = profile.status === "DRAFT";
    const canDelete = (profile.deviceCount || 0) === 0;

    return (
      <>
        <DropdownMenuItem onClick={() => handleEditProfile(profile)}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handlePublishProfile(profile)}
          disabled={!isDraft}
        >
          <Send className="w-4 h-4 mr-2" />
          Publish Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            navigate(`/profiles/${profile.platform}/${profile.id}/policies`)
          }
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Policies
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDeleteProfile(profile)}
          disabled={!canDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Profile
        </DropdownMenuItem>
      </>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profiles</h1>
            <p className="text-muted-foreground mt-1">
              Manage configuration profiles and policies for devices
            </p>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Profile
          </Button>
        </header>

        {/* Platform Tabs */}
        <section
          className="inline-flex rounded-lg border bg-muted/30 p-1"
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
                onClick={() => !isDisabled && setPlatformFilter(platform)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive && "bg-background text-foreground shadow-sm",
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
                <p className="stat-card__value text-2xl">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Profiles</p>
              </div>
            </div>
          </article>

          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </article>

          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.draft}</p>
                <p className="text-sm text-muted-foreground">Draft</p>
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
              <p>Compliance Stats</p>
              <p className="text-xs text-muted-foreground/70">Coming soon</p>
            </div>
          </article>
        </section>

        {/* Profiles Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          <DataTable
            data={profiles}
            columns={columns}
            loading={loading}
            globalSearchPlaceholder="Search profiles..."
            emptyMessage="No profiles found."
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
    </MainLayout>
  );
};

export default Profiles;
