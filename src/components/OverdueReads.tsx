import ActiveBookCard from '@/components/ActiveBookCard'
import { ReadingDeadlineWithProgress } from '@/types/deadline'
import { StyleSheet } from 'react-native'
import { ThemedScrollView } from './ThemedScrollView'
import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

const OverdueReads = ({deadlines}:{
    deadlines?: ReadingDeadlineWithProgress[]
}) => {
    const overdueDeadlines: ReadingDeadlineWithProgress[] = deadlines ?? [];

    return (
        <ThemedScrollView>
            <ThemedView style={styles.container}>
                <ThemedText style={styles.pageTitle}>OVERDUE DEADLINES</ThemedText>
                {overdueDeadlines.length > 0 ? (
                    overdueDeadlines.map((deadline) => (
                        <ActiveBookCard 
                            key={deadline.id}
                            deadline={deadline}
                        />
                    ))
                ) : (
                    <ThemedText style={styles.emptyText}>No overdue deadlines</ThemedText>
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
        fontWeight: '600',
        color: '#b0b0b0'
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic'
    }
})