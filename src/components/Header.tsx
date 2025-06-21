import dayjs from 'dayjs';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

type HeaderProps = {
    activeCount: number;
    attentionCount: number;
}

const Header = ({ activeCount, attentionCount }: HeaderProps) => {
    const today = Date.now()
    const formattedDate = dayjs(today).format('dddd, MMMM DD')
    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.dateRow}>
                <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
                <ThemedText style={styles.statusSummary}>
                    {activeCount} active • {attentionCount} needs attention
                </ThemedText>
            </ThemedView>
            <ThemedView style={styles.settings}>
                <IconSymbol size={28} name="gearshape.fill" color='white' />
            </ThemedView>
        </ThemedView>
    )
}

export default Header

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#2d2d2d',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        paddingBottom: 15,
        borderColor: '#535353',
    },
    dateRow: {
        backgroundColor: '#2d2d2d',
        paddingTop: 20,
        justifyContent: 'space-between'
    },
    dateText: {
        fontWeight: '600',
        fontSize: 20,
        marginBottom: 10,
        color: '#ffffff'
    },
    statusSummary: {
        fontSize: 14,
        color: '#b0b0b0',
    },
    settings: {
        backgroundColor: '#2d2d2d',
        justifyContent: 'center'
    }

})