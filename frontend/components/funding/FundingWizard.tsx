"use client";

import { useState } from "react";
import { ArrowRight, Building2, CheckCircle, Globe, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api"; // Assuming default export is axios instance or similar wrapper

interface FundingSession {
    type: string;
    provider: string;
    session: any;
}

export function FundingWizard() {
    const [step, setStep] = useState<"region" | "provider" | "success">("region");
    const [country, setCountry] = useState("US");
    const [loading, setLoading] = useState(false);
    const [sessionData, setSessionData] = useState<FundingSession | null>(null);
    const [linkedAccount, setLinkedAccount] = useState<any>(null);

    const startConnection = async () => {
        setLoading(true);
        try {
            const res = await api.post("/funding/connect/start", { countryCode: country });
            if (res.data.success) {
                setSessionData(res.data.data);
                setStep("provider");
            }
        } catch (err) {
            toast.error("Failed to initialize funding connection");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const simulateProviderFlow = async () => {
        // This simulates opening Plaid/Paystack modal and getting a token back
        setLoading(true);

        // Fake delay for "User interacting with bank modal"
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock response from SDK
        const mockResponse = {
            provider: sessionData?.provider,
            token: `mock_public_token_${Math.random()}`,
            accountId: `mock_account_${Math.random()}` // User selected account
        };

        try {
            const res = await api.post("/funding/connect/complete", mockResponse);
            if (res.data.success) {
                setLinkedAccount(res.data.data.linkedAccount);
                setStep("success");
                toast.success("Bank account connected successfully!");
            }
        } catch (err) {
            toast.error("Failed to link account");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            {step === "region" && (
                <div className="glass-card p-8 rounded-[2rem] border border-blue-500/20 bg-slate-900/50 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Select Your Region</h2>
                        <p className="text-slate-400">We use your location to match you with the best banking partners.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Country</label>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="US">United States (Plaid)</option>
                            <option value="NG">Nigeria (Paystack)</option>
                            <option value="GB">United Kingdom (TrueLayer)</option>
                            <option value="DE">Germany (TrueLayer)</option>
                        </select>
                    </div>

                    <button
                        onClick={startConnection}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Bank-grade security encryption</span>
                    </div>
                </div>
            )}

            {step === "provider" && sessionData && (
                <div className="glass-card p-8 rounded-[2rem] border border-blue-500/20 bg-slate-900/50 space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                            <Building2 className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Connect {sessionData.provider === 'plaid' ? 'Bank Account' : 'Payment Method'}</h2>
                        <p className="text-slate-400">Using secure connection via <span className="text-white font-bold capitalize">{sessionData.provider}</span></p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
                        <p>ℹ️ Since this is a specialized demo environment, clicking "Connect" will simulate the successful OAuth/SDK flow for {sessionData.provider}.</p>
                    </div>

                    <button
                        onClick={simulateProviderFlow}
                        disabled={loading}
                        className="w-full bg-white text-slate-900 hover:bg-slate-200 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Connect with ${sessionData.provider.charAt(0).toUpperCase() + sessionData.provider.slice(1)}`}
                    </button>

                    <button
                        onClick={() => setStep('region')}
                        className="w-full text-slate-500 hover:text-white p-2 text-sm transition-colors"
                    >
                        Back to Region Selection
                    </button>
                </div>
            )}

            {step === "success" && linkedAccount && (
                <div className="glass-card p-8 rounded-[2rem] border border-green-500/20 bg-green-500/5 space-y-8 animate-in zoom-in duration-300">
                    <div className="space-y-2 text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Account Connected!</h2>
                        <p className="text-slate-400">Your funding source is active.</p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Institution</span>
                            <span className="text-white font-bold">{linkedAccount.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Account</span>
                            <div className="flex items-center gap-2">
                                <span className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300 uppercase">{linkedAccount.mask}</span>
                                <span className="text-white font-medium capitalize">{linkedAccount.type}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Currency</span>
                            <span className="text-white font-bold">{linkedAccount.currency}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
}
