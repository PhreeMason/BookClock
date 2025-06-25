import { palette } from '@/constants/palette'
import { ReadingDeadlineWithProgress } from '@/types/deadline'
import dayjs from 'dayjs'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

const BookDetailsSection = (
    { deadline }: { deadline: ReadingDeadlineWithProgress }
) => {
    return (
        <ThemedView backgroundColor="card" style={styles.section}>
            <View style={styles.sectionTitle}>
                <ThemedText style={styles.sectionIcon}>📚</ThemedText>
                <ThemedText type="subtitle">Book Details</ThemedText>
            </View>

            <View style={styles.detailsGrid}>
                <View style={[styles.detailRow]}>
                    <ThemedText color="textMuted">Author</ThemedText>
                    <ThemedText style={styles.detailsValue}>{deadline.author || 'Unknown'}</ThemedText>
                </View>
                <View style={[styles.detailRow]}>
                    <ThemedText color="textMuted">Format</ThemedText>
                    <ThemedText style={styles.detailsValue}>
                        {deadline.format.charAt(0).toUpperCase() + deadline.format.slice(1)}
                    </ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <ThemedText color="textMuted">Priority</ThemedText>
                    <ThemedText style={styles.detailsValue}>{deadline.flexibility.charAt(0).toUpperCase() + deadline.flexibility.slice(1)}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <ThemedText color="textMuted">Source</ThemedText>
                    <ThemedText style={styles.detailsValue}>{deadline.source}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <ThemedText color="textMuted">Added</ThemedText>
                    <ThemedText style={styles.detailsValue}>{dayjs(deadline.created_at || '').format('MMMM DD, YYYY')}</ThemedText>
                </View>
            </View>
        </ThemedView>
    )
}

export default BookDetailsSection

const styles = StyleSheet.create({
    section: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
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
        borderBottomColor: palette.celadon[600],
    },
    detailsValue: {
        fontWeight: '600',
        fontSize: 17,
    },
})