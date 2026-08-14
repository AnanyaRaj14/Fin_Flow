'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-medium mb-1">Day {label}</p>
      <p className="text-primary">Spent: ${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

export default function MonthlySpendingChart({ data = [] }) {
  // data: [{ day: 1, amount: 45.5 }, ...]
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Monthly Spending</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 || data.every((d) => d.amount === 0) ? (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
            No spending data this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
              <Bar dataKey="amount" radius={[3, 3, 0, 0]} maxBarSize={14}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.amount >= max * 0.8 ? '#ef4444' : '#6366f1'}
                    fillOpacity={0.8 + (entry.amount / max) * 0.2}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
