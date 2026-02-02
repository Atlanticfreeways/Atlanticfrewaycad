"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, PieChart, Building2, Settings, LogOut, FileText, Landmark } from "lucide-react";
import clsx from "clsx";

const navigation = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "My Cards", href: "/cards", icon: CreditCard },
    { name: "Transactions", href: "/transactions", icon: PieChart },
    { name: "Business", href: "/business", icon: Building2 },
    // Admin Tools
    { name: "Reconciliation", href: "/admin/reconciliation", icon: FileText },
    { name: "Banking Sim", href: "/admin/banking", icon: Landmark },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full w-64 bg-slate-900 border-r border-slate-800">
            <div className="p-6 flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">Atlantic</span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <item.icon className={clsx("w-5 h-5", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-white")} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </Link>
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 rounded-xl hover:bg-red-400/10 transition-all mt-1">
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
}
