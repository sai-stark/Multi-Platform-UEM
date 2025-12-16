import { useLanguage } from '@/contexts/LanguageContext';
import { HardDrive } from 'lucide-react';

const storageData = [
  { label: 'System Files', used: 45.2, total: 100, unit: 'GB' },
  { label: 'Applications', used: 28.7, total: 50, unit: 'GB' },
  { label: 'User Data', used: 156.3, total: 200, unit: 'GB' },
  { label: 'Logs & Backups', used: 12.1, total: 25, unit: 'GB' },
];

export function StorageUsage() {
  const { t } = useLanguage();

  return (
    <div className="panel">
      <div className="panel__header">
        <h3 className="panel__title">{t('dashboard.storageUsage')}</h3>
      </div>
      <div className="panel__content">
        <div className="space-y-4" role="list" aria-label="Storage usage breakdown">
          {storageData.map((item) => {
            const percentage = (item.used / item.total) * 100;
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
                    {item.used} / {item.total} {item.unit}
                  </span>
                </div>
                <div 
                  className="h-2 bg-muted rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={item.used}
                  aria-valuemin={0}
                  aria-valuemax={item.total}
                  aria-label={`${item.label}: ${item.used} of ${item.total} ${item.unit} used (${percentage.toFixed(0)}%)`}
                >
                  <div 
                    className={`h-full rounded-full transition-all ${
                      isCritical 
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
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Used</span>
            <span className="text-lg font-semibold text-foreground font-mono">
              242.3 / 375 GB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
