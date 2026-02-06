import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';

import ReceiptCaptureScreen from '../screens/ReceiptCaptureScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="ReceiptCapture" component={ReceiptCaptureScreen} options={{ presentation: 'modal' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
