import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RepositoryService } from "@/api/services/repository";
import { Platform, ApplicationUnion } from "@/types/models";
import { cn } from "@/lib/utils";

interface RepositoryApplication extends ApplicationUnion {
  size?: string;
  installTypes?: string[];
  isMandatory?: boolean;
  isBlocked?: boolean;
  isEmmApp?: boolean;
  packageName?: string; // For non-mobile apps
  platform?: Platform;
  iconUrl?: string;
}

const RepositoryDetails = () => {
  const { platform, repoId } = useParams<{
    platform: Platform;
    repoId: string;
  }>();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<RepositoryApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [repositoryName, setRepositoryName] = useState<string>("");

  useEffect(() => {
    if (platform && repoId) {
      fetchApplications();
      fetchRepositoryInfo();
    }
  }, [platform, repoId]);

  const fetchRepositoryInfo = async () => {
    try {
      const result = await RepositoryService.getCustomRepositories(
        platform as Platform
      );
      const repo = result.content.find((r) => {
        if (r.customUbuntuRepo) return r.customUbuntuRepo.id === repoId;
        if (r.customRpmRepo) return r.customRpmRepo.id === repoId;
        return r.id === repoId;
      });
      if (repo) {
        if (repo.customUbuntuRepo) {
          setRepositoryName(repo.customUbuntuRepo.name);
        } else if (repo.customRpmRepo) {
          setRepositoryName(repo.customRpmRepo.name);
        } else {
          setRepositoryName(repo.name || "Repository");
        }
      }
    } catch (error) {
      console.error("Error fetching repository info:", error);
    }
  };

  const fetchApplications = async () => {
    if (!platform || !repoId) return;

    setLoading(true);
    try {
      const data = await RepositoryService.getRepositoryApplications(
        platform as Platform,
        repoId
      );
      setApplications(data.content || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<RepositoryApplication>[] = [
    {
      key: "name",
      header: "Application Name",
      accessor: (item) => item.name,
      sortable: true,
      searchable: true,
      render: (_, item) => (
        <div>
          <a
            href="#"
            className="font-medium text-primary hover:text-primary/80 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Navigate to application details if needed
            }}
          >
            {item.name}
          </a>
          {item.packageName && (
            <p className="text-xs text-muted-foreground">{item.packageName}</p>
          )}
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      accessor: (item) => item.description || "",
      sortable: true,
      searchable: true,
      render: (value) => (
        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
          {value || "-"}
        </p>
      ),
    },
    {
      key: "manufacturere",
      header: "Manufacturer",
      accessor: (item) => item.manufacturere || "",
      sortable: true,
      searchable: true,
      render: (value) => (
        <span className="text-muted-foreground">{value || "-"}</span>
      ),
    },
    {
      key: "version",
      header: "Version",
      accessor: (item) => item.version,
      sortable: true,
      render: (value) => (
        <span className="text-muted-foreground font-mono text-sm">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "osType",
      header: "OS Type",
      accessor: (item) => item.osType || "",
      sortable: true,
      filterable: true,
      render: (value) => {
        if (!value) return <span className="text-muted-foreground">-</span>;
        const typeLabels: Record<string, string> = {
          MobileApplication: "Mobile",
          WindowsApplication: "Windows",
          LinuxApplication: "Linux",
          FileDetail: "File",
          AndroidApplication: "Android",
          DmgFileDetail: "DMG",
        };
        const typeColors: Record<string, string> = {
          MobileApplication:
            "bg-success/10 text-success",
          WindowsApplication:
            "bg-info/10 text-info",
          LinuxApplication:
            "bg-warning/10 text-warning",
          FileDetail:
            "bg-muted text-muted-foreground",
          AndroidApplication:
            "bg-success/10 text-success",
          DmgFileDetail:
            "bg-accent/10 text-accent",
        };
        const label = typeLabels[value] || value;
        const colorClass =
          typeColors[value] || "bg-secondary text-secondary-foreground";
        return (
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              colorClass
            )}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: "size",
      header: "Size",
      accessor: (item) => item.size || "",
      sortable: true,
      render: (value) => (
        <span className="text-muted-foreground">{value || "-"}</span>
      ),
    },
    {
      key: "isMandatory",
      header: "Mandatory",
      accessor: (item) => (item.isMandatory ? "Yes" : "No"),
      sortable: true,
      filterable: true,
      render: (_, item) => (
        <span
          className={cn(
            "text-sm",
            item.isMandatory ? "text-success" : "text-muted-foreground"
          )}
        >
          {item.isMandatory ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "isBlocked",
      header: "Blocked",
      accessor: (item) => (item.isBlocked ? "Yes" : "No"),
      sortable: true,
      filterable: true,
      render: (_, item) => (
        <span
          className={cn(
            "text-sm",
            item.isBlocked ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {item.isBlocked ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Navigation */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/repositories')} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Repositories
        </Button>

        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {repositoryName || "Repository Applications"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Applications in this repository
              </p>
            </div>
          </div>
        </header>

        {/* Applications Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          <DataTable
            data={applications}
            columns={columns}
            loading={loading}
            globalSearchPlaceholder="Search applications..."
            emptyMessage="No applications found in this repository."
            defaultPageSize={10}
            showExport={true}
            exportTitle="Repository Applications Report"
            exportFilename={`repository-${repoId}-applications`}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default RepositoryDetails;
