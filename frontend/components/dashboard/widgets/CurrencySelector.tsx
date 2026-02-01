'use client';
import React from 'react';
import { useCurrency } from '@/lib/contexts/CurrencyContext';
import { Globe } from 'lucide-react';

export function CurrencySelector() {
    const { displayCurrency, setDisplayCurrency, availableAssets } = useCurrency();

    // Combine fiat and crypto for the selector
    const currencies = [...availableAssets.fiat, ...availableAssets.crypto];

    return (
        <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Display Currency
            </h3>
            <div className="mx-3 flex items-center space-x-2 rounded-md bg-slate-800 p-1">
                <Globe className="ml-2 h-4 w-4 text-slate-400" />
                <select
                    value={displayCurrency}
                    onChange={(e) => setDisplayCurrency(e.target.value)}
                    className="w-full bg-transparent p-1 text-sm text-slate-200 focus:outline-none"
                >
                    {currencies.length > 0 ? (
                        currencies.map((currency) => (
                            <option key={currency} value={currency} className="bg-slate-900 text-slate-200">
                                {currency}
                            </option>
                        ))
                    ) : (
                        <option value="USD">USD</option>
                    )}
                </select>
            </div>
        </div>
    );
}
