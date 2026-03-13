import { AppActionType, Application, ApplicationService } from '@/api/services/applications';
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
import { Button } from '@/components/ui/button';
import { Column, DataTable } from '@/components/ui/data-table';
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getAssetUrl } from '@/config/env';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Platform } from '@/types/models';
import { getErrorMessage } from '@/utils/errorUtils';
import {
  AlertTriangle,
  Clock,
  Eye,
  Package,
  Shield,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AndroidAppManagerProps {
  applications: Application[];
  loading: boolean;
  onRefresh: () => void;
  platform: Platform;
}

export const AndroidAppManager = ({ applications, loading, onRefresh, platform }: AndroidAppManagerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; app: Application | null }>({
    open: false,
    app: null
  });

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDialog.app?.id) return;

    try {
      await ApplicationService.deleteApplication(platform, deleteDialog.app.id);
      toast({
        title: 'Success',
        description: `${deleteDialog.app.name} has been deleted`
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to delete application:', error);
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to delete application'),
        variant: 'destructive'
      });
    } finally {
      setDeleteDialog({ open: false, app: null });
    }
  };

  // Handle action change
  const handleSetAction = async (app: Application, action: AppActionType) => {
    if (!app.id) return;

    let body: Record<string, any>;
    switch (action) {
      case 'MANDATORY':
        body = { isMandatory: true };
        break;
      case 'BLOCKED':
        body = { isBlocked: true };
        break;
      case 'OPTIONAL':
      default:
        body = { isMandatory: false, isBlocked: false };
        break;
    }

    try {
      await ApplicationService.setApplicationAction(platform, app.id, body);
      toast({
        title: 'Success',
        description: `${app.name} is now ${action.toLowerCase()}`
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to set action:', error);
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to update application action'),
        variant: 'destructive'
      });
    }
  };

  // Android table columns
  const columns: Column<Application>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (item) => item.name,
      render: (_, item) => (
        <span
          className="font-medium text-blue-500 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
          onClick={() => navigate(`/applications/${platform}/${item.id}`)}
        >
          {item.name}
        </span>
      ),
    },
    {
      key: 'packageName',
      header: 'Package Name',
      accessor: (item) => item.packageName || '-',
      render: (value) => (
        <span className="text-sm text-muted-foreground">{value}</span>
      ),
    },
    {
      key: 'flags',
      header: 'Flags',
      sortable: false,
      searchable: false,
      filterable: false,
      accessor: (item) => {
        const flags = [
          item.isEmmApp && 'EMM App',
          item.isEmmAgent && 'EMM Agent',
          item.isLauncher && 'Launcher',
          item.isMandatory && 'Mandatory',
          item.isBlocked && 'Blocked',
        ].filter(Boolean);
        return flags.length > 0 ? flags.join(', ') : 'None';
      },
      render: (_, item) => {
        const flagDefs = [
          { key: 'isEmmApp', label: 'EMM App', value: item.isEmmApp, activeImg: getAssetUrl('/Assets/App_True.png'), inactiveImg: getAssetUrl('/Assets/App.png') },
          { key: 'isEmmAgent', label: 'EMM Agent', value: item.isEmmAgent, activeImg: getAssetUrl('/Assets/Agent_True.png'), inactiveImg: getAssetUrl('/Assets/Agent.png') },
          { key: 'isLauncher', label: 'Launcher', value: item.isLauncher, activeImg: getAssetUrl('/Assets/Launcher_True.png'), inactiveImg: getAssetUrl('/Assets/Launcher.png') },
          { key: 'isMandatory', label: 'Mandatory', value: item.isMandatory, activeImg: getAssetUrl('/Assets/Mandatory_True.png'), inactiveImg: getAssetUrl('/Assets/Mandatory.png') },
          { key: 'isBlocked', label: 'Blocked', value: item.isBlocked, activeImg: getAssetUrl('/Assets/Block_True.png'), inactiveImg: getAssetUrl('/Assets/Block.png') },
        ];
        return (
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-1">
              {flagDefs.map((flag) => (
                <Tooltip key={flag.key}>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-opacity">
                      <img
                        src={flag.value ? flag.activeImg : flag.inactiveImg}
                        alt={flag.label}
                        className={cn(
                          'w-5 h-5 object-contain',
                          !flag.value && 'opacity-30'
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">{flag.label}: {flag.value ? 'Yes' : 'No'}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (item) => item.description || '-',
      render: (value) => (
        <p className="text-sm text-muted-foreground max-w-[250px] truncate" title={String(value)}>
          {value}
        </p>
      ),
    },
    {
      key: 'versions',
      header: 'Versions',
      accessor: (item) => item.versions?.length || 0,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      accessor: (item) => item.author || '-',
      render: (value) => (
        <span className="text-sm">{value}</span>
      ),
    },
  ];

  // Quick actions — inline icon buttons
  const quickActions = (app: Application) => (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/applications/${platform}/${app.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View Details</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialog({ open: true, app });
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </>
  );

  // Row actions — 3-dot dropdown items
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
    </>
  );

  return (
    <>
      <DataTable
        key="android-table"
        data={applications}
        columns={columns}
        loading={loading}
        globalSearchPlaceholder="Search applications..."
        emptyMessage={
          loading ? "Loading applications..." : (
            <EmptyState
              icon={Package}
              title="No Applications Found"
              description="No applications found for Android."
            />
          )
        }
        quickActions={quickActions}
        rowActions={rowActions}
        defaultPageSize={10}
        showExport={true}
        exportTitle="Applications Report"
        exportFilename="applications"
      />

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
    </>
  );
};
