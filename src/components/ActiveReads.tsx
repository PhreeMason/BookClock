import DeadlineCard from '@/components/DeadlineCard'
import { ThemedScrollView } from '@/components/ThemedScrollView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useDeadlines } from '@/contexts/DeadlineProvider'
import { Link } from 'expo-router'
import { StyleSheet } from 'react-native'
import { ThemedButton } from './ThemedButton'

const ActiveReads = () => {
    const { activeDeadlines, isLoading, error } = useDeadlines()

    if (isLoading) {
        return (
            <ThemedScrollView>
                <ThemedView backgroundColor="card" style={styles.container}>
                    <ThemedText>Loading active deadlines...</ThemedText>
                </ThemedView>
            </ThemedScrollView>
        );
    }

    if (error) {
        return (
            <ThemedScrollView>
                <ThemedView backgroundColor="card" style={styles.container}>
                    <ThemedText color="error" style={styles.errorText}>Error loading deadlines: {error.message}</ThemedText>
                </ThemedView>
            </ThemedScrollView>
        );
    }

    return (
        <ThemedScrollView>
            <ThemedView backgroundColor="card" style={styles.container}>
                <ThemedText
                    type='defaultSemiBold'
                    color='textMuted'
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
                        color='textMuted'
                    >No active deadlines</ThemedText>
                )}
            </ThemedView>
            <Link href="/deadline/new" asChild>
                <ThemedButton
                    title='+ Add New Book'
                    style={styles.addNewButton}
                    variant='primary'
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
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic'
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center'
    },
    addNewButton: {
        margin: 20,
    },
})