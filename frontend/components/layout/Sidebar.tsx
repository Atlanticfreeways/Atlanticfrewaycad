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
    { name: "Overview", href: "/", icon: LayoutDashboard },
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
                "flex flex-col h-full w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out",
                "fixed lg:static inset-y-0 left-0 z-50",
                isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
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
                    </div>

                    {/* Business Tools */}
                    <div>
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Business</p>
                        <div className="space-y-1">
                            {businessNav.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={onMobileClose}
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
                        </div>
                    </div>

                    {/* Admin Tools */}
                    <div>
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Admin</p>
                        <div className="space-y-1">
                            {adminNav.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={onMobileClose}
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
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-1">
                    <Link href="/profile" onClick={onMobileClose} className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all">
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                    </Link>
                    <Link href="/notifications" onClick={onMobileClose} className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span>Notifications</span>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></span>
                    </Link>
                    <Link href="/help" onClick={onMobileClose} className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all">
                        <HelpCircle className="w-5 h-5" />
                        <span>Help</span>
                    </Link>
                    <Link href="/settings" onClick={onMobileClose} className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all">
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </Link>
                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 rounded-xl hover:bg-red-400/10 transition-all">
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
}
