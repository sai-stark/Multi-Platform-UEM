import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Smartphone, Laptop, Server } from 'lucide-react';

export interface Device {
  id: string;
  name: string;
  platform: 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux';
  owner: string;
  lastSync: string;
  complianceStatus: 'compliant' | 'non-compliant' | 'pending';
  status: 'online' | 'offline' | 'inactive';
}

const platformIcons = {
  Android: Smartphone,
  iOS: Smartphone,
  Windows: Laptop,
  macOS: Laptop,
  Linux: Server,
};

const complianceStyles = {
  compliant: 'status-badge--compliant',
  'non-compliant': 'status-badge--non-compliant',
  pending: 'status-badge--pending',
};

const complianceLabels = {
  compliant: 'Compliant',
  'non-compliant': 'Non-Compliant',
  pending: 'Pending',
};

interface DeviceTableProps {
  devices: Device[];
  totalDevicesCount: number;
}

export function DeviceTable({ devices, totalDevicesCount }: DeviceTableProps) {
  const { t } = useLanguage();

  return (
    <div className="panel">
      <div className="panel__header flex items-center justify-between">
        <h3 className="panel__title">{t('dashboard.recentActivity')}</h3>
        <span className="text-sm text-muted-foreground">
          Showing {devices.length} of {totalDevicesCount.toLocaleString()} devices
        </span>
      </div>
      <div className="overflow-x-auto">
        <table 
          className="data-table"
          role="table"
          aria-label="Recent device activity"
        >
          <thead>
            <tr>
              <th scope="col">{t('table.deviceName')}</th>
              <th scope="col">{t('table.platform')}</th>
              <th scope="col">{t('table.owner')}</th>
              <th scope="col">{t('table.lastSync')}</th>
              <th scope="col">{t('table.complianceStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => {
              const PlatformIcon = platformIcons[device.platform];
              return (
                <tr 
                  key={device.id}
                  tabIndex={0}
                  className="cursor-pointer"
                  role="row"
                  aria-label={`Device ${device.name}, ${device.platform}, ${complianceLabels[device.complianceStatus]}`}
                >
                  <td className="font-medium text-foreground">
                    {device.name}
                  </td>
                  <td>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <PlatformIcon className="w-4 h-4" aria-hidden="true" />
                      {device.platform}
                    </span>
                  </td>
                  <td className="text-muted-foreground font-mono text-xs">
                    {device.owner}
                  </td>
                  <td className="text-muted-foreground font-mono text-xs">
                    <time dateTime={device.lastSync.replace(' ', 'T')}>
                      {device.lastSync}
                    </time>
                  </td>
                  <td>
                    <span 
                      className={cn('status-badge', complianceStyles[device.complianceStatus])}
                      role="status"
                    >
                      {complianceLabels[device.complianceStatus]}
                    </span>
                  </td>
                </tr>
              );
            })}
            {devices.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  No devices found matching the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
