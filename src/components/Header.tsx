import { useTheme } from '@/theme';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed';
import { ThemedView } from './themed';
import { IconSymbol } from './ui/IconSymbol';

type HeaderProps = {
    activeCount: number;
    attentionCount: number;
    totalReadingTimePerDay: string;
}

const Header = ({ activeCount, attentionCount, totalReadingTimePerDay }: HeaderProps) => {
    const today = Date.now()
    const formattedDate = dayjs(today).format('dddd, MMMM DD')
    const { theme } = useTheme();
    const iconColor = theme.primary;

    const handleSettingsPress = () => {
        router.push('/settings');
    };

    return (
        <ThemedView backgroundColor="background" borderColor="border" style={styles.container}>
            <ThemedView backgroundColor="background" style={styles.dateRow}>
                <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
                <ThemedText color="textMuted" style={styles.statusSummary}>
                    {activeCount} active • {attentionCount} needs attention
                </ThemedText>
                <ThemedText color="textMuted" style={styles.readingTimeSummary}>
                    {totalReadingTimePerDay}
                </ThemedText>
            </ThemedView>
            <TouchableOpacity 
                style={styles.settings} 
                onPress={handleSettingsPress}
            >
                <IconSymbol size={28} name="gearshape.fill" color={iconColor} />
            </TouchableOpacity>
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