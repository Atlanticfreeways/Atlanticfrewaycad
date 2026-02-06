import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TXS = [
    { id: 1, merchant: 'Amazon AWS', amount: '-249.00', date: 'Today' },
    { id: 2, merchant: 'Uber Trip', amount: '-24.50', date: 'Yesterday' },
    { id: 3, merchant: 'WeWork Subscription', amount: '-450.00', date: 'Feb 4' },
    { id: 4, merchant: 'Starbucks', amount: '-12.40', date: 'Feb 4' },
];

export default function TransactionsScreen({ navigation }) {
    const handleScan = () => {
        navigation.navigate('ReceiptCapture');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Transactions</Text>
            <FlatList
                data={TXS}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View style={styles.left}>
                            <Text style={styles.merchant}>{item.merchant}</Text>
                            <Text style={styles.date}>{item.date}</Text>
                        </View>
                        <Text style={styles.amount}>{item.amount}</Text>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.fab} onPress={handleScan}>
                <Ionicons name="camera" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', padding: 20, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 20 },
    item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
    merchant: { color: 'white', fontSize: 16, fontWeight: '500' },
    date: { color: '#64748b', fontSize: 13, marginTop: 4 },
    amount: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    fab: {
        position: 'absolute', bottom: 30, right: 30,
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#3b82f6',
        alignItems: 'center', justifyContent: 'center',
        elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4
    }
});;
