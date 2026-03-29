import api from './axios';
import {
  ApiResponse,
  User,
  Expense,
  ExpenseFormData,
  PaginatedExpenses,
  DashboardData,
  CategoryTotal,
  MonthlyTotal,
  Budget,
  BudgetFormData,
  ExpenseFilters,
} from '../types';

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', data),

  getMe: () =>
    api.get<ApiResponse<{ user: User }>>('/auth/me'),
};

// ─── Expenses ─────────────────────────────────────────────
export const expenseApi = {
  getAll: (
    filters: Partial<ExpenseFilters> & { page?: number; limit?: number; category?: string }
  ) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) params.append(k, String(v));
    });
    return api.get<ApiResponse<PaginatedExpenses>>(`/expenses?${params.toString()}`);
  },

  getById: (id: string) =>
    api.get<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`),

  create: (data: ExpenseFormData) =>
    api.post<ApiResponse<{ expense: Expense }>>('/expenses', data),

  update: (id: string, data: Partial<ExpenseFormData>) =>
    api.put<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/expenses/${id}`),

  getDashboard: (params: { month?: number; year?: number; type?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.append(k, String(v));
    });
    return api.get<ApiResponse<DashboardData>>(`/expenses/dashboard?${query.toString()}`);
  },

  getCategoryTotals: (params: { month?: number; year?: number; type?: string }) =>
    api.get<ApiResponse<{ categoryTotals: CategoryTotal[] }>>('/expenses/analytics/categories', {
      params,
    }),

  getMonthlyTotals: (params: { year?: number; type?: string }) =>
    api.get<ApiResponse<{ monthlyTotals: MonthlyTotal[] }>>('/expenses/analytics/monthly', {
      params,
    }),
};

// ─── Budgets ──────────────────────────────────────────────
export const budgetApi = {
  getAll: (params: { month?: number; year?: number }) =>
    api.get<ApiResponse<{ budgets: Budget[] }>>('/budgets', { params }),

  upsert: (data: BudgetFormData) =>
    api.post<ApiResponse<{ budget: Budget }>>('/budgets', data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/budgets/${id}`),
};
