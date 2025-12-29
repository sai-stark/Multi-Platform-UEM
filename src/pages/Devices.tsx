import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Battery,
  CheckCircle,
  Filter,
  HardDrive,
  Laptop,
  Monitor,
  MoreVertical,
  RefreshCw,
  Search,
  Server,
  Smartphone,
  Wifi,
  WifiOff,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Device {
  id: string;
  name: string;
  model: string;
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux';
  osVersion: string;
  owner: string;
  lastSync: string;
  complianceStatus: 'compliant' | 'non-compliant' | 'pending';
  connectionStatus: 'online' | 'offline';
  batteryLevel: number;
  storageUsed: number;
  storageTotal: number;
}

const mockDevices: Device[] = [
  { id: '1', name: 'CDOT-AND-001', model: 'Samsung Galaxy S23', platform: 'android', osVersion: 'Android 14', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-15 14:32', complianceStatus: 'compliant', connectionStatus: 'online', batteryLevel: 85, storageUsed: 45, storageTotal: 128 },
  { id: '2', name: 'CDOT-AND-002', model: 'Google Pixel 8', platform: 'android', osVersion: 'Android 14', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-15 13:45', complianceStatus: 'compliant', connectionStatus: 'online', batteryLevel: 72, storageUsed: 38, storageTotal: 128 },
  { id: '3', name: 'CDOT-IOS-042', model: 'iPhone 15 Pro', platform: 'ios', osVersion: 'iOS 17.2', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-15 12:18', complianceStatus: 'compliant', connectionStatus: 'online', batteryLevel: 92, storageUsed: 98, storageTotal: 256 },
  { id: '4', name: 'CDOT-IOS-043', model: 'iPad Pro 12.9"', platform: 'ios', osVersion: 'iPadOS 17.2', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-15 11:02', complianceStatus: 'pending', connectionStatus: 'offline', batteryLevel: 45, storageUsed: 156, storageTotal: 256 },
  { id: '5', name: 'CDOT-WIN-103', model: 'Dell Latitude 5540', platform: 'windows', osVersion: 'Windows 11 Pro', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-14 23:55', complianceStatus: 'non-compliant', connectionStatus: 'offline', batteryLevel: 100, storageUsed: 320, storageTotal: 512 },
  { id: '6', name: 'CDOT-WIN-104', model: 'HP EliteBook 840', platform: 'windows', osVersion: 'Windows 11 Pro', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-15 08:30', complianceStatus: 'compliant', connectionStatus: 'online', batteryLevel: 67, storageUsed: 245, storageTotal: 512 },
  { id: '7', name: 'CDOT-MAC-067', model: 'MacBook Pro 14"', platform: 'macos', osVersion: 'macOS Sonoma 14.2', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-15 10:15', complianceStatus: 'compliant', connectionStatus: 'online', batteryLevel: 88, storageUsed: 380, storageTotal: 512 },
  { id: '8', name: 'CDOT-LNX-021', model: 'ThinkPad X1 Carbon', platform: 'linux', osVersion: 'Ubuntu 22.04 LTS', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-14 22:30', complianceStatus: 'compliant', connectionStatus: 'offline', batteryLevel: 23, storageUsed: 180, storageTotal: 256 },
];

const platformConfig = {
  android: { label: 'Android', icon: Smartphone },
  ios: { label: 'iOS', icon: Smartphone },
  windows: { label: 'Windows', icon: Laptop },
  macos: { label: 'macOS', icon: Laptop },
  linux: { label: 'Linux', icon: Server },
};

const complianceConfig = {
  compliant: { label: 'Compliant', className: 'status-badge--compliant' },
  'non-compliant': { label: 'Non-Compliant', className: 'status-badge--non-compliant' },
  pending: { label: 'Pending', className: 'status-badge--pending' },
};

const Devices = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { platform } = useParams<{ platform?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [connectionFilter, setConnectionFilter] = useState('all');

  const filteredDevices = mockDevices.filter(device => {
    const matchesPlatform = !platform || device.platform === platform;
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.complianceStatus === statusFilter;
    const matchesConnection = connectionFilter === 'all' || device.connectionStatus === connectionFilter;
    return matchesPlatform && matchesSearch && matchesStatus && matchesConnection;
  });

  const pageTitle = platform
    ? `${platformConfig[platform as keyof typeof platformConfig]?.label || 'Unknown'} Devices`
    : t('nav.devices');

  const stats = {
    total: filteredDevices.length,
    online: filteredDevices.filter(d => d.connectionStatus === 'online').length,
    compliant: filteredDevices.filter(d => d.complianceStatus === 'compliant').length,
    nonCompliant: filteredDevices.filter(d => d.complianceStatus === 'non-compliant').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-muted-foreground mt-1">
              {platform ? `Manage ${platformConfig[platform as keyof typeof platformConfig]?.label} devices` : 'View and manage all enrolled devices'}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Sync All
          </Button>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Device statistics">
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-info" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Devices</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-success" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.online}</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.compliant}</p>
                <p className="text-sm text-muted-foreground">Compliant</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.nonCompliant}</p>
                <p className="text-sm text-muted-foreground">Non-Compliant</p>
              </div>
            </div>
          </article>
        </section>

        {/* Filters */}
        <section className="filter-bar" aria-label="Device filters">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
              aria-label="Search devices"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="compliance-filter" className="text-sm text-muted-foreground">Compliance:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="compliance-filter" className="w-36 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="connection-filter" className="text-sm text-muted-foreground">Connection:</label>
            <Select value={connectionFilter} onValueChange={setConnectionFilter}>
              <SelectTrigger id="connection-filter" className="w-32 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Devices Table */}
        <section className="panel" aria-label="Devices list">
          <div className="overflow-x-auto">
            <table className="data-table" role="table" aria-label="Enrolled devices">
              <thead>
                <tr>
                  <th scope="col">Device</th>
                  <th scope="col">Platform</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Status</th>
                  <th scope="col">Battery</th>
                  <th scope="col">Storage</th>
                  <th scope="col">Last Sync</th>
                  <th scope="col" className="w-12"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((device) => {
                  const platformInfo = platformConfig[device.platform];
                  const PlatformIcon = platformInfo.icon;
                  const compliance = complianceConfig[device.complianceStatus];
                  const storagePercent = Math.round((device.storageUsed / device.storageTotal) * 100);

                  return (
                    <tr key={device.id} tabIndex={0}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <PlatformIcon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                          </div>
                          <div>
                            <p
                              className="font-medium text-foreground hover:text-primary cursor-pointer hover:underline"
                              onClick={() => navigate(`/devices/${device.platform}/${device.id}`)}
                            >
                              {device.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{device.model}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="text-foreground">{platformInfo.label}</p>
                          <p className="text-xs text-muted-foreground">{device.osVersion}</p>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-muted-foreground">{device.owner}</td>
                      <td>
                        <div className="space-y-1">
                          <span className={cn('status-badge', compliance.className)}>
                            {compliance.label}
                          </span>
                          <div className="flex items-center gap-1 text-xs">
                            {device.connectionStatus === 'online' ? (
                              <><Wifi className="w-3 h-3 text-success" aria-hidden="true" /><span className="text-success">Online</span></>
                            ) : (
                              <><WifiOff className="w-3 h-3 text-muted-foreground" aria-hidden="true" /><span className="text-muted-foreground">Offline</span></>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Battery className={cn('w-4 h-4', device.batteryLevel < 20 ? 'text-destructive' : device.batteryLevel < 50 ? 'text-warning' : 'text-success')} aria-hidden="true" />
                          <span className="text-sm font-mono">{device.batteryLevel}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                          <div className="text-sm">
                            <span className="font-mono">{device.storageUsed}</span>
                            <span className="text-muted-foreground">/{device.storageTotal} GB</span>
                            <span className={cn('ml-1 text-xs', storagePercent > 90 ? 'text-destructive' : storagePercent > 75 ? 'text-warning' : 'text-muted-foreground')}>
                              ({storagePercent}%)
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-muted-foreground font-mono">
                        <time dateTime={device.lastSync.replace(' ', 'T')}>{device.lastSync}</time>
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${device.name}`}>
                              <MoreVertical className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem onClick={() => navigate(`/devices/${device.platform}/${device.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Sync Device</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Lock Device</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Wipe Device</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredDevices.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No devices match your filters.
            </div>
          )}

          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredDevices.length} devices
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

export default Devices;
