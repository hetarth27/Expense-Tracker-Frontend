import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Expense, EXPENSE_CATEGORIES, ExpenseFormData } from '../../types';
import { ErrorAlert } from '../ui';
import Button from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';

interface ExpenseFormProps {
  initialData?: Expense;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
}

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }));
const TYPE_OPTIONS = [
  { value: 'personal', label: 'Personal' },
  { value: 'household', label: 'Household' },
];
const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'card', label: 'Card' },
];

const defaultForm = (): ExpenseFormData => ({
  amount: '',
  category: 'Food & Dining',
  type: 'personal',
  note: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  paymentMethod: 'UPI',
});

const ExpenseForm = ({ initialData, onSubmit, onCancel }: ExpenseFormProps) => {
  const [form, setForm] = useState<ExpenseFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        amount: initialData.amount,
        category: initialData.category,
        type: initialData.type,
        note: initialData.note || '',
        date: format(new Date(initialData.date), 'yyyy-MM-dd'),
        paymentMethod: initialData.paymentMethod,
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {};
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = 'Enter a valid amount';
    if (!form.category) newErrors.category = 'Select a category';
    if (!form.date) newErrors.date = 'Select a date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = <K extends keyof ExpenseFormData>(key: K, value: ExpenseFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && <ErrorAlert message={submitError} />}

      <Input
        label="Amount (Rs)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        value={form.amount}
        onChange={(e) => set('amount', e.target.value === '' ? '' : parseFloat(e.target.value))}
        error={errors.amount}
        leftAddon={<span className="text-sm font-medium">Rs</span>}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label="Category"
          value={form.category}
          options={CATEGORY_OPTIONS}
          onChange={(e) => set('category', e.target.value as ExpenseFormData['category'])}
          error={errors.category}
        />
        <Select
          label="Type"
          value={form.type}
          options={TYPE_OPTIONS}
          onChange={(e) => set('type', e.target.value as ExpenseFormData['type'])}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
          error={errors.date}
          max={format(new Date(), 'yyyy-MM-dd')}
        />
        <Select
          label="Payment Method"
          value={form.paymentMethod}
          options={PAYMENT_OPTIONS}
          onChange={(e) => set('paymentMethod', e.target.value as ExpenseFormData['paymentMethod'])}
        />
      </div>

      <Textarea
        label="Note (optional)"
        placeholder="What was this for?"
        value={form.note}
        onChange={(e) => set('note', e.target.value)}
        rows={2}
      />

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {initialData ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
