import { Sidebar } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                    <h1 className="text-lg font-medium text-slate-200">Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium">JD</div>
                    </div>
                </header>
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
