'use client';

import {
    CreditCard,
    UserPlus,
    FileText,
    Shield,
    CheckCircle2,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
    {
        name: 'Issue New Card',
        description: 'Create physical or virtual cards',
        icon: CreditCard,
        color: 'bg-blue-100 text-blue-600',
        href: '#',
    },
    {
        name: 'Add Employee',
        description: 'Invite team members',
        icon: UserPlus,
        color: 'bg-purple-100 text-purple-600',
        href: '#',
    },
    {
        name: 'Create Expense',
        description: 'Submit new expense report',
        icon: FileText,
        color: 'bg-green-100 text-green-600',
        href: '#',
    },
    {
        name: 'Spending Limits',
        description: 'Manage card limits',
        icon: Shield,
        color: 'bg-amber-100 text-amber-600',
        href: '#',
    },
    {
        name: 'Request Approval',
        description: 'Ask for budget approval',
        icon: CheckCircle2,
        color: 'bg-indigo-100 text-indigo-600',
        href: '#',
    },
];

export function QuickActions() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    View All
                </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {actions.map((action) => (
                    <button
                        key={action.name}
                        className="group flex w-full items-center rounded-lg border border-slate-100 p-3 hover:bg-slate-50 hover:border-slate-200 transition-all"
                    >
                        <div className={cn('mr-4 rounded-lg p-3 transition-colors', action.color)}>
                            <action.icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">
                                {action.name}
                            </p>
                            <p className="text-sm text-slate-500">{action.description}</p>
                        </div>
                        <Plus className="ml-auto h-5 w-5 text-slate-300 opacity-0 transition-all group-hover:opacity-100" />
                    </button>
                ))}
            </div>
        </div>
    );
}
