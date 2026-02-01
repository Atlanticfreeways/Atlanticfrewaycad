"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Interfaces
interface CurrencyContextType {
    displayCurrency: string;
    setDisplayCurrency: (currency: string) => void;
    formatCurrency: (amount: number, currency?: string) => string;
    convertAmount: (amountUSD: number, targetCurrency?: string) => number;
    rates: Record<string, number>;
    availableAssets: { fiat: string[], crypto: string[] };
    isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
    displayCurrency: 'USD',
    setDisplayCurrency: () => { },
    formatCurrency: () => '',
    convertAmount: () => 0,
    rates: {},
    availableAssets: { fiat: [], crypto: [] },
    isLoading: true,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [displayCurrency, setDisplayCurrency] = useState('USD');
    const [rates, setRates] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    const [availableAssets, setAvailableAssets] = useState<{ fiat: string[], crypto: string[] }>({ fiat: [], crypto: [] });

    // Load preference from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('atlantic_display_currency');
        if (saved) setDisplayCurrency(saved);
    }, []);

    // Save preference
    useEffect(() => {
        localStorage.setItem('atlantic_display_currency', displayCurrency);
    }, [displayCurrency]);

    // Fetch initial rates, config, and setup socket listener
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Config
                const configRes = await axios.get('/api/v1/config/assets');
                if (configRes.data) {
                    setAvailableAssets({
                        fiat: configRes.data.fiat.map((c: any) => c.code),
                        crypto: configRes.data.crypto.map((c: any) => c.code)
                    });
                }

                // Fetch Rates
                const res = await axios.get('/api/v1/rates');
                if (res.data && res.data.rates) {
                    setRates(res.data.rates);
                }
            } catch (error) {
                console.error('Failed to fetch initial data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();

        // Socket.io connection for real-time updates
        const token = localStorage.getItem('token'); // Assuming token is stored here
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
            transports: ['websocket'],
            autoConnect: true,
            auth: {
                token: token
            }
        });

        socket.on('connect', () => {
            console.log('Connected to currency stream');
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        socket.on('metrics:rates_updated', (newRates) => {
            console.log('Received live rate update');
            setRates(newRates);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const convertAmount = (amountUSD: number, targetCurrency: string = displayCurrency) => {
        if (targetCurrency === 'USD') return amountUSD;
        if (!rates['USD'] || !rates[targetCurrency]) return amountUSD; // Fallback

        // Rates are typically base USD (1 USD = X Currency)
        const rate = rates[targetCurrency];
        return amountUSD * rate;
    };

    const formatCurrency = (amountUSD: number, currency: string = displayCurrency) => {
        const converted = convertAmount(amountUSD, currency);

        return new Intl.NumberFormat('en-US', { // Locale could also be dynamic based on user location
            style: 'currency',
            currency: currency,
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{
            displayCurrency,
            setDisplayCurrency,
            formatCurrency,
            convertAmount,
            rates,
            availableAssets,
            isLoading
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};
