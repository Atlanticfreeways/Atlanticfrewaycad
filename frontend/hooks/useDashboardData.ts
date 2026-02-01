import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useDashboardData() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [overview, metrics] = await Promise.all([
                    api.get('/dashboard/overview'),
                    api.get('/dashboard/metrics')
                ]);
                setData({ ...overview, metrics });
            } catch (e: any) {
                console.error(e);
                setError(e);
            } finally {
                setLoading(false);
            }
        }

        // Only fetch if token exists
        if (localStorage.getItem('token')) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, []);

    return { data, loading, error };
}
