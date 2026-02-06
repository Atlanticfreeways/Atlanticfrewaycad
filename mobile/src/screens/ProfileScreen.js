import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { scheduleLocalNotification } from '../utils/notifications';

export default function ProfileScreen({ navigation }) {
    const handleLogout = () => {
        // Mock logout
        navigation.navigate('Login');
    };

    const handleTestNotification = async () => {
        await scheduleLocalNotification(
            "Transaction Alert",
            "You just spent $24.50 at Starbucks.",
            { transactionId: 123 }
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar} />
                <Text style={styles.name}>Alice Smith</Text>
                <Text style={styles.role}>Administrator</Text>
            </View>

            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem}><Text style={styles.menuText}>Security Settings</Text></TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleTestNotification}><Text style={styles.menuText}>Test Notification</Text></TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}><Text style={styles.menuText}>Help & Support</Text></TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', padding: 20, paddingTop: 60 },
    header: { alignItems: 'center', marginBottom: 40 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3b82f6', marginBottom: 16 },
    name: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    role: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
    menuItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
    menuText: { color: 'white', fontSize: 16 },
    logoutButton: { marginTop: 40, backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center' },
    logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
