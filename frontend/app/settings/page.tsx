'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Lock, Bell, Shield, Key, Download } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('account');
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch user data
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/v1/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setUserData({
                        name: data.user.full_name || '',
                        email: data.user.email || '',
                        phone: data.user.phone || '',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const tabs = [
        { id: 'account', name: 'Account', icon: User },
        { id: 'security', name: 'Security', icon: Lock },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'privacy', name: 'Privacy', icon: Shield },
        { id: 'api', name: 'API Keys', icon: Key },
    ];

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: userData.name,
                    phone: userData.phone,
                })
            });

            if (response.ok) {
                alert('Settings saved successfully');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardShell>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-slate-400 mt-2">Manage your account settings and preferences</p>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="w-64 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                            ? 'bg-blue-600/10 text-blue-400'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={userData.name}
                                                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                                className="mt-1 w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={userData.email}
                                                disabled
                                                className="mt-1 w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                                            <input
                                                id="phone"
                                                type="tel"
                                                value={userData.phone}
                                                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                                className="mt-1 w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleSave} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                            <h3 className="font-medium text-white mb-2">Change Password</h3>
                                            <p className="text-sm text-slate-400 mb-4">Update your password regularly to keep your account secure</p>
                                            <Button variant="secondary">Change Password</Button>
                                        </div>
                                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                            <h3 className="font-medium text-white mb-2">Two-Factor Authentication</h3>
                                            <p className="text-sm text-slate-400 mb-4">Add an extra layer of security to your account</p>
                                            <Button variant="secondary">Enable 2FA</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Notification Preferences</h2>
                                <div className="space-y-3">
                                    {['Transaction Alerts', 'Security Updates', 'Marketing Emails', 'Product Updates'].map((item) => (
                                        <label key={item} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                            <span className="text-white">{item}</span>
                                            <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Privacy & Data</h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                        <h3 className="font-medium text-white mb-2">Download Your Data</h3>
                                        <p className="text-sm text-slate-400 mb-4">Export all your personal data in JSON format (GDPR compliance)</p>
                                        <Button variant="secondary" className="flex items-center gap-2">
                                            <Download className="w-4 h-4" />
                                            Request Data Export
                                        </Button>
                                    </div>
                                    <div className="p-4 bg-red-900/20 rounded-lg border border-red-700">
                                        <h3 className="font-medium text-red-400 mb-2">Delete Account</h3>
                                        <p className="text-sm text-slate-400 mb-4">Permanently delete your account and all associated data</p>
                                        <Button variant="destructive">Delete Account</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'api' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-white mb-4">API Keys</h2>
                                <p className="text-slate-400">Generate API keys for programmatic access to your account</p>
                                <Button>Generate New API Key</Button>
                                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                    <p className="text-sm text-slate-400">No API keys generated yet</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
