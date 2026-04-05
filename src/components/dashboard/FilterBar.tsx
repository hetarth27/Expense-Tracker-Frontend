import { ExpenseFilters, ExpenseType } from '../../types';
import { MONTH_OPTIONS, getYearOptions } from '../../utils/helpers';
import { Select } from '../ui/Input';

interface FilterBarProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
}

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'personal', label: 'Personal' },
  { value: 'household', label: 'Household' },
];

const FilterBar = ({ filters, onChange }: FilterBarProps) => {
  const yearOptions = getYearOptions().map((y) => ({ value: y, label: String(y) }));

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 lg:w-auto">
      <div className="w-full sm:w-36">
        <Select
          value={filters.month}
          options={MONTH_OPTIONS}
          onChange={(e) => onChange({ ...filters, month: parseInt(e.target.value) })}
        />
      </div>
      <div className="w-full sm:w-28">
        <Select
          value={filters.year}
          options={yearOptions}
          onChange={(e) => onChange({ ...filters, year: parseInt(e.target.value) })}
        />
      </div>
      <div className="w-full sm:w-36">
        <Select
          value={filters.type}
          options={TYPE_OPTIONS}
          onChange={(e) => onChange({ ...filters, type: e.target.value as ExpenseType | '' })}
        />
      </div>
    </div>
  );
};

export default FilterBar;
