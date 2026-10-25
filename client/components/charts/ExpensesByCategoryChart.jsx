'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  if (!data || data.length === 0) {
    return (
      <div className="h-[230px] flex flex-col items-center justify-center text-center p-4">
        <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground mb-2">
          <PieIcon className="w-4 h-4" />
        </div>
        <p className="text-xs font-medium text-foreground">No expense data</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Add categorized transactions to view distribution.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-end pb-2 mb-2">
        <span className="text-[11px] font-mono text-muted-foreground">
          {data.length} categories
        </span>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color || '#6366f1'}
                className="transition-all duration-200 hover:opacity-85"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span className="text-xs text-muted-foreground font-medium">{value}</span>}
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
