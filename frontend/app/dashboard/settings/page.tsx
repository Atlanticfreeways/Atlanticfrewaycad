'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    User,
    Lock,
    Bell,
    Shield,
    Key,
    CreditCard,
    Download,
    LogOut,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    Copy,
    Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { changePassword } from '@/lib/password';
import { profileSchema, passwordSchema, apiKeySchema, validateForm } from '@/lib/validation';

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
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

    // 2FA State
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [mfaSetupStep, setMfaSetupStep] = useState<'idle' | 'generating' | 'qr' | 'success'>('idle');
    const [mfaQrCode, setMfaQrCode] = useState('');
    const [mfaSecret, setMfaSecret] = useState('');
    const [mfaVerifyCode, setMfaVerifyCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);

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

        // Fetch MFA status
        const fetchMfaStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/v1/users/mfa/status', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setMfaEnabled(data.enabled);
                }
            } catch (err) {
                console.error('Failed to fetch MFA status', err);
            }
        };
        fetchMfaStatus();
    }, []);

    const tabs = [
        { id: 'account', name: 'Account', icon: User },
        { id: 'security', name: 'Security', icon: Lock },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'privacy', name: 'Privacy', icon: Shield },
        { id: 'api', name: 'API Keys', icon: Key },
    ];

    const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});

    const handleSave = async () => {
        // Validate with Zod
        const validation = validateForm(profileSchema, {
            full_name: userData.name,
            phone: userData.phone,
            // Keep existing email as it's not editable but schema might require it 
            // Actually profileSchema doesn't have email.
        });

        if (!validation.success) {
            setAccountErrors(validation.errors);
            toast.error('Please fix the errors in the form');
            return;
        }

        setAccountErrors({});
        setLoading(true);
        const loadId = toast.loading('Saving changes...');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(validation.data)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Profile updated successfully', { id: loadId });
            } else {
                toast.error(data.error || 'Failed to save settings', { id: loadId });
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to update profile', { id: loadId });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        // Validate password data
        const validation = validateForm(passwordSchema, {
            currentPassword: passwordData.current,
            newPassword: passwordData.new,
            confirmPassword: passwordData.confirm,
        });

        if (!validation.success) {
            setPasswordErrors(validation.errors);
            toast.error('Please fix the errors in the form');
            return;
        }

        setPasswordErrors({});
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
        // Validate API key data
        const validation = validateForm(apiKeySchema, {
            name: newKeyData.name,
            expiresIn: newKeyData.expires_days,
        });

        if (!validation.success) {
            toast.error(Object.values(validation.errors)[0] || 'Please fix the errors');
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

    const handleMfaSetup = async () => {
        setMfaSetupStep('generating');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users/mfa/setup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setMfaQrCode(data.qrCode);
                setMfaSecret(data.secret);
                setMfaSetupStep('qr');
            } else {
                toast.error(data.error || 'Failed to start MFA setup');
                setMfaSetupStep('idle');
            }
        } catch (error) {
            toast.error('Network error during MFA setup');
            setMfaSetupStep('idle');
        }
    };

    const handleMfaVerify = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users/mfa/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: mfaVerifyCode,
                    secret: mfaSecret
                })
            });
            const data = await response.json();
            if (data.success) {
                setMfaEnabled(true);
                setBackupCodes(data.backupCodes);
                setMfaSetupStep('success');
                toast.success('2FA enabled successfully!');
            } else {
                toast.error(data.error || 'Verification failed');
            }
        } catch (error) {
            toast.error('Network error during verification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardShell>
            <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-slate-400 mt-2">Manage your account settings and preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Tab Navigation (Responsive) */}
                    <div className="lg:w-64">
                        <div className="flex lg:flex-col overflow-x-auto pb-2 lg:pb-0 scrollbar-hide gap-1 bg-slate-900 md:bg-transparent p-1 rounded-xl">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap lg:w-full ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="font-medium">{tab.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Panel */}
                    <div className="flex-1 min-w-0">
                        {activeTab === 'account' && (
                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 md:p-8 space-y-8">
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-6">Account Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-slate-400">Full Name</Label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={userData.name}
                                                onChange={(e) => {
                                                    setUserData({ ...userData, name: e.target.value });
                                                    if (accountErrors.full_name) setAccountErrors({ ...accountErrors, full_name: '' });
                                                }}
                                                className={`w-full px-4 py-2 bg-slate-900 border ${accountErrors.full_name ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                                placeholder="Enter your full name"
                                            />
                                            {accountErrors.full_name && (
                                                <p className="text-xs text-red-500 mt-1">{accountErrors.full_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-slate-400">Email Address</Label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={userData.email}
                                                disabled
                                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 cursor-not-allowed italic"
                                            />
                                            <p className="text-[10px] text-slate-500">Email addresses cannot be changed for security</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-slate-400">Phone Number</Label>
                                            <input
                                                id="phone"
                                                type="tel"
                                                value={userData.phone}
                                                onChange={(e) => {
                                                    setUserData({ ...userData, phone: e.target.value });
                                                    if (accountErrors.phone) setAccountErrors({ ...accountErrors, phone: '' });
                                                }}
                                                className={`w-full px-4 py-2 bg-slate-900 border ${accountErrors.phone ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                                placeholder="+1 (555) 000-0000"
                                            />
                                            {accountErrors.phone && (
                                                <p className="text-xs text-red-500 mt-1">{accountErrors.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-700">
                                    <Button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </div>
                                        ) : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 md:p-8 space-y-10">
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-blue-400" />
                                        Security Settings
                                    </h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700 space-y-6">
                                                <div>
                                                    <h3 className="font-semibold text-white mb-1">Change Password</h3>
                                                    <p className="text-sm text-slate-400">Update your password regularly to keep your account secure</p>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="current-password" rural-slate-400>Current Password</Label>
                                                        <input
                                                            id="current-password"
                                                            type="password"
                                                            value={passwordData.current}
                                                            onChange={(e) => {
                                                                setPasswordData({ ...passwordData, current: e.target.value });
                                                                setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                                                            }}
                                                            className={`w-full px-4 py-2 bg-slate-900 border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                                            placeholder="••••••••"
                                                        />
                                                        {passwordErrors.currentPassword && (
                                                            <p className="text-xs text-red-400">{passwordErrors.currentPassword}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="new-password" shadow-slate-400>New Password</Label>
                                                        <input
                                                            id="new-password"
                                                            type="password"
                                                            value={passwordData.new}
                                                            onChange={(e) => {
                                                                setPasswordData({ ...passwordData, new: e.target.value });
                                                                setPasswordErrors({ ...passwordErrors, newPassword: '' });
                                                            }}
                                                            className={`w-full px-4 py-2 bg-slate-900 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                                            placeholder="••••••••"
                                                        />
                                                        {passwordErrors.newPassword ? (
                                                            <p className="text-xs text-red-400">{passwordErrors.newPassword}</p>
                                                        ) : (
                                                            <p className="text-[10px] text-slate-500">
                                                                Must include uppercase, lowercase, number & special character
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="confirm-password" font-slate-400>Confirm New Password</Label>
                                                        <input
                                                            id="confirm-password"
                                                            type="password"
                                                            value={passwordData.confirm}
                                                            onChange={(e) => {
                                                                setPasswordData({ ...passwordData, confirm: e.target.value });
                                                                setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                                                            }}
                                                            className={`w-full px-4 py-2 bg-slate-900 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                                            placeholder="••••••••"
                                                        />
                                                        {passwordErrors.confirmPassword && (
                                                            <p className="text-xs text-red-400">{passwordErrors.confirmPassword}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={handlePasswordChange}
                                                    disabled={changingPassword}
                                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                                                >
                                                    {changingPassword ? 'Updating...' : 'Update Password'}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700 space-y-4">
                                                <div>
                                                    <h3 className="font-semibold text-white mb-1">Two-Factor Authentication</h3>
                                                    <p className="text-sm text-slate-400">Add an extra layer of protection to your account</p>
                                                </div>

                                                {mfaSetupStep === 'idle' && (
                                                    <>
                                                        <div className={`flex items-center gap-4 p-4 rounded-lg border ${mfaEnabled ? 'bg-green-500/10 border-green-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                                                            {mfaEnabled ? <Check className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />}
                                                            <p className={`text-xs ${mfaEnabled ? 'text-green-300' : 'text-blue-300'}`}>
                                                                2FA is currently <span className="font-bold underline">{mfaEnabled ? 'enabled' : 'disabled'}</span>.
                                                            </p>
                                                        </div>
                                                        {!mfaEnabled && (
                                                            <Button onClick={handleMfaSetup} className="w-full bg-blue-600 hover:bg-blue-700">Set Up 2FA</Button>
                                                        )}
                                                        {mfaEnabled && (
                                                            <Button variant="secondary" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10">Disable 2FA</Button>
                                                        )}
                                                    </>
                                                )}

                                                {mfaSetupStep === 'generating' && (
                                                    <div className="flex flex-col items-center py-8">
                                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                                                        <p className="text-sm text-slate-400">Generating secure secret...</p>
                                                    </div>
                                                )}

                                                {mfaSetupStep === 'qr' && (
                                                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                                        <div className="flex flex-col items-center">
                                                            <div className="p-3 bg-white rounded-xl mb-4">
                                                                <img src={mfaQrCode} alt="MFA QR Code" className="w-48 h-48" />
                                                            </div>
                                                            <div className="text-center space-y-2">
                                                                <p className="text-sm text-white font-medium">Scan this QR code</p>
                                                                <p className="text-xs text-slate-400">Use Google Authenticator or Authy to scan the code above.</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Verification Code</Label>
                                                            <input
                                                                type="text"
                                                                value={mfaVerifyCode}
                                                                onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                                placeholder="000000"
                                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-center text-2xl tracking-widest font-bold text-white focus:border-blue-500 outline-none"
                                                            />
                                                        </div>

                                                        <div className="flex gap-3">
                                                            <Button variant="secondary" onClick={() => setMfaSetupStep('idle')} className="flex-1">Cancel</Button>
                                                            <Button onClick={handleMfaVerify} disabled={loading || mfaVerifyCode.length !== 6} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                                                {loading ? 'Verifying...' : 'Verify & Enable'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {mfaSetupStep === 'success' && (
                                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                                                <Check className="w-6 h-6 text-green-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-bold">MFA Enabled!</p>
                                                                <p className="text-xs text-green-300/80">Your account is now extra secure.</p>
                                                            </div>
                                                        </div>

                                                        <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-4">
                                                            <p className="text-sm font-bold text-amber-400 flex items-center gap-2">
                                                                <Shield className="w-4 h-4" />
                                                                Backup Recovery Codes
                                                            </p>
                                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                                Store these codes in a safe place. If you lose access to your device, these are the ONLY way to recover your account.
                                                            </p>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {backupCodes.map(code => (
                                                                    <code key={code} className="bg-slate-950 p-2 rounded text-center text-blue-400 font-mono text-sm">{code}</code>
                                                                ))}
                                                            </div>
                                                            <Button variant="secondary" className="w-full text-xs flex items-center gap-2" onClick={() => window.print()}>
                                                                <Download className="w-3 h-3" />
                                                                Download Backup Codes
                                                            </Button>
                                                        </div>

                                                        <Button onClick={() => setMfaSetupStep('idle')} className="w-full">Back to Security</Button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700 space-y-4">
                                                <div>
                                                    <h3 className="font-semibold text-white mb-1">Active Sessions</h3>
                                                    <p className="text-sm text-slate-400">Manage your connected devices</p>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            <span className="text-white">Current Session (MacBook Pro)</span>
                                                        </div>
                                                        <span className="text-slate-500">Active now</span>
                                                    </div>
                                                </div>
                                                <Button variant="secondary" className="w-full text-xs">Revoke All Other Sessions</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 md:p-8">
                                <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                                <div className="space-y-4 max-w-2xl">
                                    {[
                                        { title: 'Transaction Alerts', desc: 'Get notified when a transaction is made or requires approval' },
                                        { title: 'Security Updates', desc: 'Important alerts about your account security and login activity' },
                                        { title: 'Marketing Emails', desc: 'Stay updated with our latest features and corporate offers' },
                                        { title: 'Product Updates', desc: 'Periodic summaries of new platform capabilities' }
                                    ].map((item) => (
                                        <label key={item.title} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors">
                                            <div>
                                                <p className="text-white font-medium">{item.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                            </div>
                                            <input type="checkbox" className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0" defaultChecked />
                                        </label>
                                    ))}
                                    <div className="pt-6">
                                        <Button className="bg-blue-600 hover:bg-blue-700">Update Preferences</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 md:p-8 space-y-8">
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-6">Privacy & Data</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700 space-y-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                <Download className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">Download Your Data</h3>
                                                <p className="text-sm text-slate-400 mt-1">Export all your personal data in JSON format for your records.</p>
                                            </div>
                                            <Button variant="secondary" className="w-full">Request Export</Button>
                                        </div>
                                        <div className="p-6 bg-red-500/5 rounded-xl border border-red-500/10 space-y-4">
                                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                                <Trash2 className="w-6 h-6 text-red-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">Delete Account</h3>
                                                <p className="text-sm text-slate-400 mt-1">Permanently remove your account and all associated data.</p>
                                            </div>
                                            <Button variant="destructive" className="w-full">Delete Account</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'api' && (
                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 md:p-8 space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">API access Keys</h2>
                                        <p className="text-sm text-slate-400 mt-1">Generate keys for programmatic access to your account</p>
                                    </div>
                                    <Button onClick={() => setShowNewKeyDialog(!showNewKeyDialog)} className="bg-blue-600 hover:bg-blue-700">
                                        <Key className="w-4 h-4 mr-2" />
                                        New API Key
                                    </Button>
                                </div>

                                {/* New Key Dialog */}
                                {showNewKeyDialog && (
                                    <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-6">
                                        <h3 className="font-semibold text-white">Create New Key</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="key-name" className="text-slate-400">Key Name</Label>
                                                <input
                                                    id="key-name"
                                                    type="text"
                                                    value={newKeyData.name}
                                                    onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Production Bot"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="expires-days" className="text-slate-400">Expiration</Label>
                                                <select
                                                    id="expires-days"
                                                    value={newKeyData.expires_days}
                                                    onChange={(e) => setNewKeyData({ ...newKeyData, expires_days: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                                >
                                                    <option value={30}>30 Days</option>
                                                    <option value={90}>90 Days</option>
                                                    <option value={365}>1 Year</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button onClick={generateApiKey} disabled={generatingKey} className="bg-blue-600 hover:bg-blue-700 px-8">
                                                {generatingKey ? 'Generating...' : 'Generate'}
                                            </Button>
                                            <Button variant="secondary" onClick={() => setShowNewKeyDialog(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                )}

                                {/* Generated Key Display */}
                                {generatedKey && (
                                    <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-4">
                                        <div className="flex items-center gap-2 text-amber-500">
                                            <AlertCircle className="w-5 h-5" />
                                            <h3 className="font-bold">Important: Secure Your Key</h3>
                                        </div>
                                        <p className="text-xs text-amber-300/80">
                                            For security reasons, we can only show this key once. If you lose it, you'll need to generate a new one.
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={generatedKey}
                                                readOnly
                                                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm tracking-wider"
                                            />
                                            <Button onClick={() => copyToClipboard(generatedKey)} className="px-6">Copy</Button>
                                        </div>
                                        <Button variant="ghost" className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/5 text-xs" onClick={() => setGeneratedKey(null)}>
                                            I have safely stored this key
                                        </Button>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active API Keys</h3>
                                    {loadingKeys ? (
                                        <div className="grid gap-4">
                                            {[1, 2].map(i => <div key={i} className="h-24 bg-slate-900 animate-pulse rounded-xl border border-slate-800" />)}
                                        </div>
                                    ) : apiKeys.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                                            <Key className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                            <p className="text-slate-500">No active API keys found</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {apiKeys.map((key) => (
                                                <div key={key.id} className="p-5 bg-slate-900/50 border border-slate-700 rounded-2xl hover:border-slate-600 transition-colors group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase text-sm tracking-tighter">{key.name}</h4>
                                                            <p className="text-xs font-mono text-slate-500 mt-1">{key.key_prefix}••••••••</p>
                                                        </div>
                                                        <Badge variant="secondary" className={key.is_expired ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}>
                                                            {key.is_expired ? 'Expired' : 'Active'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-[10px] text-slate-500 font-medium">
                                                        <p>CREATED: {new Date(key.created_at).toLocaleDateString()}</p>
                                                        <p>EXPIRES: {new Date(key.expires_at).toLocaleDateString()}</p>
                                                        {key.last_used_at && <p className="text-blue-500/60">LAST USED: {new Date(key.last_used_at).toLocaleString()}</p>}
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-slate-800 text-right">
                                                        <button
                                                            onClick={() => revokeApiKey(key.id, key.name)}
                                                            className="text-[10px] text-red-500/60 hover:text-red-500 uppercase font-bold tracking-widest transition-colors"
                                                        >
                                                            Revoke Key
                                                        </button>
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
