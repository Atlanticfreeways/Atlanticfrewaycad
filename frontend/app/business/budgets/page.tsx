"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { motion } from "framer-motion";
import { Plus, TrendingUp, AlertTriangle, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress"; // Need to ensure this exists or use standard HTML
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<any[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        // Mock Data
        setBudgets([
            { id: 1, name: 'Marketing Q3', spent: 45000, amount: 60000, percent: 75, period: 'quarterly', scope: 'Marketing' },
            { id: 2, name: 'SaaS Software', spent: 12500, amount: 15000, percent: 83, period: 'monthly', scope: 'Technology' },
            { id: 3, name: 'Team Travel', spent: 2200, amount: 10000, percent: 22, period: 'annual', scope: 'Company' },
            { id: 4, name: 'Office Supplies', spent: 1100, amount: 1000, percent: 110, period: 'monthly', scope: 'Ops', alert: true }
        ]);
    }, []);

    return (
        <DashboardShell>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Budget Tracking</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Monitor Team Spend & Burns</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-500 font-bold shadow-lg shadow-blue-600/20 rounded-xl px-6">
                        <Plus className="w-5 h-5 mr-2" /> Create Budget
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard title="Total Budgeted" value="$86,000" icon={PieChart} color="bg-blue-500" />
                    <KPICard title="Total Spent" value="$60,800" sub="70% Utilized" icon={TrendingUp} color="bg-purple-500" />
                    <KPICard title="At Risk" value="1 Budget" sub="Over 100%" icon={AlertTriangle} color="bg-red-500" />
                </div>

                {/* Budget List */}
                <div className="grid grid-cols-1 gap-6">
                    {budgets.map((budget) => (
                        <div key={budget.id} className="glass-card p-6 rounded-2xl border border-white/5 relative group hover:border-blue-500/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-white">{budget.name}</h3>
                                        <span className="text-[10px] uppercase font-black tracking-widest bg-white/5 px-2 py-1 rounded-full text-slate-400">{budget.period}</span>
                                        {budget.alert && (
                                            <span className="text-[10px] uppercase font-black tracking-widest bg-red-500/20 text-red-500 px-2 py-1 rounded-full flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Over Budget
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium mt-1">{budget.scope}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-mono font-bold text-white">${budget.spent.toLocaleString()} <span className="text-slate-500 text-lg">/ ${budget.amount.toLocaleString()}</span></p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-4 bg-slate-900 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(budget.percent, 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={cn(
                                        "h-full rounded-full transition-colors",
                                        budget.percent > 100 ? "bg-red-500" :
                                            budget.percent > 90 ? "bg-amber-500" : "bg-blue-600"
                                    )}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <span>{budget.percent}% Used</span>
                                <span>${(budget.amount - budget.spent).toLocaleString()} Remaining</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <CreateBudgetModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        </DashboardShell>
    );
}

function KPICard({ title, value, sub, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
                <h4 className="text-2xl font-black text-white">{value}</h4>
                {sub && <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}/20`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
    )
}

function CreateBudgetModal({ isOpen, onClose }: any) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Budget">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Budget Created'); onClose(); }}>
                <div className="space-y-2">
                    <Label>Budget Name</Label>
                    <Input placeholder="e.g. Engineering Q1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                        <Label>Period</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annual">Annual</option>
                            <option value="project">One-time Project</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Scope (Team/Category)</Label>
                    <Input placeholder="e.g. Marketing or Travel" />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Enable Budget Tracking</Button>
            </form>
        </Modal>
    )
}
