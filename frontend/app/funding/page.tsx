import { FundingWizard } from "@/components/funding/FundingWizard";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function FundingPage() {
    return (
        <DashboardShell>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white text-glow">Instant Funding</h1>
                    <p className="text-slate-400">Connect your bank account to enable instant transfers and cards.</p>
                </div>

                <div className="py-10">
                    <FundingWizard />
                </div>
            </div>
        </DashboardShell>
    );
}
