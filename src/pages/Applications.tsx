import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AppWindow,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  Apple,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ApplicationCategoryChart } from "@/components/applications/ApplicationCategoryChart";
import { ApplicationPlatformChart } from "@/components/applications/ApplicationPlatformChart";
import { AddApplicationDialog } from "@/components/applications/AddApplicationDialog";
import { DataTable, Column } from "@/components/ui/data-table";

type Platform = "all" | "android" | "ios" | "windows";

interface Application {
  id: string;
  name: string;
  packageName: string;
  version: string;
  category: string;
  deployedDevices: number;
  status: "approved" | "blocked" | "pending";
  platform: Platform;
  size: string;
  lastUpdated: string;
}

const mockApplications: Application[] = [
  {
    id: "1",
    name: "Microsoft Teams",
    packageName: "com.microsoft.teams",
    version: "24.1.0",
    category: "Productivity",
    deployedDevices: 4520,
    status: "approved",
    platform: "android",
    size: "156 MB",
    lastUpdated: "2024-01-12",
  },
  {
    id: "2",
    name: "Slack",
    packageName: "com.slack",
    version: "23.12.10",
    category: "Communication",
    deployedDevices: 3890,
    status: "approved",
    platform: "android",
    size: "98 MB",
    lastUpdated: "2024-01-10",
  },
  {
    id: "3",
    name: "Adobe Acrobat Reader",
    packageName: "com.adobe.reader",
    version: "24.1.2",
    category: "Productivity",
    deployedDevices: 5200,
    status: "approved",
    platform: "ios",
    size: "245 MB",
    lastUpdated: "2024-01-14",
  },
  {
    id: "4",
    name: "Zoom",
    packageName: "us.zoom.videomeetings",
    version: "5.17.0",
    category: "Communication",
    deployedDevices: 4100,
    status: "approved",
    platform: "ios",
    size: "178 MB",
    lastUpdated: "2024-01-11",
  },
  {
    id: "5",
    name: "WhatsApp",
    packageName: "com.whatsapp",
    version: "2.24.1.6",
    category: "Communication",
    deployedDevices: 120,
    status: "blocked",
    platform: "android",
    size: "65 MB",
    lastUpdated: "2024-01-08",
  },
  {
    id: "6",
    name: "TikTok",
    packageName: "com.zhiliaoapp.musically",
    version: "33.0.5",
    category: "Social Media",
    deployedDevices: 0,
    status: "blocked",
    platform: "ios",
    size: "280 MB",
    lastUpdated: "2024-01-05",
  },
  {
    id: "7",
    name: "SAP Fiori",
    packageName: "com.sap.fiori",
    version: "2.8.4",
    category: "Enterprise",
    deployedDevices: 2340,
    status: "approved",
    platform: "windows",
    size: "89 MB",
    lastUpdated: "2024-01-13",
  },
  {
    id: "8",
    name: "Custom ERP Client",
    packageName: "in.cdot.erpclient",
    version: "1.2.0",
    category: "Enterprise",
    deployedDevices: 0,
    status: "pending",
    platform: "windows",
    size: "45 MB",
    lastUpdated: "2024-01-15",
  },
  {
    id: "9",
    name: "Microsoft Office",
    packageName: "com.microsoft.office",
    version: "16.0.1",
    category: "Productivity",
    deployedDevices: 3200,
    status: "approved",
    platform: "windows",
    size: "520 MB",
    lastUpdated: "2024-01-14",
  },
  {
    id: "10",
    name: "Outlook Mobile",
    packageName: "com.microsoft.outlook",
    version: "4.2.1",
    category: "Communication",
    deployedDevices: 2800,
    status: "approved",
    platform: "android",
    size: "110 MB",
    lastUpdated: "2024-01-13",
  },
];

const statusConfig = {
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "status-badge--compliant",
  },
  blocked: {
    label: "Blocked",
    icon: XCircle,
    className: "status-badge--non-compliant",
  },
  pending: {
    label: "Pending Review",
    icon: Clock,
    className: "status-badge--pending",
  },
};

const platformConfig: Record<
  Platform,
  { label: string; icon: React.ElementType; color: string }
> = {
  all: { label: "All Platforms", icon: AppWindow, color: "text-primary" },
  android: { label: "Android", icon: Smartphone, color: "text-success" },
  ios: { label: "iOS", icon: Apple, color: "text-muted-foreground" },
  windows: { label: "Windows", icon: Monitor, color: "text-info" },
};

