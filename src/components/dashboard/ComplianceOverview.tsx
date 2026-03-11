import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';

interface ComplianceData {
  status: string;
  count: number;
  percentage: number;
  variant: 'success' | 'destructive' | 'warning';
}

interface ComplianceOverviewProps {
  data: ComplianceData[];
  totalCount: number;
}

const variantColors = {
  success: 'bg-success',
  destructive: 'bg-destructive',
  warning: 'bg-warning',
};

export function ComplianceOverview({ data, totalCount }: ComplianceOverviewProps) {
  const { t } = useLanguage();

  return (
    <div className="panel flex flex-col h-[320px]">
      <div className="panel__header">
        <h3 className="panel__title">{t('dashboard.complianceOverview')}</h3>
      </div>
      <div className="panel__content flex-1 flex flex-col justify-center">
        {totalCount === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground pb-8">
            No compliance data available.
          </div>
        ) : (
          <>
            <div className="space-y-5 flex-1" role="list" aria-label="Compliance status breakdown">
              {data.map((item) => (
                <div key={item.status} role="listitem">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {item.status}
                    </span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {item.count.toLocaleString()} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={item.percentage} 
                      className="h-3"
                      aria-label={`${item.status}: ${item.percentage.toFixed(1)}%`}
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
            <div className="mt-4 pt-3 border-t border-border shrink-0">
              <p className="text-sm text-muted-foreground">
                Total devices: <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
