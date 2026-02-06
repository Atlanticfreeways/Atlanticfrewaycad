import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

export default function CardsScreen() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCards = async () => {
        try {
            const response = await api.get('/business/cards?scope=me');
            setCards(response.data.cards || []);
        } catch (error) {
            console.error('Failed to fetch cards:', error);
            // Alert.alert('Error', 'Could not load cards');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCards();
    }, []);

    const handleToggleFreeze = async (card) => {
        const newStatus = card.status === 'active' ? 'frozen' : 'active';
        const action = newStatus === 'active' ? 'Unfreeze' : 'Freeze';

        Alert.alert(
            `${action} Card?`,
            `Are you sure you want to ${action.toLowerCase()} this card ending in ${card.last_four}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: action,
                    style: newStatus === 'frozen' ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            await api.put(`/business/cards/${card.id}/status`, { status: newStatus });
                            // Optimistic update
                            setCards(cards.map(c => c.id === card.id ? { ...c, status: newStatus } : c));
                        } catch (e) {
                            Alert.alert('Error', `Failed to ${action.toLowerCase()} card.`);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Cards</Text>

            {loading ? (
                <ActivityIndicator color="#3b82f6" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={cards}
                    keyExtractor={item => item.id.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>No active cards found.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.visualCard, item.status === 'frozen' && styles.frozenCard]}
                            onPress={() => handleToggleFreeze(item)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.brand}>VISA</Text>
                                {item.status === 'frozen' && (
                                    <View style={styles.badge}>
                                        <Ionicons name="lock-closed" size={12} color="white" />
                                        <Text style={styles.badgeText}>FROZEN</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.number}>•••• •••• •••• {item.last_four}</Text>

                            <View style={styles.details}>
                                <View>
                                    <Text style={styles.label}>Cardholder</Text>
                                    <Text style={styles.value}>{item.first_name} {item.last_name}</Text>
                                </View>
                                <View>
                                    <Text style={styles.label}>Expires</Text>
                                    <Text style={styles.value}>12/28</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', padding: 20, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 20 },
    empty: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#64748b' },
    visualCard: {
        height: 220,
        backgroundColor: '#2563eb',
        borderRadius: 20,
        padding: 24,
        justifyContent: 'space-between',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10
    },
    frozenCard: {
        backgroundColor: '#334155',
        opacity: 0.9
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    brand: { color: 'white', fontWeight: 'bold', fontSize: 22, fontStyle: 'italic' },
    badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
    number: { color: 'white', fontSize: 26, letterSpacing: 4, fontFamily: 'Courier' }, // Fallback font
    details: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { color: 'rgba(255,255,255,0.6)', fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
    value: { color: 'white', fontSize: 14, fontWeight: '600' }
});
