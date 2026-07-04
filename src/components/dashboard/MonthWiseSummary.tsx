import { useEffect, useState } from 'react';
import { getMonthlyTotals } from '../../api/axios';
import { MonthlyTotal } from '../../types';
import { formatCurrency, formatMonthYear } from '../../utils/helpers';
import { ErrorAlert, PageLoader } from '../ui';

interface MonthWiseSummaryProps {
    year?: number;
    type?: string;
}

const MonthWiseSummary = ({ year, type }: MonthWiseSummaryProps) => {
    const [data, setData] = useState<MonthlyTotal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMonthlyTotals = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const res = await getMonthlyTotals({ year, type });
                setData(res.data.data?.monthlyTotals ?? []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load monthly summary');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMonthlyTotals();
    }, [year, type]);

    if (isLoading) {
        return <PageLoader />;
    }

    if (error) {
        return <ErrorAlert message={error} />;
    }

    const totalExpenses = data.reduce((sum, month) => sum + month.total, 0);
    const totalCount = data.reduce((sum, month) => sum + month.count, 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Month-wise Summary</h3>
                <div className="text-right">
                    <p className="text-sm font-mono text-white">{formatCurrency(totalExpenses)}</p>
                    <p className="text-xs text-slate-500">{totalCount} expenses</p>
                </div>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No expense data available</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.map((month) => (
                        <div
                            key={`${month.year}-${month.month}`}
                            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-surface-700/50 bg-surface-800/20"
                        >
                            <div>
                                <p className="text-sm font-medium text-slate-200">
                                    {formatMonthYear(month.month, month.year)}
                                </p>
                                <p className="text-xs text-slate-500">{month.count} expenses</p>
                            </div>
                            <p className="text-sm font-mono font-semibold text-white">
                                {formatCurrency(month.total)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MonthWiseSummary;
