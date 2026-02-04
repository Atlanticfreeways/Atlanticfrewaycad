"use client";

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaToken, setMfaToken] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mfaRequired) {
                // Secondary MFA Verification
                const res = await api.post<{ success: boolean; user: any; tokens: { accessToken: string } }>('/auth/mfa/verify', {
                    code: mfaCode,
                    mfaToken
                });

                if (res.success) {
                    login(res.tokens.accessToken, res.user);
                }
            } else {
                // Initial Login
                const res = await api.post<{ success: boolean; user?: any; tokens?: { accessToken: string }; mfaRequired?: boolean; mfaToken?: string }>('/auth/login', {
                    email,
                    password
                });

                if (res.mfaRequired && res.mfaToken) {
                    setMfaRequired(true);
                    setMfaToken(res.mfaToken);
                } else if (res.success && res.tokens) {
                    login(res.tokens.accessToken, res.user);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-white font-bold text-2xl">A</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                    <p className="mt-2 text-slate-400">Sign in to your card dashboard</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {!mfaRequired ? (
                            <>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <label htmlFor="mfaCode" className="block text-sm font-medium text-slate-300">2FA Verification Code</label>
                                <p className="text-xs text-slate-500 mb-2">Please enter the 6-digit code from your authenticator app</p>
                                <input
                                    id="mfaCode"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    required
                                    placeholder="000000"
                                    className="mt-1 block w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500">
                    Don't have an account? <Link href="/register" className="text-blue-400 hover:underline">Apply now</Link>
                </p>
            </div>
        </div>
    );
}
