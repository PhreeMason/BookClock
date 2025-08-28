import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

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
        <ThemedView backgroundColor="surfaceHover" borderColor="border" style={styles.container}>
            <ThemedView backgroundColor="surfaceHover" style={styles.dateRow}>
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
        justifyContent: 'space-between',
    },
    dateText: {
        fontSize: 28,
        marginBottom: 10,
        fontFamily: 'CrimsonText-Bold',
        lineHeight: 28,
        letterSpacing: -0.4,
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