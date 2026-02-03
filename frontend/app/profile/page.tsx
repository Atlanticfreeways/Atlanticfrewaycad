'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Building, Calendar, CreditCard } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardShell>
                <div className="p-8 text-center text-slate-400">Loading profile...</div>
            </DashboardShell>
        );
    }

    const kycTierColors = {
        basic: 'bg-slate-600',
        standard: 'bg-blue-600',
        turbo: 'bg-purple-600',
        business: 'bg-yellow-600',
    };

    return (
        <DashboardShell>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Profile</h1>
                    <p className="text-slate-400 mt-2">Your account information and settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <User className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-center">{user?.full_name || 'User'}</h2>
                            <p className="text-blue-100 text-center text-sm mt-1">{user?.email}</p>
                            <div className="mt-4 flex justify-center">
                                <Badge className={`${kycTierColors[user?.kyc_tier || 'basic']} text-white`}>
                                    {(user?.kyc_tier || 'basic').toUpperCase()} Tier
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Email</p>
                                        <p className="text-white">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Phone</p>
                                        <p className="text-white">{user?.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Member Since</p>
                                        <p className="text-white">
                                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                    <Building className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Account Type</p>
                                        <p className="text-white capitalize">{user?.account_type || 'Personal'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* KYC Status */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-xl font-semibold text-white mb-4">KYC Verification</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Current Tier</span>
                                    <Badge className={`${kycTierColors[user?.kyc_tier || 'basic']} text-white`}>
                                        {(user?.kyc_tier || 'basic').toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Monthly Limit</span>
                                    <span className="text-white font-medium">
                                        ${(user?.monthly_limit || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Monthly Spent</span>
                                    <span className="text-white font-medium">
                                        ${(user?.monthly_spent || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-700">
                                    <Button variant="secondary" className="w-full">
                                        Upgrade KYC Tier
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-xl font-semibold text-white mb-4">Account Actions</h3>
                            <div className="space-y-3">
                                <Button variant="secondary" className="w-full justify-start">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    View My Cards
                                </Button>
                                <Button variant="secondary" className="w-full justify-start">
                                    <User className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
