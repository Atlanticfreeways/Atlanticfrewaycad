"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "Is Atlantic a bank?",
        answer: "Atlantic is a financial technology company, not a bank. Banking services are provided by our partner banks, Members FDIC. Cards are issued by Atlantic's partner banks pursuant to a license from Visa U.S.A. Inc."
    },
    {
        question: "How does the 30-day free trial work?",
        answer: "You get full access to the Atlantic Enterprise plan for 30 days. This includes unlimited virtual cards, API access, and multi-currency ledgers. No credit card is required to start the trial."
    },
    {
        question: "What currencies do you support?",
        answer: "We support settlement in 35+ currencies including USD, EUR, GBP, CAD, AUD, and SGD. You can hold balances in multiple currencies and convert instantly at interbank rates."
    },
    {
        question: "Can I issue physical cards?",
        answer: "Yes, you can issue physical corporate cards to your team members. We support customized card designs with your company logo. Physical cards can be shipped to over 80 countries."
    },
    {
        question: "Is the API fully documented?",
        answer: "Absolutely. Our API is designed for developers, by developers. We provide comprehensive documentation, SDKs in Node.js, Python, and Go, and a dedicated sandbox environment for testing."
    }
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-32 px-4 relative overflow-hidden bg-slate-950">
            <div className="max-w-3xl mx-auto space-y-16 relative z-10">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <HelpCircle className="w-3 h-3" />
                        <span>Common Questions</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        Everything you need <br />
                        <span className="text-slate-500">to know.</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>
            </div>

            {/* Background Gradient */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
        </section>
    );
}

function FAQItem({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-6 md:p-8 rounded-3xl transition-all duration-300 border ${isOpen ? 'bg-slate-900 border-blue-500/30 shadow-lg shadow-blue-900/10' : 'bg-slate-900/30 border-white/5 hover:border-white/10'}`}
        >
            <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold pr-8 transition-colors ${isOpen ? 'text-white' : 'text-slate-400'}`}>
                    {question}
                </h3>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-800 text-slate-500'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pt-4 text-slate-400 leading-relaxed text-sm md:text-base pr-8">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}
