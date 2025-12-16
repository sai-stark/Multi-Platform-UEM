import { useLanguage } from '@/contexts/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const platformData = [
  { name: 'Android', value: 2450, pattern: 'solid' },
  { name: 'iOS', value: 1830, pattern: 'diagonal' },
  { name: 'Windows', value: 1240, pattern: 'dotted' },
  { name: 'macOS', value: 680, pattern: 'horizontal' },
  { name: 'Linux', value: 320, pattern: 'vertical' },
];

// Colors that remain distinguishable in greyscale
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function PlatformChart() {
  const { t } = useLanguage();
  const total = platformData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="panel">
      <div className="panel__header">
        <h3 className="panel__title">{t('dashboard.platformDistribution')}</h3>
      </div>
      <div className="panel__content">
        {/* Chart */}
        <div className="h-64" role="img" aria-label="Platform distribution pie chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--popover-foreground))',
                }}
                formatter={(value: number) => [
                  `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                  'Devices'
                ]}
              />
              <Legend 
                verticalAlign="bottom"
                formatter={(value, entry: any) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Textual Alternative - WCAG SC 1.1.1 */}
        <div className="mt-4 sr-only" aria-live="polite">
          <h4>Platform Distribution Data:</h4>
          <ul>
            {platformData.map((item) => (
              <li key={item.name}>
                {item.name}: {item.value.toLocaleString()} devices ({((item.value / total) * 100).toFixed(1)}%)
              </li>
            ))}
          </ul>
        </div>

        {/* Visible Data Table for Accessibility */}
        <table className="w-full mt-4 text-sm" aria-label="Platform distribution data">
          <thead className="sr-only">
            <tr>
              <th>Platform</th>
              <th>Device Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {platformData.map((item, index) => (
              <tr key={item.name} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <td className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: COLORS[index] }}
                    aria-hidden="true"
                  />
                  <span className="text-foreground">{item.name}</span>
                </td>
                <td className="text-muted-foreground font-mono">
                  {item.value.toLocaleString()}
                  <span className="ml-2 text-xs">
                    ({((item.value / total) * 100).toFixed(1)}%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
