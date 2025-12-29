import { MainLayout } from "@/components/layout/MainLayout";
import { AddProfileDialog } from "@/components/profiles/AddProfileDialog";
import { EditProfileDialog } from "@/components/profiles/EditProfileDialog";
import { ProfilePlatformChart } from "@/components/profiles/ProfilePlatformChart";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Profile } from "@/types/models";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Apple,
  Archive,
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const mockProfiles: Profile[] = [
  {
    id: "1",
    name: "Corporate Android Default",
    description: "Standard policy for all Android devices",
    platform: "android",
    createdTime: "2024-01-15T10:00:00Z",
    updatedTime: "2024-01-20T14:30:00Z",
    status: "active",
    category: "Corporate",
  },
  {
    id: "2",
    name: "iOS Executive Policy",
    description: "High security policy for executives",
    platform: "ios",
    createdTime: "2024-01-10T09:00:00Z",
    updatedTime: "2024-01-22T11:15:00Z",
    status: "active",
    category: "Specialized",
  },
  {
    id: "3",
    name: "Windows Kiosk Mode",
    description: "Locked down kiosk for public terminals",
    platform: "windows",
    createdTime: "2024-01-05T16:20:00Z",
    updatedTime: "2024-01-18T09:45:00Z",
    status: "active",
    category: "Kiosk",
  },
  {
    id: "4",
    name: "Field Workers Android",
    description: "Optimized for battery and location tracking",
    platform: "android",
    createdTime: "2024-01-12T11:30:00Z",
    updatedTime: "2024-01-21T15:20:00Z",
    status: "draft",
    category: "Specialized",
  },
  {
    id: "5",
    name: "BYOD Limited Access",
    description: "Restriction policy for personal devices",
    platform: "ios",
    createdTime: "2024-01-08T13:45:00Z",
    updatedTime: "2024-01-19T10:10:00Z",
    status: "active",
    category: "BYOD",
  },
  {
    id: "6",
    name: "Sales Tablet Configuration",
    description: "iPad setup for sales team",
    platform: "ios",
    createdTime: "2024-01-14T10:00:00Z",
    updatedTime: "2024-01-23T12:00:00Z",
    status: "archived",
    category: "Corporate",
  },
  {
    id: "7",
    name: "Development Windows Workstation",
    description: "Developer machine defaults",
    platform: "windows",
    createdTime: "2024-01-02T08:15:00Z",
    updatedTime: "2024-01-16T16:50:00Z",
    status: "draft",
    category: "Corporate",
  },
];

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
    image: "/Assets/all_platforms.png",
  },
  android: {
    label: "Android",
    icon: Smartphone,
    color: "text-success",
    image: "/Assets/android.png",
  },
  ios: {
    label: "iOS",
    icon: Apple,
    color: "text-muted-foreground",
    image: "/Assets/apple.png",
  },
  windows: {
    label: "Windows",
    icon: Monitor,
    color: "text-info",
    disabled: true,
    image: "/Assets/microsoft.png",
  },
};

const Profiles = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    android: 0,
    ios: 0,
    windows: 0,
    active: 0,
    draft: 0,
    archived: 0,
  });

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      let data: Profile[] = [...mockProfiles];

      if (platformFilter !== "all") {
        data = data.filter((p) => p.platform === platformFilter);
      }

      setProfiles(data);

      // Update stats based on all mock data
      const allData = mockProfiles;
      setStats({
        total: allData.length,
        android: allData.filter((p) => p.platform === "android").length,
        ios: allData.filter((p) => p.platform === "ios").length,
        windows: allData.filter((p) => p.platform === "windows").length,
        active: allData.filter((p) => p.status === "active").length,
        draft: allData.filter((p) => p.status === "draft").length,
        archived: allData.filter((p) => p.status === "archived").length,
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
          className="font-medium text-foreground hover:text-primary cursor-pointer hover:underline"
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
      accessor: (item) => item.status || "active",
      sortable: true,
      filterable: true,
      render: (value) => {
        const statusConfig: Record<
          string,
          { icon: React.ElementType; color: string; label: string }
        > = {
          active: {
            icon: CheckCircle,
            color: "text-success",
            label: "Active",
          },
          draft: {
            icon: FileText,
            color: "text-warning",
            label: "Draft",
          },
          archived: {
            icon: Archive,
            color: "text-muted-foreground",
            label: "Archived",
          },
        };
        const config = statusConfig[value] || statusConfig.draft;
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
      key: "category",
      header: "Category",
      accessor: (item) => item.category || "-",
      sortable: true,
      filterable: true,
      render: (value) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: "updatedTime",
      header: "Last Modified",
      accessor: (item) => item.updatedTime || "",
      sortable: true,
      render: (value) => (
        <span className="text-muted-foreground font-mono text-sm">
          {value ? new Date(value).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditDialogOpen(true);
  };

  const handlePublishProfile = (profile: Profile) => {
    // TODO: Implement publish profile
    console.log("Publish profile:", profile.id);
  };

  const rowActions = (profile: Profile) => (
    <>
      <DropdownMenuItem onClick={() => handleEditProfile(profile)}>
        <Pencil className="w-4 h-4 mr-2" />
        Edit Profile
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => navigate(`/profiles/${profile.platform}/${profile.id}`)}
      >
        <Edit className="w-4 h-4 mr-2" />
        Edit Policies
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handlePublishProfile(profile)}>
        <Send className="w-4 h-4 mr-2" />
        Publish Profile
      </DropdownMenuItem>
    </>
  );

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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className="stat-card__value text-2xl">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
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

          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Archive className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.archived}</p>
                <p className="text-sm text-muted-foreground">Archived</p>
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
    </MainLayout>
  );
};

export default Profiles;
