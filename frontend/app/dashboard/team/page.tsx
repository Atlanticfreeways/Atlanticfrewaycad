"use client";

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Mail, Shield, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function TeamPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await api.get<any>('/team');
            if (res.success) {
                setMembers(res.members);
            }
        } catch (error) {
            console.error(error);
            // toast.error("Failed to load team members");
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = () => {
        toast.info("Invite feature coming soon!");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Loading Team...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
                    <p className="text-slate-500">Manage access and roles for your organization.</p>
                </div>
                <button onClick={handleInvite} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-400" />
                        Active Members ({members.length})
                    </h3>
                </div>

                <div className="divide-y divide-slate-100">
                    {members.map((member, i) => (
                        <div key={member.id || i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase">
                                    {(member.first_name?.[0] || 'U') + (member.last_name?.[0] || '')}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{member.first_name} {member.last_name} {member.id === '1' ? '(You)' : ''}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> {member.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${member.role === 'owner' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                    <Shield className="w-3 h-3" />
                                    {member.role || 'Member'}
                                </span>
                                <button className="text-slate-400 hover:text-slate-600 text-sm font-medium">Edit</button>
                            </div>
                        </div>
                    ))}
                    {members.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No team members found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
