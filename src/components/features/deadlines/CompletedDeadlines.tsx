import { DeadlineCard } from '@/components/features/deadlines/DeadlineCard'
import { ThemedScrollView, ThemedText, ThemedView } from '@/components/themed'
import { useGetCompletedDeadlines } from '@/hooks/useDeadlines'
import { ReadingDeadlineWithProgress } from '@/types/deadline'
import { StyleSheet, View } from 'react-native'

const CompletedDeadlines = () => {
    const { data: completedDeadlines = [], isLoading, error } = useGetCompletedDeadlines();
    
    // Separate completed and set aside deadlines
    const completed = completedDeadlines.filter(deadline => {
        const latestStatus = deadline.status?.[deadline.status.length - 1]?.status;
        return latestStatus === 'complete';
    });
    
    const setAside = completedDeadlines.filter(deadline => {
        const latestStatus = deadline.status?.[deadline.status.length - 1]?.status;
        return latestStatus === 'set_aside';
    });

    if (isLoading) {
        return (
            <ThemedScrollView>
                <ThemedView backgroundColor="background" style={styles.container}>
                    <ThemedText>Loading completed deadlines...</ThemedText>
                </ThemedView>
            </ThemedScrollView>
        );
    }   

    if (error) {
        return (
            <ThemedScrollView>
                <ThemedView backgroundColor="background" style={styles.container}>
                    <ThemedText color="error" style={styles.errorText}>Error loading deadlines: {error.message}</ThemedText>
                </ThemedView>
            </ThemedScrollView>
        );
    }

    const renderSection = (title: string, deadlines: ReadingDeadlineWithProgress[]) => {
        if (deadlines.length === 0) return null;
        
        return (
            <View style={styles.section}>
                <ThemedText
                    type='semiBold'
                    color='textMuted'
                    style={styles.sectionTitle}
                >
                    {title}
                </ThemedText>
                {deadlines.map((deadline) => (
                    <DeadlineCard
                        key={deadline.id}
                        deadline={deadline}
                    />
                ))}
            </View>
        );
    };

    return (
        <ThemedScrollView backgroundColor="background">
            <ThemedView backgroundColor="background" style={styles.container}>
                {completedDeadlines.length > 0 ? (
                    <>
                        {renderSection('COMPLETED', completed)}
                        {renderSection('SET ASIDE', setAside)}
                    </>
                ) : (
                    <ThemedText
                        style={styles.emptyText}
                        color='textMuted'
                    >
                        No completed deadlines yet
                    </ThemedText>
                )}
            </ThemedView>
        </ThemedScrollView>
    )
}

export default CompletedDeadlines

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 20
    },
    section: {
        gap: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 50,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center'
    },
})