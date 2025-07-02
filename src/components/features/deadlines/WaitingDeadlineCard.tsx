import { ThemedText, ThemedView } from '@/components/themed';
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

const WaitingDeadlineCard = () => {
    const { theme } = useTheme();
    const cardColor = theme.surface;
    const borderColor = theme.textMuted;
    const textColor = theme.text;
    const textMutedColor = theme.textMuted;
    
    return (
        <ThemedView style={[styles.content, { backgroundColor: cardColor, borderColor: borderColor }]}>
            <Text style={styles.icon}>📚</Text>
            <ThemedView style={[styles.textContainer, { backgroundColor: cardColor }]}>
                <ThemedText style={[styles.title, { color: textColor }]}>The Atlas Six</ThemedText>
                <ThemedText style={[styles.description, { color: textMutedColor }]}>ARC requested • Awaiting Approval</ThemedText>
            </ThemedView>
        </ThemedView>
    )
}

export default WaitingDeadlineCard

const styles = StyleSheet.create({
    content: {
        flexDirection: 'row',
        borderRadius: 10,
        borderWidth: 2,
        paddingVertical: 10
    },
    textContainer: {
    },
    icon: {
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 30,
        padding: 10
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    }
})