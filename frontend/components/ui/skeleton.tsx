// Loading skeleton components for better UX

import React from 'react';

export const CardSkeleton = () => (
    <div className="animate-pulse bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-700 rounded w-2/3 mb-2"></div>
        <div className="h-3 bg-slate-700 rounded w-1/2"></div>
    </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-slate-700 rounded w-20"></div>
                </div>
            </div>
        ))}
    </div>
);

export const ChartSkeleton = () => (
    <div className="animate-pulse bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="h-6 bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="h-[300px] bg-slate-700/30 rounded flex items-center justify-center">
            <div className="text-slate-600">Loading chart...</div>
        </div>
    </div>
);

export const ProfileSkeleton = () => (
    <div className="space-y-6">
        <div className="animate-pulse flex items-center gap-6 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="w-24 h-24 bg-slate-700 rounded-full"></div>
            <div className="flex-1">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-1"></div>
                <div className="h-4 bg-slate-700 rounded w-1/4"></div>
            </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    </div>
);

export const NotificationSkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-700 rounded w-full mb-1"></div>
                        <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const ListSkeleton = ({ items = 5 }: { items?: number }) => (
    <div className="space-y-2">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="h-4 bg-slate-700 rounded w-full"></div>
            </div>
        ))}
    </div>
);
