import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  description?: string;
}

const variantStyles = {
  default: 'border-border',
  success: 'border-l-4 border-l-success',
  warning: 'border-l-4 border-l-warning',
  destructive: 'border-l-4 border-l-destructive',
  info: 'border-l-4 border-l-info',
};

const iconVariantStyles = {
  default: 'bg-muted text-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
};

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default',
  description 
}: StatCardProps) {
  return (
    <article 
      className={cn('stat-card', variantStyles[variant])}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="stat-card__value mt-1">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <p 
              className={cn(
                'text-sm mt-2 font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
              aria-label={`Trend: ${trend.isPositive ? 'up' : 'down'} ${trend.value}%`}
            >
              <span aria-hidden="true">{trend.isPositive ? '↑' : '↓'}</span>
              {' '}{Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div 
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            iconVariantStyles[variant]
          )}
          aria-hidden="true"
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </article>
  );
}
