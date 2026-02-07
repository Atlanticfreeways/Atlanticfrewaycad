"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Fingerprint, Loader2, ScanFace, Shield, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface VerificationSession {
    success: boolean;
    verification: any;
    sdkToken?: string;
}

export function KYCWizard() {
    const [step, setStep] = useState<"intro" | "tier" | "processing" | "success">("intro");
    const [tier, setTier] = useState("standard");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<any>(null);

    const startVerification = async () => {
        setLoading(true);
        try {
            // 1. Initiate Verification
            const res = await api.post("/kyc/verify", { tier });

            if (res.data.success) {
                // In a real app, successful response with SDK token would trigger the Onfido/Persona SDK here
                // For mock, we simulate the "Processing" and "Webhook" delay
                setStep("processing");
                simulateVerificationProcess();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to start verification");
            console.error(err);
            setLoading(false);
        }
    };

    const simulateVerificationProcess = async () => {
        // Simulate SDK steps (Document upload, Selfie, etc.)
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Trigger the "Webhook" manually for this mock session to auto-approve
            // In prod, this happens server-to-server
            await api.post("/kyc/webhook/onfido", {
                applicant_id: "mock_applicant_id",
                status: "complete",
                result: "clear",
                check_id: `check_${Math.random()}`
            });

            // Fetch updated status
            const statusRes = await api.get("/kyc/status");
            setStatus(statusRes.data.verification);
            setStep("success");
            toast.success("Identity Verified Successfully!");

        } catch (err) {
            toast.error("Verification processing failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            {step === "intro" && (
                <div className="glass-card p-8 rounded-[2rem] border border-blue-500/20 bg-slate-900/50 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-2 text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Verify Your Identity</h2>
                        <p className="text-slate-400">Unlock higher limits and instant features by verifying your identity.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Select Verification Level</label>

                        <div
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${tier === 'standard' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
                            onClick={() => setTier('standard')}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-white">Standard Verification</span>
                                {tier === 'standard' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                            </div>
                            <p className="text-sm text-slate-400">Limit: $50,000/mo • Crypto Funding • Physical Cards</p>
                        </div>

                        <div
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${tier === 'turbo' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
                            onClick={() => setTier('turbo')}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-white">Turbo Verification</span>
                                {tier === 'turbo' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                            </div>
                            <p className="text-sm text-slate-400">Limit: $100,000/mo • Virtual Bank Account • ACH/Wire</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep('tier')}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        Start Verification <ArrowRight className="w-5 h-5" />
                    </button>

                    <div className="text-center text-xs text-slate-500">
                        Secure 256-bit encrypted verification powered by Onfido
                    </div>
                </div>
            )}

            {step === "tier" && (
                <div className="glass-card p-8 rounded-[2rem] border border-blue-500/20 bg-slate-900/50 space-y-8 animate-in fade-in">
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-bold text-white">Prepare Your Documents</h3>
                        <p className="text-slate-400 text-sm">You will need to scan a government-issued ID and take a selfie.</p>

                        <div className="flex justify-center gap-8 py-4">
                            <div className="flex flex-col items-center gap-2 text-slate-300">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-2">
                                    <ScanFace className="w-6 h-6 text-blue-400" />
                                </div>
                                <span className="text-xs font-semibold">Selfie Check</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-slate-300">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-2">
                                    <UploadCloud className="w-6 h-6 text-blue-400" />
                                </div>
                                <span className="text-xs font-semibold">ID Upload</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={startVerification}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Launch Verification Session"}
                    </button>

                    <button
                        onClick={() => setStep('intro')}
                        className="w-full text-slate-500 hover:text-white p-2 text-sm transition-colors"
                    >
                        Back
                    </button>
                </div>
            )}

            {step === "processing" && (
                <div className="glass-card p-12 rounded-[2rem] border border-blue-500/20 bg-slate-900/50 flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-300">
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                    <h3 className="text-xl font-bold text-white">Verifying Identity...</h3>
                    <p className="text-slate-400 text-center max-w-xs">Please wait while we securely process your documents and verify match.</p>
                </div>
            )}

            {step === "success" && (
                <div className="glass-card p-8 rounded-[2rem] border border-green-500/20 bg-green-500/5 space-y-8 animate-in zoom-in duration-300">
                    <div className="space-y-2 text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                            <Fingerprint className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Verification Complete</h2>
                        <p className="text-slate-400">Your account has been upgraded.</p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Status</span>
                            <span className="text-green-400 font-bold uppercase tracking-wider text-xs bg-green-400/10 px-2 py-1 rounded">Approved</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Tier</span>
                            <span className="text-white font-bold capitalize">{status?.tier || tier}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Verified At</span>
                            <span className="text-white font-medium text-sm">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        Start Using Atlantic
                    </button>
                </div>
            )}
        </div>
    );
}
