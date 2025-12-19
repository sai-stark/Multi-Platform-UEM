import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Shield, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  Wifi,
  Smartphone,
  Settings
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredPolicies = mockPolicies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          policy.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    const matchesType = typeFilter === 'all' || policy.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: mockPolicies.length,
    active: mockPolicies.filter(p => p.status === 'active').length,
    inactive: mockPolicies.filter(p => p.status === 'inactive').length,
    draft: mockPolicies.filter(p => p.status === 'draft').length,
  };

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

        {/* Filters */}
        <section className="filter-bar" aria-label="Policy filters">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
              aria-label="Search policies"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm text-muted-foreground">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-32 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="type-filter" className="text-sm text-muted-foreground">Type:</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="type-filter" className="w-36 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Passcode">Passcode</SelectItem>
                <SelectItem value="Network">Network</SelectItem>
                <SelectItem value="Kiosk">Kiosk</SelectItem>
                <SelectItem value="Application">Application</SelectItem>
                <SelectItem value="Display">Display</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Policies Table */}
        <section className="panel" aria-label="Policies list">
          <div className="overflow-x-auto">
            <table className="data-table" role="table" aria-label="Configuration policies">
              <thead>
                <tr>
                  <th scope="col">Policy</th>
                  <th scope="col">Type</th>
                  <th scope="col">Platform</th>
                  <th scope="col">Assigned Devices</th>
                  <th scope="col">Assigned Groups</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="w-12"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredPolicies.map((policy) => {
                  const status = statusConfig[policy.status];
                  const StatusIcon = status.icon;
                  const TypeIcon = typeIcons[policy.type] || Shield;
                  return (
                    <tr key={policy.id} tabIndex={0}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{policy.name}</p>
                            <p className="text-xs text-muted-foreground max-w-xs truncate">{policy.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted-foreground">{policy.type}</td>
                      <td className="text-muted-foreground">{policy.platform}</td>
                      <td className="font-mono">{policy.assignedDevices.toLocaleString()}</td>
                      <td className="font-mono">{policy.assignedGroups}</td>
                      <td>
                        <span className={cn('status-badge', status.className)}>
                          <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${policy.name}`}>
                              <MoreVertical className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredPolicies.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No policies match your filters.
            </div>
          )}

          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredPolicies.length} of {mockPolicies.length} policies
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

export default Policies;
