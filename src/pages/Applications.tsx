import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  AppWindow, 
  Download, 
  Shield, 
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Application {
  id: string;
  name: string;
  packageName: string;
  version: string;
  category: string;
  deployedDevices: number;
  status: 'approved' | 'blocked' | 'pending';
  platform: string;
  size: string;
  lastUpdated: string;
}

const mockApplications: Application[] = [
  { id: '1', name: 'Microsoft Teams', packageName: 'com.microsoft.teams', version: '24.1.0', category: 'Productivity', deployedDevices: 4520, status: 'approved', platform: 'Multi-platform', size: '156 MB', lastUpdated: '2024-01-12' },
  { id: '2', name: 'Slack', packageName: 'com.slack', version: '23.12.10', category: 'Communication', deployedDevices: 3890, status: 'approved', platform: 'Multi-platform', size: '98 MB', lastUpdated: '2024-01-10' },
  { id: '3', name: 'Adobe Acrobat Reader', packageName: 'com.adobe.reader', version: '24.1.2', category: 'Productivity', deployedDevices: 5200, status: 'approved', platform: 'Multi-platform', size: '245 MB', lastUpdated: '2024-01-14' },
  { id: '4', name: 'Zoom', packageName: 'us.zoom.videomeetings', version: '5.17.0', category: 'Communication', deployedDevices: 4100, status: 'approved', platform: 'Multi-platform', size: '178 MB', lastUpdated: '2024-01-11' },
  { id: '5', name: 'WhatsApp', packageName: 'com.whatsapp', version: '2.24.1.6', category: 'Communication', deployedDevices: 120, status: 'blocked', platform: 'Mobile', size: '65 MB', lastUpdated: '2024-01-08' },
  { id: '6', name: 'TikTok', packageName: 'com.zhiliaoapp.musically', version: '33.0.5', category: 'Social Media', deployedDevices: 0, status: 'blocked', platform: 'Mobile', size: '280 MB', lastUpdated: '2024-01-05' },
  { id: '7', name: 'SAP Fiori', packageName: 'com.sap.fiori', version: '2.8.4', category: 'Enterprise', deployedDevices: 2340, status: 'approved', platform: 'Multi-platform', size: '89 MB', lastUpdated: '2024-01-13' },
  { id: '8', name: 'Custom ERP Client', packageName: 'in.cdot.erpclient', version: '1.2.0', category: 'Enterprise', deployedDevices: 0, status: 'pending', platform: 'Android', size: '45 MB', lastUpdated: '2024-01-15' },
];

const statusConfig = {
  approved: { label: 'Approved', icon: CheckCircle, className: 'status-badge--compliant' },
  blocked: { label: 'Blocked', icon: XCircle, className: 'status-badge--non-compliant' },
  pending: { label: 'Pending Review', icon: Clock, className: 'status-badge--pending' },
};

const Applications = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredApps = mockApplications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.packageName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: mockApplications.length,
    approved: mockApplications.filter(a => a.status === 'approved').length,
    blocked: mockApplications.filter(a => a.status === 'blocked').length,
    pending: mockApplications.filter(a => a.status === 'pending').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('nav.applications')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and deploy applications across your device fleet
            </p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" aria-hidden="true" />
            Add Application
          </Button>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Application statistics">
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
                <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
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
                <Shield className="w-5 h-5 text-destructive" aria-hidden="true" />
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
                <AlertTriangle className="w-5 h-5 text-warning" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </article>
        </section>

        {/* Filters */}
        <section className="filter-bar" aria-label="Application filters">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
              aria-label="Search applications"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm text-muted-foreground">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-36 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="text-sm text-muted-foreground">Category:</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category-filter" className="w-40 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Productivity">Productivity</SelectItem>
                <SelectItem value="Communication">Communication</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Applications Table */}
        <section className="panel" aria-label="Applications list">
          <div className="overflow-x-auto">
            <table className="data-table" role="table" aria-label="Managed applications">
              <thead>
                <tr>
                  <th scope="col">Application</th>
                  <th scope="col">Category</th>
                  <th scope="col">Platform</th>
                  <th scope="col">Version</th>
                  <th scope="col">Deployed</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="w-12"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const status = statusConfig[app.status];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={app.id} tabIndex={0}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <AppWindow className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{app.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{app.packageName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted-foreground">{app.category}</td>
                      <td className="text-muted-foreground">{app.platform}</td>
                      <td className="font-mono text-muted-foreground">{app.version}</td>
                      <td className="font-mono">{app.deployedDevices.toLocaleString()}</td>
                      <td>
                        <span className={cn('status-badge', status.className)}>
                          <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${app.name}`}>
                              <MoreVertical className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Deploy to Devices</DropdownMenuItem>
                            <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
                            {app.status !== 'blocked' && (
                              <DropdownMenuItem className="text-destructive">Block Application</DropdownMenuItem>
                            )}
                            {app.status === 'blocked' && (
                              <DropdownMenuItem className="text-success">Approve Application</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredApps.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No applications match your filters.
            </div>
          )}

          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredApps.length} of {mockApplications.length} applications
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Applications;
