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
import { getAssetUrl } from "@/config/env";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Apple,
  Database,
  Layout,
  Monitor,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { RepositoryService } from "@/api/services/repository";
import { PaginatedCustomRepoList } from "@/types/models";
import { AddRepositoryDialog } from "@/components/repositories/AddRepositoryDialog";
import { useNavigate, useSearchParams } from "react-router-dom";

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
    image: getAssetUrl("/Assets/all_platforms.svg"),
  },
  android: {
    label: "Android",
    icon: Smartphone,
    color: "text-success",
    image: getAssetUrl("/Assets/android.svg"),
  },
  ios: {
    label: "iOS",
    icon: Apple,
    color: "text-muted-foreground",
    image: getAssetUrl("/Assets/apple.svg"),
  },
  windows: {
    label: "Windows",
    icon: Monitor,
    color: "text-info",
    image: getAssetUrl("/Assets/microsoft.svg"),
  },
  linux: {
    label: "Linux",
    icon: Monitor,
    color: "text-info",
    image: getAssetUrl("/Assets/linux.svg"),
  },
  macos: {
    label: "macOS",
    icon: Monitor,
    color: "text-info",
    image: getAssetUrl("/Assets/mac_os.svg"),
  },
};

const Repositories = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const getInitialPlatform = (): string => {
    const urlPlatform = searchParams.get('platform');
    if (urlPlatform && platformConfig[urlPlatform]) return urlPlatform;
    return 'all';
  };
  const [platformFilter, setPlatformFilter] = useState<string>(getInitialPlatform());

  // Sync URL search params when platform tab changes
  useEffect(() => {
    if (platformFilter === 'all') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ platform: platformFilter }, { replace: true });
    }
  }, [platformFilter, setSearchParams]);
  const [repositories, setRepositories] = useState<CustomRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    android: 0,
    ios: 0,
    windows: 0,
    linux: 0,
    macos: 0,
  });

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const isServerSidePagination = platformFilter !== 'all' && platformFilter !== 'ios';

  const fetchRepositories = useCallback(async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      if (platformFilter === 'all' || platformFilter === 'ios') {
        // Aggregate from all platforms (client-side pagination)
        const platforms: Platform[] = ["android", "windows", "linux", "macos"];

        const statsResults = await Promise.all(
          platforms.map(async (platform) => {
            try {
              const result = await RepositoryService.getCustomRepositories(
                platform
              );
              const repos = Array.isArray(result?.content) ? result.content : [];
              return { platform, repos };
            } catch {
              return { platform, repos: [] };
            }
          })
        );

        let allRepos: CustomRepository[] = [];
        if (platformFilter === "all") {
          allRepos = statsResults.flatMap(({ repos }) => repos || []);
        } else {
          allRepos = [];
        }

        setRepositories(allRepos);
        setTotalElements(allRepos.length);
        setTotalPages(1);

        let androidCount = 0;
        let windowsCount = 0;
        let linuxCount = 0;
        let macosCount = 0;

        statsResults.forEach(({ platform, repos }) => {
          const count = repos?.length || 0;
          if (platform === "android") {
            androidCount = count;
          } else if (platform === "windows") {
            windowsCount = count;
          } else if (platform === "linux") {
            linuxCount = count;
          } else if (platform === "macos") {
            macosCount = count;
          }
        });

        setStats({
          total: statsResults.reduce(
            (sum, { repos }) => sum + (repos?.length || 0),
            0
          ),
          android: androidCount,
          ios: 0,
          windows: windowsCount,
          linux: linuxCount,
          macos: macosCount,
        });
      } else {
        // Specific platform — server-side pagination
        const platform = platformFilter as Platform;
        try {
          const result = await RepositoryService.getCustomRepositories(platform, { pageNumber: page - 1, pageSize: size });
          const repos = Array.isArray(result?.content) ? result.content : [];
          setRepositories(repos);
          setTotalPages(result?.totalPages || 1);
          setTotalElements(result?.totalElements || 0);

          setStats(prev => ({
            ...prev,
            total: result?.totalElements || 0,
            [platform]: result?.totalElements || 0,
          }));
        } catch {
          setRepositories([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
    } finally {
      setLoading(false);
    }
  }, [platformFilter, currentPage, pageSize]);

  // Reset to page 1 when platform filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [platformFilter]);

  useEffect(() => {
    fetchRepositories(currentPage, pageSize);
  }, [platformFilter, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const getRepositoryName = (repo: CustomRepository): string => {
    if (repo.customUbuntuRepo) {
      return repo.customUbuntuRepo.name;
    }
    if (repo.customRpmRepo) {
      return repo.customRpmRepo.name;
    }
    return repo.name || t('repositories.unnamed');
  };

  const getRepositoryType = (repo: CustomRepository): string => {
    const typeMap: Record<string, string> = {
      CustomWindowsRepo: t("repositories.types.windows"),
      CustomAndroidFileRepo: t("repositories.types.android"),
      CustomUbuntuRepo: t("repositories.types.ubuntu"),
      CustomRpmRepo: t("repositories.types.rpm"),
      CustomCommonFileRepo: t("repositories.types.commonFile"),
      CustomMacOsFileRepo: t("repositories.types.macos"),
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

  const showLinuxColumns =
    platformFilter === "linux" || platformFilter === "all";

  const columns: Column<CustomRepository>[] = useMemo(() => {
    const baseColumns: Column<CustomRepository>[] = [
      {
        key: "name",
        header: t("repositories.table.name"),
        accessor: (item) => getRepositoryName(item),
        render: (_, item) => {
          const repoId = getRepositoryId(item);
          const platform = getRepositoryPlatform(item);
          return (
            <p
              className="font-medium text-primary hover:text-primary/80 cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/repositories/${platform}/${repoId}`);
              }}
            >
              {getRepositoryName(item)}
            </p>
          );
        },
      },
      {
        key: "repoType",
        header: t("repositories.table.type"),
        accessor: (item) => item.repoType,
        render: (_, item) => {
          const type = getRepositoryType(item);
          const typeColors: Record<string, string> = {
            Windows:
              "bg-info/10 text-info",
            Android:
              "bg-success/10 text-success",
            Ubuntu:
              "bg-warning/10 text-warning",
            RPM: "bg-accent/10 text-accent",
            "Common File":
              "bg-muted text-muted-foreground",
            [t('repositories.types.commonFile')]:
              "bg-muted text-muted-foreground",
            macOS:
              "bg-muted text-muted-foreground",
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
      ...(showLinuxColumns
        ? [
            {
              key: "components",
              header: t("repositories.table.components"),
              accessor: (item: CustomRepository) =>
                getRepositoryComponents(item).join(", "),
              sortable: false,
              render: (_: any, item: CustomRepository) => {
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
              header: t("repositories.table.architectures"),
              accessor: (item: CustomRepository) =>
                getRepositoryArchitectures(item).join(", "),
              sortable: false,
              render: (_: any, item: CustomRepository) => {
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
          ]
        : []),
      {
        key: "creationTime",
        header: t("repositories.table.created"),
        accessor: (item) => {
          if (item.customUbuntuRepo) {
            return item.customUbuntuRepo.creationTime || "";
          }
          if (item.customRpmRepo) {
            return item.customRpmRepo.creationTime || "";
          }
          return item.creationTime || "";
        },
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
                  {t("repositories.by")} {createdBy.substring(0, 8)}...
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "modificationTime",
        header: t("repositories.table.lastModified"),
        accessor: (item) => {
          if (item.customUbuntuRepo) {
            return item.customUbuntuRepo.modificationTime || "";
          }
          if (item.customRpmRepo) {
            return item.customRpmRepo.modificationTime || "";
          }
          return item.modificationTime || "";
        },
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
                  {t("repositories.by")} {modifiedBy.substring(0, 8)}...
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "createdBy",
        header: t("repositories.table.createdBy"),
        accessor: (item) => getCreatedBy(item),
        hidden: true,
        render: (value) => (
          <span className="text-muted-foreground font-mono text-xs truncate max-w-[120px]">
            {value || "-"}
          </span>
        ),
      },
      {
        key: "lastModifiedBy",
        header: t("repositories.table.lastModifiedBy"),
        accessor: (item) => getLastModifiedBy(item),
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

  const rowActions = (repo: CustomRepository) => {
    return (
      <>
        <DropdownMenuItem onClick={() => console.log("Edit", repo)}>
          <Pencil className="w-4 h-4 mr-2" />
          {t("repositories.actions.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => console.log("Delete", repo)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {t("repositories.actions.delete")}
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
            <h1 className="text-2xl font-bold text-foreground">{t("repositories.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("repositories.subtitle")}
            </p>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            {t("repositories.addRepo")}
          </Button>
        </header>

        {/* Platform Tabs */}
        <section
          className="flex flex-wrap w-full rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm p-1.5 shadow-sm gap-1"
          role="tablist"
          aria-label="Filter by platform"
        >
          {Object.keys(platformConfig).map((platform) => {
            const config = platformConfig[platform];
            const Icon = config.icon;
            const isActive = platformFilter === platform;
            const isDisabled = config.disabled || platform === "ios";
            return (
              <button
                key={platform}
                role="tab"
                aria-selected={isActive}
                aria-disabled={isDisabled}
                disabled={isDisabled}
                onClick={() => !isDisabled && setPlatformFilter(platform)}
                className={cn(
                  "flex-1 min-w-fit relative inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
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
                    alt={t(`repositories.platform.${platform}`)}
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
                {t(`repositories.platform.${platform}`)}
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
                <p className="stat-card__value text-2xl">{stats.total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {t("repositories.stats.total")}
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
                <p className="stat-card__value text-2xl">{stats.windows.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t("repositories.stats.windows")}</p>
              </div>
            </div>
          </article>

          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.linux.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t("repositories.stats.linux")}</p>
              </div>
            </div>
          </article>

          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.macos.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t("repositories.stats.macos")}</p>
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
            globalSearchPlaceholder={t("repositories.table.searchPlaceholder")}
            emptyMessage={t("repositories.table.emptyMessage")}
            rowActions={rowActions}
            defaultPageSize={10}
            pageSizeOptions={[10, 20, 50, 100]}
            showExport={true}
            exportTitle={t("repositories.table.exportTitle")}
            exportFilename="repositories"
            serverSidePagination={isServerSidePagination}
            currentPage={isServerSidePagination ? currentPage : undefined}
            totalPages={isServerSidePagination ? totalPages : undefined}
            totalElements={isServerSidePagination ? totalElements : undefined}
            pageSize={isServerSidePagination ? pageSize : undefined}
            onPageChange={isServerSidePagination ? handlePageChange : undefined}
            onPageSizeChange={isServerSidePagination ? handlePageSizeChange : undefined}
          />
        </div>
      </div>

      <AddRepositoryDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onRepositoryAdded={() => fetchRepositories(currentPage, pageSize)}
        defaultPlatform={
          platformFilter !== "all" && platformFilter !== "ios"
            ? (platformFilter as Platform)
            : "linux"
        }
      />
    </MainLayout>
  );
};

export default Repositories;
