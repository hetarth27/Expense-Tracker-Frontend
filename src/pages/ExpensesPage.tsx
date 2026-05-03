import { useEffect, useState } from 'react';
import { createExpense, deleteExpense, generateShareToken, getExpenses, revokeShareToken, updateExpense } from '../api/axios';
import ExpenseFilterBar from '../components/expenses/ExpenseFilterBar';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseTable from '../components/expenses/ExpenseTable';
import { ErrorAlert, Modal, PageLoader } from '../components/ui';
import Button from '../components/ui/Button';
import {
  Expense,
  ExpenseFilters,
  ExpenseFormData
} from '../types';
import { formatCurrency, formatMonthYear, getCurrentMonthYear } from '../utils/helpers';

const ExpensesPage = () => {
  const now = getCurrentMonthYear();

  const [filters, setFilters] = useState<ExpenseFilters>({
    month: now.month,
    year: now.year,
    type: '',
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getExpenses({
        month: filters.month,
        year: filters.year,
        type: filters.type || undefined,
        category: categoryFilter || undefined,
        page,
        limit,
      });
      const result = res.data.data;

      setExpenses(result?.expenses ?? []);
      setTotal(result?.total ?? 0);
      setTotalAmount(result?.totalAmount ?? 0);
      setTotalPages(result?.totalPages ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters.month, filters.year, filters.type, categoryFilter, page, limit]);

  const handleFilterChange = (f: ExpenseFilters) => {
    setFilters(f);
    setPage(1);
  };

  const handleAdd = async (data: ExpenseFormData) => {
    await createExpense(data);
    await fetchExpenses();
    setShowAddModal(false);
    setSuccess('Expense added successfully');
  };

  const handleEdit = async (data: Partial<ExpenseFormData>) => {
    if (!editExpense) return;
    await updateExpense(editExpense._id, data);
    await fetchExpenses();
    setEditExpense(null);
    setSuccess('Expense updated');
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    await fetchExpenses();
    setSuccess('Expense deleted');
  };

  const handleGenerateShare = async () => {
    setIsGeneratingShare(true);
    try {
      const res = await generateShareToken();
      const data = res.data.data;
      setShareUrl(data?.shareUrl ?? null);
      setShowShareModal(true);
      setSuccess('Share link generated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate share link');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const handleRevokeShare = async () => {
    try {
      await revokeShareToken();
      setShareUrl(null);
      setShowShareModal(false);
      setSuccess('Share link revoked successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke share link');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500/10 via-purple-500/5 to-surface-800/50 border border-surface-700/50">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20 text-2xl">
                  💰
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">Expenses</h1>
                  <p className="text-sm text-slate-400">
                    Track and manage your spending
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 rounded-lg bg-surface-800/50 px-3 py-1.5">
                  <span className="text-slate-400">Total:</span>
                  <span className="font-semibold text-white">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-surface-800/50 px-3 py-1.5">
                  <span className="text-slate-400">Records:</span>
                  <span className="font-semibold text-white">{total}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-surface-800/50 px-3 py-1.5">
                  <span className="text-slate-400">Period:</span>
                  <span className="font-semibold text-white">{formatMonthYear(filters.month, filters.year)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="secondary"
                onClick={handleGenerateShare}
                disabled={isGeneratingShare}
                className="w-full sm:w-auto"
                size="sm"
              >
                {isGeneratingShare ? 'Generating...' : '📤 Share Expenses'}
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto shadow-app"
                size="lg"
              >
                ➕ Add Expense
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Enhanced Filters Section */}
      <div className="card p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white">Filters & Options</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <ExpenseFilterBar
              filters={filters}
              categoryFilter={categoryFilter}
              limit={limit}
              onChange={handleFilterChange}
              onCategoryChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
              onLimitChange={(value) => {
                setLimit(value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Expense Table Section */}
      <div className="card p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <PageLoader />
          </div>
        ) : (
          <>
            <ExpenseTable
              expenses={expenses}
              onEdit={setEditExpense}
              onDelete={handleDelete}
            />

            {totalPages > 1 && (
              <div className="mt-8 flex flex-col gap-4 border-t border-surface-700/50 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                  <p className="text-sm text-slate-400">
                    Showing page <span className="font-semibold text-white">{page}</span> of{' '}
                    <span className="font-semibold text-white">{totalPages}</span>
                  </p>
                  <p className="text-sm text-slate-500">
                    {total} total results • {limit} per page
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="px-3"
                  >
                    ← Previous
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      let start = Math.max(1, page - Math.floor(maxVisible / 2));
                      let end = Math.min(totalPages, start + maxVisible - 1);

                      if (end - start + 1 < maxVisible) {
                        start = Math.max(1, end - maxVisible + 1);
                      }

                      // Add first page if not in range
                      if (start > 1) {
                        pages.push(
                          <Button
                            key={1}
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage(1)}
                            className="min-w-[40px] px-3"
                          >
                            1
                          </Button>
                        );
                        if (start > 2) {
                          pages.push(
                            <span key="ellipsis-start" className="px-2 text-slate-500">
                              ...
                            </span>
                          );
                        }
                      }

                      for (let i = start; i <= end; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant={i === page ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setPage(i)}
                            className="min-w-[40px] px-3"
                          >
                            {i}
                          </Button>
                        );
                      }

                      // Add last page if not in range
                      if (end < totalPages) {
                        if (end < totalPages - 1) {
                          pages.push(
                            <span key="ellipsis-end" className="px-2 text-slate-500">
                              ...
                            </span>
                          );
                        }
                        pages.push(
                          <Button
                            key={totalPages}
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage(totalPages)}
                            className="min-w-[40px] px-3"
                          >
                            {totalPages}
                          </Button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="px-3"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense">
        <ExpenseForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
      </Modal>


      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Expenses">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Generate a secure shareable link to your recent expenses. The link will expire in 7 days.
          </p>
          {shareUrl && (
            <div className="space-y-3">
              <div className="rounded-lg border border-surface-700 bg-surface-800 p-3">
                <p className="text-xs text-slate-500 mb-2">Shareable Link:</p>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full bg-transparent text-sm text-slate-200 font-mono border-none outline-none"
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="flex-1"
                >
                  Copy Link
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="flex-1"
                >
                  Open Link
                </Button>
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2 border-t border-surface-700">
            <Button
              variant="secondary"
              onClick={handleRevokeShare}
              className="flex-1 text-rose-400 hover:text-rose-300"
            >
              Revoke Link
            </Button>
            <Button onClick={() => setShowShareModal(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
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
    </div >
  );
};

export default ExpensesPage;
