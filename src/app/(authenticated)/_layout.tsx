import { Loader } from '@/components/Loader';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  if (!isLoaded) {
    return <Loader />;
  }

  if (!isSignedIn) {
    return <Redirect href='/sign-in' />;
  }

  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen
        name='book/[api_id]'
        options={{ 
           animation: 'fade_from_bottom',
           presentation: 'modal',
           headerTitle: 'details',
           headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                padding: 6,
              }}>
              <IconSymbol name="arrow.left" size={24} color={'#716E75'} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}