import { ThemedScrollView } from "@/components/ThemedScrollView"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useState } from "react"
import { StyleSheet, TextInput, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = () => {
        if (searchQuery.trim()) {
            // Implement your search logic here
            console.log('Searching for:', searchQuery)
        }
    }

    const handleClear = () => {
        setSearchQuery('')
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ThemedScrollView>
                <ThemedView style={styles.container}>
                    <ThemedText type="title" style={styles.title}>Search</ThemedText>
                    
                    <ThemedView style={styles.searchContainer}>
                        <ThemedView style={styles.searchBar}>
                            <IconSymbol 
                                name="magnifyingglass" 
                                size={20} 
                                color="#666" 
                                style={styles.searchIcon} 
                            />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search for books..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={handleSearch}
                                returnKeyType="search"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                                    <IconSymbol name="xmark.circle.fill" size={20} color="#666" />
                                </TouchableOpacity>
                            )}
                        </ThemedView>
                        
                        <TouchableOpacity 
                            style={styles.searchButton} 
                            onPress={handleSearch}
                            disabled={!searchQuery.trim()}
                        >
                            <ThemedText style={styles.searchButtonText}>Search</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>

                    {searchQuery.length > 0 && (
                        <ThemedView style={styles.resultsContainer}>
                            <ThemedText type="subtitle">
                                Search results for "{searchQuery}"
                            </ThemedText>
                            <ThemedText type="default">
                                No results found. Implement your search functionality here.
                            </ThemedText>
                        </ThemedView>
                    )}
                </ThemedView>
            </ThemedScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
    },
    searchContainer: {
        gap: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
        color: '#333',
    },
    clearButton: {
        padding: 4,
    },
    searchButton: {
        backgroundColor: '#0a7ea4',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        alignSelf: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsContainer: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        gap: 8,
    },
})