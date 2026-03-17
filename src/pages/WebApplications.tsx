import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TablePageSkeleton } from '@/components/skeletons';
import { WebApplicationService } from '@/api/services/webApps';
import { WebApplication } from '@/types/models';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    pageUrl: '',
    iconText: '',
    icon: '',
  });
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const fetchWebApps = useCallback(async (showLoading = true, page: number = currentPage, size: number = pageSize) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await WebApplicationService.getWebApplications({ pageNumber: page - 1, pageSize: size });
      setWebApps(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch web applications:', error);
      toast({
        title: t('webApps.toasts.error'),
        description: getErrorMessage(error, t('webApps.toasts.errorFetch')),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast, currentPage, pageSize]);

  useEffect(() => {
    fetchWebApps(true, currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

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
        title: t('webApps.toasts.validation.title'),
        description: t('webApps.toasts.validation.name'),
        variant: 'destructive',
      });
      return;
    }
    if (!formData.pageUrl.trim()) {
      toast({
        title: t('webApps.toasts.validation.title'),
        description: t('webApps.toasts.validation.url'),
        variant: 'destructive',
      });
      return;
    }
    if (!formData.iconText.trim()) {
      toast({
        title: t('webApps.toasts.validation.title'),
        description: t('webApps.toasts.validation.iconText'),
        variant: 'destructive',
      });
      return;
    }
    if (!formData.icon.trim()) {
      toast({
        title: t('webApps.toasts.validation.title'),
        description: t('webApps.toasts.validation.icon'),
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
          title: t('webApps.toasts.success'),
          description: t('webApps.toasts.updated'),
        });
      } else {
        // Create new app
        await WebApplicationService.createWebApplication(formData);
        toast({
          title: t('webApps.toasts.success'),
          description: t('webApps.toasts.created'),
        });
      }
      handleCloseModal();
      fetchWebApps(false, currentPage, pageSize);
    } catch (error) {
      console.error('Failed to save web application:', error);
      toast({
        title: t('webApps.toasts.error'),
        description: getErrorMessage(error, editingApp ? t('webApps.toasts.errorUpdate') : t('webApps.toasts.errorCreate')),
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
        title: t('webApps.toasts.success'),
        description: t('webApps.toasts.deleted'),
      });
      setOpenDeleteModal(false);
      setAppToDelete(null);
      fetchWebApps(false, currentPage, pageSize);
    } catch (error) {
      console.error('Failed to delete web application:', error);
      toast({
        title: t('webApps.toasts.error'),
        description: getErrorMessage(error, t('webApps.toasts.errorDelete')),
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const stats = {
    total: totalElements,
    totalDevices: webApps.reduce((sum, app) => sum + (app.deviceCount || 0), 0),
  };

  const columns: Column<WebApplication>[] = [
    {
      key: 'name',
      header: t('webApps.table.name'),
      accessor: (item) => item.name,
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
      header: t('webApps.table.iconText'),
      accessor: (item) => item.iconText,
      render: (value) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: 'deviceCount',
      header: t('webApps.table.deviceCount'),
      accessor: (item) => item.deviceCount,
      align: 'right',
      render: (value) => <span className="font-mono">{(value || 0).toLocaleString()}</span>,
    },
    {
      key: 'modificationTime',
      header: t('webApps.table.modified'),
      accessor: (item) => item.modificationTime || '',
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
        {t('webApps.actions.open')}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleOpenEditModal(app)}>
        <Edit className="w-4 h-4 mr-2" />
        {t('webApps.actions.edit')}
      </DropdownMenuItem>
      <DropdownMenuItem 
        className="text-destructive"
        onClick={() => handleDeleteClick(app)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {t('webApps.actions.delete')}
      </DropdownMenuItem>
    </>
  );

  if (loading && webApps.length === 0) {
    return (
      <MainLayout>
        <TablePageSkeleton />
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
              {t('webApps.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('webApps.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => fetchWebApps(false, currentPage, pageSize)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button className="gap-2" onClick={handleOpenAddModal}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t('webApps.addWebApp')}
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
                <p className="stat-card__value text-2xl">{stats.total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('webApps.stats.total')}</p>
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
                <p className="text-sm text-muted-foreground">{t('webApps.stats.deployments')}</p>
              </div>
            </div>
          </article>
        </section>

        {/* Web Applications Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          <DataTable
            data={webApps}
            columns={columns}
            globalSearchPlaceholder={t('webApps.table.searchPlaceholder')}
            emptyMessage={t('webApps.table.emptyMessage')}
            rowActions={rowActions}
            defaultPageSize={10}
            pageSizeOptions={[10, 20, 50, 100]}
            showExport={true}
            exportTitle={t('webApps.table.exportTitle')}
            exportFilename="web-applications"
            serverSidePagination={true}
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
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
              {editingApp ? t('webApps.addDialog.editTitle') : t('webApps.addDialog.addTitle')}
            </DialogTitle>
            <DialogDescription>
              {editingApp 
                ? t('webApps.addDialog.editDesc') 
                : t('webApps.addDialog.addDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('webApps.addDialog.nameLabel')}</Label>
              <Input
                id="name"
                placeholder={t('webApps.addDialog.namePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageUrl">{t('webApps.addDialog.urlLabel')}</Label>
              <Input
                id="pageUrl"
                type="url"
                placeholder={t('webApps.addDialog.urlPlaceholder')}
                value={formData.pageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, pageUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iconText">{t('webApps.addDialog.iconTextLabel')}</Label>
              <Input
                id="iconText"
                placeholder={t('webApps.addDialog.iconTextPlaceholder')}
                value={formData.iconText}
                onChange={(e) => setFormData(prev => ({ ...prev, iconText: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                {t('webApps.addDialog.iconTextDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">{t('webApps.addDialog.iconLabel')}</Label>
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
                    {t('webApps.addDialog.iconDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal} disabled={formLoading}>
              {t('webApps.addDialog.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingApp ? t('webApps.addDialog.updating') : t('webApps.addDialog.creating')}
                </>
              ) : (
                <>
                  {editingApp ? t('webApps.addDialog.updateBtn') : t('webApps.addDialog.createBtn')} {t('webApps.addDialog.webAppText')}
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
              {t('webApps.deleteDialog.desc').replace('{name}', appToDelete?.name || '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpenDeleteModal(false)} 
              disabled={deleteLoading}
            >
              {t('webApps.addDialog.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('webApps.deleteDialog.deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('webApps.actions.delete')}
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
