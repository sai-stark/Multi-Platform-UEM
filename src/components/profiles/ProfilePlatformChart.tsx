import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface PlatformChartProps {
    data: { name: string; count: number; fill: string }[];
}

export function ProfilePlatformChart({ data }: PlatformChartProps) {
    return (
        <Card className="panel">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Profiles by Platform</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                            <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                width={70}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                }}
                                cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
