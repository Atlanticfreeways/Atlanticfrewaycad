"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { CreditCard, Plus, Loader2, Lock, Unlock, Eye } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function CardsPage() {
    const { data, loading, error } = useDashboardData();
    const [isCreating, setIsCreating] = useState(false);

    if (loading) {
        return (
            <DashboardShell>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            </DashboardShell>
        )
    }

    const cards = data?.cards || [];

    return (
        <DashboardShell>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Cards</h1>
                    <p className="text-slate-400">Manage your virtual and physical cards</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Issue New Card</span>
                </button>
            </div>

            {isCreating && <CreateCardModal onClose={() => setIsCreating(false)} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {cards.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl border-dashed">
                        <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white">No cards issued yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">Create your first virtual card to start spending securely online.</p>
                    </div>
                ) : (
                    cards.map((card: any) => <CardItem key={card.id} card={card} />)
                )}
            </div>
        </DashboardShell>
    );
}

function CardItem({ card }: { card: any }) {
    const isActive = card.status === 'active';

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 relative group overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                {isActive ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>

            <div className="mb-8">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Virtual Card</p>
                <h3 className="text-white font-bold text-lg mt-1">{card.name || 'Atlantic Card'}</h3>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2 bg-slate-950/50 p-2 rounded-lg w-fit">
                    <span className="text-slate-300 font-mono text-lg">•••• •••• •••• {card.last_four || 'XXXX'}</span>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Card Holder</p>
                        <p className="text-slate-300 font-medium">YOUR NAME</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                    View Details
                </button>
            </div>
        </div>
    )
}

function CreateCardModal({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [nickname, setNickname] = useState('');
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Determine endpoint based on role or just default to personal for MVP
            const endpoint = user?.role === 'employee' ? '/business/cards/corporate' : '/personal/cards';

            await api.post(endpoint, {
                nickname,
                dailyLimit: 1000,
                monthlyLimit: 5000
            });
            window.location.reload(); // Simple refresh for now
        } catch (err) {
            alert('Failed to issue card');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-white mb-4">Issue New Virtual Card</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Card Nickname</label>
                        <input
                            type="text"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Travel Expenses"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                        />
                    </div>

                    <div className="flex space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Issue Card'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
