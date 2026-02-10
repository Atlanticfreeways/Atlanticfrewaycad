"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, Code2, Globe, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { ModernNavbar, ModernFooter } from '@/components/landing/ModernLayout';
import { CardShowcase } from '@/components/landing/CardShowcase';
import { IssuanceSpecs } from '@/components/landing/IssuanceSpecs';
import { ProductSpotlight } from '@/components/landing/ProductSpotlight';
import { Pricing, LandingMarquee, Testimonials } from '@/components/landing/EnterpriseSections';
import { CookieConsent } from '@/components/landing/CookieConsent';
import { FAQSection } from '@/components/landing/FAQSection';

export default function LandingPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white selection:bg-blue-600/30">
      {/* Sandbox Top-Bar */}
      <div className="bg-blue-600 py-3 px-4 relative z-[60]">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Instant Access Available</span>
          <div className="w-[1px] h-3 bg-white/20" />
          <Link href="/auth/register" className="flex items-center space-x-2 group">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Initialize your sandbox in 30 seconds</span>
            <ArrowRight className="w-3 h-3 group-hover:tranzinc-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <ModernNavbar />

      <main>
        {/* Hero Section */}
        <section className="pt-48 pb-20 px-4 md:px-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />

          <div className="max-w-7xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>instant access available...</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.9] text-glow"
            >
              Issuing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-blue-600">Reinvented.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-3xl mx-auto text-lg md:text-xl text-zinc-400 font-medium leading-relaxed"
            >
              Deploy physical and virtual card fleets instantly. Global ledger, high-speed rails,
              and bank-grade compliance built for the next generation of fintech innovators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link
                href="/auth/register"
                className="group w-full sm:w-auto bg-white text-black px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-zinc-100 transition-all active:scale-95 shadow-2xl shadow-white/5 flex items-center justify-center space-x-3"
              >
                <span>Get Your Card</span>
                <ArrowRight className="w-5 h-5 group-hover:tranzinc-x-2 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto bg-white/5 border border-white/10 px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-white/10 transition-all flex items-center justify-center"
              >
                Sign In
              </Link>
            </motion.div>
          </div>

          <div className="mt-32 max-w-7xl mx-auto">
            <LandingMarquee />
          </div>
        </section>

        <div id="products">
          <CardShowcase />
        </div>

        <div>
          <ProductSpotlight />
        </div>

        <div>
          <IssuanceSpecs />
        </div>

        <div id="solutions" className="py-32 bg-zinc-900/30">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <MainFeature icon={ShieldCheck} title="Compliance Hub" desc="SOC2, PCI-DSS, and KYB automated." />
              <MainFeature icon={Globe} title="180+ Countries" desc="Global settlement rails established." />
              <MainFeature icon={Code2} title="Developer API" desc="Modern SDKs for every language." />
              <MainFeature icon={Cpu} title="Deep Core" desc="Proprietary high-speed ledger." />
            </div>
          </div>
        </div>

        <div id="pricing">
          <Pricing />
        </div>

        <div>
          <Testimonials />
        </div>

        <div>
          <FAQSection />
        </div>

        {/* Final CTA */}
        <section className="py-40 px-4">
          <div className="max-w-5xl mx-auto glass-card rounded-[3.5rem] p-12 md:p-24 text-center space-y-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/10 blur-[80px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              Ready to build the <br />
              <span className="text-blue-500">future of money?</span>
            </h2>
            <p className="max-w-2xl mx-auto text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">
              Join 5,000+ companies using Atlantic to power their financial products.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-600/30 active:scale-95 transition-all">Start Your Trial</Link>
              <Link href="/contact" className="text-blue-500 font-black uppercase tracking-[0.2em] text-xs hover:text-white transition-colors">Contact Sales Force</Link>
            </div>
          </div>
        </section>
      </main>

      <ModernFooter />
      <CookieConsent />
    </div>
  );
}

function MainFeature({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 glass-card rounded-3xl border border-white/5 space-y-6 group hover:border-blue-500/20 transition-all">
      <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
        <Icon className="w-6 h-6 text-blue-500 group-hover:text-white" />
      </div>
      <div>
        <h4 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h4>
        <p className="text-sm text-zinc-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
