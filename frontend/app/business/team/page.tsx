'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Trash2, Shield } from 'lucide-react';

interface TeamMember {
    id: string;
    email: string;
    full_name: string;
    role: string;
    status: string;
    invited_at: string;
    last_active: string;
}

export default function TeamManagementPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('operator');

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/business/team', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMembers(data.team);
            }
        } catch (error) {
            console.error('Failed to fetch team:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/business/team/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });

            if (response.ok) {
                alert('Invitation sent successfully');
                setInviteEmail('');
                fetchTeam();
            }
        } catch (error) {
            console.error('Failed to send invitation:', error);
            alert('Failed to send invitation');
        }
    };

    const handleRemove = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/v1/business/team/${memberId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setMembers(members.filter(m => m.id !== memberId));
        } catch (error) {
            console.error('Failed to remove member:', error);
        }
    };

    const handleRoleChange = async (memberId: string, newRole: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/v1/business/team/${memberId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-red-600',
            finance_manager: 'bg-purple-600',
            operator: 'bg-blue-600',
            viewer: 'bg-slate-600',
        };
        return <Badge className={`${colors[role] || 'bg-slate-600'} text-white`}>
            {role.replace('_', ' ').toUpperCase()}
        </Badge>;
    };

    return (
        <DashboardShell>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Team Management</h1>
                    <p className="text-slate-400 mt-2">Manage users and permissions for your business account</p>
                </div>

                {/* Invite Form */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Invite Team Member</h2>
                    <form onSubmit={handleInvite} className="flex gap-4">
                        <input
                            type="email"
                            placeholder="email@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="admin">Admin</option>
                            <option value="finance_manager">Finance Manager</option>
                            <option value="operator">Operator</option>
                            <option value="viewer">Viewer</option>
                        </select>
                        <Button type="submit" className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Invite
                        </Button>
                    </form>
                </div>

                {/* Team Members Table */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Role</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Last Active</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        Loading team members...
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        No team members yet. Invite someone to get started!
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                                        <td className="px-4 py-3 text-sm text-white">{member.full_name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-300">{member.email}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-white"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="finance_manager">Finance Manager</option>
                                                <option value="operator">Operator</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={member.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'}>
                                                {member.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-400">
                                            {member.last_active ? new Date(member.last_active).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleRemove(member.id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardShell>
    );
}
