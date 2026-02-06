"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { motion } from "framer-motion";
import { RefreshCw, CheckCircle, AlertCircle, Link as LinkIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AccountingPage() {
    const [integrations, setIntegrations] = useState([
        { id: 'quickbooks', name: 'QuickBooks Online', status: 'connected', lastSync: '10 mins ago', icon: 'QB' },
        { id: 'xero', name: 'Xero', status: 'disconnected', lastSync: null, icon: 'X' },
        { id: 'netsuite', name: 'Oracle NetSuite', status: 'disconnected', lastSync: null, icon: 'N' }
    ]);
    const [syncing, setSyncing] = useState<string | null>(null);

    const handleConnect = (id: string) => {
        // Mock OAuth Window
        const loadingToast = toast.loading(`Connecting to ${id}...`);
        setTimeout(() => {
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: 'connected', lastSync: 'Just now' } : i));
            toast.dismiss(loadingToast);
            toast.success(`Successfully connected to ${id}`);
        }, 3000); // Simulate API delay
    };

    const handleSync = (id: string) => {
        setSyncing(id);
        // Mock Sync
        setTimeout(() => {
            setSyncing(null);
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, lastSync: 'Just now' } : i));
            toast.success("Transactions synced successfully");
        }, 2000);
    };

    return (
        <DashboardShell>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Accounting Integrations</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Automate Reconciliation & Bookkeeping</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map((integration) => (
                        <div key={integration.id} className="glass-card p-6 rounded-2xl border border-white/5 relative group hover:border-blue-500/30 transition-all flex flex-col justify-between h-[280px]">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-2xl font-black text-slate-900 shadow-lg">
                                        {integration.icon}
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest flex items-center space-x-1",
                                        integration.status === 'connected' ? "bg-green-500/20 text-green-500" : "bg-slate-700 text-slate-400"
                                    )}>
                                        {integration.status === 'connected' ? <CheckCircle className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                                        <span>{integration.status}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{integration.name}</h3>
                                <p className="text-sm text-slate-400">
                                    {integration.status === 'connected'
                                        ? "Transactions connect automatically. Mapping rules active."
                                        : "Connect to sync transactions, receipts, and categories."}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {integration.status === 'connected' ? (
                                    <>
                                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <span>Last Sync</span>
                                            <span className="text-slate-300">{integration.lastSync}</span>
                                        </div>
                                        <Button
                                            onClick={() => handleSync(integration.id)}
                                            disabled={!!syncing}
                                            className="w-full bg-blue-600 hover:bg-blue-500 font-bold shadow-lg shadow-blue-600/20"
                                        >
                                            <RefreshCw className={cn("w-4 h-4 mr-2", syncing === integration.id ? "animate-spin" : "")} />
                                            {syncing === integration.id ? "Syncing..." : "Sync Now"}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => handleConnect(integration.id)}
                                        variant="outline"
                                        className="w-full border-white/10 hover:bg-white/5 text-white font-bold"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Connect
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Audit / Logs Preview */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Sync Activities</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-slate-300 text-sm">Successfully exported 45 transactions to QuickBooks</span>
                                </div>
                                <span className="text-slate-500 text-xs font-mono">2024-02-06 14:30:00</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardShell>
    )
}
