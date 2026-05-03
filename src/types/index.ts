// ─── Auth ─────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Expense ──────────────────────────────────────────────
export type ExpenseType = 'personal' | 'household';
export type PaymentMethod = 'cash' | 'UPI' | 'card';

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Medicines',
  'Utilities',
  'Housing',
  'Education',
  'Travel',
  'Groceries',
  'Fruits & Vegetables',
  'Subscriptions',
  'Vehicle Services',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  note?: string;
  date: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  amount: number | '';
  category: ExpenseCategory;
  type: ExpenseType;
  note?: string;
  date: string;
  paymentMethod: PaymentMethod;
}

// ─── Budget ───────────────────────────────────────────────
export interface Budget {
  _id: string;
  userId: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  month: number;
  year: number;
  spent?: number;
  percentage?: number;
  exceeded?: boolean;
  remaining?: number;
}

export interface BudgetFormData {
  category: ExpenseCategory;
  monthlyLimit: number | '';
  month: number;
  year: number;
}

// ─── Dashboard ────────────────────────────────────────────
export interface CategoryTotal {
  category: string;
  total: number;
  count: number;
}

export interface MonthlyTotal {
  year: number;
  month: number;
  total: number;
  count: number;
}

export interface DashboardData {
  currentMonthTotal: number;
  previousMonthTotal: number;
  percentageChange: number;
  highestCategory: CategoryTotal | null;
  categoryBreakdown: CategoryTotal[];
  monthlyTrend: MonthlyTotal[];
  recentExpenses: Expense[];
}

// ─── Filters ──────────────────────────────────────────────
export interface ExpenseFilters {
  month: number;
  year: number;
  type: ExpenseType | '';
}

// ─── API ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedExpenses {
  expenses: Expense[];
  total: number;
  totalAmount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Category Meta ────────────────────────────────────────
export interface CategoryMeta {
  color: string;
  bg: string;
  icon: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  'Food & Dining': { color: 'text-orange-400', bg: 'bg-orange-400/10', icon: '🍽️' },
  'Transportation': { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '🚗' },
  'Shopping': { color: 'text-pink-400', bg: 'bg-pink-400/10', icon: '🛍️' },
  'Entertainment': { color: 'text-purple-400', bg: 'bg-purple-400/10', icon: '🎮' },
  'Medicines': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: '🏥' },
  'Utilities': { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: '⚡' },
  'Housing': { color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: '🏠' },
  'Education': { color: 'text-indigo-400', bg: 'bg-indigo-400/10', icon: '📚' },
  'Travel': { color: 'text-sky-400', bg: 'bg-sky-400/10', icon: '✈️' },
  'Groceries': { color: 'text-lime-400', bg: 'bg-lime-400/10', icon: '🛒' },
  'Subscriptions': { color: 'text-violet-400', bg: 'bg-violet-400/10', icon: '📱' },
  'Fruits & Vegetables': { color: 'text-red-400', bg: 'bg-red-400/10', icon: '🍇' },
  'Vehicle Services': { color: 'text-amber-400', bg: 'bg-amber-400/10', icon: '🔧' },
  'Other': { color: 'text-slate-400', bg: 'bg-slate-400/10', icon: '📌' },
};

export const CHART_COLORS = [
  '#38bdf8', '#818cf8', '#fb923c', '#f472b6',
  '#34d399', '#fbbf24', '#a78bfa', '#22d3ee',
  '#86efac', '#fca5a5', '#c4b5fd', '#6ee7b7',
];
