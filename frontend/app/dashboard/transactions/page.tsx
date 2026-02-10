"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DashboardShell } from '@/components/layout/DashboardShell';
import {
    Download,
    Search,
    DollarSign,
    Filter,
    ArrowUpRight,
    Calendar,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Transaction {
    id: string;
    merchant_name: string;
    amount: number;
    currency: string;
    status: 'approved' | 'declined' | 'pending' | 'completed' | 'failed';
    mcc_description: string;
    created_at: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get<any>('/transactions');
            if (res.success && res.history) {
                // Map backend response to frontend interface if needed
                setTransactions(res.history);
            } else if (res.transactions) {
                setTransactions(res.transactions);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <DashboardShell>
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight text-glow">Transaction Ledger</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Audit-ready enterprise transaction stream</p>
                    </div>
                    <button className="flex items-center space-x-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl transition-all hover:bg-white/10 active:scale-95 font-bold">
                        <Download className="w-5 h-5" />
                        <span>Export Financial Report</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by merchant or trace ID..."
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600/50 font-bold">
                            <option>Last 30 Days</option>
                            <option>Last 90 Days</option>
                            <option>This Quarter</option>
                        </select>
                    </div>
                    <button className="bg-slate-900 border border-white/5 rounded-2xl py-4 flex items-center justify-center space-x-2 text-slate-400 hover:text-white transition-all font-bold text-sm">
                        <Filter className="w-4 h-4" />
                        <span>Advanced Filters</span>
                    </button>
                </div>

                {/* Ledger Table */}
                <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Merchant</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Classification</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Settlement</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.map((tx, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={tx.id}
                                        className="hover:bg-white/[0.02] transition-all group cursor-pointer"
                                    >
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-slate-300">{new Date(tx.created_at).toLocaleDateString()}</p>
                                            <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-widest">{new Date(tx.created_at).toLocaleTimeString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <DollarSign className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-white tracking-tight">{tx.merchant_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-400/5 px-2 py-1 rounded-md">{tx.mcc_description}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                tx.status === 'completed' ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'
                                            )}>
                                                <span>{tx.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <span className="text-lg font-black text-white tracking-tighter">${tx.amount.toFixed(2)}</span>
                                                <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-8 border-t border-white/5 bg-slate-900/40 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Vault Ledger 1.0.4</p>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></button>
                            <div className="flex items-center space-x-2">
                                {[1, 2, 3].map(p => (
                                    <button key={p} className={cn("w-8 h-8 rounded-lg text-[10px] font-black transition-all", p === 1 ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white")}>{p}</button>
                                ))}
                            </div>
                            <button className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
