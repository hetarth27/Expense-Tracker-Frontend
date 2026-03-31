import { useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import FilterBar from '../components/dashboard/FilterBar';
import MonthlyTrend from '../components/dashboard/MonthlyTrend';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import { ErrorAlert, PageLoader, StatCard } from '../components/ui';
import { useDashboard } from '../hooks/useDashboard';
import { CATEGORY_META, ExpenseFilters } from '../types';
import { formatCurrency, formatMonthYear, formatPercentage, getCurrentMonthYear } from '../utils/helpers';

const DashboardPage = () => {
  const now = getCurrentMonthYear();
  const [filters, setFilters] = useState<ExpenseFilters>({
    month: now.month,
    year: now.year,
    type: '',
  });

  const { data, isLoading, error } = useDashboard({
    month: filters.month,
    year: filters.year,
    type: filters.type || undefined,
  });

  const pctChange = data?.percentageChange ?? 0;
  const pctColor =
    pctChange > 0 ? 'text-rose-400' : pctChange < 0 ? 'text-emerald-400' : 'text-slate-500';
  const pctIcon = pctChange > 0 ? '↑' : pctChange < 0 ? '↓' : '–';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {formatMonthYear(filters.month, filters.year)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FilterBar filters={filters} onChange={setFilters} />
          <Link to="/expenses/new" className="btn-primary whitespace-nowrap">
            + Add Expense
          </Link>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Total This Month"
              value={formatCurrency(data?.currentMonthTotal ?? 0)}
              sub={
                data?.previousMonthTotal
                  ? `vs ${formatCurrency(data.previousMonthTotal)} last month`
                  : 'No previous month data'
              }
              icon="💰"
              iconBg="bg-brand-500/10"
            />
            <StatCard
              label="Month-over-Month"
              value={data ? formatPercentage(pctChange) : '—'}
              sub={
                pctChange !== 0
                  ? pctChange > 0
                    ? 'Spending increased'
                    : 'Spending decreased'
                  : 'No change'
              }
              subColor={pctColor}
              icon={pctIcon}
              iconBg={
                pctChange > 0
                  ? 'bg-rose-500/10'
                  : pctChange < 0
                    ? 'bg-emerald-500/10'
                    : 'bg-surface-700'
              }
            />
            <StatCard
              label="Top Category"
              value={data?.highestCategory?.category ?? '—'}
              sub={
                data?.highestCategory
                  ? formatCurrency(data.highestCategory.total)
                  : 'No data yet'
              }
              icon={
                data?.highestCategory
                  ? CATEGORY_META[data.highestCategory.category]?.icon ?? '📊'
                  : '📊'
              }
              iconBg="bg-purple-500/10"
            />
            <StatCard
              label="Total Transactions"
              value={String(
                data?.categoryBreakdown.reduce((sum, c) => sum + c.count, 0) ?? 0
              )}
              sub="This month"
              icon="🧾"
              iconBg="bg-amber-500/10"
            />
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Monthly trend – full width on md, 2/3 on xl */}
            <div className="xl:col-span-2 card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Monthly Trend</h2>
                <span className="section-title">Last 6 months</span>
              </div>
              <MonthlyTrend data={data?.monthlyTrend ?? []} />
            </div>

            {/* Category breakdown */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">By Category</h2>
                <span className="section-title">{formatMonthYear(filters.month, filters.year)}</span>
              </div>
              <CategoryBreakdown
                data={data?.categoryBreakdown ?? []}
                total={data?.currentMonthTotal ?? 0}
              />
            </div>
          </div>

          {/* Recent expenses */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent Expenses</h2>
              <Link to="/expenses" className="text-sm text-brand-400 hover:text-brand-300">
                View all →
              </Link>
            </div>
            <RecentExpenses expenses={data?.recentExpenses ?? []} />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
