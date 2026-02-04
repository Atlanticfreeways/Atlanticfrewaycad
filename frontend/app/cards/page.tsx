"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import {
    CreditCard,
    Plus,
    Loader2,
    Lock,
    Unlock,
    Eye,
    ShieldCheck,
    Zap,
    MoreHorizontal,
    ArrowUpRight,
    Settings2,
    EyeOff
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CardsPage() {
    const { data, loading, error } = useDashboardData();
    const [isCreating, setIsCreating] = useState(false);

    if (loading) {
        return (
            <DashboardShell>
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Accessing Vault...</p>
                </div>
            </DashboardShell>
        )
    }

    const cards = data?.cards || [
        { id: '1', name: 'Primary Corporate', last_four: '4242', status: 'active', type: 'CORPORATE', limit: 5000 },
        { id: '2', name: 'AWS Infrastructure', last_four: '1092', status: 'inactive', type: 'VIRTUAL', limit: 10000 },
    ];

    return (
        <DashboardShell>
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight text-glow">Card Management</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Control your enterprise spending rails</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="group flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 font-bold"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Issue Corporate Card</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {cards.map((card: any, idx: number) => (
                        <CardItem key={card.id} card={card} index={idx} />
                    ))}

                    {/* Add Card Placeholder */}
                    <button
                        onClick={() => setIsCreating(true)}
                        className="h-full min-h-[220px] rounded-[2.5rem] border-2 border-dashed border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center space-y-4 group"
                    >
                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                            <Plus className="w-6 h-6 text-slate-500 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 group-hover:text-blue-500 uppercase tracking-widest">Issue New Rail</span>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold text-white tracking-tight">Security & Compliance</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <SecuritySetting title="PCI-DSS v4.0" status="Certified" desc="Hardware-level PAN encryption enabled." />
                        <SecuritySetting title="Real-time MCC" status="Active" desc="Spending categories restricted by policy." />
                        <SecuritySetting title="Fraud Shield" status="Active" desc="ML-based transaction scoring enabled." />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isCreating && <CreateCardModal onClose={() => setIsCreating(false)} />}
            </AnimatePresence>
        </DashboardShell>
    );
}

function CardItem({ card, index }: { card: any, index: number }) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isFrozen, setIsFrozen] = useState(card.status === 'inactive');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden group hover:shadow-[0_0_50px_rgba(37,99,235,0.1)] transition-all duration-700"
        >
            {/* Geometric Background Detail */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/5 blur-[60px] rounded-full group-hover:bg-blue-600/10 transition-colors" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Enterprise Platinum</span>
                            {isFrozen && <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Frozen</span>}
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight">{card.name}</h3>
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="flex items-center justify-between">
                        <div className="font-mono text-2xl text-slate-100 tracking-[0.2em]">
                            {isRevealed ? "4242 8812 0092 1083" : "•••• •••• •••• " + card.last_four}
                        </div>
                        <button
                            onClick={() => setIsRevealed(!isRevealed)}
                            className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all"
                        >
                            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Card Holder</p>
                            <p className="text-sm font-bold text-slate-300">NORTHERN SYSTEMS INC</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Expires</p>
                            <p className="text-sm font-bold text-slate-300">12/28</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFrozen(!isFrozen)}
                        className={cn(
                            "flex-1 py-4 rounded-2xl font-bold text-sm tracking-tight transition-all flex items-center justify-center space-x-2",
                            isFrozen ? "bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white" : "bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white"
                        )}
                    >
                        {isFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        <span>{isFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
                    </button>
                    <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-sm tracking-tight transition-all flex items-center justify-center space-x-2 border border-white/5">
                        <Settings2 className="w-4 h-4" />
                        <span>Manage Limits</span>
                    </button>
                    <button className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/5">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

function SecuritySetting({ title, status, desc }: any) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-white text-sm">{title}</h4>
                <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{status}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    )
}

function CreateCardModal({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-slate-950 border border-white/10 rounded-[3rem] w-full max-w-lg p-10 relative z-10 shadow-3xl overflow-hidden"
            >
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Issue New Rail</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">Configure your high-speed spending infrastructure</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Allocation Nickname</label>
                        <input className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50" placeholder="e.g. Marketing Q3 Ads" />
                    </div>
                </div>

                <div className="flex gap-4 mt-12">
                    <button onClick={onClose} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-white transition-all">Cancel</button>
                    <button className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-white transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center space-x-2">
                        <span>Initiate Issuance</span>
                        <Zap className="w-4 h-4 fill-current" />
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
