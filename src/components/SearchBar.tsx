import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type SearchBarProps = {
    onSearch: (query: string) => void;
    placeholder?: string;
};

export default function SearchBar({ onSearch, placeholder = "Search..." }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
        }
    };

    const handleClear = () => {
        setSearchQuery('');
    };

    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <IconSymbol 
                    name="magnifyingglass" 
                    size={20} 
                    color="#666" 
                    style={styles.searchIcon} 
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder={placeholder}
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
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
});