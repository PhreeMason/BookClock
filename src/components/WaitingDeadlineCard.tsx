import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

const WaitingDeadlineCard = () => {
    return (
        <ThemedView style={styles.content}>
            <Text style={styles.icon}>📚</Text>
            <ThemedView style={styles.textContainer}>
                <ThemedText style={styles.title}>The Atlas Six</ThemedText>
                <ThemedText style={styles.description}>ARC requested • Awaiting Approval</ThemedText>
            </ThemedView>
        </ThemedView>
    )
}

export default WaitingDeadlineCard

const styles = StyleSheet.create({
    content: {
        flexDirection: 'row',
        backgroundColor: '#2d2d2d',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#404040',
        paddingVertical: 10

    },
    textContainer: {
        backgroundColor: '#2d2d2d',
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
        color: '#ffffff',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#b0b0b0',
    }
})