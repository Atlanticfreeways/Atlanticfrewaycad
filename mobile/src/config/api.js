import axios from 'axios';
import { Platform } from 'react-native';

// For Android Emulator use 10.0.2.2, for iOS Simulator use localhost
// For physical device, use your machine's LAN IP
const BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api/v1'
    : 'http://localhost:4000/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
