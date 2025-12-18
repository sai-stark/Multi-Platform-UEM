import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  platform: string;
}

const data = [
  { name: 'Compliant', value: 156, pattern: 'solid' },
  { name: 'Non-Compliant', value: 23, pattern: 'striped' },
  { name: 'Pending', value: 8, pattern: 'dotted' },
];

// High-contrast colors that work in greyscale
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export function ComplianceDistributionChart({ platform }: Props) {
  const { t, language } = useLanguage();
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const localizedData = data.map(item => ({
    ...item,
    localName: item.name === 'Compliant' 
      ? (language === 'hi' ? 'अनुपालक' : 'Compliant')
      : item.name === 'Non-Compliant'
      ? (language === 'hi' ? 'गैर-अनुपालक' : 'Non-Compliant')
      : (language === 'hi' ? 'लंबित' : 'Pending'),
  }));

  return (
    <div className="panel">
      <h3 className="text-lg font-semibold mb-4">{t('deviceMgmt.complianceDistribution')}</h3>
      
      {/* Chart */}
      <div className="h-[250px]" role="img" aria-label={t('deviceMgmt.complianceChartAlt')}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={localizedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="localName"
              strokeWidth={2}
              stroke="hsl(var(--background))"
            >
              {localizedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    filter: index === 1 ? 'url(#striped)' : index === 2 ? 'url(#dotted)' : 'none'
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.375rem',
                color: 'hsl(var(--popover-foreground))',
              }}
              formatter={(value: number, name: string) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                name
              ]}
            />
            <Legend 
              verticalAlign="bottom"
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
            {/* SVG Patterns for greyscale distinguishability */}
            <defs>
              <pattern id="striped" patternUnits="userSpaceOnUse" width="4" height="4">
                <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="hsl(var(--background))" strokeWidth="1"/>
              </pattern>
              <pattern id="dotted" patternUnits="userSpaceOnUse" width="4" height="4">
                <circle cx="2" cy="2" r="1" fill="hsl(var(--background))"/>
              </pattern>
            </defs>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Textual Fallback Table */}
      <details className="mt-4">
        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
          {t('deviceMgmt.viewAsTable')}
        </summary>
        <table className="w-full mt-2 text-sm" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 font-medium">{t('deviceMgmt.status')}</th>
              <th className="text-right py-2 font-medium">{t('deviceMgmt.count')}</th>
              <th className="text-right py-2 font-medium">{t('deviceMgmt.percentage')}</th>
            </tr>
          </thead>
          <tbody>
            {localizedData.map((item, index) => (
              <tr key={index} className="border-b border-border/50">
                <td className="py-2">{item.localName}</td>
                <td className="text-right py-2">{item.value}</td>
                <td className="text-right py-2">{((item.value / total) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
