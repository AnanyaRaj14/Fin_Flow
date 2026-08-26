'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { PieChart as PieIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-popover/95 backdrop-blur-xl border border-border/80 dark:border-white/10 rounded-xl p-3 shadow-xl text-xs min-w-[120px]">
      <div className="flex items-center gap-1.5 font-bold text-foreground">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.payload?.color }} />
        {item.name}
      </div>
      <p className="font-mono font-bold text-sm tabular-nums text-foreground mt-1">
        {formatCurrency(item.value)}
      </p>
    </div>
  );
};

export default function ExpensesByCategoryChart({ data = [] }) {
  return (
    <Card className="border border-border/80 dark:border-white/[0.08] dark:bg-card/85 backdrop-blur-md">
      <CardHeader className="pb-2 border-b border-border/40 dark:border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">Category Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Where your money went this cycle</p>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Distribution
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <div className="h-[260px] flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground mb-2">
              <PieIcon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-foreground">No expense data</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add categorized expenses to see allocation.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={92}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color || '#6366f1'}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-xs text-muted-foreground font-medium">{value}</span>}
                wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
