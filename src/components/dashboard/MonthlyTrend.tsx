import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyTotal } from '../../types';
import { getMonthName, formatCompactCurrency, formatCurrency } from '../../utils/helpers';
import { EmptyState } from '../ui';

interface MonthlyTrendProps {
  data: MonthlyTotal[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-brand-400 font-mono text-sm font-medium">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

const MonthlyTrend = ({ data }: MonthlyTrendProps) => {
  if (!data.length) {
    return <EmptyState icon="📈" title="No trend data" description="Spend across months to see your trend" />;
  }

  const chartData = data.map((d) => ({
    name: `${getMonthName(d.month)} '${String(d.year).slice(-2)}`,
    total: d.total,
  }));

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompactCurrency}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="url(#colorTotal)"
            dot={{ fill: '#0ea5e9', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrend;
