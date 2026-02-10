"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, Search, Bell, Zap, Sparkles, ChevronRight } from "lucide-react";
// Removed duplicate import
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSandboxActive] = useState(true); // Simulated trial state

    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && !isAuthenticated) {
            toast.error("Please log in to access the console.");
            router.push('/auth/login');
        }
    }, [isMounted, isAuthenticated, router]);

    if (!isMounted) {
        return null; // Or a loading spinner
    }

    if (!isAuthenticated) {
        return null; // Prevent flash of content
    }

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none" />

            <Sidebar
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={() => setIsMobileMenuOpen(false)}
            />

            <main className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Sandbox Trial Banner */}
                {isSandboxActive && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-2 px-4 relative z-[30] flex items-center justify-center space-x-4">
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            You are in <span className="underline underline-offset-2">Sandbox Mode</span>. Real-world issuing available upon completion of KYB.
                        </p>
                        <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">
                            Upgrade & Verify
                        </button>
                    </div>
                )}

                <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-slate-950/50 backdrop-blur-xl shrink-0">
                    <div className="flex items-center flex-1 gap-8">
                        {/* Hamburger Menu Button (Mobile Only) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden text-slate-400 hover:text-white transition-all p-2 -ml-2 rounded-xl hover:bg-white/5 active:scale-95"
                            aria-label="Open menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="hidden md:flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                                <h1 className="text-sm font-black text-white uppercase tracking-widest leading-none">Global Workspace</h1>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                                    Primary Rails <ChevronRight className="w-3 h-3 text-slate-700" /> <span className="text-blue-500">Node_TX_492</span>
                                </p>
                            </div>
                        </div>

                        {/* Global Search */}
                        <div className="hidden lg:flex flex-1 max-w-md relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by trace ID, card, or merchant..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-slate-600">CMD + K</div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-slate-950" />
                        </button>
                        <div className="h-8 w-[1px] bg-white/5 mx-2" />
                        <div className="flex items-center space-x-3 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center text-[10px] font-black shadow-lg">
                                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'JD'}
                            </div>
                            <div className="hidden xl:block">
                                <p className="text-xs font-black text-white leading-none">{user?.name || 'Demo User'}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                    {user?.email || 'Admin Account'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>

                    {/* Console Footer */}
                    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 flex items-center justify-between border-t border-white/5 opacity-30">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Vault Engine v2.4.0</p>
                        <div className="flex items-center space-x-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Link href="#" className="hover:text-white">API Docs</Link>
                            <Link href="#" className="hover:text-white">System Status</Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
