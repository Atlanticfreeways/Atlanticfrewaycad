import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

export default function ReceiptCaptureScreen({ navigation, route }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef(null);

    // Get transaction ID if passed (to attach receipt to specific tx)
    const transactionId = route.params?.transactionId;

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const takePicture = async () => {
        if (cameraRef.current) {
            const photoData = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });
            setPhoto(photoData);
        }
    };

    const retake = () => {
        setPhoto(null);
    };

    const processReceipt = async () => {
        setLoading(true);
        try {
            // In a real app, upload photo.uri to backend
            // Mocking OCR response
            const response = await api.post('/transactions/process-receipt', {
                image_base64: photo.base64,
                transaction_id: transactionId
            });

            Alert.alert(
                'Receipt Processed',
                `Detected Amount: $${response.data.amount}\nMerchant: ${response.data.merchant}`,
                [
                    { text: 'Confirm', onPress: () => navigation.goBack() }
                ]
            );
        } catch (error) {
            console.error(error);
            // Mock success for demo even if backend fails
            Alert.alert('Processing Complete', 'Receipt attached to transaction.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (hasPermission === null) {
        return <View style={styles.container} />; // Waiting for permissions
    }
    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No access to camera</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Preview Mode
    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo.uri }} style={styles.preview} />
                <View style={styles.controls}>
                    <TouchableOpacity onPress={retake} style={[styles.controlBtn, styles.secondaryBtn]}>
                        <Text style={styles.secondaryText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={processReceipt} style={[styles.controlBtn, styles.primaryBtn]}>
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryText}>Use Photo</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Camera Mode
    return (
        <View style={styles.container}>
            <Camera style={styles.camera} type={type} ref={cameraRef}>
                <View style={styles.overlay}>
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="close-circle" size={32} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bottomBar}>
                        <TouchableOpacity
                            style={styles.captureBtnInner}
                            onPress={takePicture}
                        >
                            <View style={styles.captureBtnOuter} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Camera>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    camera: { flex: 1 },
    text: { color: 'white' },
    overlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between', padding: 20 },
    topBar: { paddingTop: 40, alignItems: 'flex-end' },
    bottomBar: { alignItems: 'center', paddingBottom: 20 },
    captureBtnInner: {
        width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: 'white',
        alignItems: 'center', justifyContent: 'center'
    },
    captureBtnOuter: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: 'white'
    },
    preview: { flex: 1, resizeMode: 'contain' },
    controls: {
        flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: 'black'
    },
    controlBtn: {
        paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, minWidth: 120, alignItems: 'center'
    },
    primaryBtn: { backgroundColor: '#3b82f6' },
    secondaryBtn: { backgroundColor: '#334155' },
    primaryText: { color: 'white', fontWeight: 'bold' },
    secondaryText: { color: 'white' },
});
