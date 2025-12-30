import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CustomRepository, Platform } from "@/types/models";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Apple,
  Database,
  Edit,
  Layout,
  Monitor,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { RepositoryService } from "@/api/services/repository";
import { PaginatedCustomRepoList } from "@/types/models";

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
    image: "/Assets/microsoft.png",
  },
  linux: {
    label: "Linux",
    icon: Monitor,
    color: "text-info",
    image: "/Assets/linux.png",
  },
};

const Repositories = () => {
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [repositories, setRepositories] = useState<CustomRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    android: 0,
    ios: 0,
    windows: 0,
    linux: 0,
  });

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      const platforms: Platform[] = ["android", "windows", "linux"];
      let allRepos: CustomRepository[] = [];

      if (platformFilter === "all") {
        // Fetch from all platforms
        const results = await Promise.all(
          platforms.map((platform) =>
            RepositoryService.getCustomRepositories(platform)
          )
        );
        allRepos = results.flatMap((result) => result.content);
      } else if (
        platformFilter === "android" ||
        platformFilter === "windows" ||
        platformFilter === "linux"
      ) {
        // Fetch from selected platform
        const result = await RepositoryService.getCustomRepositories(
          platformFilter as Platform
        );
        allRepos = result.content;
      } else {
        // iOS/macOS not supported by API
        allRepos = [];
      }

      setRepositories(allRepos);

      // Calculate stats from all platforms
      const statsResults = await Promise.all(
        platforms.map(async (platform) => {
          const result = await RepositoryService.getCustomRepositories(
            platform
          );
          return { platform, repos: result.content };
        })
      );

      // Count repos by platform
      let androidCount = 0;
      let windowsCount = 0;
      let linuxCount = 0;

      statsResults.forEach(({ platform, repos }) => {
        if (platform === "android") {
          androidCount = repos.length;
        } else if (platform === "windows") {
          windowsCount = repos.length;
        } else if (platform === "linux") {
          linuxCount = repos.length;
        }
      });

      setStats({
        total: statsResults.reduce((sum, { repos }) => sum + repos.length, 0),
        android: androidCount,
        ios: 0,
        windows: windowsCount,
        linux: linuxCount,
      });
    } catch (error) {
      console.error("Error fetching repositories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
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

  const getRepositoryName = (repo: CustomRepository): string => {
    if (repo.customUbuntuRepo) {
      return repo.customUbuntuRepo.name;
    }
    if (repo.customRpmRepo) {
      return repo.customRpmRepo.name;
    }
    return repo.name || "Unnamed Repository";
  };

  const getRepositoryType = (repo: CustomRepository): string => {
    // Map repoType to display name
    const typeMap: Record<string, string> = {
      CustomWindowsRepo: "Windows",
      CustomAndroidFileRepo: "Android",
      CustomUbuntuRepo: "Ubuntu",
      CustomRpmRepo: "RPM",
      CustomCommonFileRepo: "Common File",
      CustomMacOsFileRepo: "macOS",
    };
    return typeMap[repo.repoType] || repo.repoType;
  };

  const getRepositoryPlatform = (repo: CustomRepository): string => {
    if (repo.repoType === "CustomWindowsRepo") {
      return "windows";
    } else if (repo.repoType === "CustomAndroidFileRepo") {
      return "android";
    } else if (
      repo.repoType === "CustomUbuntuRepo" ||
      repo.repoType === "CustomRpmRepo"
    ) {
      return "linux";
    } else if (repo.repoType === "CustomMacOsFileRepo") {
      return "macos";
    }
    return "all";
  };

  const getRepositoryDetails = (repo: CustomRepository): string => {
    if (repo.customUbuntuRepo) {
      const components = repo.customUbuntuRepo.components.join(", ");
      const archs = repo.customUbuntuRepo.architectures.join(", ");
      return `Components: ${components} | Architectures: ${archs}`;
    }
    if (repo.customRpmRepo) {
      return "RPM Repository";
    }
    return "-";
  };

  const getRepositoryId = (repo: CustomRepository): string => {
    if (repo.customUbuntuRepo) {
      return repo.customUbuntuRepo.id;
    }
    if (repo.customRpmRepo) {
      return repo.customRpmRepo.id;
    }
    return repo.id || "-";
  };

  const getRepositoryComponents = (repo: CustomRepository): string[] => {
    if (repo.customUbuntuRepo) {
      return repo.customUbuntuRepo.components || [];
    }
    return [];
  };

  const getRepositoryArchitectures = (repo: CustomRepository): string[] => {
    if (repo.customUbuntuRepo) {
      return repo.customUbuntuRepo.architectures || [];
    }
    return [];
  };

  const getCreatedBy = (repo: CustomRepository): string => {
    if (repo.customUbuntuRepo) {
      return repo.customUbuntuRepo.createdBy || "";
    }
    if (repo.customRpmRepo) {
      return repo.customRpmRepo.createdBy || "";
    }
    return repo.createdBy || "";
  };

  const getLastModifiedBy = (repo: CustomRepository): string => {
    if (repo.customUbuntuRepo) {
      return repo.customUbuntuRepo.lastModifiedBy || "";
    }
    if (repo.customRpmRepo) {
      return repo.customRpmRepo.lastModifiedBy || "";
    }
    return repo.lastModifiedBy || "";
  };

  const columns: Column<CustomRepository>[] = [
    {
      key: "name",
      header: "Repository Name",
      accessor: (item) => getRepositoryName(item),
      sortable: true,
      searchable: true,
      render: (_, item) => (
        <div className="flex flex-col">
          <p className="font-medium text-blue-500 hover:text-blue-600 cursor-pointer hover:underline">
            {getRepositoryName(item)}
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {getRepositoryId(item)}
          </p>
        </div>
      ),
    },
    {
      key: "repoType",
      header: "Repository Type",
      accessor: (item) => item.repoType,
      sortable: true,
      filterable: true,
      render: (_, item) => {
        const type = getRepositoryType(item);
        const typeColors: Record<string, string> = {
          Windows:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          Android:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          Ubuntu:
            "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
          RPM: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
          "Common File":
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          macOS:
            "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
        };
        const colorClass =
          typeColors[type] || "bg-secondary text-secondary-foreground";
        return (
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              colorClass
            )}
          >
            {type}
          </span>
        );
      },
    },
    {
      key: "platform",
      header: "Platform",
      accessor: (item) => getRepositoryPlatform(item),
      sortable: true,
      filterable: true,
      render: (_, item) => {
        const platform = getRepositoryPlatform(item);
        const config = platformConfig[platform] || platformConfig.all;
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
                  getPlatformIcon(platform, true)
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
      key: "components",
      header: "Components",
      accessor: (item) => getRepositoryComponents(item).join(", "),
      sortable: false,
      searchable: true,
      render: (_, item) => {
        const components = getRepositoryComponents(item);
        if (components.length === 0)
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {components.map((comp, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground"
              >
                {comp}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "architectures",
      header: "Architectures",
      accessor: (item) => getRepositoryArchitectures(item).join(", "),
      sortable: false,
      searchable: true,
      render: (_, item) => {
        const archs = getRepositoryArchitectures(item);
        if (archs.length === 0)
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {archs.map((arch, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground"
              >
                {arch}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "creationTime",
      header: "Created",
      accessor: (item) => {
        if (item.customUbuntuRepo) {
          return item.customUbuntuRepo.creationTime || "";
        }
        if (item.customRpmRepo) {
          return item.customRpmRepo.creationTime || "";
        }
        return item.creationTime || "";
      },
      sortable: true,
      hidden: true,
      render: (value, item) => {
        const createdBy = getCreatedBy(item);
        return (
          <div className="flex flex-col">
            <span className="text-muted-foreground text-sm">
              {value ? new Date(value).toLocaleDateString() : "-"}
            </span>
            {createdBy && (
              <span className="text-xs text-muted-foreground/70 font-mono truncate max-w-[100px]">
                by {createdBy.substring(0, 8)}...
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "modificationTime",
      header: "Last Modified",
      accessor: (item) => {
        if (item.customUbuntuRepo) {
          return item.customUbuntuRepo.modificationTime || "";
        }
        if (item.customRpmRepo) {
          return item.customRpmRepo.modificationTime || "";
        }
        return item.modificationTime || "";
      },
      sortable: true,
      hidden: true,
      render: (value, item) => {
        const modifiedBy = getLastModifiedBy(item);
        return (
          <div className="flex flex-col">
            <span className="text-muted-foreground text-sm">
              {value ? new Date(value).toLocaleDateString() : "-"}
            </span>
            {modifiedBy && (
              <span className="text-xs text-muted-foreground/70 font-mono truncate max-w-[100px]">
                by {modifiedBy.substring(0, 8)}...
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "createdBy",
      header: "Created By",
      accessor: (item) => getCreatedBy(item),
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
      accessor: (item) => getLastModifiedBy(item),
      sortable: true,
      hidden: true,
      render: (value) => (
        <span className="text-muted-foreground font-mono text-xs truncate max-w-[120px]">
          {value || "-"}
        </span>
      ),
    },
  ];

  const rowActions = (repo: CustomRepository) => {
    return (
      <>
        <DropdownMenuItem onClick={() => console.log("Edit", repo)}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit Repository
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => console.log("Delete", repo)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Repository
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
            <h1 className="text-2xl font-bold text-foreground">Repositories</h1>
            <p className="text-muted-foreground mt-1">
              Manage custom software repositories for your devices
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => console.log("Add repository")}
          >
            <Plus className="w-4 h-4" />
            Add Repository
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
            const isDisabled =
              config.disabled || platform === "ios" || platform === "macos";
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
                <p className="text-sm text-muted-foreground">
                  Total Repositories
                </p>
              </div>
            </div>
          </article>

          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.windows}</p>
                <p className="text-sm text-muted-foreground">Windows Repos</p>
              </div>
            </div>
          </article>

          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.linux}</p>
                <p className="text-sm text-muted-foreground">Linux Repos</p>
              </div>
            </div>
          </article>
        </section>

        {/* Repositories Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          <DataTable
            data={repositories}
            columns={columns}
            loading={loading}
            globalSearchPlaceholder="Search repositories..."
            emptyMessage="No repositories found."
            rowActions={rowActions}
            defaultPageSize={10}
            showExport={true}
            exportTitle="Repositories Report"
            exportFilename="repositories"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Repositories;
