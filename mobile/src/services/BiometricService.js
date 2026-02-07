import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

const BiometricService = {
    checkHardware: async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            if (!compatible) return false;
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            return enrolled;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    authenticate: async () => {
        try {
            const hasHardware = await BiometricService.checkHardware();
            if (!hasHardware) return false;

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access Atlantic',
                fallbackLabel: 'Use Passcode',
            });

            return result.success;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
};

export default BiometricService;
