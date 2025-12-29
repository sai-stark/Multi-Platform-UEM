import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Shield, 
  Plus, 
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  Wifi,
  Smartphone,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DataTable, Column } from '@/components/ui/data-table';

interface Policy {
  id: string;
  name: string;
  type: string;
  description: string;
  platform: string;
  assignedDevices: number;
  assignedGroups: number;
  status: 'active' | 'inactive' | 'draft';
  lastModified: string;
}

const mockPolicies: Policy[] = [
  { id: '1', name: 'Corporate Security Baseline', type: 'Security', description: 'Standard security settings for all corporate devices', platform: 'Multi-platform', assignedDevices: 4520, assignedGroups: 12, status: 'active', lastModified: '2024-01-12' },
  { id: '2', name: 'Passcode Enforcement', type: 'Passcode', description: 'Minimum 8 character alphanumeric passcode requirement', platform: 'Multi-platform', assignedDevices: 5200, assignedGroups: 15, status: 'active', lastModified: '2024-01-10' },
  { id: '3', name: 'Corporate WiFi Configuration', type: 'Network', description: 'Auto-configure corporate WiFi settings', platform: 'Multi-platform', assignedDevices: 3890, assignedGroups: 10, status: 'active', lastModified: '2024-01-14' },
  { id: '4', name: 'Kiosk Mode - Sales Terminals', type: 'Kiosk', description: 'Single-app kiosk mode for POS terminals', platform: 'Android', assignedDevices: 450, assignedGroups: 3, status: 'active', lastModified: '2024-01-11' },
  { id: '5', name: 'App Blocklist - Social Media', type: 'Application', description: 'Block social media applications on work devices', platform: 'Multi-platform', assignedDevices: 2100, assignedGroups: 8, status: 'active', lastModified: '2024-01-08' },
  { id: '6', name: 'VPN Auto-Connect', type: 'Network', description: 'Automatic VPN connection for remote workers', platform: 'Multi-platform', assignedDevices: 1200, assignedGroups: 4, status: 'inactive', lastModified: '2024-01-05' },
  { id: '7', name: 'Screen Timeout Policy', type: 'Display', description: '5-minute screen timeout for security', platform: 'Multi-platform', assignedDevices: 5200, assignedGroups: 15, status: 'active', lastModified: '2024-01-13' },
  { id: '8', name: 'New Device Policy Draft', type: 'Security', description: 'Testing new security configurations', platform: 'iOS', assignedDevices: 0, assignedGroups: 0, status: 'draft', lastModified: '2024-01-15' },
];

const statusConfig = {
  active: { label: 'Active', icon: CheckCircle, className: 'status-badge--compliant' },
  inactive: { label: 'Inactive', icon: XCircle, className: 'status-badge--non-compliant' },
  draft: { label: 'Draft', icon: Clock, className: 'status-badge--pending' },
};

const typeIcons: Record<string, typeof Shield> = {
  Security: Shield,
  Passcode: Lock,
  Network: Wifi,
  Kiosk: Smartphone,
  Application: Settings,
  Display: Settings,
};

const Policies = () => {
  const { t } = useLanguage();

  const stats = {
    total: mockPolicies.length,
    active: mockPolicies.filter(p => p.status === 'active').length,
    inactive: mockPolicies.filter(p => p.status === 'inactive').length,
    draft: mockPolicies.filter(p => p.status === 'draft').length,
  };

  const columns: Column<Policy>[] = [
    {
      key: 'name',
      header: 'Policy',
      accessor: (item) => item.name,
      sortable: true,
      searchable: true,
      render: (_, item) => {
        const TypeIcon = typeIcons[item.type] || Shield;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground max-w-xs truncate">{item.description}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      accessor: (item) => item.type,
      sortable: true,
      filterable: true,
      render: (value) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: 'platform',
      header: 'Platform',
      accessor: (item) => item.platform,
      sortable: true,
      filterable: true,
      render: (value) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: 'assignedDevices',
      header: 'Assigned Devices',
      accessor: (item) => item.assignedDevices,
      sortable: true,
      align: 'right',
      render: (value) => <span className="font-mono">{value.toLocaleString()}</span>,
    },
    {
      key: 'assignedGroups',
      header: 'Assigned Groups',
      accessor: (item) => item.assignedGroups,
      sortable: true,
      align: 'right',
      render: (value) => <span className="font-mono">{value}</span>,
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

  const rowActions = (policy: Policy) => (
    <>
      <DropdownMenuItem>View Details</DropdownMenuItem>
      <DropdownMenuItem>Edit Policy</DropdownMenuItem>
      <DropdownMenuItem>Assign to Devices</DropdownMenuItem>
      <DropdownMenuItem>Assign to Groups</DropdownMenuItem>
      <DropdownMenuItem>Duplicate</DropdownMenuItem>
      {policy.status === 'active' && (
        <DropdownMenuItem className="text-warning">Deactivate</DropdownMenuItem>
      )}
      {policy.status !== 'active' && (
        <DropdownMenuItem className="text-success">Activate</DropdownMenuItem>
      )}
      <DropdownMenuItem className="text-destructive">Delete Policy</DropdownMenuItem>
    </>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('nav.policies')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage device configuration policies
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Create Policy
          </Button>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Policy statistics">
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-info" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Policies</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.inactive}</p>
                <p className="text-sm text-muted-foreground">Inactive</p>
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
        </section>

        {/* Policies Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          <DataTable
            data={mockPolicies}
            columns={columns}
            globalSearchPlaceholder="Search policies..."
            emptyMessage="No policies match your filters."
            rowActions={rowActions}
            defaultPageSize={10}
            showExport={true}
            exportTitle="Policies Report"
            exportFilename="policies"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Policies;
