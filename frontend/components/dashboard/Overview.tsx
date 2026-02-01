'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/lib/api';
import { DollarSign, CreditCard, Clock, Wallet } from 'lucide-react';
import { MetricCard } from './widgets/MetricCard';
import { useCurrency } from '@/lib/contexts/CurrencyContext';

export function Overview() {
    const { formatCurrency } = useCurrency();
    const { data: metrics, isLoading, error } = useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: dashboardAPI.getMetrics,
        refetchInterval: 30000
    });

    if (isLoading) {
        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-red-600">Failed to load metrics</div>;
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Total Spend"
                value={formatCurrency(metrics?.totalSpend?.current || 0)}
                change={{
                    value: `${metrics?.totalSpend?.change || 0}%`,
                    trend: (metrics?.totalSpend?.change || 0) >= 0 ? 'up' : 'down'
                }}
                icon={DollarSign}
                variant="default"
            />
            <MetricCard
                title="Active Cards"
                value={String(metrics?.activeCards || 0)}
                change={{ value: 'active', trend: 'neutral' as const }}
                icon={CreditCard}
                variant="primary"
            />
            <MetricCard
                title="Pending Approvals"
                value={String(metrics?.pendingApprovals || 0)}
                change={{ value: 'pending', trend: 'neutral' as const }}
                icon={Clock}
                variant="warning"
            />
            <MetricCard
                title="Available Balance"
                value={formatCurrency(metrics?.availableBalance || 0)}
                change={{ value: 'available', trend: 'neutral' as const }}
                icon={Wallet}
                variant="success"
            />
        </div>
    );
}
