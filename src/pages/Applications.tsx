import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Application, ApplicationService, AppActionType } from '@/api/services/applications';
import { AddApplicationDialog } from '@/components/applications/AddApplicationDialog';
import { Platform } from '@/types/models';
import { getAssetUrl } from '@/config/env';
import { 
  Package, 
  Plus, 
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Shield,
  AlertTriangle,
  Smartphone,
  Apple,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DataTable, Column } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const actionConfig: Record<AppActionType, { label: string; icon: typeof CheckCircle; className: string }> = {
  MANDATORY: { label: 'Mandatory', icon: CheckCircle, className: 'status-badge--compliant' },
  OPTIONAL: { label: 'Optional', icon: Clock, className: 'status-badge--pending' },
  BLOCKED: { label: 'Blocked', icon: XCircle, className: 'status-badge--non-compliant' },
};

// Platform configuration for tabs
const platformConfig: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  disabled?: boolean;
  image?: string;
}> = {
  android: {
    label: 'Android',
    icon: Smartphone,
    color: 'text-success',
    image: getAssetUrl('/Assets/android.png'),
  },
  ios: {
    label: 'iOS',
    icon: Apple,
    color: 'text-muted-foreground',
    image: getAssetUrl('/Assets/apple.png'),
  },
  windows: {
    label: 'Windows',
    icon: Monitor,
    color: 'text-info',
    disabled: true,
    image: getAssetUrl('/Assets/microsoft.png'),
  },
  linux: {
    label: 'Linux',
    icon: Monitor,
    color: 'text-info',
    disabled: true,
    image: getAssetUrl('/Assets/linux.png'),
  },
};

const Applications = () => {
  const { toast } = useToast();
  const [platform, setPlatform] = useState<Platform>('android');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; app: Application | null }>({
    open: false,
    app: null
  });

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await ApplicationService.getApplications(platform);
      setApplications(response.content || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [platform]);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDialog.app?.id) return;
    
    try {
      await ApplicationService.deleteApplication(platform, deleteDialog.app.id);
      toast({
        title: 'Success',
        description: `${deleteDialog.app.name} has been deleted`
      });
      fetchApplications();
    } catch (error) {
      console.error('Failed to delete application:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete application',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialog({ open: false, app: null });
    }
  };

  // Handle action change
  const handleSetAction = async (app: Application, action: AppActionType) => {
    if (!app.id) return;
    
    try {
      await ApplicationService.setApplicationAction(platform, app.id, { action });
      toast({
        title: 'Success',
        description: `${app.name} is now ${action.toLowerCase()}`
      });
      fetchApplications();
    } catch (error) {
      console.error('Failed to set action:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application action',
        variant: 'destructive'
      });
    }
  };

  // Stats
  const stats = {
    total: applications.length,
    mandatory: applications.filter(a => a.action === 'MANDATORY').length,
    optional: applications.filter(a => a.action === 'OPTIONAL').length,
    blocked: applications.filter(a => a.action === 'BLOCKED').length,
  };

  // Table columns
  const columns: Column<Application>[] = [
    {
      key: 'name',
      header: 'Application',
      accessor: (item) => item.name,
      sortable: true,
      searchable: true,
      render: (_, item) => (
        <div className="flex items-center gap-3">
          {item.iconUrl ? (
            <img 
              src={item.iconUrl} 
              alt="" 
              className="w-10 h-10 rounded-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.packageName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      accessor: (item) => item.version || '-',
      sortable: true,
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'versions',
      header: 'Versions',
      accessor: (item) => item.versions?.length || 0,
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      accessor: (item) => item.action || 'OPTIONAL',
      sortable: true,
      filterable: true,
      render: (_, item) => {
        const action = item.action || 'OPTIONAL';
        const config = actionConfig[action];
        const ActionIcon = config.icon;
        return (
          <span className={cn('status-badge', config.className)}>
            <ActionIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {config.label}
          </span>
        );
      },
    },
  ];

  // Row actions
  const rowActions = (app: Application) => (
    <>
      <DropdownMenuItem onClick={() => handleSetAction(app, 'MANDATORY')}>
        <Shield className="w-4 h-4 mr-2 text-success" />
        Set Mandatory
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleSetAction(app, 'OPTIONAL')}>
        <Clock className="w-4 h-4 mr-2 text-warning" />
        Set Optional
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleSetAction(app, 'BLOCKED')}>
        <AlertTriangle className="w-4 h-4 mr-2 text-destructive" />
        Block App
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>View Details</DropdownMenuItem>
      <DropdownMenuItem>Manage Versions</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem 
        className="text-destructive"
        onClick={() => setDeleteDialog({ open: true, app })}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </DropdownMenuItem>
    </>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Applications
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage mobile applications for your device fleet
            </p>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Application
          </Button>
        </header>

        {/* Platform Tabs */}
        <section
          className="grid grid-cols-4 w-full rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm p-1.5 shadow-sm"
          role="tablist"
          aria-label="Filter by platform"
        >
          {Object.keys(platformConfig).map((platformKey) => {
            const config = platformConfig[platformKey];
            const Icon = config.icon;
            const isActive = platform === platformKey;
            const isDisabled = config.disabled;
            return (
              <button
                key={platformKey}
                role="tab"
                aria-selected={isActive}
                aria-disabled={isDisabled}
                disabled={isDisabled}
                onClick={() => !isDisabled && setPlatform(platformKey as Platform)}
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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Application statistics">
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-info" aria-hidden="true" />
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
                <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.mandatory}</p>
                <p className="text-sm text-muted-foreground">Mandatory</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.optional}</p>
                <p className="text-sm text-muted-foreground">Optional</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.blocked}</p>
                <p className="text-sm text-muted-foreground">Blocked</p>
              </div>
            </div>
          </article>
        </section>

        {/* Applications Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          <DataTable
            data={applications}
            columns={columns}
            loading={loading}
            globalSearchPlaceholder="Search applications..."
            emptyMessage={loading ? "Loading applications..." : "No applications found."}
            rowActions={rowActions}
            defaultPageSize={10}
            showExport={true}
            exportTitle="Applications Report"
            exportFilename="applications"
          />
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, app: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteDialog.app?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Application Dialog */}
        <AddApplicationDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onApplicationAdded={fetchApplications}
          platform={platform}
        />
      </div>
    </MainLayout>
  );
};

export default Applications;
