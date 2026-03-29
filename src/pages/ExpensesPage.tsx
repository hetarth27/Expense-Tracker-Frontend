import React, { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { getCurrentMonthYear, formatMonthYear } from '../utils/helpers';
import { Expense, ExpenseFilters, EXPENSE_CATEGORIES } from '../types';
import { PageLoader, ErrorAlert, Modal } from '../components/ui';
import { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import FilterBar from '../components/dashboard/FilterBar';
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseForm from '../components/expenses/ExpenseForm';
import { MONTH_OPTIONS, getYearOptions } from '../utils/helpers';
import { useToast } from '../context/ToastContext';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total} expense{total !== 1 ? 's' : ''} ·{' '}
            {formatMonthYear(filters.month, filters.year)}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>+ Add Expense</Button>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <FilterBar filters={filters} onChange={handleFilterChange} />
        <div className="w-44">
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

      {/* Table */}
      <div className="card p-6">
        {isLoading ? (
          <PageLoader />
        ) : (
          <ExpenseTable
            expenses={expenses}
            onEdit={setEditExpense}
            onDelete={handleDelete}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-700/50">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} · {total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                ← Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense">
        <ExpenseForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
      </Modal>

      {/* Edit Modal */}
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
