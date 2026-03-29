import React from 'react';
import { Link } from 'react-router-dom';
import { Expense, CATEGORY_META } from '../../types';
import { formatCurrency, formatDateShort } from '../../utils/helpers';
import { EmptyState } from '../ui';

interface RecentExpensesProps {
  expenses: Expense[];
}

const PaymentBadge = ({ method }: { method: string }) => {
  const styles: Record<string, string> = {
    cash: 'bg-emerald-500/10 text-emerald-400',
    UPI: 'bg-violet-500/10 text-violet-400',
    card: 'bg-sky-500/10 text-sky-400',
  };
  return (
    <span className={`badge ${styles[method] || 'bg-surface-700 text-slate-400'}`}>
      {method}
    </span>
  );
};

const RecentExpenses = ({ expenses }: RecentExpensesProps) => {
  if (!expenses.length) {
    return (
      <EmptyState
        icon="💸"
        title="No expenses yet"
        description="Start tracking your spending"
        action={
          <Link to="/expenses/new" className="btn-primary text-sm">
            Add Expense
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => {
        const meta = CATEGORY_META[expense.category];
        return (
          <div
            key={expense._id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800/50 transition-colors group"
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${meta?.bg || 'bg-surface-700'}`}>
              {meta?.icon || '💰'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {expense.category}
                </p>
                <PaymentBadge method={expense.paymentMethod} />
              </div>
              <p className="text-xs text-slate-500 truncate">
                {expense.note || expense.type}
                {' · '}
                {formatDateShort(expense.date)}
              </p>
            </div>

            {/* Amount */}
            <p className="text-sm font-semibold font-mono text-white shrink-0">
              {formatCurrency(expense.amount)}
            </p>
          </div>
        );
      })}

      <Link
        to="/expenses"
        className="flex items-center justify-center gap-1.5 py-2.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
      >
        View all expenses
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
};

export default RecentExpenses;
