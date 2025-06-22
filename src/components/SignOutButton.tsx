import { useThemeColor } from '@/hooks/useThemeColor';
import { useClerk } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

export const SignOutButton = () => {
  const { signOut } = useClerk()
  const dangerColor = useThemeColor({}, 'danger');
  
  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      Linking.openURL(Linking.createURL('/'))
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }
  
  return (
    <TouchableOpacity onPress={handleSignOut} style={styles.button}>
      <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={dangerColor} />
      <ThemedText color="danger" style={styles.text}>Sign Out</ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  text: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});