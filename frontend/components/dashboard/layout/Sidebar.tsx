'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Activity, Settings, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencySelector } from '../widgets/CurrencySelector';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cards', href: '/dashboard/cards', icon: CreditCard },
    { name: 'Transactions', href: '/dashboard/transactions', icon: Activity },
    { name: 'Team', href: '/dashboard/team', icon: Users },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
            <div className="flex h-16 items-center px-6">
                <span className="text-xl font-bold text-primary-600">Atlantic</span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                                    isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'
                                )}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-slate-200 p-4 space-y-4">
                <CurrencySelector />
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                    <div className="ml-3">
                        <p className="text-sm font-medium text-slate-700">User Name</p>
                        <p className="text-xs text-slate-500">View Profile</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
