import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface SourceSelectorProps {
    selectedSource: string;
    onSelectSource: (source: 'arc' | 'library' | 'personal') => void;
}

export const SourceSelector = ({ selectedSource, onSelectSource }: SourceSelectorProps) => {
    const sources = [
        { key: 'arc', label: '📚 ARC' },
        { key: 'library', label: '📖 Library' },
        { key: 'personal', label: '📗 Personal' }
    ];

    return (
        <View style={styles.formatSelector}>
            {sources.map((source) => (
                <TouchableOpacity
                    key={source.key}
                    style={[
                        styles.formatChip,
                        selectedSource === source.key && styles.formatChipSelected
                    ]}
                    onPress={() => onSelectSource(source.key as 'arc' | 'library' | 'personal')}
                >
                    <ThemedText style={[
                        styles.formatChipText,
                        selectedSource === source.key && styles.formatChipTextSelected
                    ]}>
                        {source.label}
                    </ThemedText>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    formatSelector: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    formatChip: {
        backgroundColor: '#404040',
        borderRadius: 20,
        padding: 8,
        paddingHorizontal: 16,
    },
    formatChipSelected: {
        backgroundColor: '#4ade80',
    },
    formatChipText: {
        fontSize: 14,
        color: '#b0b0b0',
    },
    formatChipTextSelected: {
        color: '#1a1a1a',
        fontWeight: '600',
    },
}); 