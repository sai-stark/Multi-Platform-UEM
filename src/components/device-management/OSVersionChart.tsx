import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  platform: string;
}

const osData = [
  { name: 'Android 14', count: 45, pattern: 0 },
  { name: 'Android 13', count: 32, pattern: 1 },
  { name: 'iOS 17', count: 28, pattern: 2 },
  { name: 'iOS 16', count: 15, pattern: 3 },
  { name: 'Win 11', count: 38, pattern: 4 },
  { name: 'Win 10', count: 22, pattern: 0 },
  { name: 'macOS 14', count: 12, pattern: 1 },
  { name: 'Ubuntu', count: 8, pattern: 2 },
];

// Different shades for greyscale distinguishability
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function OSVersionChart({ platform }: Props) {
  const { t } = useLanguage();
  
  const filteredData = platform === 'all' 
    ? osData 
    : osData.filter(item => {
        const lower = item.name.toLowerCase();
        if (platform === 'android') return lower.includes('android');
        if (platform === 'ios') return lower.includes('ios');
        if (platform === 'windows') return lower.includes('win');
        if (platform === 'macos') return lower.includes('macos');
        if (platform === 'linux') return lower.includes('ubuntu') || lower.includes('linux');
        return true;
      });

  return (
    <div className="panel">
      <h3 className="text-lg font-semibold mb-4">{t('deviceMgmt.osVersionSpread')}</h3>
      
      {/* Chart */}
      <div className="h-[250px]" role="img" aria-label={t('deviceMgmt.osChartAlt')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={filteredData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              horizontal={true}
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis 
              type="number"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              type="category"
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={55}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.375rem',
                color: 'hsl(var(--popover-foreground))',
              }}
              formatter={(value: number) => [`${value} devices`, t('deviceMgmt.count')]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {filteredData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.pattern % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ARIA Table Equivalent */}
      <details className="mt-4">
        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
          {t('deviceMgmt.viewAsTable')}
        </summary>
        <table className="w-full mt-2 text-sm" role="table" aria-label={t('deviceMgmt.osVersionTable')}>
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 font-medium">{t('deviceMgmt.osVersion')}</th>
              <th className="text-right py-2 font-medium">{t('deviceMgmt.deviceCount')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="border-b border-border/50">
                <td className="py-2">{item.name}</td>
                <td className="text-right py-2">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
