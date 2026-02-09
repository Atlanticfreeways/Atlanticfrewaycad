"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import {
    Users,
    UserPlus,
    Shield,
    MoreVertical,
    Mail,
    CheckCircle2,
    Clock,
    Search,
    Filter
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const teamMembers = [
    { id: 1, name: 'Alex Rivera', email: 'alex@atlantic.com', role: 'Administrator', status: 'active', avatar: 'AR' },
    { id: 2, name: 'Jordan Smith', email: 'jordan@atlantic.com', role: 'Finance Manager', status: 'active', avatar: 'JS' },
    { id: 3, name: 'Casey Wilson', email: 'casey@atlantic.com', role: 'Developer', status: 'pending', avatar: 'CW' },
    { id: 4, name: 'Morgan Lee', email: 'morgan@atlantic.com', role: 'Read Only', status: 'active', avatar: 'ML' },
];

export default function TeamPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <DashboardShell>
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight text-glow">Team Management</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Manage workspace permissions & members</p>
                    </div>
                    <button
                        className="group flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-white/5 active:scale-95 font-bold hover:bg-slate-200"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Invite Member</span>
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatBox label="Total Members" value="12" />
                    <StatBox label="Active Now" value="4" />
                    <StatBox label="Pending invites" value="2" />
                    <StatBox label="Admin seats" value="3/5" />
                </div>

                <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-2 px-4 py-3 bg-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
                                <Filter className="w-4 h-4" />
                                <span>Category</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-3 bg-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
                                <Shield className="w-4 h-4" />
                                <span>Roles</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Member</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Role</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {teamMembers.map((member, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={member.id}
                                        className="hover:bg-white/[0.02] transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xs shadow-lg shadow-blue-600/10">
                                                    {member.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white tracking-tight">{member.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-2">
                                                <Shield className="w-3 h-3 text-blue-500" />
                                                <span className="text-sm font-bold text-slate-300">{member.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                member.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                                            )}>
                                                {member.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                <span>{member.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 bg-slate-900/20 text-center border-t border-white/5">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Showing 4 of 12 workspace members</p>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

function StatBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
        </div>
    )
}
