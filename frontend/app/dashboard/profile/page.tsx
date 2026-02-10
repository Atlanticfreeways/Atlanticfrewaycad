'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User, Building, Calendar,
    Camera, Save, X, Edit2, AlertCircle, Shield
} from 'lucide-react';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error';
import { toast } from '@/lib/toast';
import { profileSchema, validateForm } from '@/lib/validation';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        bio: '',
        company: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
                setFormData({
                    full_name: data.user.full_name || '',
                    phone: data.user.phone || '',
                    bio: data.user.bio || '',
                    company: data.user.company || ''
                });
            } else {
                setError(data.error || 'Failed to fetch profile');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setError('Could not connect to server. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing, reset form
            setFormData({
                full_name: user?.full_name || '',
                phone: user?.phone || '',
                bio: user?.bio || '',
                company: user?.company || ''
            });
            setFormErrors({});
        }
        setIsEditing(!isEditing);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        // Validate form
        const validation = validateForm(profileSchema, formData);
        if (!validation.success) {
            setFormErrors(validation.errors);
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSaving(true);
        toast.loading('Saving profile changes...');

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
                setUser(data.user);
                toast.success('Profile updated successfully');
                setIsEditing(false);
                setFormErrors({});
            } else {
                toast.error('Failed to update profile', data.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            toast.error('Failed to update profile', 'Network error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardShell>
                <div className="p-4 md:p-8 max-w-4xl mx-auto">
                    <ProfileSkeleton />
                </div>
            </DashboardShell>
        );
    }

    if (error) {
        return (
            <DashboardShell>
                <div className="p-4 md:p-8 max-w-4xl mx-auto">
                    <ErrorDisplay
                        message={error}
                        onRetry={fetchProfile}
                    />
                </div>
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
            <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Profile</h1>
                        <p className="text-slate-400 mt-2">Manage your public profile and personal information</p>
                    </div>
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={handleEditToggle}
                                    disabled={isSaving}
                                    className="flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={handleEditToggle}
                                className="flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Summary */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>

                            <div className="relative mt-4 mb-6 inline-block">
                                <div className="w-28 h-28 bg-slate-700 rounded-full border-4 border-slate-900 flex items-center justify-center overflow-hidden mx-auto">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-14 h-14 text-slate-500" />
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg border-2 border-slate-900">
                                        <Camera className="w-4 h-4 text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-1">{user?.full_name || 'User'}</h2>
                            <p className="text-slate-400 text-sm mb-6">{user?.email}</p>

                            <div className="flex justify-center mb-8">
                                <Badge className={`${kycTierColors[user?.kyc_tier || 'basic']} text-white px-3 py-1`}>
                                    {(user?.kyc_tier || 'basic').toUpperCase()} Tier
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-6">
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Status</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${user?.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                                        <span className="text-sm text-white capitalize">{user?.status || 'Inactive'}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Role</p>
                                    <span className="text-sm text-white capitalize">{user?.role || 'Guest'}</span>
                                </div>
                            </div>
                        </div>

                        {/* KYC Stats */}
                        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-400" />
                                KYC & Limits
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Monthly Usage</span>
                                        <span className="text-slate-200">${(user?.monthly_spent || 0).toLocaleString()} / ${(user?.monthly_limit || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${Math.min(100, ((user?.monthly_spent || 0) / (user?.monthly_limit || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Button variant="secondary" className="w-full hover:bg-slate-700 border-slate-700">
                                        Upgrade Verification
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information & Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-700 bg-slate-800/30">
                                <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                            </div>
                            <div className="p-6">
                                {isEditing ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="full_name">Full Name</Label>
                                            <Input
                                                id="full_name"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                className={formErrors.full_name ? 'border-red-500' : ''}
                                                placeholder="Enter your full name"
                                            />
                                            {formErrors.full_name && (
                                                <p className="text-xs text-red-500 mt-1">{formErrors.full_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className={formErrors.phone ? 'border-red-500' : ''}
                                                placeholder="+1 (555) 000-0000"
                                            />
                                            {formErrors.phone && (
                                                <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company</Label>
                                            <Input
                                                id="company"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                className={formErrors.company ? 'border-red-500' : ''}
                                                placeholder="Company name"
                                            />
                                            {formErrors.company && (
                                                <p className="text-xs text-red-500 mt-1">{formErrors.company}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <textarea
                                                id="bio"
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className={`w-full px-4 py-2 bg-slate-900 border ${formErrors.bio ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]`}
                                                placeholder="Tell us about yourself..."
                                            />
                                            {formErrors.bio && (
                                                <p className="text-xs text-red-500 mt-1">{formErrors.bio}</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Full Name</p>
                                            <p className="text-white font-medium">{user?.full_name || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Email ADDRESS</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-medium">{user?.email}</p>
                                                <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">Verified</Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Phone</p>
                                            <p className="text-white font-medium">{user?.phone || 'Not provided'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Company</p>
                                            <p className="text-white font-medium">{user?.company || 'Not provided'}</p>
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Bio</p>
                                            <p className="text-white font-medium leading-relaxed">
                                                {user?.bio || 'No bio available. Click Edit Profile to add one.'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Details Bagde Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Member Since</p>
                                    <p className="text-white font-semibold">
                                        {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700 flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center">
                                    <Building className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Account Type</p>
                                    <p className="text-white font-semibold capitalize">{user?.account_type || 'Personal'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Notice */}
                        {!isEditing && (
                            <div className="bg-amber-900/10 border border-amber-800/30 rounded-xl p-5 flex items-start gap-4">
                                <div className="w-10 h-10 bg-amber-600/10 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="text-amber-500 font-semibold mb-1">Security Reminder</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        To change your password or security settings, please go to the
                                        <Button variant="link" className="text-blue-400 p-0 h-auto font-medium ml-1" onClick={() => window.location.href = '/settings?tab=security'}>
                                            Settings page
                                        </Button>.
                                        Keep your account information private.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
