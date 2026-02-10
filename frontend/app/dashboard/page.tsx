import { Overview } from "@/components/dashboard/Overview";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Zap, ArrowRight, Sparkles } from "lucide-react";

export default function DashboardPage() {
    return (
        <DashboardShell>
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-blue-600/5 border border-blue-500/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white text-glow">Performance Overview</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time enterprise intelligence • <span className="text-blue-500 font-black">Sandbox Mode Active</span></p>
                    </div>
                    <button className="relative z-10 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-3">
                        Go Live Now <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <Overview />

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <SpendingChart />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="glass-card p-8 rounded-[2rem] border border-blue-500/20 bg-blue-500/5 h-full flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />

                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-xl font-bold mb-3 tracking-tight text-white">AI Insights</h4>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                                Your spending on &quot;Cloud Infrastructure&quot; is up <span className="text-blue-400 font-bold">12%</span> this month. We recommend reviewing your reserved instances.
                            </p>
                            <button className="text-sm font-bold text-blue-500 hover:text-white flex items-center space-x-2 transition-all">
                                <span>View Recommendations</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight text-white text-glow">Execution Log</h2>
                    <RecentTransactions />
                </div>
            </div>
        </DashboardShell>
    );
}
