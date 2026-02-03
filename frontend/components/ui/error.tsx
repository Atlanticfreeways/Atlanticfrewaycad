// Error boundary and error display components

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorDisplayProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    showRetry?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    title = 'Something went wrong',
    message,
    onRetry,
    showRetry = true,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md w-full">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-red-400 mb-1">{title}</h3>
                        <p className="text-sm text-slate-300">{message}</p>
                        {showRetry && onRetry && (
                            <Button
                                onClick={onRetry}
                                variant="secondary"
                                className="mt-4 flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 max-w-md w-full text-center">
                {icon && <div className="flex justify-center mb-4 text-slate-600">{icon}</div>}
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                {description && <p className="text-sm text-slate-400 mb-4">{description}</p>}
                {action && (
                    <Button onClick={action.onClick} className="mt-2">
                        {action.label}
                    </Button>
                )}
            </div>
        </div>
    );
};
