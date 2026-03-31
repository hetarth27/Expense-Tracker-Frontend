import React, { useState } from 'react';
import { Budget, BudgetFormData, CATEGORY_META, EXPENSE_CATEGORIES } from '../../types';
import { MONTH_OPTIONS, clamp, formatCurrency, getYearOptions } from '../../utils/helpers';
import { ConfirmDialog, ErrorAlert } from '../ui';
import Button from '../ui/Button';
import { Input, Select } from '../ui/Input';

// ─── Budget Card ──────────────────────────────────────────
interface BudgetCardProps {
  budget: Budget;
  onDelete: (id: string) => Promise<void>;
}

export const BudgetCard = ({ budget, onDelete }: BudgetCardProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const meta = CATEGORY_META[budget.category];
  const percentage = clamp(budget.percentage ?? 0, 0, 100);
  const exceeded = budget.exceeded ?? false;

  const progressColor = exceeded
    ? 'bg-rose-500'
    : percentage >= 80
      ? 'bg-amber-400'
      : 'bg-brand-400';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(budget._id);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className={`card p-4 space-y-3 ${exceeded ? 'border-rose-500/30' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${meta?.bg || 'bg-surface-700'}`}>
              {meta?.icon || '💰'}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{budget.category}</p>
              <p className="text-xs text-slate-500">
                Limit: {formatCurrency(budget.monthlyLimit)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {exceeded && (
              <span className="badge bg-rose-500/10 text-rose-400">Over budget</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirm(true)}
              className="p-1.5 hover:text-rose-400 text-slate-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Spent: {formatCurrency(budget.spent ?? 0)}</span>
            <span className={exceeded ? 'text-rose-400 font-medium' : ''}>
              {budget.percentage ?? 0}%
            </span>
          </div>
          <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {exceeded
              ? `Over by ${formatCurrency((budget.spent ?? 0) - budget.monthlyLimit)}`
              : `${formatCurrency(budget.remaining ?? 0)} remaining`}
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Remove budget for "${budget.category}"?`}
        isLoading={isDeleting}
      />
    </>
  );
};

// ─── Budget Form ──────────────────────────────────────────
interface BudgetFormProps {
  onSubmit: (data: BudgetFormData) => Promise<void>;
  onCancel: () => void;
  defaultMonth?: number;
  defaultYear?: number;
}

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }));

export const BudgetForm = ({
  onSubmit,
  onCancel,
  defaultMonth,
  defaultYear,
}: BudgetFormProps) => {
  const now = new Date();
  const [form, setForm] = useState<BudgetFormData>({
    category: 'Food & Dining',
    monthlyLimit: '',
    month: defaultMonth ?? now.getMonth() + 1,
    year: defaultYear ?? now.getFullYear(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yearOptions = getYearOptions().map((y) => ({ value: y, label: String(y) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.monthlyLimit || Number(form.monthlyLimit) <= 0) {
      setError('Enter a valid budget limit');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ...form, monthlyLimit: Number(form.monthlyLimit) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = <K extends keyof BudgetFormData>(key: K, value: BudgetFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorAlert message={error} />}

      <Select
        label="Category"
        value={form.category}
        options={CATEGORY_OPTIONS}
        onChange={(e) => set('category', e.target.value as BudgetFormData['category'])}
      />

      <Input
        label="Monthly Limit (₹)"
        type="number"
        min="1"
        placeholder="5000"
        value={form.monthlyLimit}
        onChange={(e) =>
          set('monthlyLimit', e.target.value === '' ? '' : parseFloat(e.target.value))
        }
        leftAddon={<span className="text-sm">₹</span>}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Month"
          value={form.month}
          options={MONTH_OPTIONS}
          onChange={(e) => set('month', parseInt(e.target.value))}
        />
        <Select
          label="Year"
          value={form.year}
          options={yearOptions}
          onChange={(e) => set('year', parseInt(e.target.value))}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          Set Budget
        </Button>
      </div>
    </form>
  );
};
