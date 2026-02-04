"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Github,
    Chrome,
    ArrowRight,
    Lock,
    Mail,
    AlertCircle,
    Fingerprint,
    Zap
} from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Left Pane - Narrative */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 border-r border-white/5 relative overflow-hidden flex-col justify-between p-20">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1e40af 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-32 -mt-32" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">A</div>
                        <span className="text-2xl font-black tracking-tighter text-white">Atlantic</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                            <Zap className="w-3 h-3 fill-current" />
                            <span>v2 Launchpad Ready</span>
                        </div>
                        <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tighter">
                            Manage your <br />
                            <span className="text-blue-500">financial ecosystem.</span>
                        </h2>
                    </div>
                    <p className="max-w-md text-slate-500 font-medium text-lg leading-relaxed">
                        Access your global ledger, monitor card issuance in real-time, and deploy capital across 180+ regions.
                    </p>
                </div>

                <div className="relative z-10 pt-10 border-t border-white/5">
                    <div className="flex items-center space-x-12 opacity-50">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Uptime</p>
                            <p className="text-sm font-bold text-slate-400">99.99%</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Global Ops</p>
                            <p className="text-sm font-bold text-slate-400">24/7/365</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Audited</p>
                            <p className="text-sm font-bold text-slate-400">AICPA SOC2</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pane - High Volume Login */}
            <div className="flex-1 flex flex-col justify-center p-8 md:p-20 relative bg-slate-950">
                <div className="max-w-md w-full mx-auto space-y-10">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white tracking-tight">Welcome back</h1>
                        <p className="text-slate-500 font-bold text-sm">Secure authorization required for console access.</p>
                    </div>

                    {/* All Auth Buttons - Social + Standard on same page */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center space-x-3 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all group">
                            <Chrome className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                            <span className="text-sm font-bold text-white">Google</span>
                        </button>
                        <button className="flex items-center justify-center space-x-3 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all group">
                            <Github className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                            <span className="text-sm font-bold text-white">Github</span>
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                        <div className="relative flex justify-center text-xs uppercase font-black tracking-[0.3em]"><span className="bg-slate-950 px-4 text-slate-700">Enterprise Auth</span></div>
                    </div>

                    <form className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Identity (Work Email)</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all placeholder:text-slate-700"
                                    placeholder="alex@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secret Key</label>
                                <Link href="#" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-white">Recover Access</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all placeholder:text-slate-700"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Link
                            href="/dashboard"
                            className="flex w-full justify-center items-center space-x-3 bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all active:scale-95 shadow-xl shadow-white/5"
                        >
                            <span>Enter Console</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </form>

                    <div className="flex items-center justify-between pt-6">
                        <button className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors group">
                            <Fingerprint className="w-5 h-5 group-hover:text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Biometric Access</span>
                        </button>
                        <p className="text-sm font-bold text-slate-500">
                            New here? <Link href="/auth/register" className="text-blue-500 hover:text-white transition-colors">Join Atlantic</Link>
                        </p>
                    </div>

                    <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex items-start space-x-3">
                        <AlertCircle className="w-4 h-4 text-slate-600 mt-0.5" />
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                            For security purposes, we may require multi-factor authentication for login attempts from unauthorized networks.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
