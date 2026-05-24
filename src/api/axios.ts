import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  ApiResponse,
  Budget,
  BudgetFormData,
  DashboardData,
  Expense,
  ExpenseFilters,
  ExpenseFormData,
  MonthlyTotal,
  PaginatedExpenses,
  User,
} from '../types';
import { clearAuthSession, getAuthToken } from '../utils/authSession';

// const BASE_URL = 'https://expense-tracker-backend-yj1t.onrender.com/api';
const BASE_URL = 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ─────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      clearAuthSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const login = (data: { email: string; password: string }) =>
  api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', data);

export const register = (data: { name: string; email: string; password: string }) =>
  api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data);

export const getCurrentUser = () =>
  api.get<ApiResponse<{ user: User }>>('/auth/me');

export const getDashboard = (params: { month: number; year: number; type?: string }) =>
  api.get<ApiResponse<DashboardData>>('/expenses/dashboard', { params });

export const getExpenses = (
  filters: Partial<ExpenseFilters> & { page: number; limit: number; category?: string }
) =>
  api.get<ApiResponse<PaginatedExpenses>>('/expenses', {
    params: filters,
  });

export const createExpense = (data: ExpenseFormData) =>
  api.post<ApiResponse<{ expense: Expense }>>('/expenses', data);

export const updateExpense = (id: string, data: Partial<ExpenseFormData>) =>
  api.put<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`, data);

export const deleteExpense = (id: string) =>
  api.delete<ApiResponse<null>>(`/expenses/${id}`);

export const getBudgets = (params: { month: number; year: number }) =>
  api.get<ApiResponse<{ budgets: Budget[] }>>('/budgets', { params });

export const upsertBudget = (data: BudgetFormData) =>
  api.post<ApiResponse<{ budget: Budget }>>('/budgets', data);

export const deleteBudget = (id: string) =>
  api.delete<ApiResponse<null>>(`/budgets/${id}`);

export const getMonthlyTotals = (params?: { year?: number; type?: string }) =>
  api.get<ApiResponse<{ monthlyTotals: MonthlyTotal[] }>>('/expenses/analytics/monthly', { params });

export const generateShareToken = () =>
  api.post<ApiResponse<{ token: string; expiresAt: string; shareUrl: string }>>('/share/generate');

export const revokeShareToken = () =>
  api.delete<ApiResponse<null>>('/share/revoke');

export const getPublicExpenses = (
  token: string,
  params?: {
    category?: string;
    type?: string;
    month?: number;
    year?: number;
    date?: string;
  }
) =>
  api.get<ApiResponse<{ userName: string; expenses: Expense[]; total?: number; totalAmount?: number }>>(
    `/share/expenses/${token}`,
    { params }
  );

export default api;
