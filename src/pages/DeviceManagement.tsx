import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Monitor, 
  Smartphone, 
  Laptop,
  Server,
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock,
  MoreHorizontal,
  Lock,
  Trash2,
  Eye
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ComplianceDistributionChart } from '@/components/device-management/ComplianceDistributionChart';
import { OSVersionChart } from '@/components/device-management/OSVersionChart';

type Platform = 'all' | 'android' | 'ios' | 'windows' | 'macos' | 'linux';

const platformIcons: Record<string, React.ElementType> = {
  android: Smartphone,
  ios: Smartphone,
  windows: Laptop,
  macos: Laptop,
  linux: Server,
};

const mockDevices = [
  { id: 'DEV-001', user: 'Amit Kumar', os: 'Android 14', compliance: 'compliant', lastSync: '2 min ago', platform: 'android' },
  { id: 'DEV-002', user: 'Priya Singh', os: 'iOS 17.2', compliance: 'non-compliant', lastSync: '15 min ago', platform: 'ios' },
  { id: 'DEV-003', user: 'Rahul Sharma', os: 'Windows 11', compliance: 'compliant', lastSync: '1 hr ago', platform: 'windows' },
  { id: 'DEV-004', user: 'Neha Gupta', os: 'macOS 14.1', compliance: 'pending', lastSync: '3 hrs ago', platform: 'macos' },
  { id: 'DEV-005', user: 'Vikram Patel', os: 'Ubuntu 22.04', compliance: 'compliant', lastSync: '5 min ago', platform: 'linux' },
  { id: 'DEV-006', user: 'Anita Desai', os: 'Android 13', compliance: 'non-compliant', lastSync: '30 min ago', platform: 'android' },
  { id: 'DEV-007', user: 'Suresh Kumar', os: 'iOS 16.7', compliance: 'compliant', lastSync: '10 min ago', platform: 'ios' },
  { id: 'DEV-008', user: 'Meera Iyer', os: 'Windows 10', compliance: 'pending', lastSync: '2 hrs ago', platform: 'windows' },
];

const complianceStyles: Record<string, string> = {
  compliant: 'bg-success/10 text-success',
  'non-compliant': 'bg-destructive/10 text-destructive',
  pending: 'bg-warning/10 text-warning',
};

const complianceLabels: Record<string, { en: string; hi: string }> = {
  compliant: { en: 'Compliant', hi: 'अनुपालक' },
  'non-compliant': { en: 'Non-Compliant', hi: 'गैर-अनुपालक' },
  pending: { en: 'Pending', hi: 'लंबित' },
};

export default function DeviceManagement() {
  const { t, language } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');

  const filteredDevices = selectedPlatform === 'all' 
    ? mockDevices 
    : mockDevices.filter(d => d.platform === selectedPlatform);

  const stats = {
    total: filteredDevices.length,
    online: filteredDevices.filter(d => d.lastSync.includes('min')).length,
    offline: filteredDevices.filter(d => !d.lastSync.includes('min')).length,
    nonCompliant: filteredDevices.filter(d => d.compliance === 'non-compliant').length,
    pending: filteredDevices.filter(d => d.compliance === 'pending').length,
  };

  return (
    <MainLayout>
    <div className="space-y-6">
      {/* Page Header */}
      <header>
        <h1 className="text-2xl font-semibold text-foreground">
          {t('deviceMgmt.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('deviceMgmt.subtitle')}
        </p>
      </header>

      {/* Tier 0: Persistent Filter Bar */}
      <nav 
        className="filter-bar"
        role="navigation"
        aria-label={t('deviceMgmt.platformFilter')}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            {t('filter.platform')}:
          </span>
          {(['all', 'android', 'ios', 'windows', 'macos', 'linux'] as Platform[]).map((platform) => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPlatform(platform)}
              className="min-w-[80px]"
              aria-pressed={selectedPlatform === platform}
            >
              {platform === 'all' ? t('filter.all') : platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Button>
          ))}
        </div>
      </nav>

      {/* Tier 1: KPI Stats */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">{t('deviceMgmt.kpiSection')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title={t('deviceMgmt.totalDevices')}
            value={stats.total}
            icon={Monitor}
            variant="default"
          />
          <StatCard
            title={t('deviceMgmt.online')}
            value={stats.online}
            icon={Wifi}
            variant="success"
          />
          <StatCard
            title={t('deviceMgmt.offline')}
            value={stats.offline}
            icon={WifiOff}
            variant="warning"
          />
          <StatCard
            title={t('deviceMgmt.nonCompliant')}
            value={stats.nonCompliant}
            icon={AlertTriangle}
            variant="destructive"
          />
          <StatCard
            title={t('deviceMgmt.pendingActions')}
            value={stats.pending}
            icon={Clock}
            variant="info"
          />
        </div>
      </section>

      {/* Tier 2: Graphical Data */}
      <section aria-labelledby="charts-heading">
        <h2 id="charts-heading" className="sr-only">{t('deviceMgmt.chartsSection')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplianceDistributionChart platform={selectedPlatform} />
          <OSVersionChart platform={selectedPlatform} />
        </div>
      </section>

      {/* Tier 3: Devices Data Grid */}
      <section aria-labelledby="devices-table-heading">
        <div className="panel">
          <h2 id="devices-table-heading" className="text-lg font-semibold mb-4">
            {t('deviceMgmt.deviceList')}
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">{t('deviceMgmt.deviceId')}</TableHead>
                  <TableHead>{t('deviceMgmt.userOwner')}</TableHead>
                  <TableHead>{t('deviceMgmt.osVersion')}</TableHead>
                  <TableHead>{t('deviceMgmt.complianceStatus')}</TableHead>
                  <TableHead>{t('deviceMgmt.lastSync')}</TableHead>
                  <TableHead className="w-[80px] text-right">{t('deviceMgmt.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => {
                  const PlatformIcon = platformIcons[device.platform];
                  return (
                    <TableRow key={device.id}>
                      <TableCell className="font-mono text-sm">{device.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PlatformIcon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                          {device.user}
                        </div>
                      </TableCell>
                      <TableCell>{device.os}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${complianceStyles[device.compliance]}`}>
                          {device.compliance === 'compliant' && '✓'}
                          {device.compliance === 'non-compliant' && '✗'}
                          {device.compliance === 'pending' && '⏳'}
                          {complianceLabels[device.compliance][language]}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{device.lastSync}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              aria-label={`${t('deviceMgmt.actionsFor')} ${device.id}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border border-border">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                              {t('deviceMgmt.viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
                              {t('deviceMgmt.lockDevice')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                              {t('deviceMgmt.wipeDevice')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
    </MainLayout>
  );
}
