import { useMemo, useState } from 'react';
import { Monitor, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { PlatformChart } from '@/components/dashboard/PlatformChart';
import { ComplianceOverview } from '@/components/dashboard/ComplianceOverview';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { DeviceTable, Device } from '@/components/dashboard/DeviceTable';
import { StorageUsage, StorageData } from '@/components/dashboard/StorageUsage';

// Extended mock devices for realistic filtering
const MOCK_DEVICES: Device[] = [
  { id: '1', name: 'CDOT-AND-001', platform: 'Android', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-15 14:32', complianceStatus: 'compliant', status: 'online' },
  { id: '2', name: 'CDOT-IOS-042', platform: 'iOS', owner: 'jsmith@cdot.in', lastSync: '2024-01-15 13:45', complianceStatus: 'compliant', status: 'online' },
  { id: '3', name: 'CDOT-WIN-103', platform: 'Windows', owner: 'ajay@cdot.in', lastSync: '2024-01-15 12:18', complianceStatus: 'non-compliant', status: 'offline' },
  { id: '4', name: 'CDOT-MAC-067', platform: 'macOS', owner: 'prajwal@cdot.in', lastSync: '2024-01-15 11:02', complianceStatus: 'pending', status: 'online' },
  { id: '5', name: 'CDOT-LNX-021', platform: 'Linux', owner: 'devops@cdot.in', lastSync: '2024-01-14 23:55', complianceStatus: 'compliant', status: 'online' },
  { id: '6', name: 'CDOT-AND-088', platform: 'Android', owner: 'marketing@cdot.in', lastSync: '2024-01-14 22:30', complianceStatus: 'non-compliant', status: 'inactive' },
  { id: '7', name: 'CDOT-IOS-043', platform: 'iOS', owner: 'sales1@cdot.in', lastSync: '2024-01-13 09:15', complianceStatus: 'compliant', status: 'offline' },
  { id: '8', name: 'CDOT-WIN-104', platform: 'Windows', owner: 'hr@cdot.in', lastSync: '2024-01-12 16:45', complianceStatus: 'compliant', status: 'online' },
  { id: '9', name: 'CDOT-AND-089', platform: 'Android', owner: 'support@cdot.in', lastSync: '2024-01-15 08:20', complianceStatus: 'pending', status: 'online' },
  { id: '10', name: 'CDOT-MAC-068', platform: 'macOS', owner: 'design@cdot.in', lastSync: '2024-01-11 10:30', complianceStatus: 'compliant', status: 'offline' },
];

const STORAGE_DATA: StorageData[] = [
  { label: 'System Files', used: 45.2, total: 100, unit: 'GB' },
  { label: 'Applications', used: 28.7, total: 50, unit: 'GB' },
  { label: 'User Data', used: 156.3, total: 200, unit: 'GB' },
  { label: 'Logs & Backups', used: 12.1, total: 25, unit: 'GB' },
];

const Dashboard = () => {
  const { t } = useLanguage();

  const [filters, setFilters] = useState<{ platform: string; compliance: string; status: string }>({
    platform: 'all',
    compliance: 'all',
    status: 'all',
  });

  const handleFilterChange = (newFilters: { platform: string; compliance: string; status: string }) => {
    setFilters(newFilters);
  };

  const filteredDevices = useMemo(() => {
    return MOCK_DEVICES.filter((device) => {
      const matchPlatform = filters.platform === 'all' || device.platform.toLowerCase() === filters.platform;
      const matchCompliance = filters.compliance === 'all' || device.complianceStatus === filters.compliance;
      const matchStatus = filters.status === 'all' || device.status === filters.status;
      return matchPlatform && matchCompliance && matchStatus;
    });
  }, [filters]);

  const stats = useMemo(() => {
    const total = filteredDevices.length;
    const compliant = filteredDevices.filter(d => d.complianceStatus === 'compliant').length;
    const nonCompliant = filteredDevices.filter(d => d.complianceStatus === 'non-compliant').length;
    const pending = filteredDevices.filter(d => d.complianceStatus === 'pending').length;
    
    // Extrapolate for realistic appearance if no filters are applied
    const multiplier = Object.values(filters).every(f => f === 'all') ? 656 : 1; 

    return {
      total: total * multiplier,
      compliant: compliant * multiplier,
      nonCompliant: nonCompliant * multiplier,
      pending: pending * multiplier,
      compliantPercent: total > 0 ? ((compliant / total) * 100).toFixed(1) : '0',
    };
  }, [filteredDevices, filters]);

  const platformDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      Android: 0, iOS: 0, Windows: 0, macOS: 0, Linux: 0
    };
    filteredDevices.forEach(d => { counts[d.platform]++; });
    
    // Extrapolate multiplier
    const multiplier = Object.values(filters).every(f => f === 'all') ? 656 : 1;
    
    return [
      { name: 'Android', value: counts.Android * multiplier, pattern: 'solid' },
      { name: 'iOS', value: counts.iOS * multiplier, pattern: 'diagonal' },
      { name: 'Windows', value: counts.Windows * multiplier, pattern: 'dotted' },
      { name: 'macOS', value: counts.macOS * multiplier, pattern: 'horizontal' },
      { name: 'Linux', value: counts.Linux * multiplier, pattern: 'vertical' },
    ].filter(item => item.value > 0);
  }, [filteredDevices, filters]);

  const complianceOverviewData = useMemo(() => {
    const total = stats.total;
    return [
      { 
        status: 'Compliant', 
        count: stats.compliant, 
        percentage: total > 0 ? (stats.compliant / total) * 100 : 0, 
        variant: 'success' as const 
      },
      { 
        status: 'Non-Compliant', 
        count: stats.nonCompliant, 
        percentage: total > 0 ? (stats.nonCompliant / total) * 100 : 0, 
        variant: 'destructive' as const 
      },
      { 
        status: 'Pending', 
        count: stats.pending, 
        percentage: total > 0 ? (stats.pending / total) * 100 : 0, 
        variant: 'warning' as const 
      },
    ];
  }, [stats]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header>
          <h1 className="text-2xl font-bold text-foreground">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Enterprise Unified Endpoint Management Console
          </p>
        </header>

        {/* Filter Bar */}
        <section aria-label="Device filters">
          <FilterBar onFilterChange={handleFilterChange} />
        </section>

        {/* Stats Grid */}
        <section aria-label="Device statistics overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t('dashboard.totalDevices')}
              value={stats.total.toLocaleString()}
              icon={Monitor}
              trend={{ value: 5.2, isPositive: true }}
              variant="info"
              description="Across selected filters"
            />
            <StatCard
              title={t('dashboard.compliant')}
              value={stats.compliant.toLocaleString()}
              icon={CheckCircle}
              trend={{ value: 2.1, isPositive: true }}
              variant="success"
              description={`${stats.compliantPercent}% of filtered`}
            />
            <StatCard
              title={t('dashboard.nonCompliant')}
              value={stats.nonCompliant.toLocaleString()}
              icon={XCircle}
              trend={{ value: 1.8, isPositive: false }}
              variant="destructive"
              description="Requires attention"
            />
            <StatCard
              title={t('dashboard.pending')}
              value={stats.pending.toLocaleString()}
              icon={Clock}
              variant="warning"
              description="Awaiting evaluation"
            />
          </div>
        </section>

        {/* Charts Row */}
        <section aria-label="Data visualizations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlatformChart data={platformDistribution} />
            <ComplianceOverview data={complianceOverviewData} totalCount={stats.total} />
          </div>
        </section>

        {/* Device Table (Recent Activity) */}
        <section aria-label="Device list">
          <DeviceTable devices={filteredDevices} totalDevicesCount={stats.total} />
        </section>

        {/* Storage Usage (System-wide, not filtered by device) */}
        <section aria-label="Storage information">
          <StorageUsage data={STORAGE_DATA} />
        </section>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
