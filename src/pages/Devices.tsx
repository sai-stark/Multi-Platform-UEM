import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { DataTable, Column } from '@/components/ui/data-table';
import {
  Battery,
  CheckCircle,
  HardDrive,
  Laptop,
  Monitor,
  RefreshCw,
  Server,
  Smartphone,
  Wifi,
  WifiOff,
  XCircle
} from 'lucide-react';
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

  const filteredByPlatform = platform 
    ? mockDevices.filter(d => d.platform === platform) 
    : mockDevices;

  const pageTitle = platform
    ? `${platformConfig[platform as keyof typeof platformConfig]?.label || 'Unknown'} Devices`
    : t('nav.devices');

  const stats = {
    total: filteredByPlatform.length,
    online: filteredByPlatform.filter(d => d.connectionStatus === 'online').length,
    compliant: filteredByPlatform.filter(d => d.complianceStatus === 'compliant').length,
    nonCompliant: filteredByPlatform.filter(d => d.complianceStatus === 'non-compliant').length,
  };

  const columns: Column<Device>[] = [
    {
      key: 'name',
      header: 'Device',
      accessor: (item) => item.name,
      sortable: true,
      searchable: true,
      render: (_, item) => {
        const platformInfo = platformConfig[item.platform];
        const PlatformIcon = platformInfo.icon;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <PlatformIcon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p
                className="font-medium text-foreground hover:text-primary cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/devices/${item.platform}/${item.id}`);
                }}
              >
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">{item.model}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'platform',
      header: 'Platform',
      accessor: (item) => platformConfig[item.platform].label,
      sortable: true,
      filterable: true,
      render: (_, item) => {
        const platformInfo = platformConfig[item.platform];
        return (
          <div>
            <p className="text-foreground">{platformInfo.label}</p>
            <p className="text-xs text-muted-foreground">{item.osVersion}</p>
          </div>
        );
      },
    },
    {
      key: 'owner',
      header: 'Owner',
      accessor: (item) => item.owner,
      sortable: true,
      searchable: true,
      render: (value) => (
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
      ),
    },
    {
      key: 'complianceStatus',
      header: 'Status',
      accessor: (item) => item.complianceStatus,
      sortable: true,
      filterable: true,
      render: (_, item) => {
        const compliance = complianceConfig[item.complianceStatus];
        return (
          <div className="space-y-1">
            <span className={cn('status-badge', compliance.className)}>
              {compliance.label}
            </span>
            <div className="flex items-center gap-1 text-xs">
              {item.connectionStatus === 'online' ? (
                <><Wifi className="w-3 h-3 text-success" aria-hidden="true" /><span className="text-success">Online</span></>
              ) : (
                <><WifiOff className="w-3 h-3 text-muted-foreground" aria-hidden="true" /><span className="text-muted-foreground">Offline</span></>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'batteryLevel',
      header: 'Battery',
      accessor: (item) => item.batteryLevel,
      sortable: true,
      align: 'center',
      render: (value, item) => (
        <div className="flex items-center gap-2 justify-center">
          <Battery className={cn('w-4 h-4', item.batteryLevel < 20 ? 'text-destructive' : item.batteryLevel < 50 ? 'text-warning' : 'text-success')} aria-hidden="true" />
          <span className="text-sm font-mono">{value}%</span>
        </div>
      ),
    },
    {
      key: 'storage',
      header: 'Storage',
      accessor: (item) => Math.round((item.storageUsed / item.storageTotal) * 100),
      sortable: true,
      render: (_, item) => {
        const storagePercent = Math.round((item.storageUsed / item.storageTotal) * 100);
        return (
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <div className="text-sm">
              <span className="font-mono">{item.storageUsed}</span>
              <span className="text-muted-foreground">/{item.storageTotal} GB</span>
              <span className={cn('ml-1 text-xs', storagePercent > 90 ? 'text-destructive' : storagePercent > 75 ? 'text-warning' : 'text-muted-foreground')}>
                ({storagePercent}%)
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'lastSync',
      header: 'Last Sync',
      accessor: (item) => item.lastSync,
      sortable: true,
      render: (value) => (
        <time className="text-xs text-muted-foreground font-mono" dateTime={value.replace(' ', 'T')}>
          {value}
        </time>
      ),
    },
  ];

  const rowActions = (device: Device) => (
    <>
      <DropdownMenuItem onClick={() => navigate(`/devices/${device.platform}/${device.id}`)}>
        View Details
      </DropdownMenuItem>
      <DropdownMenuItem>Sync Device</DropdownMenuItem>
      <DropdownMenuItem>Send Message</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Lock Device</DropdownMenuItem>
      <DropdownMenuItem className="text-destructive">Wipe Device</DropdownMenuItem>
    </>
  );

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

        {/* Devices Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          <DataTable
            data={filteredByPlatform}
            columns={columns}
            globalSearchPlaceholder="Search devices..."
            emptyMessage="No devices match your filters."
            rowActions={rowActions}
            defaultPageSize={10}
            showExport={true}
            exportTitle="Devices Report"
            exportFilename="devices"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Devices;
