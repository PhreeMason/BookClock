import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type IconSymbolName = React.ComponentProps<typeof IconSymbol>['name'];

export type FormatCategory = 'reading' | 'listening' | 'combined';

interface ReadingListeningToggleProps {
    selectedCategory: FormatCategory;
    onCategoryChange: (category: FormatCategory) => void;
}

const ReadingListeningToggle: React.FC<ReadingListeningToggleProps> = ({
    selectedCategory,
    onCategoryChange,
}) => {
    const { theme } = useTheme();

    const categories = [
        {
            key: 'combined' as const,
            label: 'Combined',
            icon: 'chart.bar.fill' as IconSymbolName,
            description: 'All formats together'
        },
        {
            key: 'reading' as const,
            label: 'Reading',
            icon: 'book.fill' as IconSymbolName,
            description: 'Physical books & ebooks'
        },
        {
            key: 'listening' as const,
            label: 'Listening',
            icon: 'headphones' as IconSymbolName,
            description: 'Audiobooks'
        }
    ];

    return (
        <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="slider.horizontal.3" size={20} color={theme.primary} />
                <ThemedText style={styles.headerText}>View</ThemedText>
            </View>
            
            <View style={styles.toggleContainer}>
                {categories.map((category) => {
                    const isSelected = selectedCategory === category.key;
                    
                    return (
                        <TouchableOpacity
                            key={category.key}
                            style={[
                                styles.toggleButton,
                                {
                                    backgroundColor: isSelected ? theme.primary : theme.surface,
                                    borderColor: isSelected ? theme.primary : theme.border,
                                }
                            ]}
                            onPress={() => onCategoryChange(category.key)}
                            activeOpacity={0.7}
                        >
                            <IconSymbol 
                                name={category.icon} 
                                size={16} 
                                color={isSelected ? theme.background : theme.text} 
                            />
                            <ThemedText 
                                style={[
                                    styles.toggleLabel,
                                    { color: isSelected ? theme.background : theme.text }
                                ]}
                            >
                                {category.label}
                            </ThemedText>
                            <ThemedText 
                                style={[
                                    styles.toggleDescription,
                                    { color: isSelected ? theme.background : theme.textMuted }
                                ]}
                            >
                                {category.description}
                            </ThemedText>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    toggleButton: {
        flex: 1,
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
        alignItems: 'center',
        minHeight: 80,
        justifyContent: 'center',
    },
    toggleLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 6,
        marginBottom: 2,
        textAlign: 'center',
    },
    toggleDescription: {
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 14,
    },
});

export default ReadingListeningToggle;