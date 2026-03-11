import { useLanguage } from '@/contexts/LanguageContext';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface PlatformChartProps {
  data: { name: string; value: number; pattern: string }[];
}

// Colors that remain distinguishable in greyscale
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function PlatformChart({ data }: PlatformChartProps) {
  const { t } = useLanguage();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="panel flex flex-col h-[320px]">
      <div className="panel__header">
        <h3 className="panel__title">{t('dashboard.platformDistribution')}</h3>
      </div>
      <div className="panel__content flex-1 flex flex-col justify-center">
        {total === 0 ? (
           <div className="flex items-center justify-center h-full text-muted-foreground">
             No platform data available for the selected filters.
           </div>
        ) : (
          <div className="flex items-center gap-6">
            {/* Pie Chart - Left Side */}
            <div className="flex-1 h-52 min-w-0" role="img" aria-label="Platform distribution pie chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
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
                      `${value.toLocaleString()} (${((value / total) * 100).toFixed(2)}%)`,
                      'Devices'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table - Right Side */}
            <div className="flex-1 min-w-0">
              {/* Screen reader only full data */}
              <div className="sr-only" aria-live="polite">
                <h4>Platform Distribution Data:</h4>
                <ul>
                  {data.map((item) => (
                    <li key={item.name}>
                      {item.name}: {item.value.toLocaleString()} devices ({((item.value / total) * 100).toFixed(2)}%)
                    </li>
                  ))}
                </ul>
              </div>

              <table className="w-full text-sm" aria-label="Platform distribution data">
                <thead className="sr-only">
                  <tr>
                    <th>Platform</th>
                    <th>Device Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.name} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <td className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: COLORS[index] }}
                          aria-hidden="true"
                        />
                        <span className="text-foreground truncate">{item.name}</span>
                      </td>
                      <td className="text-muted-foreground font-mono shrink-0 pl-2">
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
        )}
      </div>
    </div>
  );
}
