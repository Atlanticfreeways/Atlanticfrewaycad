"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle, Loader2, Building2, User } from 'lucide-react';
import { ModernNavbar, ModernFooter } from '@/components/landing/ModernLayout';
import { toast } from 'sonner';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsPending(false);
        setSubmitted(true);
        toast.success("Message sent! We'll be in touch shortly.");
    };

    return (
        <div className="bg-zinc-950 min-h-screen text-white selection:bg-blue-600/30">
            <ModernNavbar />

            <main className="pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center space-y-6 mb-16">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                            <Mail className="w-3 h-3" />
                            <span>Sales & Support</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]">
                            Get in <span className="text-blue-500">touch.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-zinc-400 font-medium">
                            Whether you&apos;re exploring enterprise options or need technical assistance, our team is ready to help.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl space-y-6">
                                <h3 className="text-2xl font-bold">Enterprise Sales</h3>
                                <p className="text-zinc-500">For high-volume card issuance and custom integrations.</p>
                                <Link href="mailto:sales@atlantic.money" className="flex items-center space-x-3 text-blue-500 font-bold hover:text-white transition-colors">
                                    <Mail className="w-5 h-5" />
                                    <span>sales@atlantic.money</span>
                                </Link>
                            </div>

                            <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl space-y-6">
                                <h3 className="text-2xl font-bold">Developer Support</h3>
                                <p className="text-zinc-500">Technical questions about our API, SDKs, or Sandbox environment.</p>
                                <Link href="mailto:dev@atlantic.money" className="flex items-center space-x-3 text-blue-500 font-bold hover:text-white transition-colors">
                                    <Code2Icon className="w-5 h-5" />
                                    <span>dev@atlantic.money</span>
                                </Link>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl">
                            {submitted ? (
                                <div className="text-center space-y-6 py-12">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-white">Message Received</h3>
                                        <p className="text-zinc-500">
                                            Thank you for contacting us. A member of our team will respond within 24 hours.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="text-blue-500 font-bold hover:text-white transition-colors"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={onSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">First Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                                <input required type="text" className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-800" placeholder="Jane" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Last Name</label>
                                            <input required type="text" className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-800" placeholder="Doe" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Work Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                            <input required type="email" className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-800" placeholder="jane@company.com" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Company Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                            <input type="text" className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-800" placeholder="Acme Inc." />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Message</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-zinc-600" />
                                            <textarea required rows={4} className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-800 resize-none" placeholder="Tell us about your project..." />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Send Message</span><Send className="w-4 h-4" /></>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <ModernFooter />
        </div>
    );
}

function Code2Icon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m18 16 4-4-4-4" />
            <path d="m6 8-4 4 4 4" />
            <path d="m14.5 4-5 16" />
        </svg>
    )
}
