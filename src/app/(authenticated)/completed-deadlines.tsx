import { ThemedView, ThemedText } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import CompletedDeadlines from '@/components/features/deadlines/CompletedDeadlines';

export default function CompletedDeadlinesScreen() {
    const { theme } = useTheme();
    const borderColor = theme.border;
    const iconColor = theme.primary;

    const handleBackPress = () => {
        router.back();
    };

    return (
        <ThemedView backgroundColor="background" style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={Platform.OS === 'ios' ? 24 : 40} color={iconColor} />
                </TouchableOpacity>
                <ThemedText type="semiBold" style={styles.headerTitle}>
                    Completed Deadlines
                </ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            {/* Completed Deadlines Component */}
            <CompletedDeadlines />
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
});