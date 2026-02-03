'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Download, Calendar, TrendingUp, DollarSign, CreditCard, PieChart } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from '@/lib/toast';

interface ReportData {
    summary: {
        total_spending: number;
        total_transactions: number;
        average_transaction: number;
        active_days: number;
    };
    spending_trend: Array<{ date: string; amount: number }>;
    category_breakdown: Array<{ category: string; amount: number; percentage: number; count: number }>;
    transaction_volume: Array<{ date: string; count: number }>;
    top_merchants: Array<{ merchant: string; amount: number; count: number }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

export default function ReportsPage() {
    const [timeRange, setTimeRange] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    useEffect(() => {
        fetchReportData();
    }, [timeRange]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/reports/spending?range=${timeRange}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setReportData(data.data);
            } else {
                toast.error('Failed to load report data');
            }
        } catch (error) {
            console.error('Failed to fetch report data:', error);
            toast.error('Failed to load report data', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (format: 'csv' | 'pdf') => {
        toast.info(`Exporting report as ${format.toUpperCase()}...`);
        // Export functionality can be implemented later
    };

    return (
        <DashboardShell>
            <div className="p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
                        <p className="text-slate-400 mt-2">Visualize your spending patterns and transaction history</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => handleExport('csv')} variant="secondary" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                        <Button onClick={() => handleExport('pdf')} variant="secondary" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex gap-3 mb-6">
                    {['7d', '30d', '90d', '1y'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${timeRange === range
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            {range === '7d' && 'Last 7 Days'}
                            {range === '30d' && 'Last 30 Days'}
                            {range === '90d' && 'Last 90 Days'}
                            {range === '1y' && 'Last Year'}
                        </button>
                    ))}
                </div>

                {/* Summary Cards */}
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading report data...</div>
                ) : !reportData ? (
                    <div className="text-center py-12 text-slate-400">No data available</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <DollarSign className="w-6 h-6" />
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <p className="text-sm text-blue-100">Total Spending</p>
                                <p className="text-2xl font-bold">${reportData.summary.total_spending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <p className="text-sm text-purple-100">Transactions</p>
                                <p className="text-2xl font-bold">{reportData.summary.total_transactions.toLocaleString()}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <p className="text-sm text-green-100">Avg Transaction</p>
                                <p className="text-2xl font-bold">${reportData.summary.average_transaction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <p className="text-sm text-orange-100">Active Days</p>
                                <p className="text-2xl font-bold">{reportData.summary.active_days}</p>
                            </div>
                        </div>


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Spending Trend */}
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                <h2 className="text-xl font-semibold text-white mb-4">Spending Trend</h2>
                                {reportData.spending_trend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={reportData.spending_trend.map(item => ({
                                            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                            amount: item.amount
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="date" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                labelStyle={{ color: '#e2e8f0' }}
                                                formatter={(value: number) => `$${value.toFixed(2)}`}
                                            />
                                            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Spending" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center text-slate-400">
                                        No spending data for this period
                                    </div>
                                )}
                            </div>

                            {/* Category Breakdown */}
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                <h2 className="text-xl font-semibold text-white mb-4">Spending by Category</h2>
                                {reportData.category_breakdown.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RePieChart>
                                            <Pie
                                                data={reportData.category_breakdown.map((cat, idx) => ({
                                                    name: cat.category,
                                                    value: cat.amount,
                                                    color: COLORS[idx % COLORS.length]
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {reportData.category_breakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                formatter={(value: number) => `$${value.toFixed(2)}`}
                                            />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center text-slate-400">
                                        No category data for this period
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transaction Volume */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h2 className="text-xl font-semibold text-white mb-4">Transaction Volume</h2>
                            {reportData.transaction_volume.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={reportData.transaction_volume.map(item => ({
                                        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                        count: item.count
                                    }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="date" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                            labelStyle={{ color: '#e2e8f0' }}
                                        />
                                        <Bar dataKey="count" fill="#8b5cf6" name="Transactions" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-slate-400">
                                    No transaction data for this period
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </DashboardShell>
    );
}
