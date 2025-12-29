import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Globe, 
  Plus, 
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DataTable, Column } from '@/components/ui/data-table';

interface WebApp {
  id: string;
  name: string;
  url: string;
  category: string;
  deployedDevices: number;
  status: 'published' | 'draft' | 'archived';
  displayMode: 'Browser' | 'Fullscreen' | 'Standalone';
  lastModified: string;
}

const mockWebApps: WebApp[] = [
  { id: '1', name: 'Corporate Intranet', url: 'https://intranet.cdot.in', category: 'Internal', deployedDevices: 5200, status: 'published', displayMode: 'Standalone', lastModified: '2024-01-12' },
  { id: '2', name: 'HR Portal', url: 'https://hr.cdot.in', category: 'Internal', deployedDevices: 4800, status: 'published', displayMode: 'Standalone', lastModified: '2024-01-10' },
  { id: '3', name: 'Project Management', url: 'https://projects.cdot.in', category: 'Productivity', deployedDevices: 3200, status: 'published', displayMode: 'Browser', lastModified: '2024-01-14' },
  { id: '4', name: 'Training Portal', url: 'https://training.cdot.in', category: 'Training', deployedDevices: 2100, status: 'published', displayMode: 'Fullscreen', lastModified: '2024-01-11' },
  { id: '5', name: 'IT Support Desk', url: 'https://support.cdot.in', category: 'Support', deployedDevices: 5200, status: 'published', displayMode: 'Standalone', lastModified: '2024-01-08' },
  { id: '6', name: 'New CRM System', url: 'https://crm-beta.cdot.in', category: 'Sales', deployedDevices: 0, status: 'draft', displayMode: 'Standalone', lastModified: '2024-01-15' },
  { id: '7', name: 'Legacy ERP', url: 'https://erp-old.cdot.in', category: 'Enterprise', deployedDevices: 120, status: 'archived', displayMode: 'Browser', lastModified: '2023-12-01' },
  { id: '8', name: 'Employee Directory', url: 'https://directory.cdot.in', category: 'Internal', deployedDevices: 4500, status: 'published', displayMode: 'Standalone', lastModified: '2024-01-13' },
];

const statusConfig = {
  published: { label: 'Published', icon: CheckCircle, className: 'status-badge--compliant' },
  draft: { label: 'Draft', icon: Clock, className: 'status-badge--pending' },
  archived: { label: 'Archived', icon: XCircle, className: 'status-badge--non-compliant' },
};

const WebApplications = () => {
  const { t } = useLanguage();

  const stats = {
    total: mockWebApps.length,
    published: mockWebApps.filter(a => a.status === 'published').length,
    draft: mockWebApps.filter(a => a.status === 'draft').length,
    archived: mockWebApps.filter(a => a.status === 'archived').length,
  };

  const categories = [...new Set(mockWebApps.map(app => app.category))];

  const columns: Column<WebApp>[] = [
    {
      key: 'name',
      header: 'Web Application',
      accessor: (item) => item.name,
      sortable: true,
      searchable: true,
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Globe className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-info hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Link2 className="w-3 h-3" aria-hidden="true" />
              {item.url}
            </a>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (item) => item.category,
      sortable: true,
      filterable: true,
      render: (value) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: 'displayMode',
      header: 'Display Mode',
      accessor: (item) => item.displayMode,
      sortable: true,
      filterable: true,
      render: (value) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: 'deployedDevices',
      header: 'Deployed',
      accessor: (item) => item.deployedDevices,
      sortable: true,
      align: 'right',
      render: (value) => <span className="font-mono">{value.toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (item) => item.status,
      sortable: true,
      filterable: true,
      render: (_, item) => {
        const status = statusConfig[item.status];
        const StatusIcon = status.icon;
        return (
          <span className={cn('status-badge', status.className)}>
            <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {status.label}
          </span>
        );
      },
    },
  ];

  const rowActions = (app: WebApp) => (
    <>
      <DropdownMenuItem onClick={() => window.open(app.url, '_blank')}>
        <ExternalLink className="w-4 h-4 mr-2" />
        Open URL
      </DropdownMenuItem>
      <DropdownMenuItem>View Details</DropdownMenuItem>
      <DropdownMenuItem>Edit Web App</DropdownMenuItem>
      <DropdownMenuItem>Deploy to Devices</DropdownMenuItem>
      <DropdownMenuItem>Duplicate</DropdownMenuItem>
      {app.status === 'published' && (
        <DropdownMenuItem className="text-warning">Archive</DropdownMenuItem>
      )}
      {app.status === 'archived' && (
        <DropdownMenuItem className="text-success">Restore</DropdownMenuItem>
      )}
      {app.status === 'draft' && (
        <DropdownMenuItem className="text-success">Publish</DropdownMenuItem>
      )}
      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
    </>
  );

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
          <Button className="gap-2">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Web App
          </Button>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Web application statistics">
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
                <p className="stat-card__value text-2xl">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.draft}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <XCircle className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.archived}</p>
                <p className="text-sm text-muted-foreground">Archived</p>
              </div>
            </div>
          </article>
        </section>

        {/* Web Applications Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          <DataTable
            data={mockWebApps}
            columns={columns}
            globalSearchPlaceholder="Search web apps..."
            emptyMessage="No web applications match your filters."
            rowActions={rowActions}
            defaultPageSize={10}
            showExport={true}
            exportTitle="Web Applications Report"
            exportFilename="web-applications"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default WebApplications;
