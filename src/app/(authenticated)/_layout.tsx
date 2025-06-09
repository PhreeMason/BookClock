import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator } from 'react-native';

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return <ActivityIndicator />;
  }

  if (!isSignedIn) {
    return <Redirect href='/sign-in' />;
  }

  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen
        name='book/[api_id]'
        options={{ headerShown: false, animation: 'fade_from_bottom', presentation: 'modal' }}
      />
    </Stack>
  );
}