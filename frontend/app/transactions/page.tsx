"use client";

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Download, Search, DollarSign } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ErrorDisplay, EmptyState } from '@/components/ui/error';
import { toast } from '@/lib/toast';

interface Transaction {
    id: string;
    merchant_name: string;
    amount: number;
    currency: string;
    status: 'approved' | 'declined' | 'pending' | 'completed' | 'failed';
    mcc_description: string;
    created_at: string;
    card_id: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<string>('30d');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, statusFilter, dateRange]);

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });

            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (dateRange !== 'all') params.append('range', dateRange);

            const response = await fetch(`/api/v1/transactions?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setTransactions(data.transactions || []);
                setTotalPages(Math.ceil((data.pagination?.total || 0) / itemsPerPage));
            } else {
                setError(data.error || 'Failed to load transactions');
                toast.error('Failed to load transactions');
            }
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            setError('Network error - please check your connection');
            toast.error('Failed to load transactions', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx =>
        searchTerm === '' ||
        tx.merchant_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardShell>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Transaction History</h1>
                        <p className="text-slate-400 mt-2">
                            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
                        </p>
                    </div>
                    <Button variant="secondary" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by merchant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                        <option value="declined">Declined</option>
                        <option value="pending">Pending</option>
                    </select>

                    {/* Date Range */}
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="all">All Time</option>
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <TableSkeleton rows={10} />
                ) : error ? (
                    <ErrorDisplay message={error} onRetry={fetchTransactions} />
                ) : filteredTransactions.length === 0 ? (
                    <EmptyState
                        icon={<DollarSign className="w-12 h-12" />}
                        title="No transactions found"
                        description={searchTerm ? "Try adjusting your search or filters" : "You haven't made any transactions yet"}
                    />
                ) : (
                    <>
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Merchant
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {filteredTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                                    {new Date(transaction.created_at).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white font-medium">
                                                    {transaction.merchant_name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {transaction.mcc_description || 'Other'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-white">
                                                    ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <StatusBadge status={transaction.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardShell>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        approved: 'bg-green-600/20 text-green-400 border-green-600',
        completed: 'bg-green-600/20 text-green-400 border-green-600',
        declined: 'bg-red-600/20 text-red-400 border-red-600',
        failed: 'bg-red-600/20 text-red-400 border-red-600',
        pending: 'bg-yellow-600/20 text-yellow-400 border-yellow-600',
    };

    return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${styles[status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
