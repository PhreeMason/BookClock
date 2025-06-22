import { SignOutButton } from '@/components/SignOutButton';
import { ThemedScrollView } from '@/components/ThemedScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { UserAvatar } from '@/components/UserAvatar';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const { user } = useUser();
    const backgroundColor = useThemeColor({}, 'background');
    const cardBackgroundColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const iconColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');
    const textMutedColor = useThemeColor({}, 'textMuted');

    const handleBackPress = () => {
        router.back();
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={iconColor} />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                    Settings
                </ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ThemedScrollView style={styles.content}>
                {/* User Profile Section */}
                <View style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor }]}>
                    <View style={styles.profileHeader}>
                        <UserAvatar size={80} />
                        <View style={styles.profileInfo}>
                            <ThemedText type="defaultSemiBold" style={styles.userName}>
                                {user?.fullName || user?.firstName || 'User'}
                            </ThemedText>
                            <ThemedText colorName="textMuted" style={styles.userEmail}>
                                {user?.primaryEmailAddress?.emailAddress}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Settings Options */}
                <View style={styles.settingsSection}>
                    <View style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor }]}>
                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <IconSymbol name="person.fill" size={20} color={iconColor} />
                                <ThemedText style={styles.settingText}>Edit Profile</ThemedText>
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
                    </View>
                </View>

                {/* Sign Out Section */}
                <View style={styles.signOutSection}>
                    <View style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor }]}>
                        <SignOutButton />
                    </View>
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
        padding: 8,
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