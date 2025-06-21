import { Loader } from '@/components/Loader';
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
    <Stack>
      <Stack.Screen name='search' options={{ headerShown: false }} />
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen
        name='book/[api_id]/add'
        options={{ 
           animation: 'fade_from_bottom',
           presentation: 'modal',
           headerTitle: 'Add to library',
        }}
      />
    </Stack>
  );
}