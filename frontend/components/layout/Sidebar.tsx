"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CreditCard,
    PieChart,
    Building2,
    Settings,
    LogOut,
    FileText,
    Landmark,
    Bell,
    User,
    BarChart3,
    HelpCircle,
    Users,
    Shield,
    X
} from "lucide-react";
import clsx from "clsx";

const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Cards", href: "/cards", icon: CreditCard },
    { name: "Transactions", href: "/transactions", icon: PieChart },
    { name: "Business", href: "/business", icon: Building2 },
    { name: "Reports", href: "/reports", icon: BarChart3 },
];

const businessNav = [
    { name: "Team", href: "/business/team", icon: Users },
    { name: "Bulk Issuance", href: "/business/bulk-issuance", icon: CreditCard },
];

const adminNav = [
    { name: "Reconciliation", href: "/admin/reconciliation", icon: FileText },
    { name: "Banking Sim", href: "/admin/banking", icon: Landmark },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: Shield },
];

interface SidebarProps {
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "flex flex-col h-full w-64 bg-slate-950/80 backdrop-blur-xl border-r border-white/5 transition-all duration-500 ease-in-out shadow-2xl overflow-hidden",
                "fixed lg:static inset-y-0 left-0 z-50",
                isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
                {/* Header with Close Button */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Atlantic</span>
                    </div>

                    {/* Close button (mobile only) */}
                    <button
                        onClick={onMobileClose}
                        className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
                    {/* Main Navigation */}
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onMobileClose}
                                    className={clsx(
                                        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                        isActive
                                            ? "bg-blue-600/10 text-white shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-600 rounded-r-full" />}
                                    <item.icon className={clsx("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-blue-500" : "text-slate-500 group-hover:text-white")} />
                                    <span className="font-semibold text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Business Tools */}
                    <div>
                        <p className="px-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Enterprise</p>
                        <div className="space-y-1">
                            {businessNav.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={onMobileClose}
                                        className={clsx(
                                            "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                            isActive
                                                ? "bg-purple-600/10 text-white shadow-[0_0_20px_rgba(147,51,234,0.1)]"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-purple-600 rounded-r-full" />}
                                        <item.icon className={clsx("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-purple-500" : "text-slate-500 group-hover:text-white")} />
                                        <span className="font-semibold text-sm">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Admin Tools */}
                    <div>
                        <p className="px-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">System</p>
                        <div className="space-y-1">
                            {adminNav.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={onMobileClose}
                                        className={clsx(
                                            "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                            isActive
                                                ? "bg-slate-600/10 text-white"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-slate-500 rounded-r-full" />}
                                        <item.icon className={clsx("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-slate-400" : "text-slate-500 group-hover:text-white")} />
                                        <span className="font-semibold text-sm">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t border-white/5 space-y-1 bg-slate-900/20 backdrop-blur-sm">
                    <Link href="/profile" onClick={onMobileClose} className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all group">
                        <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Profile</span>
                    </Link>
                    <Link href="/notifications" onClick={onMobileClose} className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all relative group">
                        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="text-sm font-medium">Notifications</span>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                    </Link>
                    <Link href="/help" onClick={onMobileClose} className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all group">
                        <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Help Center</span>
                    </Link>
                    <Link href="/settings" onClick={onMobileClose} className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all group">
                        <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                        <span className="text-sm font-medium">Settings</span>
                    </Link>
                    <div className="pt-2">
                        <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 rounded-xl hover:bg-red-400/10 transition-all group">
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold tracking-tight">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
