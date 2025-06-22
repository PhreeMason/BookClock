import DeadlineCard from '@/components/DeadlineCard'
import { ThemedScrollView } from '@/components/ThemedScrollView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import WaitingDeadlineCard from '@/components/WaitingDeadlineCard'
import { useDeadlines } from '@/contexts/DeadlineProvider'
import { Link } from 'expo-router'
import { StyleSheet } from 'react-native'
import Button from './Button'

const ActiveReads = () => {
    const { activeDeadlines, isLoading, error } = useDeadlines()

    if (isLoading) {
        return (
            <ThemedScrollView>
                <ThemedView style={styles.container}>
                    <ThemedText>Loading active deadlines...</ThemedText>
                </ThemedView>
            </ThemedScrollView>
        );
    }

    if (error) {
        return (
            <ThemedScrollView>
                <ThemedView style={styles.container}>
                    <ThemedText style={styles.errorText}>Error loading deadlines: {error.message}</ThemedText>
                </ThemedView>
            </ThemedScrollView>
        );
    }

    return (
        <ThemedScrollView>
            <ThemedView style={styles.container}>
                <ThemedText 
                    type='defaultSemiBold'
                    colorName='textMuted'
                    style={styles.pageTitle}>ACTIVE DEADLINES</ThemedText>
                {activeDeadlines.length > 0 ? (
                    activeDeadlines.map((deadline) => (
                        <DeadlineCard 
                            key={deadline.id}
                            deadline={deadline}
                        />
                    ))
                ) : (
                    <ThemedText 
                        style={styles.emptyText}
                        colorName='textMuted'
                    >No active deadlines</ThemedText>
                )}
            </ThemedView>
            <ThemedView style={styles.container}>
                <ThemedText 
                    type='defaultSemiBold'
                    colorName='textMuted'
                    style={styles.pageTitle}>WAITING</ThemedText>
                <WaitingDeadlineCard />
                <WaitingDeadlineCard />
            </ThemedView>
            <Link href='/deadline/new' asChild>
                <Button 
                    title='+ Add New Book'
                    onPress={() => {}}
                    style={styles.addNewButton}
                />
            </Link>
        </ThemedScrollView>
    )
}

export default ActiveReads

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 20
    },
    pageTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic'
    },
    errorText: {
        fontSize: 14,
        color: '#DC2626',
        textAlign: 'center'
    },
    addNewButton: {
        margin: 20,
    },
})