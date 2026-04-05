import { useState } from 'react';
import FilterBar from '../components/dashboard/FilterBar';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseTable from '../components/expenses/ExpenseTable';
import { ErrorAlert, Modal, PageLoader } from '../components/ui';
import Button from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import { useExpenses } from '../hooks/useExpenses';
import { EXPENSE_CATEGORIES, Expense, ExpenseFilters } from '../types';
import { formatMonthYear, getCurrentMonthYear } from '../utils/helpers';

const LIMIT = 15;

const ExpensesPage = () => {
  const now = getCurrentMonthYear();
  const toast = useToast();

  const [filters, setFilters] = useState<ExpenseFilters>({
    month: now.month,
    year: now.year,
    type: '',
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const {
    expenses,
    total,
    totalPages,
    isLoading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses({
    filters: { ...filters, ...(categoryFilter ? { category: categoryFilter } : {}) },
    page,
    limit: LIMIT,
  });

  const handleFilterChange = (f: ExpenseFilters) => {
    setFilters(f);
    setPage(1);
  };

  const handleAdd = async (data: Parameters<typeof createExpense>[0]) => {
    await createExpense(data);
    setShowAddModal(false);
    toast.success('Expense added successfully');
  };

  const handleEdit = async (data: Parameters<typeof updateExpense>[1]) => {
    if (!editExpense) return;
    await updateExpense(editExpense._id, data);
    setEditExpense(null);
    toast.success('Expense updated');
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    toast.success('Expense deleted');
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {total} expense{total !== 1 ? 's' : ''} · {formatMonthYear(filters.month, filters.year)}
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
          + Add Expense
        </Button>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2">
          <FilterBar filters={filters} onChange={handleFilterChange} />
          <div className="w-full sm:w-44 lg:w-44">
            <Select
              value={categoryFilter}
              options={categoryOptions}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        {isLoading ? (
          <PageLoader />
        ) : (
          <ExpenseTable
            expenses={expenses}
            onEdit={setEditExpense}
            onDelete={handleDelete}
          />
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-3 border-t border-surface-700/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} · {total} results
            </p>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="flex-1 sm:flex-none"
              >
                ← Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="flex-1 sm:flex-none"
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense">
        <ExpenseForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
      </Modal>

      <Modal
        isOpen={!!editExpense}
        onClose={() => setEditExpense(null)}
        title="Edit Expense"
      >
        {editExpense && (
          <ExpenseForm
            initialData={editExpense}
            onSubmit={handleEdit}
            onCancel={() => setEditExpense(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default ExpensesPage;
