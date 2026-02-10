"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Wifi,
    Zap,
    Smartphone,
    History,
    ArrowRight
} from 'lucide-react';

export function CardShowcase() {
    return (
        <section className="py-32 relative overflow-hidden bg-slate-950">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center mb-24 space-y-6">
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter text-glow">
                        One Rail. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Infinite Skins.</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">
                        From physical metal to instant virtual, manage your entire fleet from one console.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Visualizer Side */}
                    <div className="relative group perspective-1000">
                        <motion.div
                            initial={{ rotateX: 20, rotateY: -20 }}
                            whileHover={{ rotateX: 0, rotateY: 0 }}
                            className="relative z-10 w-full aspect-[1.586/1] rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-black border border-white/20 p-12 shadow-3xl shadow-blue-500/20 transition-all duration-700 preserves-3d"
                        >
                            {/* Card Chip */}
                            <div className="w-16 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/40 rounded-xl border border-yellow-500/30 flex flex-col justify-center px-2 space-y-1 mb-16 overflow-hidden">
                                <div className="h-[1px] bg-yellow-500/30 w-full" />
                                <div className="h-[1px] bg-yellow-500/30 w-full" />
                                <div className="h-[1px] bg-yellow-500/30 w-full" />
                            </div>

                            <div className="space-y-12">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-4">
                                        <p className="text-2xl font-black text-white tracking-[0.3em]">4242 8891 0021 1022</p>
                                        <div className="flex items-center space-x-12">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valid Thru</p>
                                                <p className="text-sm font-bold text-slate-200">12/28</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CVV</p>
                                                <p className="text-sm font-bold text-slate-200">***</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Wifi className="w-8 h-8 text-white/20 rotate-90" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xl font-black text-white tracking-tighter">NORTHERN SYSTEMS</p>
                                    <div className="w-12 h-8 flex items-center -space-x-4">
                                        <div className="w-8 h-8 rounded-full bg-red-600/80" />
                                        <div className="w-8 h-8 rounded-full bg-yellow-400/80" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Shadow/Ghost Card */}
                        <div className="absolute inset-0 bg-blue-600/20 blur-[60px] rounded-[2rem] -z-10 group-hover:bg-blue-600/30 transition-all" />
                    </div>

                    {/* Features Side */}
                    <div className="space-y-12">
                        <FeatureCard
                            icon={Zap}
                            title="Instant Virtual Issuance"
                            desc="Don't wait for the mail. Generate unlimited virtual cards with custom spending rules in < 200ms."
                        />
                        <FeatureCard
                            icon={Smartphone}
                            title="Apple & Google Pay"
                            desc="Full support for mobile wallets with real-time push-provisioning directly from the console."
                        />
                        <FeatureCard
                            icon={History}
                            title="Programmable Controls"
                            desc="Restrict spend by Merchant Category Code (MCC), time of day, or specific merchant UUIDs."
                        />

                        <div className="pt-8">
                            <button className="flex items-center space-x-3 text-blue-500 font-black uppercase tracking-widest hover:text-white transition-colors group">
                                <span>Explore Infrastructure</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="flex items-start space-x-6 group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-500">
                <Icon className="w-6 h-6 text-blue-500 group-hover:text-white" />
            </div>
            <div>
                <h4 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">{title}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
