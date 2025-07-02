import { useTheme } from '@/theme'
import { ReadingDeadlineWithProgress } from '@/types/deadline'
import dayjs from 'dayjs'
import React from 'react'
import { StyleSheet } from 'react-native'
import { ThemedText, ThemedView } from '@/components/themed'

const makeUpperCaseFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const BookDetailsSection = (
    { deadline }: { deadline: ReadingDeadlineWithProgress }
) => {
    const { theme } = useTheme();
    const borderColor = theme.border;
    return (
        <ThemedView borderColor={borderColor} backgroundColor="card" style={styles.section}>
            <ThemedView style={styles.sectionTitle}>
                <ThemedText style={styles.sectionIcon}>📚</ThemedText>
                <ThemedText type="subtitle">Book Details</ThemedText>
            </ThemedView>

            <ThemedView style={styles.detailsGrid}>
                <ThemedView style={[styles.detailRow, { borderBottomColor: theme.border }]}>
                    <ThemedText color="textMuted">Author</ThemedText>
                    <ThemedText style={styles.detailsValue}>{deadline.author || 'Unknown'}</ThemedText>
                </ThemedView>
                <ThemedView style={[styles.detailRow, { borderBottomColor: theme.border }]}>
                    <ThemedText color="textMuted">Format</ThemedText>
                    <ThemedText style={styles.detailsValue}>
                        {deadline.format.charAt(0).toUpperCase() + deadline.format.slice(1)}
                    </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.detailRow, { borderBottomColor: theme.border }]}>
                    <ThemedText color="textMuted">Priority</ThemedText>
                    <ThemedText style={styles.detailsValue}>{makeUpperCaseFirstLetter(deadline.flexibility)}</ThemedText>
                </ThemedView>
                <ThemedView style={[styles.detailRow, { borderBottomColor: theme.border }]}>
                    <ThemedText color="textMuted">Source</ThemedText>
                    <ThemedText style={styles.detailsValue}>{makeUpperCaseFirstLetter(deadline.source)}</ThemedText>
                </ThemedView>
                <ThemedView style={[styles.detailRow, { borderBottomColor: theme.border }]}>
                    <ThemedText color="textMuted">Added</ThemedText>
                    <ThemedText style={styles.detailsValue}>{dayjs(deadline.created_at || '').format('MMMM DD, YYYY')}</ThemedText>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    )
}

export default BookDetailsSection

const styles = StyleSheet.create({
    section: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    sectionTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionIcon: {
        fontSize: 18,
    },
    detailsGrid: {
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    detailsValue: {
        fontWeight: '600',
        fontSize: 17,
    },
})