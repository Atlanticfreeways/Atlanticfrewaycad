"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Plus, Shield, Filter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ApprovalsPage() {
    const [activeTab, setActiveTab] = useState<'queue' | 'my_requests' | 'rules'>('queue');
    const [requests, setRequests] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    // Fetch data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // In a real app, we'd fetch these parallel
                // const requestsRes = await api.get('/business/approvals/requests');
                // setRequests(requestsRes.history);

                // MOCK DATA FOR DEMO if API fails or is empty
                setRequests([
                    { id: 1, type: 'limit_increase', user: 'Alice Smith', amount: 5000, reason: 'Q3 Ad Campaign', status: 'pending', created_at: new Date().toISOString() },
                    { id: 2, type: 'new_card', user: 'Bob Jones', amount: 0, reason: 'New Hire Equipment', status: 'approved', created_at: new Date(Date.now() - 86400000).toISOString() },
                    { id: 3, type: 'expense', user: 'Alice Smith', amount: 1250.50, reason: 'Team Offsite', status: 'pending', created_at: new Date().toISOString() },
                ]);

                // const rulesRes = await api.get('/business/approvals/rules');
                setRules([
                    { id: 1, name: 'High Value Spend', min_amount: 1000, required_role: 'admin' },
                    { id: 2, name: 'Card Issuance', min_amount: 0, required_role: 'manager' }
                ]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeTab]);

    const handleApprove = async (id: number) => {
        try {
            // await api.post(`/business/approvals/requests/${id}/approve`, {});
            toast.success("Request Approved");
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
        } catch (e) {
            toast.error("Failed to approve");
        }
    };

    const handleReject = async (id: number) => {
        try {
            // await api.post(`/business/approvals/requests/${id}/reject`, {});
            toast.error("Request Rejected");
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
        } catch (e) {
            toast.error("Failed to reject");
        }
    };

    return (
        <DashboardShell>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Approval Center</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Control Spend & Policy</p>
                    </div>
                    <Button onClick={() => setIsRequestModalOpen(true)} className="group bg-blue-600 hover:bg-blue-500 text-white px-6 py-6 rounded-2xl shadow-xl shadow-blue-600/20 font-bold tracking-wide">
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        New Request
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
                    {[
                        { id: 'queue', label: 'Approval Queue', icon: Clock },
                        { id: 'my_requests', label: 'My Requests', icon: AlertCircle },
                        { id: 'rules', label: 'Policy Rules', icon: Shield }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                                activeTab === tab.id ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'queue' && (
                            <QueueTab
                                requests={requests.filter(r => r.status === 'pending')}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        )}
                        {activeTab === 'my_requests' && (
                            <MyRequestsTab requests={requests} />
                        )}
                        {activeTab === 'rules' && (
                            <RulesTab rules={rules} />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <NewRequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
        </DashboardShell>
    );
}

function QueueTab({ requests, onApprove, onReject }: any) {
    if (requests.length === 0) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                <Check className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest">All caught up!</p>
            </motion.div>
        )
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {requests.map((req: any) => (
                <div key={req.id} className="glass-card p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center font-bold text-blue-500 text-lg">
                            {req.user.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-bold text-white text-lg">{req.type === 'new_card' ? 'New Card Request' : 'Limit Increase'}</h3>
                                <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>
                            </div>
                            <p className="text-slate-400 text-sm">
                                <span className="text-slate-200 font-semibold">{req.user}</span> requested
                                <span className="text-white font-bold ml-1">${req.amount.toLocaleString()}</span> • {req.reason}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Button onClick={() => onReject(req.id)} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">Reject</Button>
                        <Button onClick={() => onApprove(req.id)} className="bg-blue-600 hover:bg-blue-500 text-white">Approve</Button>
                    </div>
                </div>
            ))}
        </motion.div>
    );
}

function MyRequestsTab({ requests }: any) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {requests.map((req: any) => (
                <div key={req.id} className="p-6 rounded-2xl border border-white/5 bg-slate-900/50 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-slate-300">{req.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-slate-500">{new Date(req.created_at).toLocaleDateString()} • {req.reason}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono font-bold text-white">${req.amount.toLocaleString()}</p>
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            req.status === 'approved' ? 'text-green-500' :
                                req.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                        )}>{req.status}</span>
                    </div>
                </div>
            ))}
        </motion.div>
    )
}

function RulesTab({ rules }: any) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((rule: any) => (
                <div key={rule.id} className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Shield className="w-24 h-24" />
                    </div>
                    <h3 className="font-bold text-white text-xl mb-2">{rule.name}</h3>
                    <div className="space-y-2 text-sm text-slate-400">
                        <div className="flex justify-between">
                            <span>Trigger Amount:</span>
                            <span className="text-white font-mono">${rule.min_amount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Required Approver:</span>
                            <span className="text-blue-400 uppercase font-black tracking-widest">{rule.required_role}</span>
                        </div>
                    </div>
                </div>
            ))}
            <button className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-500 hover:text-white hover:border-blue-600/50 hover:bg-blue-600/5 transition-all group">
                <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold uppercase tracking-widest text-xs">Add New Policy</span>
            </button>
        </motion.div>
    )
}

function NewRequestModal({ isOpen, onClose }: any) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Submit Request" className="max-w-lg">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Request Submitted'); onClose(); }}>
                <div className="space-y-2">
                    <Label>Request Type</Label>
                    <select className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 ring-blue-600 outline-none">
                        <option value="limit_increase">Limit Increase</option>
                        <option value="new_card">New Card Issuance</option>
                        <option value="expense">Large Expense Pre-Approval</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                    <Label>Business Justification</Label>
                    <textarea className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white min-h-[100px] focus:ring-2 ring-blue-600 outline-none" placeholder="Why is this needed?..." />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Submit Request</Button>
            </form>
        </Modal>
    )
}
