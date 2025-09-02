import { SignOutButton } from '@/components/auth/SignOutButton';
import AppHeader from '@/components/shared/AppHeader';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { ThemedScrollView, ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { user } = useUser();
  const { theme } = useTheme();
  const borderColor = theme.border;
  const iconColor = theme.primary;
  const textMutedColor = theme.textMuted;

  const handleBackPress = () => {
    router.push('/');
  };

  const handleEditProfilePress = () => {
    router.push('/profile/edit');
  };

  return (
    <SafeAreaView
      edges={['right', 'bottom', 'left']} style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemedView backgroundColor="background" style={styles.container}>
        <AppHeader title="Settings" onBack={handleBackPress} />

        <ThemedScrollView backgroundColor="background" style={styles.content}>
          {/* User Profile Section */}
          <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
            <View style={styles.profileHeader}>
              <UserAvatar size={160} />
              <View style={styles.profileInfo}>
                <ThemedText type="semiBold" style={styles.userName}>
                  {user?.fullName || user?.firstName || 'User'}
                </ThemedText>
                <ThemedText color="textMuted" style={styles.userEmail}>
                  {user?.primaryEmailAddress?.emailAddress}
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* Settings Options */}
          <View style={styles.settingsSection}>
            <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
              <TouchableOpacity style={styles.settingItem} onPress={handleEditProfilePress}>
                <View style={styles.settingLeft}>
                  <IconSymbol name="person.fill" size={20} color={iconColor} />
                  <ThemedText style={styles.settingText}>Edit Profile</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color={textMutedColor} />
              </TouchableOpacity>

              {/* <View style={[styles.divider, { backgroundColor: borderColor }]} />

              <TouchableOpacity style={styles.settingItem} onPress={handleStatsPress}>
                <View style={styles.settingLeft}>
                  <IconSymbol name="chart.bar.fill" size={20} color={iconColor} />
                  <ThemedText style={styles.settingText}>Reading Stats</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color={textMutedColor} />
              </TouchableOpacity> */}

              {/* <View style={[styles.divider, { backgroundColor: borderColor }]} /> */}
              {/* TODO: Fix achievements page */}
              {/* <TouchableOpacity style={styles.settingItem} onPress={handleAchievementsPress}>
                            <View style={styles.settingLeft}>
                                <IconSymbol name="trophy.fill" size={20} color={iconColor} />
                                <ThemedText style={styles.settingText}>Achievements</ThemedText>
                            </View>
                            <IconSymbol name="chevron.right" size={16} color={textMutedColor} />
                        </TouchableOpacity> */}

              <View style={[styles.divider, { backgroundColor: borderColor }]} />

              <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/archive')}>
                <View style={styles.settingLeft}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color={iconColor} />
                  <ThemedText style={styles.settingText}>Archives</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color={textMutedColor} />
              </TouchableOpacity>

              {/* <View style={[styles.divider, { backgroundColor: borderColor }]} />

              <TouchableOpacity style={styles.settingItem} onPress={handleThemePress}>
                <View style={styles.settingLeft}>
                  <IconSymbol name="moon.fill" size={20} color={iconColor} />
                  <ThemedText style={styles.settingText}>Appearance</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color={textMutedColor} />
              </TouchableOpacity>
            </ThemedView> */}
          </View>
          {/* Sign Out Section */}
          <View style={styles.signOutSection}>
            <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
              <SignOutButton />
            </ThemedView>
          </View>
        </ThemedScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  userName: {
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  signOutSection: {
    marginBottom: 40,
  },
}); 