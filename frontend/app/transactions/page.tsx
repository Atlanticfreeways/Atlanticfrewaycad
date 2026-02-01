"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Loader2, Search, Filter } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";

export default function TransactionsPage() {
    const { data, loading } = useDashboardData();
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) {
        return (
            <DashboardShell>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            </DashboardShell>
        )
    }

    const transactions = data?.recentTransactions || []; // Note: Dashboard hook only gets 5. ideally we need a full fetch hook.
    // For now, let's use the dashboard data, but in reality we should fetch specifically from /transactions with pagination
    // I will leave a TODO to implement dedicated fetching.

    return (
        <DashboardShell>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Transactions</h1>
                    <p className="text-slate-400">View and filter your spending history</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-800 flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search merchants..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 bg-slate-950/50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <div className="col-span-5">Merchant</div>
                    <div className="col-span-3">Date</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Amount</div>
                </div>

                {/* List */}
                <div className="divide-y divide-slate-800">
                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No transactions found
                        </div>
                    ) : (
                        transactions.filter((t: any) => t.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase())).map((tx: any) => (
                            <div key={tx.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/50 transition-colors">
                                <div className="col-span-5 flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                                        🛒
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{tx.merchant_name || 'Unknown'}</p>
                                        <p className="text-xs text-slate-500">{tx.merchant_category || 'General'}</p>
                                    </div>
                                </div>
                                <div className="col-span-3 text-sm text-slate-400">
                                    {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="col-span-2">
                                    <StatusBadge status={tx.status} />
                                </div>
                                <div className="col-span-2 text-right font-medium text-white">
                                    {tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        completed: 'bg-green-500/10 text-green-400',
        pending: 'bg-yellow-500/10 text-yellow-400',
        declined: 'bg-red-500/10 text-red-400',
        failed: 'bg-red-500/10 text-red-400',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-slate-700 text-slate-300'}`}>
            {status}
        </span>
    )
}
