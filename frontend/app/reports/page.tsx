'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Download, Calendar, TrendingUp, DollarSign, CreditCard, PieChart } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
    const [timeRange, setTimeRange] = useState('30d');
    const [loading, setLoading] = useState(true);

    // Mock data - replace with real API calls
    const spendingByCategory = [
        { name: 'Dining', value: 2400, color: '#3b82f6' },
        { name: 'Travel', value: 1800, color: '#8b5cf6' },
        { name: 'Shopping', value: 1200, color: '#ec4899' },
        { name: 'Utilities', value: 800, color: '#10b981' },
        { name: 'Other', value: 600, color: '#6b7280' },
    ];

    const monthlyTrends = [
        { month: 'Jan', spending: 4000, transactions: 45 },
        { month: 'Feb', spending: 3000, transactions: 38 },
        { month: 'Mar', spending: 5000, transactions: 52 },
        { month: 'Apr', spending: 2780, transactions: 41 },
        { month: 'May', spending: 4890, transactions: 49 },
        { month: 'Jun', spending: 6390, transactions: 61 },
    ];

    useEffect(() => {
        setTimeout(() => setLoading(false), 1000);
    }, []);

    const handleExport = (format: 'csv' | 'pdf') => {
        alert(`Exporting report as ${format.toUpperCase()}...`);
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="w-6 h-6" />
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-sm text-blue-100">Total Spending</p>
                        <p className="text-2xl font-bold">$7,800</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-purple-100">Transactions</p>
                        <p className="text-2xl font-bold">286</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-green-100">Avg Transaction</p>
                        <p className="text-2xl font-bold">$27.27</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-orange-100">Active Days</p>
                        <p className="text-2xl font-bold">24/30</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Monthly Trends */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                        <h2 className="text-xl font-semibold text-white mb-4">Spending Trend</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="spending" stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                        <h2 className="text-xl font-semibold text-white mb-4">Spending by Category</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <RePieChart>
                                <Pie
                                    data={spendingByCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {spendingByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Transaction Volume */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-4">Transaction Volume</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend />
                            <Bar dataKey="transactions" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DashboardShell>
    );
}
