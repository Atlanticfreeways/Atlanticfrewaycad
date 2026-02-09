'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Download, Trash2, AlertTriangle } from 'lucide-react';

export default function PrivacyPage() {
    const [exportLoading, setExportLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDataExport = async () => {
        setExportLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users/data-export', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `atlantic-data-export-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to export data');
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        } finally {
            setExportLoading(false);
        }
    };

    const handleAccountDeletion = async () => {
        if (deleteConfirm !== 'DELETE') {
            alert('Please type DELETE to confirm');
            return;
        }

        setDeleteLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users/delete-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Account deletion request submitted. You will receive a confirmation email.');
                setDeleteConfirm('');
            } else {
                alert('Failed to submit deletion request');
            }
        } catch (error) {
            console.error('Deletion request failed:', error);
            alert('Failed to submit deletion request');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <DashboardShell>
            <div className="p-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Privacy & Data Rights</h1>
                    <p className="text-slate-400 mt-2">Manage your personal data and privacy settings (GDPR Compliance)</p>
                </div>

                <div className="space-y-6">
                    {/* Data Export */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-600/10 rounded-lg">
                                <Download className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-white mb-2">Download Your Data</h2>
                                <p className="text-slate-400 mb-4">
                                    Export all your personal information, transaction history, and account data in a machine-readable format (JSON).
                                    This includes:
                                </p>
                                <ul className="list-disc list-inside text-slate-400 space-y-1 mb-4">
                                    <li>Account information (name, email, phone)</li>
                                    <li>Card details and transaction history</li>
                                    <li>KYC verification data</li>
                                    <li>Audit logs and activity history</li>
                                </ul>
                                <Button
                                    onClick={handleDataExport}
                                    disabled={exportLoading}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    {exportLoading ? 'Preparing Export...' : 'Request Data Export'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Data Retention Policy */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                        <h2 className="text-xl font-semibold text-white mb-2">Data Retention Policy</h2>
                        <p className="text-slate-400 mb-4">
                            We retain your personal data for as long as your account is active or as needed to provide services.
                            Specific retention periods:
                        </p>
                        <div className="space-y-2 text-slate-400">
                            <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                                <span>Transaction records</span>
                                <span className="text-white font-medium">7 years (regulatory requirement)</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                                <span>KYC documents</span>
                                <span className="text-white font-medium">5 years after account closure</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                                <span>Inactive accounts</span>
                                <span className="text-white font-medium">2 years (then auto-deleted)</span>
                            </div>
                        </div>
                    </div>

                    {/* Account Deletion */}
                    <div className="bg-red-900/20 rounded-xl p-6 border border-red-700">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-600/10 rounded-lg">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-red-400 mb-2">Delete Your Account</h2>
                                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-4 flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-slate-300">
                                        <strong className="text-yellow-400">Warning:</strong> Account deletion is permanent and irreversible.
                                        All your cards will be deactivated and you will lose access to your transaction history.
                                    </div>
                                </div>
                                <p className="text-slate-400 mb-4">
                                    What happens when you delete your account:
                                </p>
                                <ul className="list-disc list-inside text-slate-400 space-y-1 mb-4">
                                    <li>All virtual and physical cards are immediately deactivated</li>
                                    <li>Remaining balance will be refunded to your linked bank account</li>
                                    <li>Personal data will be anonymized or deleted (except regulatory records)</li>
                                    <li>You will receive a confirmation email before final deletion</li>
                                </ul>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-slate-300 mb-2">
                                            Type <strong className="text-red-400">DELETE</strong> to confirm:
                                        </label>
                                        <input
                                            type="text"
                                            value={deleteConfirm}
                                            onChange={(e) => setDeleteConfirm(e.target.value)}
                                            placeholder="DELETE"
                                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleAccountDeletion}
                                        disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                                        variant="destructive"
                                        className="flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {deleteLoading ? 'Processing...' : 'Delete My Account'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
