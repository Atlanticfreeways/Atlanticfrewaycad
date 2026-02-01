import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

let socket: Socket | null = null;

export function useSocket() {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (user && !socket) {
            const token = localStorage.getItem('token');
            if (!token) return;

            socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
                auth: { token },
                transports: ['websocket']
            });

            socket.on('connect', () => {
                console.log('WS Connected');
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('WS Disconnected');
                setIsConnected(false);
            });
        }

        return () => {
            // We might want to keep socket open between pages, so maybe don't disconnect on unmount
            // unless logout happens.
        };
    }, [user]);

    return { socket, isConnected };
}

export function useRealtimeBalance(initialBalance: number) {
    const { socket } = useSocket();
    const [balance, setBalance] = useState(initialBalance);

    useEffect(() => {
        if (!socket) return;

        setBalance(initialBalance); // Sync with prop if it changes (e.g. fresh fetch)

        const handleUpdate = (data: any) => {
            // Expect data to be { currency: 'USD', balance: 123.45 }
            if (data.currency === 'USD') { // Simplified check
                setBalance(data.balance);
            }
        };

        socket.on('balance_update', handleUpdate);

        return () => {
            socket.off('balance_update', handleUpdate);
        };
    }, [socket, initialBalance]);

    return balance;
}
