import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Globe, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Link2
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredApps = mockWebApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: mockWebApps.length,
    published: mockWebApps.filter(a => a.status === 'published').length,
    draft: mockWebApps.filter(a => a.status === 'draft').length,
    archived: mockWebApps.filter(a => a.status === 'archived').length,
  };

  const categories = [...new Set(mockWebApps.map(app => app.category))];

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

        {/* Filters */}
        <section className="filter-bar" aria-label="Web application filters">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search web apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
              aria-label="Search web applications"
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="text-sm text-muted-foreground">Category:</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category-filter" className="w-36 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Web Applications Table */}
        <section className="panel" aria-label="Web applications list">
          <div className="overflow-x-auto">
            <table className="data-table" role="table" aria-label="Managed web applications">
              <thead>
                <tr>
                  <th scope="col">Web Application</th>
                  <th scope="col">Category</th>
                  <th scope="col">Display Mode</th>
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
                            <Globe className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{app.name}</p>
                            <a 
                              href={app.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-info hover:underline flex items-center gap-1"
                            >
                              <Link2 className="w-3 h-3" aria-hidden="true" />
                              {app.url}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted-foreground">{app.category}</td>
                      <td className="text-muted-foreground">{app.displayMode}</td>
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
                            <DropdownMenuItem>
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
              No web applications match your filters.
            </div>
          )}

          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredApps.length} of {mockWebApps.length} web applications
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

export default WebApplications;
