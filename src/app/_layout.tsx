import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { NotificationProvider } from '@/contexts/NotificationProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider } from '@/theme';
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient()

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        Inter: require('../assets/fonts/Inter-Regular.ttf'),
        "CrimsonText-Regular": require('../assets/fonts/CrimsonText-Regular.ttf'),
        "CrimsonText-Bold": require('../assets/fonts/CrimsonText-Bold.ttf'),
        "CrimsonText-SemiBold": require('../assets/fonts/CrimsonText-SemiBold.ttf'),
        "Nunito-Bold": require('../assets/fonts/Nunito-Bold.ttf'),
        "Nunito-ExtraBold": require('../assets/fonts/Nunito-ExtraBold.ttf'),
        "Nunito-ExtraLight": require('../assets/fonts/Nunito-ExtraLight.ttf'),
        "Nunito-Light": require('../assets/fonts/Nunito-Light.ttf'),
        "Nunito-Medium": require('../assets/fonts/Nunito-Medium.ttf'),
        "Nunito-Regular": require('../assets/fonts/Nunito-Regular.ttf'),
        "Nunito-SemiBold": require('../assets/fonts/Nunito-SemiBold.ttf'),
    });

    if (!loaded) {
        // Async font loading only occurs in development.
        return null;
    }

    return (
        <NotificationProvider>
            <ThemeProvider>
                <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <QueryClientProvider client={queryClient}>
                        <ClerkProvider
                            {...(tokenCache ? { tokenCache } : {})}
                            {...(CLERK_PUBLISHABLE_KEY ? { publishableKey: CLERK_PUBLISHABLE_KEY } : {})}
                        >
                            <Stack>
                                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                                <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
                            </Stack>
                            <StatusBar style="auto" />
                            <Toast />
                        </ClerkProvider>
                    </QueryClientProvider>
                </NavigationThemeProvider>
            </ThemeProvider>
        </NotificationProvider>
    );
}
