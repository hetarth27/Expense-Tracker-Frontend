import { useState } from 'react';
import { CATEGORY_META, Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Badge, ConfirmDialog, EmptyState } from '../ui';
import Button from '../ui/Button';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const ExpenseTable = ({ expenses, onEdit, onDelete, isLoading }: ExpenseTableProps) => {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (!isLoading && expenses.length === 0) {
    return <EmptyState icon="📭" title="No expenses found" description="Try adjusting your filters or add a new expense" />;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-700/50">
              {['Category', 'Amount', 'Type', 'Payment', 'Date', 'Note', ''].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 px-3 first:pl-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700/30">
            {expenses.map((expense) => {
              const meta = CATEGORY_META[expense.category];
              return (
                <tr
                  key={expense._id}
                  className="group hover:bg-surface-800/30 transition-colors"
                >
                  {/* Category */}
                  <td className="py-3 px-3 pl-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${meta?.bg || 'bg-surface-700'}`}>
                        {meta?.icon || '💰'}
                      </span>
                      <span className="text-sm text-slate-200 font-medium">{expense.category}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-3">
                    <span className="font-mono text-sm font-semibold text-white">
                      {formatCurrency(expense.amount)}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-3">
                    <Badge variant={expense.type === 'personal' ? 'info' : 'warning'}>
                      {expense.type}
                    </Badge>
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-3">
                    <span className="text-sm text-slate-400">{expense.paymentMethod}</span>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-3">
                    <span className="text-sm text-slate-400">{formatDate(expense.date)}</span>
                  </td>

                  {/* Note */}
                  <td className="py-3 px-3 max-w-[150px]">
                    <span className="text-sm text-slate-500 truncate block">
                      {expense.note || '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(expense)}
                        className="p-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(expense._id)}
                        className="p-1.5 hover:text-rose-400"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        isLoading={isDeleting}
      />
    </>
  );
};

export default ExpenseTable;
