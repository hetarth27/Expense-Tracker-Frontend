import { useState } from 'react';
import { CATEGORY_META, Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Badge, ConfirmDialog, EmptyState } from '../ui';
import Button from '../ui/Button';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const ExpenseTable = ({ expenses, onEdit, onDelete, isLoading }: ExpenseTableProps) => {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (!isLoading && expenses.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No expenses found"
        description="Try adjusting your filters or add a new expense"
      />
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {expenses.map((expense) => {
          const meta = CATEGORY_META[expense.category] || { bg: 'bg-surface-700', icon: '💰' };

          return (
            <div
              key={expense._id}
              className="rounded-2xl border border-surface-700/50 bg-surface-800/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base ${meta?.bg || 'bg-surface-700'}`}
                  >
                    {meta?.icon || '💰'}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {expense.category}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(expense.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(expense)}
                      className="p-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(expense._id)}
                      className="p-1.5 hover:text-rose-400"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-white">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Payment
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{expense.paymentMethod}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </p>
                  <div className="mt-1">
                    <Badge variant={expense.type === 'personal' ? 'info' : 'warning'}>
                      {expense.type}
                    </Badge>
                  </div>
                </div>

                <div className="col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Note
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {expense.note || '-'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-surface-700/50">
              {['Category', 'Amount', 'Type', 'Payment', 'Date', 'Note', ''].map((h) => (
                <th
                  key={h}
                  className="px-3 pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 first:pl-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700/30">
            {expenses.map((expense) => {
              const meta = CATEGORY_META[expense.category] || { bg: 'bg-surface-700', icon: '💰' };

              return (
                <tr key={expense._id} className="group transition-colors hover:bg-surface-800/30">
                  <td className="py-3 px-3 pl-0">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${meta.bg}`}
                      >
                        {meta.icon}
                      </span>
                      <span className="text-sm font-medium text-slate-200">
                        {expense.category}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono text-sm font-semibold text-white">
                      {formatCurrency(expense.amount)}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <Badge variant={expense.type === 'personal' ? 'info' : 'warning'}>
                      {expense.type}
                    </Badge>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-sm text-slate-400">{expense.paymentMethod}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-sm text-slate-400">{formatDate(expense.date)}</span>
                  </td>

                  <td className="max-w-[150px] py-3 px-3">
                    <span className="block text-sm text-slate-500">
                      {expense.note || '-'}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(expense)}
                          className="p-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(expense._id)}
                          className="p-1.5 hover:text-rose-400"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {onDelete && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Expense"
          message="Are you sure you want to delete this expense? This action cannot be undone."
          isLoading={isDeleting}
        />
      )}
    </>
  );
};

export default ExpenseTable;
