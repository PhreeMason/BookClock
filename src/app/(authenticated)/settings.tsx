import { SignOutButton } from '@/components/auth/SignOutButton';
import { ThemedScrollView, ThemedText, ThemedView } from '@/components/themed';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { useTheme } from '@/theme';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const { user } = useUser();
    const { theme } = useTheme();
    const borderColor = theme.border;
    const iconColor = theme.primary;
    const textMutedColor = theme.textMuted;

    const handleBackPress = () => {
        router.back();
    };

    const handleStatsPress = () => {
        router.push('/stats');
    };

    return (
        <ThemedView backgroundColor="background" style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={Platform.OS === 'ios' ? 24 : 40} color={iconColor} />
                </TouchableOpacity>
                <ThemedText type="semiBold" style={styles.headerTitle}>
                    Settings
                </ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ThemedScrollView backgroundColor="background" style={styles.content}>
                {/* User Profile Section */}
                <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
                    <View style={styles.profileHeader}>
                        <UserAvatar size={80} />
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
                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <IconSymbol name="person.fill" size={20} color={iconColor} />
                                <ThemedText style={styles.settingText}>Edit Profile</ThemedText>
                            </View>
                            <IconSymbol name="chevron.right" size={16} color={textMutedColor} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: borderColor }]} />

                        <TouchableOpacity style={styles.settingItem} onPress={handleStatsPress}>
                            <View style={styles.settingLeft}>
                                <IconSymbol name="chart.bar.fill" size={20} color={iconColor} />
                                <ThemedText style={styles.settingText}>Reading Stats</ThemedText>
                            </View>
                            <IconSymbol name="chevron.right" size={16} color={textMutedColor} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: borderColor }]} />

                        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/completed-deadlines')}>
                            <View style={styles.settingLeft}>
                                <IconSymbol name="checkmark.circle.fill" size={20} color={iconColor} />
                                <ThemedText style={styles.settingText}>Completed Deadlines</ThemedText>
                            </View>
                            <IconSymbol name="chevron.right" size={16} color={textMutedColor} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: borderColor }]} />

                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <IconSymbol name="bell.fill" size={20} color={iconColor} />
                                <ThemedText style={styles.settingText}>Notifications</ThemedText>
                            </View>
                            <IconSymbol name="chevron.right" size={16} color={textMutedColor} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: borderColor }]} />

                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <IconSymbol name="moon.fill" size={20} color={iconColor} />
                                <ThemedText style={styles.settingText}>Appearance</ThemedText>
                            </View>
                            <IconSymbol name="chevron.right" size={16} color={textMutedColor} />
                        </TouchableOpacity>
                    </ThemedView>
                </View>
                {/* Theme Switcher */}
                <ThemeSwitcher />
                {/* Sign Out Section */}
                <View style={styles.signOutSection}>
                    <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
                        <SignOutButton />
                    </ThemedView>
                </View>
            </ThemedScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileInfo: {
        marginLeft: 16,
        flex: 1,
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