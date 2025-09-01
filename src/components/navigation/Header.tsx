import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import TodaysGoals from '../progress/TodaysGoals';

const Header = () => {
    const today = Date.now();
    const formattedDate = dayjs(today).format('dddd, MMMM DD');

    const handleSettingsPress = () => {
        router.push('/settings');
    };

    return (
        <LinearGradient
            colors={['#E8C2B9', '#B8A9D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <ThemedView backgroundColor="none" style={styles.dateRow}>
                <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
                <TouchableOpacity
                    style={styles.settings}
                    onPress={handleSettingsPress}
                >
                    <IconSymbol size={28} name="gearshape.fill" color={"rgba(222, 222, 222, 0.76)"} />
                </TouchableOpacity>
            </ThemedView>
            <TodaysGoals />
        </LinearGradient>

    );
};

export default Header

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        gap: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        paddingVertical: 10,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 28,
        fontFamily: 'CrimsonText-Bold',
        letterSpacing: -0.4,
        color: 'rgba(250, 248, 245, 1)',
    },
    statusSummary: {
        fontSize: 14,
    },
    readingTimeSummary: {
        fontSize: 14,
    },
    settings: {
        padding: 1,
        borderRadius: 50,
    }

})