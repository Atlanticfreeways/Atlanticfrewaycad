import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: {
        value: string | number;
        trend: 'up' | 'down' | 'neutral';
        label?: string;
    };
    icon: LucideIcon;
    variant?: 'default' | 'primary' | 'success' | 'warning';
    className?: string;
}

const variants = {
    default: 'bg-white border-slate-200',
    primary: 'bg-primary-50 border-primary-100',
    success: 'bg-green-50 border-green-100',
    warning: 'bg-amber-50 border-amber-100',
};

const iconVariants = {
    default: 'bg-slate-100 text-slate-600',
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-amber-100 text-amber-600',
};

export function MetricCard({
    title,
    value,
    change,
    icon: Icon,
    variant = 'default',
    className,
}: MetricCardProps) {
    return (
        <div
            className={cn(
                'rounded-xl border p-6 shadow-sm transition-all hover:shadow-md',
                variants[variant],
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
                </div>
                <div className={cn('rounded-lg p-2', iconVariants[variant])}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            {change && (
                <div className="mt-4 flex items-center text-sm">
                    <span
                        className={cn(
                            'flex items-center font-medium',
                            change.trend === 'up' ? 'text-green-600' :
                                change.trend === 'down' ? 'text-red-600' : 'text-slate-600'
                        )}
                    >
                        {change.trend === 'up' ? (
                            <ArrowUp className="mr-1 h-3 w-3" />
                        ) : change.trend === 'down' ? (
                            <ArrowDown className="mr-1 h-3 w-3" />
                        ) : null}
                        {change.value}
                    </span>
                    <span className="ml-2 text-slate-500">{change.label || 'vs last month'}</span>
                </div>
            )}
        </div>
    );
}
