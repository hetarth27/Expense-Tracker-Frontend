import { useState, useEffect, useCallback } from 'react';
import { budgetApi } from '../api/services';
import { Budget, BudgetFormData } from '../types';

export const useBudgets = (params: { month?: number; year?: number } = {}) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await budgetApi.getAll(params);
      setBudgets(res.data.data!.budgets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets');
    } finally {
      setIsLoading(false);
    }
  }, [params.month, params.year]); // eslint-disable-line

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const upsertBudget = async (data: BudgetFormData): Promise<Budget> => {
    const res = await budgetApi.upsert(data);
    await fetchBudgets();
    return res.data.data!.budget;
  };

  const deleteBudget = async (id: string): Promise<void> => {
    await budgetApi.delete(id);
    await fetchBudgets();
  };

  return { budgets, isLoading, error, refetch: fetchBudgets, upsertBudget, deleteBudget };
};
