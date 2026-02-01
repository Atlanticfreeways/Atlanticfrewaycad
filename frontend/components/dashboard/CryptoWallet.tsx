'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/lib/api';
import { useCurrency } from '@/lib/contexts/CurrencyContext';
import { TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

// Supported Crypto Assets for Display
// const SUPPORTED_ASSETS = ... (Removed, now dynamic)

export function CryptoWallet() {
    const { formatCurrency, rates, availableAssets } = useCurrency();

    const { data: metrics, isLoading, refetch } = useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: dashboardAPI.getMetrics,
        // Shared query key with Overview, so data is likely already cached
    });

    const balances = metrics?.balances || [];

    // Filter to show only supported crypto assets
    const assets = availableAssets.crypto.map(symbol => {
        // Find user's balance for this asset
        const userBalance = balances.find((b: any) => b.currency === symbol)?.balance || 0;

        // Get current price from our CurrencyContext rates
        const rate = rates[symbol];
        const price = rate ? (1 / rate) : 0;

        return {
            symbol,
            name: symbol, // In a real app we'd map code to name via the config object properly
            balance: Number(userBalance),
            price: price,
            change24h: (Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1)).toFixed(2)
        };
    });

    const totalValueUSD = assets.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);

    if (isLoading) {
        return <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />;
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Crypto Wallet</h2>
                    <p className="text-sm text-slate-500">Your digital assets</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500">Total Value</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalValueUSD)}</p>
                </div>
            </div>

            <div className="space-y-4">
                {assets.map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">
                                {asset.symbol}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{asset.name}</p>
                                <p className="text-sm text-slate-500">{asset.balance} {asset.symbol}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-slate-900">{formatCurrency(asset.balance * asset.price)}</p>
                            <div className="flex items-center justify-end space-x-1">
                                {Number(asset.change24h) >= 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                )}
                                <span className={`text-xs ${Number(asset.change24h) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {Math.abs(Number(asset.change24h))}%
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <button
                    onClick={() => refetch()}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center w-full transition-colors"
                >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh Balances
                </button>
            </div>
        </div>
    );
}
