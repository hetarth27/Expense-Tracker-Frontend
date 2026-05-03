import { EXPENSE_CATEGORIES, ExpenseFilters, ExpenseType } from '../../types';
import { MONTH_OPTIONS, getYearOptions } from '../../utils/helpers';
import { Select } from '../ui/Input';

interface ExpenseFilterBarProps {
    filters: ExpenseFilters;
    categoryFilter: string;
    limit: number;
    onChange: (filters: ExpenseFilters) => void;
    onCategoryChange: (category: string) => void;
    onLimitChange: (limit: number) => void;
}

const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'personal', label: 'Personal' },
    { value: 'household', label: 'Household' },
];

const CATEGORY_OPTIONS = [
    { value: '', label: 'All Categories' },
    ...EXPENSE_CATEGORIES.map((category) => ({ value: category, label: category })),
];

const LIMIT_OPTIONS = [
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
];

const ExpenseFilterBar = ({
    filters,
    categoryFilter,
    limit,
    onChange,
    onCategoryChange,
    onLimitChange,
}: ExpenseFilterBarProps) => {
    const yearOptions = getYearOptions().map((year) => ({ value: year, label: String(year) }));

    return (
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select
                value={filters.month}
                options={MONTH_OPTIONS}
                onChange={(e) => onChange({ ...filters, month: parseInt(e.target.value) })}
                className="w-full"
            />
            <Select
                value={filters.year}
                options={yearOptions}
                onChange={(e) => onChange({ ...filters, year: parseInt(e.target.value) })}
                className="w-full"
            />
            <Select
                value={filters.type}
                options={TYPE_OPTIONS}
                onChange={(e) => onChange({ ...filters, type: e.target.value as ExpenseType | '' })}
                className="w-full"
            />
            <Select
                value={categoryFilter}
                options={CATEGORY_OPTIONS}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full"
            />
            <Select
                value={limit}
                options={LIMIT_OPTIONS}
                onChange={(e) => onLimitChange(parseInt(e.target.value))}
                className="w-full"
            />
        </div>
    );
};

export default ExpenseFilterBar;
