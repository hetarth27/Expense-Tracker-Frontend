import { useState, useEffect, useCallback } from 'react';
import { expenseApi } from '../api/services';
import { Expense, ExpenseFormData, PaginatedExpenses, ExpenseFilters } from '../types';

interface UseExpensesOptions {
  filters?: Partial<ExpenseFilters> & { category?: string };
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export const useExpenses = ({
  filters = {},
  page = 1,
  limit = 20,
  autoFetch = true,
}: UseExpensesOptions = {}) => {
  const [data, setData] = useState<PaginatedExpenses | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await expenseApi.getAll({ ...filters, page, limit });
      setData(res.data.data!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters), page, limit]); // eslint-disable-line

  useEffect(() => {
    if (autoFetch) fetchExpenses();
  }, [fetchExpenses, autoFetch]);

  const createExpense = async (formData: ExpenseFormData): Promise<Expense> => {
    const res = await expenseApi.create(formData);
    await fetchExpenses();
    return res.data.data!.expense;
  };

  const updateExpense = async (id: string, formData: Partial<ExpenseFormData>): Promise<Expense> => {
    const res = await expenseApi.update(id, formData);
    await fetchExpenses();
    return res.data.data!.expense;
  };

  const deleteExpense = async (id: string): Promise<void> => {
    await expenseApi.delete(id);
    await fetchExpenses();
  };

  return {
    expenses: data?.expenses ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
    refetch: fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};
