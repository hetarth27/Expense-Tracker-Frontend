import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicExpenses } from '../api/axios';
import ExpenseTable from '../components/expenses/ExpenseTable';
import { ErrorAlert, PageLoader } from '../components/ui';
import { Expense } from '../types';
import { formatCurrency } from '../utils/helpers';

const PublicExpensesPage = () => {
    const { token } = useParams<{ token: string }>();
    const [userName, setUserName] = useState<string>('');
    const [expenses, setExpenses] = useState<Expense[]>([]);
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
                const res = await getPublicExpenses(token);
                const data = res.data.data;
                setUserName(data?.userName ?? '');
                setExpenses(data?.expenses ?? []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load expenses');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicExpenses();
    }, [token]);

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

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
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-white">
                        {userName ? `${userName}'s Expenses` : 'Shared Expenses'}
                    </h1>
                    <p className="text-slate-400">
                        Total: {formatCurrency(totalAmount)} • {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Expenses Table */}
                <div className="card p-6">
                    <ExpenseTable
                        expenses={expenses}
                    />
                </div>
            </div>
        </div>
    );
};

export default PublicExpensesPage;