import ActiveBookCard from '@/components/ActiveBookCard'
import { ThemedScrollView } from '@/components/ThemedScrollView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import WaitingBookCard from '@/components/WaitingBookCard'
import { Link } from 'expo-router'
import { StyleSheet, TouchableOpacity } from 'react-native'


const ActiveReads = () => {
    return (
        <ThemedScrollView>
            <ThemedView style={styles.container}>
                <ThemedText style={styles.pageTitle}>ACTIVE DEADLINES</ThemedText>
                <ActiveBookCard />
                <ActiveBookCard bookData={{
                    title: 'Playground: A Novel',
                    author: ' Richard Powers',
                    totalPages: 320,
                    currentPage: 120,
                    daysLeft: 10,
                    format: 'Book',
                    coverUrl: 'https://m.media-amazon.com/images/I/91rnexU88KL._SL1500_.jpg'
                }} />
            </ThemedView>
            <ThemedView style={styles.container}>
                <ThemedText style={styles.pageTitle}>WAITING</ThemedText>
                <WaitingBookCard />
                <WaitingBookCard />
            </ThemedView>
            <Link href='/deadline/new' asChild>
                <TouchableOpacity style={styles.addNewButton}>
                    <ThemedView
                        style={styles.addNewButtonTextContainer}
                        lightColor='#1a1a1a'
                        darkColor='#ffffff'>
                        <ThemedText
                            lightColor='#fffff'
                            darkColor='#1a1a1a'
                            style={styles.addNewButtonText}>
                            + Add New Book
                        </ThemedText>
                    </ThemedView>
                </TouchableOpacity>
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
        color: '#b0b0b0'
    },
    addNewButton: {
        margin: 20,
    },
    addNewButtonTextContainer: {
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        height: 60,
    },
    addNewButtonText: {
        fontSize: 18,
        fontWeight: '600',
    }
})