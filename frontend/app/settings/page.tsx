'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Lock, Bell, Shield, Key, Download } from 'lucide-react';
import { toast } from '@/lib/toast';
import { changePassword } from '@/lib/password';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('account');
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [changingPassword, setChangingPassword] = useState(false);

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
                toast.error('Failed to load profile');
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
        const loadingToast = toast.loading('Saving changes...');

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

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Settings saved successfully');
            } else {
                toast.error('Failed to save settings', data.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            toast.error('Please fill in all password fields');
            return;
        }

        setChangingPassword(true);

        try {
            const result = await changePassword({
                currentPassword: passwordData.current,
                newPassword: passwordData.new,
                confirmPassword: passwordData.confirm,
            });

            if (result.success) {
                toast.success('Password changed successfully');
                setPasswordData({ current: '', new: '', confirm: '' });
            } else {
                toast.error('Failed to change password', result.error);
            }
        } catch (error) {
            toast.error('Failed to change password', 'Network error');
        } finally {
            setChangingPassword(false);
        }
    };

    // API Keys state and functions
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [loadingKeys, setLoadingKeys] = useState(false);
    const [generatingKey, setGeneratingKey] = useState(false);
    const [newKeyData, setNewKeyData] = useState({ name: '', expires_days: 90 });
    const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    const fetchApiKeys = async () => {
        setLoadingKeys(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users/api-keys', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setApiKeys(data.keys);
            }
        } catch (error) {
            toast.error('Failed to load API keys');
        } finally {
            setLoadingKeys(false);
        }
    };

    const generateApiKey = async () => {
        if (!newKeyData.name) {
            toast.error('Please enter a name for the API key');
            return;
        }

        setGeneratingKey(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newKeyData)
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedKey(data.key.plaintext_key);
                toast.success('API key generated successfully');
                setNewKeyData({ name: '', expires_days: 90 });
                fetchApiKeys();
            } else {
                toast.error('Failed to generate API key', data.error);
            }
        } catch (error) {
            toast.error('Failed to generate API key', 'Network error');
        } finally {
            setGeneratingKey(false);
        }
    };

    const revokeApiKey = async (keyId: string, keyName: string) => {
        if (!confirm(`Are you sure you want to revoke "${keyName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/users/api-keys/${keyId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('API key revoked');
                fetchApiKeys();
            } else {
                toast.error('Failed to revoke key', data.error);
            }
        } catch (error) {
            toast.error('Failed to revoke key', 'Network error');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    useEffect(() => {
        if (activeTab === 'api') {
            fetchApiKeys();
        }
    }, [activeTab]);

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

                                            <div className="space-y-3 mb-4">
                                                <div>
                                                    <Label htmlFor="current-password" className="text-slate-300">Current Password</Label>
                                                    <input
                                                        id="current-password"
                                                        type="password"
                                                        value={passwordData.current}
                                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                        className="mt-1 w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Enter current password"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="new-password" className="text-slate-300">New Password</Label>
                                                    <input
                                                        id="new-password"
                                                        type="password"
                                                        value={passwordData.new}
                                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        className="mt-1 w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Enter new password"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Must be 8+ characters with uppercase, lowercase, number, and special character
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label htmlFor="confirm-password" className="text-slate-300">Confirm New Password</Label>
                                                    <input
                                                        id="confirm-password"
                                                        type="password"
                                                        value={passwordData.confirm}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        className="mt-1 w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handlePasswordChange}
                                                disabled={changingPassword}
                                                variant="secondary"
                                            >
                                                {changingPassword ? 'Changing Password...' : 'Change Password'}
                                            </Button>
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
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-2">API Keys</h2>
                                        <p className="text-slate-400">Generate API keys for programmatic access to your account</p>
                                    </div>
                                    <Button onClick={() => setShowNewKeyDialog(!showNewKeyDialog)}>
                                        Generate New API Key
                                    </Button>
                                </div>

                                {/* New Key Dialog */}
                                {showNewKeyDialog && (
                                    <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                                        <h3 className="font-medium text-white mb-3">Create New API Key</h3>
                                        <div className="space-y-3 mb-4">
                                            <div>
                                                <Label htmlFor="key-name" className="text-slate-300">Key Name</Label>
                                                <input
                                                    id="key-name"
                                                    type="text"
                                                    value={newKeyData.name}
                                                    onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                                                    className="mt-1 w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., Production API Key"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="expires-days" className="text-slate-300">Expires In (days)</Label>
                                                <select
                                                    id="expires-days"
                                                    value={newKeyData.expires_days}
                                                    onChange={(e) => setNewKeyData({ ...newKeyData, expires_days: parseInt(e.target.value) })}
                                                    className="mt-1 w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value={30}>30 days</option>
                                                    <option value={60}>60 days</option>
                                                    <option value={90}>90 days</option>
                                                    <option value={180}>180 days</option>
                                                    <option value={365}>365 days</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={generateApiKey} disabled={generatingKey}>
                                                {generatingKey ? 'Generating...' : 'Generate Key'}
                                            </Button>
                                            <Button variant="secondary" onClick={() => setShowNewKeyDialog(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Generated Key Display (shown once) */}
                                {generatedKey && (
                                    <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                                        <h3 className="font-medium text-green-400 mb-2">⚠️ Save Your API Key</h3>
                                        <p className="text-sm text-slate-400 mb-3">
                                            This is the only time you'll see this key. Copy it now and store it securely.
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={generatedKey}
                                                readOnly
                                                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm"
                                            />
                                            <Button onClick={() => copyToClipboard(generatedKey)}>
                                                Copy
                                            </Button>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            className="mt-3"
                                            onClick={() => setGeneratedKey(null)}
                                        >
                                            I've saved it
                                        </Button>
                                    </div>
                                )}

                                {/* Keys List */}
                                <div>
                                    {loadingKeys ? (
                                        <div className="text-center py-8 text-slate-400">Loading keys...</div>
                                    ) : apiKeys.length === 0 ? (
                                        <div className="p-8 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
                                            <Key className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                            <p className="text-slate-400">No API keys generated yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {apiKeys.map((key) => (
                                                <div
                                                    key={key.id}
                                                    className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-white">{key.name}</h4>
                                                            <p className="text-sm text-slate-400 font-mono mt-1">{key.key_prefix}</p>
                                                            <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                                                <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                                                                <span>Expires: {new Date(key.expires_at).toLocaleDateString()}</span>
                                                                {key.last_used_at && (
                                                                    <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                                                                )}
                                                            </div>
                                                            {key.is_expired && (
                                                                <span className="inline-block mt-2 px-2 py-1 bg-red-900/20 text-red-400 text-xs rounded">
                                                                    Expired
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => revokeApiKey(key.id, key.name)}
                                                        >
                                                            Revoke
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
