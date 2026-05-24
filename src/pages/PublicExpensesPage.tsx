import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useParams } from 'react-router-dom';
import { getPublicExpenses } from '../api/axios';
import ExpenseTable from '../components/expenses/ExpenseTable';
import { ErrorAlert, PageLoader } from '../components/ui';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import ThemeToggle from '../components/ui/ThemeToggle';
import { EXPENSE_CATEGORIES, Expense, ExpenseType } from '../types';
import {
    formatCurrency,
    formatDate,
    formatMonthYear,
    getCurrentMonthYear,
    getYearOptions,
    MONTH_OPTIONS,
} from '../utils/helpers';

type PeriodFilter = 'all' | 'month' | 'date';

const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'personal', label: 'Personal' },
    { value: 'household', label: 'Household' },
];

const CATEGORY_OPTIONS = [
    { value: '', label: 'All Categories' },
    ...EXPENSE_CATEGORIES.map((category) => ({ value: category, label: category })),
];

const PERIOD_OPTIONS = [
    { value: 'all', label: 'All Dates' },
    { value: 'month', label: 'Month Wise' },
    { value: 'date', label: 'Date Wise' },
];

const getTodayInputValue = () => {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
};

const buildFileName = (userName: string) => {
    const owner = userName.trim() || 'shared';
    const safeOwner = owner.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${safeOwner || 'shared'}-expenses.pdf`;
};

const formatPdfAmount = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);

const PublicExpensesPage = () => {
    const { token } = useParams<{ token: string }>();
    const now = getCurrentMonthYear();
    const todayInputValue = getTodayInputValue();
    const [userName, setUserName] = useState<string>('');
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState<ExpenseType | ''>('');
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
    const [month, setMonth] = useState(now.month);
    const [year, setYear] = useState(now.year);
    const [date, setDate] = useState(todayInputValue);
    const [total, setTotal] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicExpenses = async () => {
            if (!token) {
                setError('Invalid share link');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const res = await getPublicExpenses(token, {
                    category: categoryFilter || undefined,
                    type: typeFilter || undefined,
                    month: periodFilter === 'month' ? month : undefined,
                    year: periodFilter === 'month' ? year : undefined,
                    date: periodFilter === 'date' && date ? date : undefined,
                });
                const data = res.data.data;
                const nextExpenses = data?.expenses ?? [];

                setUserName(data?.userName ?? '');
                setExpenses(nextExpenses);
                setTotal(data?.total ?? nextExpenses.length);
                setTotalAmount(
                    data?.totalAmount ?? nextExpenses.reduce((sum, expense) => sum + expense.amount, 0)
                );
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load expenses');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicExpenses();
    }, [token, categoryFilter, typeFilter, periodFilter, month, year, date]);

    const yearOptions = getYearOptions().map((yearOption) => ({
        value: yearOption,
        label: String(yearOption),
    }));

    const hasActiveFilters = categoryFilter || typeFilter || periodFilter !== 'all';

    const clearFilters = () => {
        setCategoryFilter('');
        setTypeFilter('');
        setPeriodFilter('all');
        setMonth(now.month);
        setYear(now.year);
        setDate(todayInputValue);
    };

    const getPeriodLabel = () => {
        if (periodFilter === 'month') return formatMonthYear(month, year);
        if (periodFilter === 'date') return date ? formatDate(date) : 'Selected date';
        return 'All dates';
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const title = userName ? `${userName}'s Expenses` : 'Shared Expenses';

        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 210, 48, 'F');

        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.text(title, 14, 18, { maxWidth: 180 });

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(`Generated: ${formatDate(new Date())}`, 14, 28);
        doc.text(`Total: ${formatPdfAmount(totalAmount)}`, 14, 36);
        doc.text(`Records: ${total}`, 78, 36);
        doc.text(`Period: ${getPeriodLabel()}`, 116, 36);
        doc.text(`Category: ${categoryFilter || 'All categories'} | Type: ${typeFilter || 'All types'}`, 14, 44);

        autoTable(doc, {
            startY: 56,
            head: [['Date', 'Category', 'Type', 'Payment', 'Amount', 'Note']],
            body: expenses.map((expense) => [
                formatDate(expense.date),
                expense.category,
                expense.type,
                expense.paymentMethod,
                formatPdfAmount(expense.amount),
                expense.note || '-',
            ]),
            theme: 'striped',
            styles: {
                fontSize: 9,
                cellPadding: 3.2,
                textColor: [51, 65, 85],
                lineColor: [226, 232, 240],
            },
            headStyles: {
                fillColor: [14, 165, 233],
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            columnStyles: {
                0: { cellWidth: 28 },
                1: { cellWidth: 44 },
                2: { cellWidth: 26 },
                3: { cellWidth: 24 },
                4: { halign: 'right' },
                5: { cellWidth: 'auto' },
            },
            margin: { left: 14, right: 14 },
        });

        doc.save(buildFileName(userName));
    };

    if (isLoading) {
        return <PageLoader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <ErrorAlert message={error} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-900">
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
                <div className="card overflow-hidden">
                    <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 space-y-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                    Shared expense report
                                </p>
                                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                    {userName ? `${userName}'s Expenses` : 'Shared Expenses'}
                                </h1>
                            </div>

                            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                                <div className="border-l border-surface-700/50 pl-3">
                                    <p className="text-xs font-medium text-slate-500">Total Amount</p>
                                    <p className="mt-1 font-mono text-lg font-semibold text-white">
                                        {formatCurrency(totalAmount)}
                                    </p>
                                </div>
                                <div className="border-l border-surface-700/50 pl-3">
                                    <p className="text-xs font-medium text-slate-500">Records</p>
                                    <p className="mt-1 font-mono text-lg font-semibold text-white">{total}</p>
                                </div>
                                <div className="border-l border-surface-700/50 pl-3">
                                    <p className="text-xs font-medium text-slate-500">Period</p>
                                    <p className="mt-1 truncate text-sm font-semibold text-white">
                                        {getPeriodLabel()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:items-center">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleDownloadPdf}
                                disabled={expenses.length === 0}
                                className="w-full sm:w-auto"
                            >
                                Download PDF
                            </Button>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-4 sm:p-6">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Filters</h2>
                                <p className="text-sm text-slate-500">
                                    Refine the shared report before downloading or reviewing.
                                </p>
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="w-full sm:w-auto"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>

                        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <Select
                                label="Category"
                                value={categoryFilter}
                                options={CATEGORY_OPTIONS}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full"
                            />
                            <Select
                                label="Type"
                                value={typeFilter}
                                options={TYPE_OPTIONS}
                                onChange={(e) => setTypeFilter(e.target.value as ExpenseType | '')}
                                className="w-full"
                            />
                            <Select
                                label="Date Filter"
                                value={periodFilter}
                                options={PERIOD_OPTIONS}
                                onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                                className="w-full"
                            />
                            {periodFilter === 'month' && (
                                <>
                                    <Select
                                        label="Month"
                                        value={month}
                                        options={MONTH_OPTIONS}
                                        onChange={(e) => setMonth(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <Select
                                        label="Year"
                                        value={year}
                                        options={yearOptions}
                                        onChange={(e) => setYear(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </>
                            )}
                            {periodFilter === 'date' && (
                                <Input
                                    label="Date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="card p-4 sm:p-6">
                    <ExpenseTable expenses={expenses} />
                </div>
            </div>
        </div>
    );
};

export default PublicExpensesPage;
