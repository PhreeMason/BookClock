import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface SourceSelectorProps {
    selectedSource: string;
    onSelectSource: (source: 'arc' | 'library' | 'personal') => void;
}

export const SourceSelector = ({ selectedSource, onSelectSource }: SourceSelectorProps) => {
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    
    const sources = [
        { key: 'arc', label: '📚 ARC' },
        { key: 'library', label: '📖 Library' },
        { key: 'personal', label: '📗 Personal' }
    ];

    return (
        <View style={styles.sourceSelector}>
            {sources.map((source) => {
                const isSelected = selectedSource === source.key;
                return (
                    <TouchableOpacity
                        key={source.key}
                        style={[
                            styles.sourceChip,
                            { 
                                backgroundColor: isSelected ? `${primaryColor}20` : cardColor, // primary with opacity or card
                            }
                        ]}
                        onPress={() => onSelectSource(source.key as 'arc' | 'library' | 'personal')}
                    >
                        <ThemedText 
                            color={isSelected ? 'primary' : 'textMuted'}
                            style={[
                                styles.sourceChipText,
                                isSelected && styles.sourceChipTextSelected
                            ]}
                        >
                            {source.label}
                        </ThemedText>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    sourceSelector: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    sourceChip: {
        borderRadius: 20,
        padding: 8,
        paddingHorizontal: 16,
    },
    sourceChipText: {
        fontSize: 14,
    },
    sourceChipTextSelected: {
        fontWeight: '600',
    },
}); 