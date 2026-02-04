"use client";

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

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
    default: 'border-white/5 bg-slate-900/40',
    primary: 'border-blue-500/20 bg-blue-500/5',
    success: 'border-green-500/20 bg-green-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
};

const iconColors = {
    default: 'text-slate-400 bg-slate-400/10',
    primary: 'text-blue-500 bg-blue-500/10',
    success: 'text-green-500 bg-green-500/10',
    warning: 'text-amber-500 bg-amber-500/10',
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
        <motion.div
            whileHover={{ y: -5 }}
            className={cn(
                'rounded-[2rem] border p-8 backdrop-blur-xl transition-all duration-300 relative overflow-hidden group',
                variants[variant],
                className
            )}
        >
            {/* Ambient Glow */}
            <div className={cn(
                "absolute -top-12 -right-12 w-24 h-24 blur-[40px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500",
                variant === 'primary' ? 'bg-blue-500' :
                    variant === 'success' ? 'bg-green-500' :
                        variant === 'warning' ? 'bg-amber-500' : 'bg-slate-400'
            )} />

            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{title}</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter leading-none">{value}</h3>
                </div>
                <div className={cn('rounded-[1.25rem] p-3 shadow-inner', iconColors[variant])}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {change && (
                <div className="mt-8 flex items-center relative z-10">
                    <div className={cn(
                        'flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider',
                        change.trend === 'up' ? 'bg-green-500/10 text-green-500' :
                            change.trend === 'down' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'
                    )}>
                        {change.trend === 'up' ? (
                            <ArrowUp className="mr-1 h-3 w-3" />
                        ) : change.trend === 'down' ? (
                            <ArrowDown className="mr-1 h-3 w-3" />
                        ) : <TrendingUp className="mr-1 h-3 w-3" />}
                        {change.value}
                    </div>
                    <span className="ml-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{change.label || 'vs month'}</span>
                </div>
            )}
        </motion.div>
    );
}
