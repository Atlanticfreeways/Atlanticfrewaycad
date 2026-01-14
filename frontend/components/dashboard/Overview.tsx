import { DollarSign, CreditCard, Clock, Wallet } from 'lucide-react';
import { MetricCard } from './widgets/MetricCard';

const mockMetrics = {
    totalSpend: {
        value: '$45,231.89',
        change: { value: '12.5%', trend: 'up' as const },
    },
    activeCards: {
        value: '12',
        change: { value: '2', trend: 'up' as const, label: 'new this month' },
    },
    pendingApprovals: {
        value: '4',
        change: { value: '1', trend: 'down' as const, label: 'waiting' },
    },
    availableBalance: {
        value: '$154,768.11',
        change: { value: '78%', trend: 'neutral' as const, label: 'of limit' },
    },
};

export function Overview() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Total Spend"
                value={mockMetrics.totalSpend.value}
                change={mockMetrics.totalSpend.change}
                icon={DollarSign}
                variant="default"
            />
            <MetricCard
                title="Active Cards"
                value={mockMetrics.activeCards.value}
                change={mockMetrics.activeCards.change}
                icon={CreditCard}
                variant="primary"
            />
            <MetricCard
                title="Pending Approvals"
                value={mockMetrics.pendingApprovals.value}
                change={mockMetrics.pendingApprovals.change}
                icon={Clock}
                variant="warning"
            />
            <MetricCard
                title="Available Balance"
                value={mockMetrics.availableBalance.value}
                change={mockMetrics.availableBalance.change}
                icon={Wallet}
                variant="success"
            />
        </div>
    );
}
