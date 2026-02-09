import { KYCWizard } from "@/components/kyc/KYCWizard";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function KYCVerificationPage() {
    return (
        <DashboardShell>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white text-glow">Identity & Compliance</h1>
                    <p className="text-slate-400">Complete verification to access full platform features.</p>
                </div>

                <div className="py-10">
                    <KYCWizard />
                </div>
            </div>
        </DashboardShell>
    );
}
