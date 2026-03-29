import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CategoryTotal, CATEGORY_META, CHART_COLORS } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { EmptyState } from '../ui';

interface CategoryBreakdownProps {
  data: CategoryTotal[];
  total: number;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: CategoryTotal }>;
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl p-3 shadow-xl">
      <p className="text-sm font-medium text-white mb-1">{item.name}</p>
      <p className="text-brand-400 font-mono text-sm">{formatCurrency(item.value)}</p>
    </div>
  );
};

const CategoryBreakdown = ({ data, total }: CategoryBreakdownProps) => {
  if (!data.length) {
    return <EmptyState icon="📊" title="No data yet" description="Add expenses to see breakdown" />;
  }

  const chartData = data.map((item) => ({
    ...item,
    name: item.category,
    value: item.total,
    percentage: total > 0 ? ((item.total / total) * 100).toFixed(1) : '0',
  }));

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
        {chartData.map((item, index) => {
          const meta = CATEGORY_META[item.category];
          return (
            <div key={item.category} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="text-sm text-slate-300 truncate">
                  {meta?.icon} {item.category}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-medium text-white">
                  {formatCurrency(item.total)}
                </span>
                <span className="text-xs text-slate-500 ml-1">({item.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
