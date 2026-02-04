"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                            <Zap className="w-4 h-4 mr-2" />
                            The Future of Fintech is Here
                        </span>
                        <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
                            The Operating System for <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                                Modern Finance
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Atlantic provides the ultimate infrastructure for card issuance,
                            double-entry ledgers, and real-time fraud prevention.
                            Build your financial product on the rock.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center group shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                            >
                                Start Building
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all">
                                View Documentation
                            </button>
                        </div>
                    </motion.div>

                    {/* Trust badges/Features */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 items-center border-t border-slate-800/50 pt-10"
                    >
                        <div className="flex items-center justify-center space-x-3 text-slate-500">
                            <Shield className="w-6 h-6 text-blue-500/50" />
                            <span className="font-medium">PCI-DSS Compliant</span>
                        </div>
                        <div className="flex items-center justify-center space-x-3 text-slate-500 border-x border-slate-800/50">
                            <Zap className="w-6 h-6 text-yellow-500/50" />
                            <span className="font-medium">JIT Funding Ready</span>
                        </div>
                        <div className="flex items-center justify-center space-x-3 text-slate-500">
                            <BarChart3 className="w-6 h-6 text-purple-500/50" />
                            <span className="font-medium">Immutable Ledger</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
