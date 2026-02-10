"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const { mutate: handleResetRequest, isPending } = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`${API_URL}/auth/request-reset`, { email });
            return response.data;
        },
        onSuccess: () => {
            setSubmitted(true);
            toast.success("Reset link sent (if email exists)");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to send reset link");
        }
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        handleResetRequest();
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20 mb-6 group">
                        <div className="font-bold text-2xl text-white group-hover:rotate-12 transition-transform">A</div>
                    </Link>
                    <h2 className="text-3xl font-black text-white tracking-tight">Recover access</h2>
                    <p className="mt-2 text-zinc-400">Enter your email to receive a reset link.</p>
                </div>

                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl">
                    {submitted ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Check your email</h3>
                                <p className="text-zinc-500 text-sm">
                                    We have sent a password reset link to <span className="text-white font-medium">{email}</span>.
                                </p>
                            </div>
                            <Link href="/auth/login" className="block w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
                                Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                            </button>
                        </form>
                    )}
                </div>

                <div className="text-center">
                    <Link href="/auth/login" className="inline-flex items-center space-x-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Sign In</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
