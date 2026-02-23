import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WebApplicationService } from '@/api/services/webApps';
import { WebApplication } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';
import { 
  Globe, 
  Plus, 
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Link2,
  Loader2,
  ImageIcon,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, Column } from '@/components/ui/data-table';

const WebApplications = () => {
  const { toast } = useToast();
  const [webApps, setWebApps] = useState<WebApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add/Edit Modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<WebApplication | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete Modal states
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState<WebApplication | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    pageUrl: '',
    iconText: '',
    icon: '',
  });
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const fetchWebApps = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await WebApplicationService.getWebApplications();
      setWebApps(response.content || []);
    } catch (error) {
      console.error('Failed to fetch web applications:', error);
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to fetch web applications'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWebApps();
  }, [fetchWebApps]);

  const resetFormData = () => {
    setFormData({
      name: '',
      pageUrl: '',
      iconText: '',
      icon: '',
    });
    setIconPreview(null);
    setEditingApp(null);
  };

  const handleOpenAddModal = () => {
    resetFormData();
    setOpenAddModal(true);
  };

  const handleOpenEditModal = (app: WebApplication) => {
    setEditingApp(app);
    setFormData({
      name: app.name,
      pageUrl: app.pageUrl,
      iconText: app.iconText,
      icon: app.icon,
    });
    setIconPreview(app.icon ? `data:image/png;base64,${app.icon}` : null);
    setOpenAddModal(true);
  };

  const handleCloseModal = () => {
    setOpenAddModal(false);
    resetFormData();
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1]; // Remove data:image/...;base64, prefix
        setFormData(prev => ({ ...prev, icon: base64Data }));
        setIconPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.pageUrl.trim()) {
      toast({
        title: 'Validation Error',
        description: 'URL is required',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.iconText.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Icon text is required',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.icon.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Icon is required',
        variant: 'destructive',
      });
      return;
    }

    setFormLoading(true);
    try {
      if (editingApp) {
        // Update existing app
        await WebApplicationService.updateWebApplication(editingApp.id, formData);
        toast({
          title: 'Success',
          description: 'Web application updated successfully',
        });
      } else {
        // Create new app
        await WebApplicationService.createWebApplication(formData);
        toast({
          title: 'Success',
          description: 'Web application created successfully',
        });
      }
      handleCloseModal();
      fetchWebApps(false);
    } catch (error) {
      console.error('Failed to save web application:', error);
      toast({
        title: 'Error',
        description: getErrorMessage(error, editingApp ? 'Failed to update web application' : 'Failed to create web application'),
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (app: WebApplication) => {
    setAppToDelete(app);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!appToDelete) return;

    setDeleteLoading(true);
    try {
      await WebApplicationService.deleteWebApplication(appToDelete.id);
      toast({
        title: 'Success',
        description: 'Web application deleted successfully',
      });
      setOpenDeleteModal(false);
      setAppToDelete(null);
      fetchWebApps(false);
    } catch (error) {
      console.error('Failed to delete web application:', error);
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to delete web application'),
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const stats = {
    total: webApps.length,
    totalDevices: webApps.reduce((sum, app) => sum + (app.deviceCount || 0), 0),
  };

  const columns: Column<WebApplication>[] = [
    {
      key: 'name',
      header: 'Web Application',
      accessor: (item) => item.name,
      sortable: true,
      searchable: true,
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            {item.icon ? (
              <img 
                src={`data:image/png;base64,${item.icon}`} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Globe className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <a 
              href={item.pageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-info hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Link2 className="w-3 h-3" aria-hidden="true" />
              {item.pageUrl}
            </a>
          </div>
        </div>
      ),
    },
    {
      key: 'iconText',
      header: 'Icon Text',
      accessor: (item) => item.iconText,
      sortable: true,
      render: (value) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: 'deviceCount',
      header: 'Deployed Devices',
      accessor: (item) => item.deviceCount,
      sortable: true,
      align: 'right',
      render: (value) => <span className="font-mono">{(value || 0).toLocaleString()}</span>,
    },
    {
      key: 'modificationTime',
      header: 'Last Modified',
      accessor: (item) => item.modificationTime || '',
      sortable: true,
      render: (value) => (
        <span className="text-muted-foreground">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  const rowActions = (app: WebApplication) => (
    <>
      <DropdownMenuItem onClick={() => window.open(app.pageUrl, '_blank')}>
        <ExternalLink className="w-4 h-4 mr-2" />
        Open URL
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleOpenEditModal(app)}>
        <Edit className="w-4 h-4 mr-2" />
        Edit Web App
      </DropdownMenuItem>
      <DropdownMenuItem 
        className="text-destructive"
        onClick={() => handleDeleteClick(app)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </DropdownMenuItem>
    </>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Web Applications
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage web apps and bookmarks for your device fleet
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => fetchWebApps(false)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button className="gap-2" onClick={handleOpenAddModal}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Web App
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Web application statistics">
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-info" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Web Apps</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.totalDevices.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Deployments</p>
              </div>
            </div>
          </article>
        </section>

        {/* Web Applications Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          <DataTable
            data={webApps}
            columns={columns}
            globalSearchPlaceholder="Search web apps..."
            emptyMessage="No web applications found. Click 'Add Web App' to create one."
            rowActions={rowActions}
            defaultPageSize={10}
            showExport={true}
            exportTitle="Web Applications Report"
            exportFilename="web-applications"
          />
        </div>
      </div>

      {/* Add/Edit Web App Modal */}
      <Dialog open={openAddModal} onOpenChange={(open) => {
        if (!open) handleCloseModal();
        else setOpenAddModal(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingApp ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingApp ? 'Edit Web Application' : 'Add Web Application'}
            </DialogTitle>
            <DialogDescription>
              {editingApp 
                ? 'Update the web application details below.' 
                : 'Create a new web application shortcut for deployment.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="My Web App"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageUrl">URL *</Label>
              <Input
                id="pageUrl"
                type="url"
                placeholder="https://example.com"
                value={formData.pageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, pageUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iconText">Icon Text *</Label>
              <Input
                id="iconText"
                placeholder="App shortcut label"
                value={formData.iconText}
                onChange={(e) => setFormData(prev => ({ ...prev, iconText: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Text shown below the icon on device
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon *</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                  {iconPreview ? (
                    <img 
                      src={iconPreview} 
                      alt="Icon preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    id="icon"
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG or JPG, max 512x512px recommended
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingApp ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {editingApp ? 'Update' : 'Create'} Web App
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Web Application
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{appToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpenDeleteModal(false)} 
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default WebApplications;
