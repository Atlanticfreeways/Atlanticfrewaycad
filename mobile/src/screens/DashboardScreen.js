import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import api from '../config/api';

export default function DashboardScreen() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const response = await api.get('/business/finance/overview');
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>Financial Overview</Text>
                <Text style={styles.date}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Total Balance</Text>
                <Text style={styles.balance}>
                    {data?.total_balance?.amount
                        ? `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(data.total_balance.amount)}`
                        : '$0.00'
                    }
                </Text>
                <Text style={styles.change}>
                    Burn Rate: ${new Intl.NumberFormat('en-US').format(data?.monthly_burn_rate || 0)} / mo
                </Text>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Active Cards</Text>
                    <Text style={styles.statValue}>{data?.active_cards || 0}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Pending</Text>
                    <Text style={styles.statValue}>${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(data?.pending_settlements || 0)}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {/* Note: In a real app we'd fetch transactions here too, simplified for now */}
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>View Transactions tab for detailed history</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { marginTop: 60, marginBottom: 20 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    date: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
    card: { backgroundColor: '#1e293b', padding: 24, borderRadius: 16, marginBottom: 24 },
    cardTitle: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' },
    balance: { color: 'white', fontSize: 36, fontWeight: '800', marginVertical: 12 },
    change: { color: '#64748b', fontSize: 14, fontWeight: '500' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    statCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, width: '48%' },
    statLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    statValue: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
    sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    emptyState: { padding: 20, alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12 },
    emptyText: { color: '#64748b', fontStyle: 'italic' }
});
