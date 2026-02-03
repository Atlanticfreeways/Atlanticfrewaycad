'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Filter, Search } from 'lucide-react';

interface AuditLog {
    id: string;
    user_email: string;
    action: string;
    resource_type: string;
    resource_id: string;
    ip_address: string;
    user_agent: string;
    status: 'success' | 'failure';
    metadata: any;
    created_at: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ action: '', user: '', startDate: '', endDate: '' });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/admin/audit-logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setLogs(data.logs);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/admin/audit-logs/export', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        return status === 'success'
            ? <Badge className="bg-green-600 text-white">Success</Badge>
            : <Badge className="bg-red-600 text-white">Failure</Badge>;
    };

    return (
        <DashboardShell>
            <div className="p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
                        <p className="text-slate-400 mt-2">Security and activity monitoring</p>
                    </div>
                    <Button onClick={handleExport} variant="secondary" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Action Type</label>
                            <select
                                value={filter.action}
                                onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Actions</option>
                                <option value="login">Login</option>
                                <option value="card_create">Card Create</option>
                                <option value="transaction">Transaction</option>
                                <option value="settings_update">Settings Update</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">User</label>
                            <input
                                type="text"
                                placeholder="Search by email"
                                value={filter.user}
                                onChange={(e) => setFilter({ ...filter, user: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Start Date</label>
                            <input
                                type="date"
                                value={filter.startDate}
                                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">End Date</label>
                            <input
                                type="date"
                                value={filter.endDate}
                                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Timestamp</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">User</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Action</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Resource</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">IP Address</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        Loading audit logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        No audit logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                                        <td className="px-4 py-3 text-sm text-slate-300">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-white">{log.user_email}</td>
                                        <td className="px-4 py-3 text-sm text-slate-300">{log.action}</td>
                                        <td className="px-4 py-3 text-sm text-slate-400">
                                            {log.resource_type}/{log.resource_id?.slice(0, 8)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-400 font-mono">{log.ip_address}</td>
                                        <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
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
