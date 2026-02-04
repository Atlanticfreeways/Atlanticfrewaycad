"use client";

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const data = [
    { name: 'Jan', spend: 4000, limit: 2400 },
    { name: 'Feb', spend: 3000, limit: 1398 },
    { name: 'Mar', spend: 2000, limit: 9800 },
    { name: 'Apr', spend: 2780, limit: 3908 },
    { name: 'May', spend: 1890, limit: 4800 },
    { name: 'Jun', spend: 2390, limit: 3800 },
    { name: 'Jul', spend: 3490, limit: 4300 },
];

export function SpendingChart() {
    return (
        <div className="h-[400px] w-full glass-card p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Spending Analytics</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time expenditure tracking</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spend</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#475569"
                        fontSize={10}
                        fontWeight="bold"
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#475569"
                        fontSize={10}
                        fontWeight="bold"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="spend"
                        stroke="#2563eb"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorSpend)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