const Applications = () => {
  const { t } = useLanguage();
  const [platformFilter, setPlatformFilter] = useState<Platform>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredByPlatform =
    platformFilter === "all"
      ? mockApplications
      : mockApplications.filter((a) => a.platform === platformFilter);

  // Stats based on current platform filter
  const platformApps =
    platformFilter === "all"
      ? mockApplications
      : mockApplications.filter((a) => a.platform === platformFilter);
  const stats = {
    total: platformApps.length,
    approved: platformApps.filter((a) => a.status === "approved").length,
    blocked: platformApps.filter((a) => a.status === "blocked").length,
    pending: platformApps.filter((a) => a.status === "pending").length,
  };

  // Chart data
  const categoryData = [
    {
      name: "Productivity",
      value: platformApps.filter((a) => a.category === "Productivity").length,
      color: "hsl(var(--primary))",
    },
    {
      name: "Communication",
      value: platformApps.filter((a) => a.category === "Communication").length,
      color: "hsl(var(--info))",
    },
    {
      name: "Enterprise",
      value: platformApps.filter((a) => a.category === "Enterprise").length,
      color: "hsl(var(--success))",
    },
    {
      name: "Social Media",
      value: platformApps.filter((a) => a.category === "Social Media").length,
      color: "hsl(var(--warning))",
    },
  ].filter((d) => d.value > 0);

  const platformChartData = [
    {
      name: "Android",
      count: mockApplications.filter((a) => a.platform === "android").length,
      fill: "hsl(var(--success))",
    },
    {
      name: "iOS",
      count: mockApplications.filter((a) => a.platform === "ios").length,
      fill: "hsl(var(--muted-foreground))",
    },
    {
      name: "Windows",
      count: mockApplications.filter((a) => a.platform === "windows").length,
      fill: "hsl(var(--info))",
    },
  ];

  const getPlatformIcon = (platform: Platform) => {
    const config = platformConfig[platform];
    const Icon = config.icon;
    return <Icon className={cn("w-4 h-4", config.color)} />;
  };

  const columns: Column<Application>[] = [
    {
      key: "name",
      header: "Application",
      accessor: (item) => item.name,
      sortable: true,
      searchable: true,
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            {getPlatformIcon(item.platform)}
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {item.packageName}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      accessor: (item) => item.category,
      sortable: true,
      filterable: true,
      render: (value) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: "platform",
      header: "Platform",
      accessor: (item) => platformConfig[item.platform].label,
      sortable: true,
      render: (_, item) => (
        <span className="flex items-center gap-1.5">
          {getPlatformIcon(item.platform)}
          <span className="text-muted-foreground">
            {platformConfig[item.platform].label}
          </span>
        </span>
      ),
    },
    {
      key: "version",
      header: "Version",
      accessor: (item) => item.version,
      sortable: true,
      render: (value) => (
        <span className="font-mono text-muted-foreground">{value}</span>
      ),
    },
    {
      key: "deployedDevices",
      header: "Deployed",
      accessor: (item) => item.deployedDevices,
      sortable: true,
      align: "right",
      render: (value) => (
        <span className="font-mono">{value.toLocaleString()}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (item) => item.status,
      sortable: true,
      filterable: true,
      render: (_, item) => {
        const status = statusConfig[item.status];
        const StatusIcon = status.icon;
        return (
          <span className={cn("status-badge", status.className)}>
            <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {status.label}
          </span>
        );
      },
    },
  ];

  const rowActions = (app: Application) => (
    <>
      <DropdownMenuItem>View Details</DropdownMenuItem>
      <DropdownMenuItem>Deploy to Devices</DropdownMenuItem>
      <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
      {app.status !== "blocked" && (
        <DropdownMenuItem className="text-destructive">
          Block Application
        </DropdownMenuItem>
      )}
      {app.status === "blocked" && (
        <DropdownMenuItem className="text-success">
          Approve Application
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
              {t("nav.applications")}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and deploy applications across your device fleet
            </p>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Download className="w-4 h-4" aria-hidden="true" />
            Add Application
          </Button>
        </header>

        {/* Platform Tabs */}
        <section className="flex gap-2" aria-label="Platform filter">
          {(Object.keys(platformConfig) as Platform[]).map((platform) => {
            const config = platformConfig[platform];
            const Icon = config.icon;
            const isActive = platformFilter === platform;
            return (
              <Button
                key={platform}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setPlatformFilter(platform)}
                className={cn("gap-2", isActive && "shadow-md")}
              >
                <Icon className={cn("w-4 h-4", isActive ? "" : config.color)} />
                {config.label}
              </Button>
            );
          })}
        </section>

        {/* Stats Cards */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          aria-label="Application statistics"
        >
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <AppWindow className="w-5 h-5 text-info" aria-hidden="true" />
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
                <CheckCircle
                  className="w-5 h-5 text-success"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Shield
                  className="w-5 h-5 text-destructive"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.blocked}</p>
                <p className="text-sm text-muted-foreground">Blocked</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle
                  className="w-5 h-5 text-warning"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </article>
        </section>

        {/* Charts Section */}
        <section
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          aria-label="Application analytics"
        >
          <ApplicationCategoryChart data={categoryData} />
          <ApplicationPlatformChart data={platformChartData} />
        </section>

        {/* Applications Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          <DataTable
            data={filteredByPlatform}
            columns={columns}
            globalSearchPlaceholder="Search applications..."
            emptyMessage="No applications match your filters."
            rowActions={rowActions}
            defaultPageSize={10}
            showExport={true}
            exportTitle="Applications Report"
            exportFilename="applications"
          />
        </div>
      </div>

      {/* Add Application Dialog */}
      <AddApplicationDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        platform={platformFilter}
      />
    </MainLayout>
  );
};

export default Applications;
