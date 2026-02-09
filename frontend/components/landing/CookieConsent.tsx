"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem('atlantic-cookie-consent');
        if (!consent) {
            // Delay slightly for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('atlantic-cookie-consent', 'true');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
                >
                    <div className="max-w-7xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-600/10 rounded-xl hidden md:block">
                                <Cookie className="w-6 h-6 text-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-white font-bold text-sm">We use cookies to improve your experience.</h4>
                                <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
                                    By using our website, you acknowledge that you have read and understand our <Link href="#" className="text-blue-400 hover:text-white transition-colors">Cookie Policy</Link>, <Link href="#" className="text-blue-400 hover:text-white transition-colors">Privacy Policy</Link>, and our <Link href="#" className="text-blue-400 hover:text-white transition-colors">Terms of Service</Link>.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => setIsVisible(false)}
                                className="flex-1 md:flex-none py-3 px-6 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Decline
                            </button>
                            <button
                                onClick={acceptCookies}
                                className="flex-1 md:flex-none py-3 px-8 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
