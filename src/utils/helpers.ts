import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns';

// ─── Currency ─────────────────────────────────────────────
export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
};

// ─── Dates ────────────────────────────────────────────────
export const formatDate = (date: string | Date): string =>
  format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM yyyy');

export const formatDateShort = (date: string | Date): string =>
  format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM');

export const formatMonthYear = (month: number, year: number): string =>
  format(new Date(year, month - 1, 1), 'MMMM yyyy');

export const getMonthName = (month: number): string =>
  format(new Date(2024, month - 1, 1), 'MMM');

export const getCurrentMonthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

export const getMonthRange = (month: number, year: number) => ({
  start: startOfMonth(new Date(year, month - 1, 1)),
  end: endOfMonth(new Date(year, month - 1, 1)),
});

// ─── Numbers ──────────────────────────────────────────────
export const formatPercentage = (value: number, decimals = 1): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

// ─── Strings ──────────────────────────────────────────────
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const truncate = (str: string, length: number): string =>
  str.length > length ? `${str.substring(0, length)}...` : str;

// ─── Arrays ───────────────────────────────────────────────
export const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> =>
  arr.reduce(
    (acc, item) => {
      const group = String(item[key]);
      return { ...acc, [group]: [...(acc[group] || []), item] };
    },
    {} as Record<string, T[]>
  );

// ─── Year options ─────────────────────────────────────────
export const getYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
};

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: format(new Date(2024, i, 1), 'MMMM'),
}));
