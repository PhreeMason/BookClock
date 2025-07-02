import { Loader } from '@/components/shared/Loader';
import { DeadlineProvider } from '@/contexts/DeadlineProvider';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <Loader />;
  }

  if (!isSignedIn) {
    return <Redirect href='/sign-in' />;
  }

  return (
    <DeadlineProvider>
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen name='deadline/new' options={{ headerShown: false }} />
        <Stack.Screen name='deadline/[id]/view' options={{ headerShown: false }} />
        <Stack.Screen name='deadline/[id]/edit' options={{ headerShown: false }} />
        <Stack.Screen name='settings' options={{ headerShown: false }} />
        <Stack.Screen name='stats' options={{ headerShown: false }} />
      </Stack>
    </DeadlineProvider>
  );
}