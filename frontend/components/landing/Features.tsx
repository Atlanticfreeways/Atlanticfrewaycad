"use client";

import { motion } from "framer-motion";
import { CreditCard, Database, ShieldCheck, Zap, Globe, Lock } from "lucide-react";

const features = [
    {
        title: "Virtual & Physical Cards",
        description: "Issue instantly available virtual cards or premium physical cards with custom branding.",
        icon: CreditCard,
        color: "blue"
    },
    {
        title: "Immutable Ledger",
        description: "Our double-entry accounting system ensures your financial data is always accurate and auditable.",
        icon: Database,
        color: "purple"
    },
    {
        title: "Real-time Fraud Shield",
        description: "Advanced velocity checks and category-based blocking stop fraud before it happens.",
        icon: ShieldCheck,
        color: "red"
    },
    {
        title: "Just-In-Time Funding",
        description: "Keep your capital efficient by funding cards exactly at the moment of authorization.",
        icon: Zap,
        color: "yellow"
    },
    {
        title: "Multi-Currency Ready",
        description: "Built-in support for global transactions and automated currency conversion.",
        icon: Globe,
        color: "cyan"
    },
    {
        title: "Enterprise Security",
        description: "PCI-DSS ready architecture with bank-grade encryption and MFA out of the box.",
        icon: Lock,
        color: "green"
    }
];

export function Features() {
    return (
        <section className="py-24 bg-slate-950">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 italic">
                        Built for Scale. <span className="text-blue-500">For Developers.</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Everything you need to launch a world-class financial product in days, not months.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-${feature.color}-500/10 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`w-6 h-6 text-${feature.color}-500`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
