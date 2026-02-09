"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import {
    Landmark,
    Zap,
    ArrowRight,
    RefreshCcw,
    ShieldAlert,
    Globe,
    Lock,
    PlayCircle,
    CheckCircle2,
    Database
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function BankingSimPage() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [selectedBank, setSelectedBank] = useState('Central Reserve');

    const runSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => setIsSimulating(false), 2000);
    };

    return (
        <DashboardShell>
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight text-glow">Banking Simulator</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Stress-test your financial infrastructure in sandbox</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Simulation Controls */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8">
                                <Landmark className="w-12 h-12 text-blue-500/10 group-hover:text-blue-500/20 transition-colors" />
                            </div>

                            <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Generate Live Traffic</h2>

                            <div className="grid md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Network Path</label>
                                    <select
                                        className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-bold"
                                        value={selectedBank}
                                        onChange={(e) => setSelectedBank(e.target.value)}
                                    >
                                        <option>Central Reserve (Domestic)</option>
                                        <option>Eurozone Rails</option>
                                        <option>Asia-Pacific Gateway</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Transaction Intensity</label>
                                    <div className="flex items-center space-x-2 bg-slate-900 border border-white/5 rounded-2xl p-2">
                                        {['Low', 'Medium', 'Burst'].map((level) => (
                                            <button
                                                key={level}
                                                className={cn(
                                                    "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    level === 'Medium' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'
                                                )}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={runSimulation}
                                disabled={isSimulating}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-lg tracking-tight transition-all active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50 shadow-2xl shadow-blue-600/30"
                            >
                                {isSimulating ? (
                                    <>
                                        <RefreshCcw className="w-5 h-5 animate-spin" />
                                        <span>Broadcasting Signals...</span>
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="w-6 h-6" />
                                        <span>Initiate Stress Test</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <SimCard
                                icon={ShieldAlert}
                                title="Fraud Scenarios"
                                desc="Simulate stolen cards and high-risk merchants to test fallback logic."
                            />
                            <SimCard
                                icon={Globe}
                                title="Cross-Border Rails"
                                desc="Inject FX volatility and multi-hop settlement latency into your stream."
                            />
                        </div>
                    </div>

                    {/* Status Console */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="glass-card rounded-[2.5rem] border border-white/5 flex flex-col h-full bg-slate-950 overflow-hidden">
                            <div className="p-6 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Console</span>
                                </div>
                                <Database className="w-4 h-4 text-slate-700" />
                            </div>
                            <div className="p-6 font-mono text-[10px] leading-relaxed space-y-3 overflow-y-auto max-h-[500px] text-blue-400">
                                <p className="text-slate-500">[{new Date().toISOString()}] Initializing sandbox_v2_core...</p>
                                <p className="text-green-500/80">[{new Date().toISOString()}] Connection established with {selectedBank}</p>
                                <p className="text-slate-400">[{new Date().toISOString()}] Waiting for signal initiation...</p>
                                {isSimulating && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-3"
                                    >
                                        <p className="text-blue-500">[{new Date().toISOString()}] INBOUND: AUTH_REQUEST (mid_9283)</p>
                                        <p className="text-blue-500">[{new Date().toISOString()}] INBOUND: AUTH_REQUEST (mid_1029)</p>
                                        <p className="text-purple-500">[{new Date().toISOString()}] TRIGGER: LEDGER_UPDATE (entry_8192)</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20">
                            <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                <span>Sandbox Mode</span>
                            </h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                You are currently operating in the global sandbox environment. No real funds are moved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

function SimCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group flex flex-col justify-between h-full">
            <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600/10 transition-all">
                    <Icon className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
            </div>
            <button className="mt-8 text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center space-x-2 hover:text-white transition-colors">
                <span>Configure Scene</span>
                <ArrowRight className="w-3 h-3" />
            </button>
        </div>
    )
}
