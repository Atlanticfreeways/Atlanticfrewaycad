import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
    DASHBOARD_DATA: 'dashboard_data',
    CARDS_DATA: 'cards_data'
};

const OfflineService = {
    saveDashboardData: async (data) => {
        try {
            await AsyncStorage.setItem(CACHE_KEYS.DASHBOARD_DATA, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to cache dashboard data', e);
        }
    },

    getDashboardData: async () => {
        try {
            const data = await AsyncStorage.getItem(CACHE_KEYS.DASHBOARD_DATA);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load cached dashboard data', e);
            return null;
        }
    },

    // Add similar for cards...
};

export default OfflineService;
