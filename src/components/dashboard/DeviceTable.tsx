import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Smartphone, Laptop, Server } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  platform: 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux';
  owner: string;
  lastSync: string;
  complianceStatus: 'compliant' | 'non-compliant' | 'pending';
}

const mockDevices: Device[] = [
  { id: '1', name: 'CDOT-AND-001', platform: 'Android', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-15 14:32', complianceStatus: 'compliant' },
  { id: '2', name: 'CDOT-IOS-042', platform: 'iOS', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-15 13:45', complianceStatus: 'compliant' },
  { id: '3', name: 'CDOT-WIN-103', platform: 'Windows', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-15 12:18', complianceStatus: 'non-compliant' },
  { id: '4', name: 'CDOT-MAC-067', platform: 'macOS', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-15 11:02', complianceStatus: 'pending' },
  { id: '5', name: 'CDOT-LNX-021', platform: 'Linux', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-14 23:55', complianceStatus: 'compliant' },
  { id: '6', name: 'CDOT-AND-088', platform: 'Android', owner: 'mdmadmin@cdot.in', lastSync: '2024-01-14 22:30', complianceStatus: 'non-compliant' },
];

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

export function DeviceTable() {
  const { t } = useLanguage();

  return (
    <div className="panel">
      <div className="panel__header flex items-center justify-between">
        <h3 className="panel__title">{t('dashboard.recentActivity')}</h3>
        <span className="text-sm text-muted-foreground">
          Showing {mockDevices.length} of 6,560 devices
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
            {mockDevices.map((device) => {
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
