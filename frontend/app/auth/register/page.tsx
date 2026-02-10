"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Github,
    Chrome,
    ArrowRight,
    CheckCircle2,
    Lock,
    Mail,
    User,
    Building2,
    ShieldCheck,
    Loader2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function RegisterPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    // Form State
    const searchParams = useSearchParams();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [companyName, setCompanyName] = useState('');
    const [password, setPassword] = useState('');

    const { mutate: handleRegister, isPending } = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`${API_URL}/auth/register`, {
                name: fullName,
                email,
                password,
                companyName
            });
            return response.data;
        },
        onSuccess: (data) => {
            console.log("Registration success:", data);
            // Assuming the API returns user and token structure similar to login
            // If the API automatically logs them in, great. 
            // If not, we might need to redirect to login or auto-login.
            // Based on typical auth flows, we usually get a token back.
            if (data.token && data.user) {
                login(data.user, data.token);
                toast.success("Workspace created successfully!");
                router.push('/dashboard');
            } else {
                toast.success("Account created! Please log in.");
                router.push('/auth/login');
            }
        },
        onError: (error: any) => {
            console.error("Registration error:", error);
            const message = error.response?.data?.error || "Registration failed. Please try again.";
            toast.error(message);
        }
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !email || !companyName || !password) {
            toast.error("Please fill in all fields");
            return;
        }
        handleRegister();
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Left Pane - Branding & Social Proof */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-900 opacity-90" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />

                <div className="relative z-10 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-3xl text-blue-600 shadow-2xl">A</div>
                    <span className="text-3xl font-black tracking-tighter text-white">Atlantic</span>
                </div>

                <div className="relative z-10 space-y-8">
                    <h2 className="text-6xl font-black text-white leading-tight tracking-tighter">
                        Build your <br />
                        <span className="text-blue-200">financial stream.</span>
                    </h2>
                    <ul className="space-y-6">
                        <li className="flex items-center space-x-4 text-blue-100 font-bold">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                            <span>Instant card issuance (Virtual & Physical)</span>
                        </li>
                        <li className="flex items-center space-x-4 text-blue-100 font-bold">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                            <span>Developer-first API infrastructure</span>
                        </li>
                        <li className="flex items-center space-x-4 text-blue-100 font-bold">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                            <span>Bank-grade security & compliance</span>
                        </li>
                    </ul>
                </div>

                <div className="relative z-10 flex items-center space-x-4 text-blue-200">
                    <p className="text-sm font-bold uppercase tracking-widest">Trusted by builders at</p>
                    <div className="flex space-x-4">
                        <span className="font-black">GITHUB</span>
                        <span className="font-black">STRIPE</span>
                        <span className="font-black">AWS</span>
                    </div>
                </div>
            </div>

            {/* Right Pane - Consolidated Register Form */}
            <div className="flex-1 flex flex-col justify-center p-8 md:p-20 relative bg-slate-950 overflow-y-auto">
                <div className="max-w-md w-full mx-auto space-y-10 py-10">
                    <div className="space-y-2">
                        <Link href="/" className="lg:hidden inline-flex items-center space-x-2 text-blue-500 font-black tracking-tighter text-2xl mb-8">
                            <span>Atlantic</span>
                        </Link>
                        <h1 className="text-4xl font-black text-white tracking-tight">Create Workspace</h1>
                        <p className="text-slate-500 font-bold text-sm">Join the ecosystem in seconds. Personal or Enterprise.</p>
                    </div>

                    {/* Social Auth Buttons - Highly Visible as requested */}
                    <div className="grid grid-cols-2 gap-4">
                        <SocialButton icon={Chrome} label="Google" />
                        <SocialButton icon={Github} label="Github" />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                        <div className="relative flex justify-center text-xs uppercase font-black tracking-[0.3em]"><span className="bg-slate-950 px-4 text-slate-700">Or with email</span></div>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                icon={User}
                                label="Full Name"
                                placeholder="Alex Rivera"
                                value={fullName}
                                onChange={(e: any) => setFullName(e.target.value)}
                            />
                            <InputField
                                icon={Mail}
                                label="Work Email"
                                placeholder="alex@company.com"
                                type="email"
                                value={email}
                                onChange={(e: any) => setEmail(e.target.value)}
                            />
                        </div>
                        <InputField
                            icon={Building2}
                            label="Company Name"
                            placeholder="Acme Inc."
                            value={companyName}
                            onChange={(e: any) => setCompanyName(e.target.value)}
                        />
                        <InputField
                            icon={Lock}
                            label="Password"
                            placeholder="••••••••"
                            type="password"
                            value={password}
                            onChange={(e: any) => setPassword(e.target.value)}
                        />

                        <div className="flex items-center space-x-3 p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Auto-KYC enabled. Verification takes 3-5 mins.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex w-full justify-center items-center space-x-3 bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Initialize My Console</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm font-bold text-slate-500">
                        Already registered? <Link href="/auth/login" className="text-blue-500 hover:text-white transition-colors">Sign In</Link>
                    </p>

                    <div className="text-center">
                        <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em] leading-relaxed">
                            By clicking initialize, you agree to our <br />
                            <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SocialButton({ icon: Icon, label }: any) {
    return (
        <button type="button" className="flex items-center justify-center space-x-3 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all group">
            <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            <span className="text-sm font-bold text-white">{label}</span>
        </button>
    )
}

function InputField({ icon: Icon, label, placeholder, type = "text", value, onChange }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all placeholder:text-slate-700"
                    placeholder={placeholder}
                    required
                />
            </div>
        </div>
    )
}
