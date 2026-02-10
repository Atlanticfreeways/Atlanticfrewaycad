"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Truck,
    Code2,
    ShieldCheck,
    Zap,
    ArrowRight
} from 'lucide-react';

const specs = [
    {
        title: "Physical Cards",
        icon: Truck,
        details: [
            "Next-day worldwide shipping",
            "Custom embossing & etching",
            "Metal, PVC, and Bio-plastic skins",
            "NFC-enabled hardware"
        ]
    },
    {
        title: "Virtual Engine",
        icon: Zap,
        details: [
            "Instant PAN generation",
            "Dynamic CVV rotation",
            "Merchant-specific locking",
            "Single-use tokenization"
        ]
    },
    {
        title: "Developer First",
        icon: Code2,
        details: [
            "GraphQL & RESTful Endpoints",
            "Real-time Webhook firing",
            "Idempotent issuance keys",
            "Sandbox-to-Prod in 1 click"
        ]
    }
];

export function IssuanceSpecs() {
    return (
        <section className="py-32 bg-slate-900/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row gap-20">
                    <div className="lg:w-1/3 space-y-8">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3 fill-current" />
                            <span>Bank-Grade Infrastructure</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                            The Engine <br />
                            <span className="text-blue-500">Behind the Plastic.</span>
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            We don&apos;t just print cards. We provide the programmable rails that allow you to move capital at the speed of light, with compliance baked into every byte.
                        </p>
                        <div className="pt-4">
                            <button className="flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                                <span>View Technical Specs</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="lg:w-2/3 grid md:grid-cols-3 gap-8">
                        {specs.map((spec, idx) => (
                            <motion.div
                                key={spec.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-8 group hover:border-blue-500/20 transition-all"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                    <spec.icon className="w-6 h-6 text-blue-500 group-hover:text-white" />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xl font-bold text-white tracking-tight">{spec.title}</h4>
                                    <ul className="space-y-3">
                                        {spec.details.map(detail => (
                                            <li key={detail} className="flex items-center space-x-3 text-sm text-slate-500 font-medium lowercase">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Technical Payload Preview */}
                <div className="mt-24 glass-card rounded-[3rem] border border-white/5 overflow-hidden group">
                    <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-12 border-b md:border-b-0 md:border-r border-white/5 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-white tracking-tight">API Command Center</h3>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active</span>
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Our card-issuance endpoint is optimized for high-concurrency environments. Issue 1,000+ cards in a single batch with atomic transaction safety.
                            </p>
                            <div className="flex items-center space-x-6 pt-4">
                                <div className="text-center">
                                    <p className="text-xl font-bold text-white tracking-tight">200ms</p>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Latency</p>
                                </div>
                                <div className="w-[1px] h-10 bg-white/5" />
                                <div className="text-center">
                                    <p className="text-xl font-bold text-white tracking-tight">99.99%</p>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Uptime</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-950 p-8 font-mono text-xs overflow-x-auto">
                            <div className="flex items-center space-x-2 mb-6 text-slate-700">
                                <span className="bg-white/5 px-2 py-1 rounded">POST</span>
                                <span>/v1/issuance/cards</span>
                            </div>
                            <pre className="text-blue-400 space-y-2">
                                {`{
  "type": "VIRTUAL_PREPAID",
  "funding": "JIT",
  "limits": {
    "daily": 5000.00,
    "mccs": ["4814", "4816"]
  },
  "metadata": {
    "node_id": "tx_92831",
    "project": "neptune"
  }
}`}
                            </pre>
                            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                <p className="text-slate-700 uppercase tracking-widest">Response -&gt; 201 Created</p>
                                <button className="text-blue-500 font-bold hover:text-white transition-colors">Copy Payload</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
