import { Monitor, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { PlatformChart } from '@/components/dashboard/PlatformChart';
import { ComplianceOverview } from '@/components/dashboard/ComplianceOverview';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { DeviceTable } from '@/components/dashboard/DeviceTable';
import { StorageUsage } from '@/components/dashboard/StorageUsage';

const Dashboard = () => {
  const { t } = useLanguage();

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

        {/* Stats Grid */}
        <section aria-label="Device statistics overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t('dashboard.totalDevices')}
              value="6,560"
              icon={Monitor}
              trend={{ value: 5.2, isPositive: true }}
              variant="info"
              description="Across all platforms"
            />
            <StatCard
              title={t('dashboard.compliant')}
              value="4,820"
              icon={CheckCircle}
              trend={{ value: 2.1, isPositive: true }}
              variant="success"
              description="73.5% of total"
            />
            <StatCard
              title={t('dashboard.nonCompliant')}
              value="1,240"
              icon={XCircle}
              trend={{ value: 1.8, isPositive: false }}
              variant="destructive"
              description="Requires attention"
            />
            <StatCard
              title={t('dashboard.pending')}
              value="500"
              icon={Clock}
              variant="warning"
              description="Awaiting evaluation"
            />
          </div>
        </section>

        {/* Filter Bar */}
        <section aria-label="Device filters">
          <FilterBar />
        </section>

        {/* Charts Row */}
        <section aria-label="Data visualizations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlatformChart />
            <ComplianceOverview />
          </div>
        </section>

        {/* Device Table */}
        <section aria-label="Device list">
          <DeviceTable />
        </section>

        {/* Storage Usage */}
        <section aria-label="Storage information">
          <StorageUsage />
        </section>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
