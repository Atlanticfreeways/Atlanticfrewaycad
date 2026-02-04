"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Shield,
    Zap,
    Globe,
    Cpu,
    ArrowRight,
    Trophy
} from 'lucide-react';

const products = [
    {
        name: "Enterprise Metal",
        tag: "Premium",
        desc: "18g stainless steel with precision laser etching. The choice for executive fleets.",
        features: ["Priority Shipping", "No FX Fees", "Lounge Access"]
    },
    {
        name: "Ghost Virtual",
        tag: "Atomic",
        desc: "Single-use cards that vanish after one transaction. Absolute fraud protection.",
        features: ["Unlimited Cards", "Merchant Locking", "Instant API Issuing"]
    },
    {
        name: "Sustainable Bio",
        tag: "Eco-Friendly",
        desc: "High-quality degradable cards that don't compromise on durability or NFC signal.",
        features: ["Recycled Materials", "NFC Enabled", "Standard Issuing"]
    }
];

export function ProductSpotlight() {
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between mb-20">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-white tracking-tighter">Physical & Virtual <span className="text-blue-500">Fleet</span></h2>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">The industry's most versatile issuing stack</p>
                    </div>
                    <button className="hidden md:flex items-center space-x-2 text-sm font-bold text-slate-400 hover:text-white transition-all group">
                        <span>Compare all card types</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {products.map((product, idx) => (
                        <motion.div
                            key={product.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-10 rounded-[3rem] border border-white/5 flex flex-col justify-between group hover:border-blue-500/30 transition-all cursor-pointer"
                        >
                            <div className="space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <CreditCard className="w-6 h-6 text-blue-500 group-hover:text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-600/10 px-3 py-1 rounded-full uppercase tracking-widest">{product.tag}</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{product.name}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{product.desc}</p>
                                </div>
                                <ul className="space-y-4 pt-4">
                                    {product.features.map(feat => (
                                        <li key={feat} className="flex items-center space-x-3 text-xs font-bold text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button className="mt-12 w-full py-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all">
                                Select Infrastructure
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
