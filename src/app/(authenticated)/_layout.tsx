import { Loader } from '@/components/Loader';
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
        <Stack.Screen name='deadline/new' options={{ title: 'New deadline' }} />
        <Stack.Screen name='settings' options={{ headerShown: false }} />
      </Stack>
    </DeadlineProvider>
  );
}