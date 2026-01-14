'use client';

import {
    Coffee,
    Plane,
    ShoppingBag,
    Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for merging classes

const transactions = [
    {
        id: 1,
        merchant: 'Starbucks',
        category: 'Food & Drink',
        amount: '-$14.50',
        status: 'completed',
        time: '2 mins ago',
        icon: Coffee,
        iconColor: 'bg-green-100 text-green-600',
    },
    {
        id: 2,
        merchant: 'Uber Business',
        category: 'Travel',
        amount: '-$24.00',
        status: 'completed',
        time: '2 hours ago',
        icon: Plane,
        iconColor: 'bg-blue-100 text-blue-600',
    },
    {
        id: 3,
        merchant: 'Apple Store',
        category: 'Electronics',
        amount: '-$1,299.00',
        status: 'pending',
        time: '5 hours ago',
        icon: ShoppingBag,
        iconColor: 'bg-slate-100 text-slate-600',
    },
    {
        id: 4,
        merchant: 'AWS Services',
        category: 'Software',
        amount: '-$245.00',
        status: 'completed',
        time: 'Yesterday',
        icon: Wifi,
        iconColor: 'bg-amber-100 text-amber-600',
    },
    {
        id: 5,
        merchant: 'WeWork',
        category: 'Office',
        amount: '-$450.00',
        status: 'completed',
        time: 'Yesterday',
        icon: Coffee,
        iconColor: 'bg-purple-100 text-purple-600',
    },
];

export function ActivityFeed() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    View All
                </button>
            </div>
            <div className="space-y-6">
                {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={cn('rounded-full p-2', transaction.iconColor)}>
                                <transaction.icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{transaction.merchant}</p>
                                <p className="text-xs text-slate-500">
                                    {transaction.category} • {transaction.time}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-slate-900">{transaction.amount}</p>
                            <p className={cn(
                                "text-xs capitalize",
                                transaction.status === 'completed' ? 'text-green-600' :
                                    transaction.status === 'pending' ? 'text-amber-600' : 'text-slate-500'
                            )}>
                                {transaction.status}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
