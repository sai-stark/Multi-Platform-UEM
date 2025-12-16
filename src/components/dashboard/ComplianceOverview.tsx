import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';

const complianceData = [
  { status: 'Compliant', count: 4820, percentage: 73.5, variant: 'success' as const },
  { status: 'Non-Compliant', count: 1240, percentage: 18.9, variant: 'destructive' as const },
  { status: 'Pending', count: 500, percentage: 7.6, variant: 'warning' as const },
];

const variantColors = {
  success: 'bg-success',
  destructive: 'bg-destructive',
  warning: 'bg-warning',
};

export function ComplianceOverview() {
  const { t } = useLanguage();

  return (
    <div className="panel">
      <div className="panel__header">
        <h3 className="panel__title">{t('dashboard.complianceOverview')}</h3>
      </div>
      <div className="panel__content">
        <div className="space-y-5" role="list" aria-label="Compliance status breakdown">
          {complianceData.map((item) => (
            <div key={item.status} role="listitem">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  {item.status}
                </span>
                <span className="text-sm text-muted-foreground font-mono">
                  {item.count.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={item.percentage} 
                  className="h-3"
                  aria-label={`${item.status}: ${item.percentage}%`}
                />
                {/* Custom colored indicator overlay */}
                <div 
                  className={`absolute top-0 left-0 h-3 rounded-full transition-all ${variantColors[item.variant]}`}
                  style={{ width: `${item.percentage}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Total devices: <span className="font-semibold text-foreground">6,560</span>
          </p>
        </div>
      </div>
    </div>
  );
}
