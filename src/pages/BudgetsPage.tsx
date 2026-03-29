import { useState } from 'react';
import { BudgetCard, BudgetForm } from '../components/budget/BudgetCard';
import { EmptyState, ErrorAlert, Modal, PageLoader } from '../components/ui';
import Button from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import { useBudgets } from '../hooks/useBudgets';
import { BudgetFormData } from '../types';
import { MONTH_OPTIONS, formatMonthYear, getCurrentMonthYear, getYearOptions } from '../utils/helpers';

const BudgetsPage = () => {
  const now = getCurrentMonthYear();
  const toast = useToast();

  const [month, setMonth] = useState(now.month);
  const [year, setYear] = useState(now.year);
  const [showForm, setShowForm] = useState(false);

  const { budgets, isLoading, error, upsertBudget, deleteBudget } = useBudgets({ month, year });

  const yearOptions = getYearOptions().map((y) => ({ value: y, label: String(y) }));

  const exceededCount = budgets.filter((b) => b.exceeded).length;
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent ?? 0), 0);

  const handleSubmit = async (data: BudgetFormData) => {
    await upsertBudget(data);
    setShowForm(false);
    toast.success('Budget saved');
  };

  const handleDelete = async (id: string) => {
    await deleteBudget(id);
    toast.success('Budget removed');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="text-sm text-slate-500 mt-0.5">{formatMonthYear(month, year)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-36">
            <Select
              value={month}
              options={MONTH_OPTIONS}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            />
          </div>
          <div className="w-28">
            <Select
              value={year}
              options={yearOptions}
              onChange={(e) => setYear(parseInt(e.target.value))}
            />
          </div>
          <Button onClick={() => setShowForm(true)}>+ Set Budget</Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Budgets Set</p>
            <p className="font-display text-2xl font-bold text-white">{budgets.length}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Total Spent</p>
            <p className="font-display text-2xl font-bold text-white">
              ₹{totalSpent.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500">of ₹{totalBudgeted.toLocaleString('en-IN')}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Over Budget</p>
            <p
              className={`font-display text-2xl font-bold ${exceededCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
            >
              {exceededCount}
            </p>
            <p className="text-xs text-slate-500">
              {exceededCount > 0 ? 'categories exceeded' : 'all within budget'}
            </p>
          </div>
        </div>
      )}

      {/* Budget grid */}
      {isLoading ? (
        <PageLoader />
      ) : budgets.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            icon="🎯"
            title="No budgets set"
            description="Set monthly spending limits per category to stay on track"
            action={
              <Button onClick={() => setShowForm(true)}>Set Your First Budget</Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <BudgetCard key={budget._id} budget={budget} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Form modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Set Monthly Budget">
        <BudgetForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          defaultMonth={month}
          defaultYear={year}
        />
      </Modal>
    </div>
  );
};

export default BudgetsPage;
