import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { StyleSheet, TextInput, TouchableOpacity } from "react-native"

interface SearchBarProps {
    value: string
    onChangeText: (text: string) => void
    placeholder?: string
    onClear?: () => void
}

export function SearchBar({ 
    value, 
    onChangeText, 
    placeholder = "Search...", 
    onClear 
}: SearchBarProps) {
    const handleClear = () => {
        onChangeText('')
        onClear?.()
    }

    return (
        <ThemedView style={styles.searchBar}>
            <IconSymbol
                name="magnifyingglass"
                size={20}
                color="#666"
                style={styles.searchIcon}
            />
            <TextInput
                style={styles.searchInput}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                    <IconSymbol name="xmark.circle.fill" size={20} color="#666" />
                </TouchableOpacity>
            )}
        </ThemedView>
    )
}

const styles = StyleSheet.create({
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
}) 