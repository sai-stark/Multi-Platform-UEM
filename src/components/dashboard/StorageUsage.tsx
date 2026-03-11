import { useLanguage } from '@/contexts/LanguageContext';
import { HardDrive } from 'lucide-react';

export interface StorageData {
  label: string;
  used: number;
  total: number;
  unit: string;
}

interface StorageUsageProps {
  data: StorageData[];
}

export function StorageUsage({ data }: StorageUsageProps) {
  const { t } = useLanguage();

  const totalUsed = data.reduce((acc, item) => acc + item.used, 0);
  const totalCapacity = data.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel__header">
        <h3 className="panel__title">{t('dashboard.storageUsage')}</h3>
      </div>
      <div className="panel__content flex-1 flex flex-col justify-between">
        <div className="space-y-4 flex-1" role="list" aria-label="Storage usage breakdown">
          {data.map((item) => {
            const percentage = item.total > 0 ? (item.used / item.total) * 100 : 0;
            const isWarning = percentage > 80;
            const isCritical = percentage > 90;

            return (
              <div key={item.label} role="listitem">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {item.used.toFixed(1)} / {item.total.toFixed(0)} {item.unit}
                  </span>
                </div>
                <div
                  className="h-2 bg-muted rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={item.used}
                  aria-valuemin={0}
                  aria-valuemax={item.total}
                  aria-label={`${item.label}: ${item.used} of ${item.total} ${item.unit} used (${percentage.toFixed(1)}%)`}
                >
                  <div
                    className={`h-full rounded-full transition-all ${isCritical
                        ? 'bg-destructive'
                        : isWarning
                          ? 'bg-warning'
                          : 'bg-info'
                      }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {isWarning && (
                  <p
                    className={`text-xs mt-1 ${isCritical ? 'text-destructive' : 'text-warning'}`}
                    role="alert"
                  >
                    {isCritical ? 'Critical: Storage nearly full' : 'Warning: Storage above 80%'}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Total Summary */}
        <div className="mt-6 pt-4 border-t border-border shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Used</span>
            <span className="text-lg font-semibold text-foreground font-mono">
              {totalUsed.toFixed(1)} / {totalCapacity.toFixed(0)} GB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
