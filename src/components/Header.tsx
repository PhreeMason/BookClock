import { useThemeColor } from '@/hooks/useThemeColor';
import dayjs from 'dayjs';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

type HeaderProps = {
    activeCount: number;
    attentionCount: number;
    totalReadingTimePerDay: string;
}

const Header = ({ activeCount, attentionCount, totalReadingTimePerDay }: HeaderProps) => {
    const today = Date.now()
    const formattedDate = dayjs(today).format('dddd, MMMM DD')
    const backgroundColor = useThemeColor({}, 'background');
    const mutedColor = useThemeColor({}, 'textMuted');
    const borderColor = useThemeColor({}, 'border');
    const iconColor = useThemeColor({}, 'icon');

    return (
        <ThemedView style={[styles.container, { borderBottomColor: borderColor, backgroundColor }]}>
            <ThemedView style={[styles.dateRow, { backgroundColor }]}>
                <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
                <ThemedText style={[styles.statusSummary, { color: mutedColor}]}>
                    {activeCount} active • {attentionCount} needs attention
                </ThemedText>
                <ThemedText style={[styles.readingTimeSummary, { color: mutedColor}]}>
                    {totalReadingTimePerDay}
                </ThemedText>
            </ThemedView>
            <ThemedView style={[styles.settings, { backgroundColor }]}>
                <IconSymbol size={28} name="gearshape.fill" color={iconColor} />
            </ThemedView>
        </ThemedView>
    )
}

export default Header

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        paddingBottom: 15,
    },
    dateRow: {
        paddingTop: 20,
        justifyContent: 'space-between'
    },
    dateText: {
        fontWeight: '600',
        fontSize: 20,
        marginBottom: 10,
    },
    statusSummary: {
        fontSize: 14,
    },
    readingTimeSummary: {
        fontSize: 14,
    },
    settings: {
        justifyContent: 'center'
    }

})