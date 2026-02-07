import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { setAuthToken } from '../config/api';
import BiometricService from '../services/BiometricService'; // TODO: Ensure file exists
// import { useUserStore } from '../store/userStore'; // TODO

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            setAuthToken(token);
            // useUserStore.getState().setUser(user, token);

            Alert.alert('Success', `Welcome back, ${user.first_name}!`);
            navigation.replace('Main');
        } catch (error) {
            console.error(error);
            Alert.alert('Login Failed', error.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Atlantic Freeway</Text>
            <Text style={styles.subtitle}>Business Banking Reimagined</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                    style={styles.input}
                    placeholder="name@company.com"
                    placeholderTextColor="#64748b"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#64748b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.bioButton}
                onPress={async () => {
                    const success = await BiometricService.authenticate();
                    if (success) {
                        Alert.alert('Authenticated', 'Biometrics verified. (Mock login would proceed here)');
                        // In real app, retrieve stored token from secure storage
                        navigation.replace('Main');
                    }
                }}
            >
                <Ionicons name="finger-print" size={24} color="#94a3b8" />
                <Text style={styles.bioButtonText}>Use Face ID / Touch ID</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // Slate 900
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8', // Slate 400
        marginBottom: 48,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#cbd5e1', // Slate 300
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1e293b', // Slate 800
        borderWidth: 1,
        borderColor: '#334155', // Slate 700
        borderRadius: 12,
        padding: 16,
        color: 'white',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2563eb', // Blue 600
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bioButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        gap: 8,
    },
    bioButtonText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600'
    }
});
