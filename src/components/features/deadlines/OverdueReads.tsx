import { DeadlineCard } from '@/components/features/deadlines/DeadlineCard';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { StyleSheet } from 'react-native';
import { ThemedScrollView , ThemedText , ThemedView } from '@/components/themed';

const OverdueReads = () => {
    const { overdueDeadlines, isLoading, error } = useDeadlines();

    if (isLoading) {
        return (
            <ThemedScrollView>
                <ThemedView backgroundColor="card" style={styles.container}>
                    <ThemedText>Loading overdue deadlines...</ThemedText>
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
                    type='semiBold'
                    color='textMuted'
                    style={styles.pageTitle}
                >
                    OVERDUE DEADLINES
                </ThemedText>
                {overdueDeadlines.length > 0 ? (
                    overdueDeadlines.map((deadline) => (
                        <DeadlineCard 
                            key={deadline.id}
                            deadline={deadline}
                        />
                    ))
                ) : (
                    <ThemedText
                        style={styles.emptyText}
                        color='textMuted'
                    >
                        No overdue deadlines
                    </ThemedText>
                )}
            </ThemedView>
        </ThemedScrollView>
    )
}

export default OverdueReads

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
    }
})