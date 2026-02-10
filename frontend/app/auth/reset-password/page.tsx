"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, Loader2, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { mutate: handleReset, isPending, isSuccess } = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`${API_URL}/auth/reset-password`, {
                token,
                password
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success("Password reset successfully!");
            setTimeout(() => router.push('/auth/login'), 2000);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to reset password");
        }
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error("Invalid or missing reset token");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        handleReset();
    };

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-bold">
                    Missing Reset Token
                </div>
                <Link href="/auth/forgot-password" className="text-zinc-400 hover:text-white underline">Request a new link</Link>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Password Reset!</h3>
                    <p className="text-zinc-500 text-sm">
                        You can now log in with your new password. Redirecting...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Set New Password"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-white tracking-tight">Set new password</h2>
                    <p className="mt-2 text-zinc-400">Secure your account with a strong password.</p>
                </div>

                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl">
                    <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-white" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
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
