'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Download, Calendar, TrendingUp, DollarSign, CreditCard, PieChart } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
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
            <div className="p-4 md:p-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Reports & Analytics</h1>
                        <p className="text-slate-400 mt-1 text-sm md:text-base">Visualize your spending patterns and transaction history</p>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                        <Button onClick={() => handleExport('csv')} variant="secondary" className="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm">
                            <Download className="w-4 h-4" />
                            CSV
                        </Button>
                        <Button onClick={() => handleExport('pdf')} variant="secondary" className="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm">
                            <Download className="w-4 h-4" />
                            PDF
                        </Button>
                    </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex overflow-x-auto pb-4 mb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide gap-2 md:gap-3">
                    {['7d', '30d', '90d', '1y'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${timeRange === range
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                                }`}
                        >
                            {range === '7d' && '7 Days'}
                            {range === '30d' && '30 Days'}
                            {range === '90d' && '90 Days'}
                            {range === '1y' && '1 Year'}
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
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
                            {[
                                { label: 'Total Spending', val: `$${reportData.summary.total_spending.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'from-blue-600 to-blue-700' },
                                { label: 'Transactions', val: reportData.summary.total_transactions.toLocaleString(), icon: CreditCard, color: 'from-purple-600 to-purple-700' },
                                { label: 'Avg TRX', val: `$${reportData.summary.average_transaction.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'from-emerald-600 to-emerald-700' },
                                { label: 'Active Days', val: reportData.summary.active_days, icon: Calendar, color: 'from-amber-600 to-amber-700' }
                            ].map((card, i) => (
                                <div key={i} className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-black/20`}>
                                    <div className="flex items-center justify-between mb-3 opacity-80">
                                        <card.icon className="w-5 h-5 md:w-6 md:h-6" />
                                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                                    </div>
                                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{card.label}</p>
                                    <p className="text-lg md:text-2xl font-black">{card.val}</p>
                                </div>
                            ))}
                        </div>


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Spending Trend */}
                            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-slate-700 shadow-xl shadow-black/40">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-blue-400" />
                                        Spending Trend
                                    </h2>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Daily Volume</span>
                                </div>
                                {reportData.spending_trend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart data={reportData.spending_trend.map(item => ({
                                            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                            amount: item.amount
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                                            <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                                                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}
                                                itemStyle={{ color: '#3b82f6', fontSize: '14px' }}
                                                formatter={(value: number) => [`$${value.toLocaleString()}`, "Spending"]}
                                            />
                                            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#1e293b' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                            <Brush dataKey="date" height={30} stroke="#334155" fill="#1e293b" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[350px] flex items-center justify-center text-slate-500 italic text-sm">
                                        No data available for the selected period
                                    </div>
                                )}
                            </div>

                            {/* Category Breakdown */}
                            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-slate-700 shadow-xl shadow-black/40">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-purple-400" />
                                        Categories
                                    </h2>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Distribution</span>
                                </div>
                                {reportData.category_breakdown.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <RePieChart>
                                            <Pie
                                                data={reportData.category_breakdown.map((cat, idx) => ({
                                                    name: cat.category,
                                                    value: cat.amount,
                                                    color: COLORS[idx % COLORS.length]
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {reportData.category_breakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                                itemStyle={{ fontSize: '12px' }}
                                                formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[350px] flex items-center justify-center text-slate-500 italic text-sm">
                                        No category data available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transaction Volume */}
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-slate-700 shadow-xl shadow-black/40">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-purple-400" />
                                    Transaction Volume
                                </h2>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Frequency</span>
                            </div>
                            {reportData.transaction_volume.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={reportData.transaction_volume.map(item => ({
                                        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                        count: item.count
                                    }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}
                                            labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                                            itemStyle={{ color: '#8b5cf6' }}
                                        />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Count" />
                                        <Brush dataKey="date" height={30} stroke="#334155" fill="#1e293b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[350px] flex items-center justify-center text-slate-500 italic text-sm">
                                    No volume data available
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </DashboardShell>
    );
}
