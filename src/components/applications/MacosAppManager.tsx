import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Trash2,
  ExternalLink,
  Apple,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
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
import { DataTable, Column } from '@/components/ui/data-table';
import { ApplicationService } from '@/api/services/applications';
import { MacosApplication } from '@/types/application';
import { Platform } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';

interface MacosAppManagerProps {
  applications: MacosApplication[];
  loading: boolean;
  onRefresh: () => void;
  platform: Platform;
}

export const MacosAppManager = ({ applications, loading, onRefresh, platform }: MacosAppManagerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; app: MacosApplication | null }>({
    open: false,
    app: null,
  });

  const handleDelete = async () => {
    if (!deleteDialog.app?.id) return;
    try {
      await ApplicationService.deleteApplication(platform, deleteDialog.app.id);
      toast({
        title: 'Success',
        description: `${deleteDialog.app.trackName || deleteDialog.app.name} has been deleted`,
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to delete application:', error);
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to delete application'),
        variant: 'destructive',
      });
    } finally {
      setDeleteDialog({ open: false, app: null });
    }
  };

  const columns: Column<MacosApplication>[] = [
    {
      key: 'name',
      header: 'Application',
      accessor: (item) => item.trackName || item.name,
      render: (_, item) => (
        <div className="flex items-center gap-3">
          {item.artworkUrl60 || item.artworkUrl100 ? (
            <img
              src={item.artworkUrl60 || item.artworkUrl100}
              alt=""
              className="w-10 h-10 rounded-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Apple className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          <span
            className="font-medium text-blue-500 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
            onClick={() => navigate(`/applications/macos/${item.id}`)}
          >
            {item.trackName || item.name}
          </span>
        </div>
      ),
    },
    {
      key: 'bundleId',
      header: 'Bundle ID',
      accessor: (item) => item.bundleId || item.fileName || '-',
      render: (value) => (
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      accessor: (item) => item.version || '-',
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'sellerName',
      header: 'Developer',
      accessor: (item) => item.sellerName || item.artistName || '-',
    },
    {
      key: 'primaryGenreName',
      header: 'Category',
      accessor: (item) => item.primaryGenreName || '-',
      hidden: true,
      render: (value) =>
        value !== '-' ? (
          <Badge variant="outline" className="text-xs">{value}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'averageUserRating',
      header: 'Rating',
      accessor: (item) => item.averageUserRating ?? '-',
      render: (value) =>
        value !== '-' ? (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
            <span className="text-sm font-medium">{Number(value).toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'enrollmentStatus',
      header: 'Status',
      accessor: (item) => item.enrollmentStatus || 'REGISTERED',
      hidden: true,
      render: (value) => (
        <Badge variant={value === 'REGISTERED' ? 'default' : 'secondary'} className="text-xs">
          {value}
        </Badge>
      ),
    },
  ];

  const quickActions = (app: MacosApplication) => (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/applications/macos/${app.id}`);
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

  const rowActions = (app: MacosApplication) => (
    <>
      {app.trackViewUrl && (
        <DropdownMenuItem onClick={() => window.open(app.trackViewUrl, '_blank')}>
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Mac App Store
        </DropdownMenuItem>
      )}
      {app.fileUrl && (
        <DropdownMenuItem onClick={() => window.open(app.fileUrl, '_blank')}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Open File URL
        </DropdownMenuItem>
      )}
    </>
  );

  return (
    <>
      <DataTable
        key="macos-table"
        data={applications}
        columns={columns}
        loading={loading}
        globalSearchPlaceholder="Search macOS applications..."
        emptyMessage={
          loading
            ? 'Loading applications...'
            : "No macOS applications found. Click 'Add Application' to register apps."
        }
        quickActions={quickActions}
        rowActions={rowActions}
        defaultPageSize={10}
        showExport={true}
        exportTitle="macOS Applications Report"
        exportFilename="macos-applications"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, app: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.app?.trackName || deleteDialog.app?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
