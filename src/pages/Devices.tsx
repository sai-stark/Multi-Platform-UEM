import { DeviceService } from '@/api/services/devices';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Column, DataTable } from '@/components/ui/data-table';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Platform } from '@/types/models';
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
import { useEffect, useState } from 'react';
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

const platformConfig = {
  android: { label: 'Android', asset: '/Assets/android.png', icon: Smartphone },
  ios: { label: 'iOS', asset: '/Assets/apple.png', icon: Smartphone },
  windows: { label: 'Windows', asset: '/Assets/microsoft.png', icon: Laptop },
  macos: { label: 'macOS', asset: '/Assets/apple.png', icon: Laptop },
  linux: { label: 'Linux', asset: null, icon: Server },
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
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      let responseData: any[] = [];
      if (platform) {
        const res = await DeviceService.getDevices(platform as Platform, { page: 0, size: 100 });
        responseData = res.content || [];
      } else {
        const platforms: Platform[] = ['android', 'ios', 'windows', 'macos', 'linux'];
        const results = await Promise.all(
          platforms.map(async (p) => {
            try {
              const res = await DeviceService.getDevices(p, { page: 0, size: 20 });
              return res.content || [];
            } catch (err) {
              console.warn(`Failed to fetch devices for platform ${p}`, err);
              return [];
            }
          })
        );
        responseData = results.flat();
      }

      // Map API response to Device interface
      // Map API response to Device interface
      const mappedData: Device[] = responseData.map(item => {
        const platform = (item.platform || item.opSysInfo?.osType?.toLowerCase() || 'android') as any;

        // Calculate storage percentage
        let storageUsed = 0;
        let storageTotal = 0;
        if (item.storageCapacity) {
          // Android usually returns bytes or similar, need to normalize if needed. 
          // Assuming simple mapping for now based on JSON example values (which were just '1')
          storageTotal = item.storageCapacity;
          storageUsed = item.storageUsed || 0;
        } else if (item.deviceCapacity) {
          // iOS
          storageTotal = item.deviceCapacity;
          storageUsed = (item.deviceCapacity - (item.availableDeviceCapacity || 0));
        }

        return {
          id: item.id,
          name: item.deviceName || item.name || item.model || 'Unknown',
          model: item.model || item.modelName || 'Unknown',
          platform: platform,
          osVersion: item.osVersion || (item.opSysInfo ? item.opSysInfo.version : '-'),
          owner: item.deviceUser || item.userEmail || '-',
          lastSync: item.lastSyncTime ? new Date(item.lastSyncTime).toLocaleString() : (item.modificationTime ? new Date(item.modificationTime).toLocaleString() : '-'),
          complianceStatus: 'compliant', // Placeholder
          connectionStatus: (item.status === 'ONLINE' || item.connectionStatus === 'online') ? 'online' : 'offline',
          batteryLevel: item.batteryLevel ?? 0,
          storageUsed: storageUsed, // Placeholder logic needs refinement based on unit
          storageTotal: storageTotal
        };
      });
      setData(mappedData);
    } catch (error) {
      console.error("Failed to fetch devices", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [platform]);

  const pageTitle = platform
    ? `${platformConfig[platform as keyof typeof platformConfig]?.label || 'Unknown'} Devices`
    : t('nav.devices');

  const stats = {
    total: data.length,
    online: data.filter(d => d.connectionStatus === 'online').length,
    compliant: data.filter(d => d.complianceStatus === 'compliant').length,
    nonCompliant: data.filter(d => d.complianceStatus === 'non-compliant').length,
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
        const PlatformIcon = platformInfo ? platformInfo.icon : Smartphone;
        return (
          <div className="flex items-center gap-3">
            {/* <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden p-2">
              {platformInfo?.asset ? (
                <img src={platformInfo.asset} alt={platformInfo.label} className="w-full h-full object-contain" />
              ) : (
                <PlatformIcon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              )}
            </div> */}
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
      accessor: (item) => platformConfig[item.platform]?.label || item.platform,
      sortable: true,
      filterable: true,
      render: (_, item) => {
        const platformInfo = platformConfig[item.platform];
        const PlatformIcon = platformInfo?.icon || Smartphone;

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center justify-center cursor-default">
                {platformInfo?.asset ? (
                  <img
                    src={platformInfo.asset}
                    alt={platformInfo.label}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <PlatformIcon
                    className="w-5 h-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{platformInfo?.label || item.platform}</p>
            </TooltipContent>
          </Tooltip>
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
      accessor: (item) => item.storageTotal > 0 ? Math.round((item.storageUsed / item.storageTotal) * 100) : 0,
      sortable: true,
      render: (_, item) => {
        const storagePercent = item.storageTotal > 0 ? Math.round((item.storageUsed / item.storageTotal) * 100) : 0;
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
          <Button variant="outline" className="gap-2" onClick={fetchData}>
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
            data={data}
            columns={columns}
            globalSearchPlaceholder="Search devices..."
            emptyMessage={loading ? "Loading devices..." : "No devices match your filters."}
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
