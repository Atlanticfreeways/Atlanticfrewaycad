"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    CreditCard,
    Building2,
    ShieldCheck,
    Code2,
    Zap,
    Globe,
    Github,
    Twitter,
    Linkedin
} from 'lucide-react';

export function ModernNavbar() {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    return (
        <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-zinc-950/70 backdrop-blur-2xl z-50">
            <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center space-x-12">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white">Atlantic</span>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-8">
                        <NavMenuItem
                            label="Products"
                            isActive={activeMenu === 'products'}
                            onMouseEnter={() => setActiveMenu('products')}
                            onMouseLeave={() => setActiveMenu(null)}
                        >
                            <div className="grid grid-cols-2 gap-4 p-6 w-[400px]">
                                <SubNavItem icon={CreditCard} title="Virtual Cards" desc="Instant digital issuing." />
                                <SubNavItem icon={Building2} title="Corporate Cards" desc="Physical high-limit cards." />
                                <SubNavItem icon={Zap} title="JIT Funding" desc="Zero-balance liquidity." />
                                <SubNavItem icon={ShieldCheck} title="Compliance" desc="KYC/KYB as a service." />
                            </div>
                        </NavMenuItem>

                        <NavMenuItem
                            label="Solutions"
                            isActive={activeMenu === 'solutions'}
                            onMouseEnter={() => setActiveMenu('solutions')}
                            onMouseLeave={() => setActiveMenu(null)}
                        >
                            <div className="grid grid-cols-1 gap-4 p-6 w-[300px]">
                                <SubNavItem icon={Globe} title="Platform Banking" desc="Embed banking in your app." />
                                <SubNavItem icon={Code2} title="API Infrastructure" desc="The developer's first choice." />
                            </div>
                        </NavMenuItem>



                        <Link href="#pricing" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Pricing</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <Link href="/auth/login" className="text-sm font-bold text-white hover:text-blue-500 transition-colors">Sign In</Link>
                    <Link href="/auth/register" className="bg-white text-black px-6 py-3 rounded-2xl text-sm font-black hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                        Launch Console
                    </Link>
                </div>
            </div>
        </nav>
    );
}

function NavMenuItem({ label, children, isActive, onMouseEnter, onMouseLeave }: any) {
    return (
        <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <button className="flex items-center space-x-1 text-sm font-bold text-zinc-400 hover:text-white transition-colors py-8">
                <span>{label}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isActive ? "rotate-180" : "")} />
            </button>
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 top-full -mt-2 bg-zinc-900 border border-white/10 rounded-3xl shadow-3xl overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function SubNavItem({ icon: Icon, title, desc }: any) {
    return (
        <Link href="/auth/register" className="flex items-start space-x-4 p-3 rounded-2xl hover:bg-white/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Icon className="w-5 h-5 text-blue-500 group-hover:text-white" />
            </div>
            <div>
                <p className="text-sm font-bold text-white mb-0.5">{title}</p>
                <p className="text-[10px] font-medium text-zinc-500">{desc}</p>
            </div>
        </Link>
    )
}

export function ModernFooter() {
    return (
        <footer className="bg-zinc-950 border-t border-white/5 pt-32 pb-20 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -tranzinc-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-24">
                    <div className="col-span-2 space-y-8">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl uppercase">A</div>
                            <span className="text-xl font-bold tracking-tight text-white">Atlantic</span>
                        </Link>
                        <p className="text-zinc-500 text-sm font-medium max-w-xs leading-relaxed">
                            Infrastructure for the next generation of financial technology. Licensed and regulated for global scale.
                        </p>
                        <div className="flex items-center space-x-4">
                            <SocialLink icon={Twitter} />
                            <SocialLink icon={Linkedin} />
                            <SocialLink icon={Github} />
                        </div>
                    </div>

                    <div>
                        <FooterHeading>Platform</FooterHeading>
                        <FooterList items={["Card Issuing", "Global Ledger", "Compliance Engine", "Risk Management"]} />
                    </div>

                    <div>
                        <FooterHeading>Resources</FooterHeading>
                        <FooterList items={["Documentation", "API Reference", "System Status", "Merchant Intel"]} />
                    </div>

                    <div>
                        <FooterHeading>Company</FooterHeading>
                        <FooterList items={["About Atlantic", "Contact Sales", "Legal & Privacy", "Service Terms"]} />
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center space-x-8">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">© 2026 Atlantic Financial Inc.</p>
                        <div className="flex items-center space-x-4 grayscale opacity-30">
                            <div className="text-[10px] font-black text-white border border-white/20 px-2 py-0.5 rounded">PCI COMPLIANT</div>
                            <div className="text-[10px] font-black text-white border border-white/20 px-2 py-0.5 rounded">SOC2 TYPE II</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon: Icon }: any) {
    return (
        <Link href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
            <Icon className="w-5 h-5" />
        </Link>
    )
}

function FooterHeading({ children }: any) {
    return <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">{children}</h4>;
}

function FooterList({ items }: { items: string[] }) {
    const getLink = (item: string) => {
        if (item === "Contact Sales") return "/contact";
        return "/auth/register";
    };

    return (
        <ul className="space-y-4">
            {items.map(item => (
                <li key={item}>
                    <Link href={getLink(item)} className="text-sm font-bold text-zinc-500 hover:text-blue-500 transition-colors">{item}</Link>
                </li>
            ))}
        </ul>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
