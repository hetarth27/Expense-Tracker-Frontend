import { useState, useEffect, useCallback } from 'react';
import { expenseApi } from '../api/services';
import { DashboardData } from '../types';

interface UseDashboardParams {
  month?: number;
  year?: number;
  type?: string;
}

export const useDashboard = (params: UseDashboardParams = {}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await expenseApi.getDashboard(params);
      setData(res.data.data!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [params.month, params.year, params.type]); // eslint-disable-line

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refetch: fetchDashboard };
};
