"use client";

import React from 'react';
import {
    Coffee,
    Plane,
    ShoppingBag,
    Wifi,
    CreditCard,
    ArrowUpRight,
    Search,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const transactions = [
    {
        id: 1,
        merchant: 'Starbucks',
        category: 'Food & Drink',
        amount: '-$14.50',
        status: 'completed',
        time: '2 mins ago',
        icon: Coffee,
        iconColor: 'text-orange-500 bg-orange-500/10',
    },
    {
        id: 2,
        merchant: 'Uber Business',
        category: 'Travel',
        amount: '-$24.00',
        status: 'completed',
        time: '2 hours ago',
        icon: Plane,
        iconColor: 'text-blue-500 bg-blue-500/10',
    },
    {
        id: 3,
        merchant: 'Apple Store',
        category: 'Electronics',
        amount: '-$1,299.00',
        status: 'pending',
        time: '5 hours ago',
        icon: ShoppingBag,
        iconColor: 'text-purple-500 bg-purple-500/10',
    },
    {
        id: 4,
        merchant: 'AWS Services',
        category: 'Infrastructure',
        amount: '-$2,450.00',
        status: 'completed',
        time: 'Yesterday',
        icon: Wifi,
        iconColor: 'text-cyan-500 bg-cyan-500/10',
    }
];

import { DisputeModal } from '@/components/modals/DisputeModal';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export function RecentTransactions() {
    const [disputeTx, setDisputeTx] = useState<any>(null);

    const handleDisputeClick = (e: React.MouseEvent, tx: any) => {
        e.stopPropagation();
        setDisputeTx({
            id: tx.id,
            merchant_name: tx.merchant,
            amount: parseFloat(tx.amount.replace(/[^0-9.-]+/g, "")),
            created_at: new Date().toISOString()
        });
    };

    return (
        <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl transition-all duration-500">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Recent Transactions</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Real-time ledger entries</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"><Search className="w-4 h-4" /></button>
                    <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"><Filter className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="divide-y divide-white/5">
                {transactions.map((transaction, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={transaction.id}
                        className="p-6 hover:bg-white/[0.02] transition-all flex items-center justify-between group cursor-pointer relative"
                    >
                        <div className="flex items-center space-x-5">
                            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500', transaction.iconColor)}>
                                <transaction.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">{transaction.merchant}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{transaction.category}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{transaction.time}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                            <div>
                                <p className="text-xl font-black text-white tracking-tighter">{transaction.amount}</p>
                                <div className="flex items-center justify-end space-x-2 mt-1">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        transaction.status === 'completed' ? 'text-green-500' :
                                            transaction.status === 'pending' ? 'text-amber-500' : 'text-slate-500'
                                    )}>
                                        {transaction.status}
                                    </span>
                                    <ArrowUpRight className="w-3 h-3 text-slate-700 group-hover:text-blue-400 transition-colors" />
                                </div>
                            </div>

                            {/* Dispute Action */}
                            <button
                                onClick={(e) => handleDisputeClick(e, transaction)}
                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-full text-slate-500 hover:text-red-500 transition-all"
                                title="File Dispute"
                            >
                                <AlertCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-6 bg-slate-900/20 text-center">
                <button className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-all">View Full Workspace Ledger</button>
            </div>

            {disputeTx && (
                <DisputeModal
                    isOpen={!!disputeTx}
                    onClose={() => setDisputeTx(null)}
                    transaction={disputeTx}
                />
            )}
        </div>
    );
}
