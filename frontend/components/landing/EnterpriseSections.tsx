"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Star, Quote } from 'lucide-react';
import Link from 'next/link';

export function LandingMarquee() {
    const brands = ["Goldman", "Stripe", "Marqeta", "Plaid", "Brex", "Ramp", "Visa", "Mastercard"];
    return (
        <div className="py-20 bg-slate-950 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 z-10 pointer-events-none" />
            <p className="text-center text-slate-500 text-sm font-bold uppercase tracking-[0.3em] mb-12">Trusted by Infrastructure Leaders</p>
            <div className="flex space-x-12 animate-marquee whitespace-nowrap">
                {[...brands, ...brands].map((brand, i) => (
                    <span key={i} className="text-4xl md:text-5xl font-black text-slate-800 hover:text-white transition-colors cursor-default select-none">
                        {brand}.
                    </span>
                ))}
            </div>
        </div>
    );
}

export function Pricing() {
    const plans = [
        {
            name: "Starter",
            price: "$0",
            desc: "For early stage startups",
            features: ["Up to 5 virtual cards", "Basic ledger exports", "Next-day funding", "Standard support"],
            color: "slate"
        },
        {
            name: "Enterprise",
            price: "Custom",
            desc: "For global platforms",
            features: ["Unlimited virtual cards", "Real-time ledger API", "JIT funding (Instant)", "Dedicated account manager", "Custom compliance flows"],
            color: "blue",
            featured: true
        },
        {
            name: "API Only",
            price: "Usage Based",
            desc: "For builders needing rails",
            features: ["Full API access", "Webhooks & Events", "Developer sandbox", "Email support"],
            color: "purple"
        }
    ];

    return (
        <section className="py-32 bg-slate-950 relative" id="pricing">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Enterprise-Grade Pricing</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">Transparent, scalable pricing that grows with your transaction volume.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <div key={i} className={clsx(
                            "glass-card p-8 md:p-10 rounded-[2rem] border transition-all duration-500 hover:scale-[1.02]",
                            plan.featured ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_40px_rgba(37,99,235,0.1)]" : "border-white/5"
                        )}>
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                                    {plan.price !== "Custom" && <span className="text-slate-500 font-bold text-sm">/mo</span>}
                                </div>
                                <p className="text-slate-500 mt-2 font-medium">{plan.desc}</p>
                            </div>

                            <div className="space-y-4 mb-10">
                                {plan.features.map((f, j) => (
                                    <div key={j} className="flex items-start space-x-3 text-sm font-medium text-slate-300">
                                        <div className="mt-1 w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-blue-500" />
                                        </div>
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/auth/register"
                                className={clsx(
                                    "w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all",
                                    plan.featured ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-white/5 hover:bg-white/10 text-white"
                                )}
                            >
                                <span>Get Started</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function Testimonials() {
    const testimonials = [
        {
            quote: "Atlantic allowed us to launch our corporate card program in weeks instead of months. Their JIT funding API is the best in the industry.",
            author: "Sarah Chen",
            role: "CTO at FinScale",
            avatar: "SC"
        },
        {
            quote: "The ledger consistency and reconciliation tools are world-class. We've never had a reporting mismatch since switching.",
            author: "Michael Ross",
            role: "Head of Infrastructure at GlobalPay",
            avatar: "MR"
        }
    ];

    return (
        <section className="py-32 bg-slate-900/20 border-y border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <Star className="w-3 h-3 fill-current" />
                            <span>Client Stories</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight leading-[1.1]">
                            The standard for <br />
                            <span className="text-slate-500">Modern Fintech.</span>
                        </h2>
                        <div className="flex items-center space-x-8 opacity-50 grayscale">
                            {/* Small mock icons for more social proof */}
                            <div className="font-black text-2xl">FAST.</div>
                            <div className="font-black text-2xl">SAFE.</div>
                            <div className="font-black text-2xl">GLOBAL.</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {testimonials.map((t, i) => (
                            <div key={i} className="glass-card p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all cursor-default">
                                <Quote className="w-10 h-10 text-blue-500/20 mb-4" />
                                <p className="text-lg font-medium text-slate-300 leading-relaxed mb-6 italic">"{t.quote}"</p>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center font-bold">{t.avatar}</div>
                                    <div>
                                        <p className="font-bold text-white leading-none mb-1">{t.author}</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
