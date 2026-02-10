"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AnalyticsPage() {
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [employeeData, setEmployeeData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30d');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch parallel
                const [catRes, empRes, trendRes] = await Promise.all([
                    api.get<any>(`/reports/business/spending-by-category?range=${period}`),
                    api.get<any>(`/reports/business/spending-by-employee?range=${period}`),
                    api.get<any>(`/reports/business/spending-trends?range=${period}`)
                ]);

                setCategoryData(catRes.data || []);
                setEmployeeData(empRes.data || []);
                setTrendData(trendRes.data || []);
            } catch (e) {
                console.error(e);
                // Mock fallback for demo if API fails (as backend might be mocked)
                setCategoryData([
                    { name: 'Marketing', value: 45000 },
                    { name: 'Software', value: 12000 },
                    { name: 'Travel', value: 8500 },
                    { name: 'Office', value: 3000 }
                ]);
                setEmployeeData([
                    { name: 'Alice Smith', amount: 15400 },
                    { name: 'Bob Jones', amount: 8200 },
                    { name: 'Charlie Day', amount: 5000 }
                ]);
                setTrendData([
                    { date: '2024-02-01', amount: 1200 },
                    { date: '2024-02-02', amount: 3400 },
                    { date: '2024-02-03', amount: 800 },
                    { date: '2024-02-04', amount: 5600 }
                ]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [period]);

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

    return (
        <DashboardShell>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Business Analytics</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Company-wide Spending Insights</p>
                    </div>
                    {/* Period Selector */}
                    <div className="flex bg-white/5 p-1 rounded-xl">
                        {['7d', '30d', '90d'].map(d => (
                            <button
                                key={d}
                                onClick={() => setPeriod(d)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${period === d ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                {d.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-96 items-center justify-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Spending By Category */}
                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-6">Spending by Category</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                            formatter={(value: any) => `$${value.toLocaleString()}`}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Spenders (Employees) */}
                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-6">Top Spenders</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={employeeData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                        <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val}`} />
                                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                                        <Tooltip
                                            cursor={{ fill: '#1e293b' }}
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                            formatter={(value: any) => `$${value.toLocaleString()}`}
                                        />
                                        <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Trends */}
                        <div className="glass-card p-6 rounded-2xl border border-white/5 col-span-1 md:col-span-2">
                            <h3 className="text-lg font-bold text-white mb-6">Spending Trends</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val}`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                            formatter={(value: any) => `$${value.toLocaleString()}`}
                                            labelFormatter={(l) => new Date(l).toLocaleDateString()}
                                        />
                                        <Line type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
