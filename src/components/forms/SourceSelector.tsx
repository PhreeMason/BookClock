import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
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

    const cardColor = useThemeColor({}, 'card');
    const mutedTextColor = useThemeColor({}, 'textMuted');
    const primaryColor = useThemeColor({}, 'primary');
    const primaryBackgroundColor = useThemeColor({light: 'rgba(92, 46, 184, 0.1)', dark: 'rgba(74, 222, 128, 0.1)'}, 'primary');

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
                                backgroundColor: isSelected ? primaryBackgroundColor : cardColor,
                            }
                        ]}
                        onPress={() => onSelectSource(source.key as 'arc' | 'library' | 'personal')}
                    >
                        <ThemedText style={[
                            styles.sourceChipText,
                            { color: isSelected ? primaryColor : mutedTextColor },
                            isSelected && styles.sourceChipTextSelected
                        ]}>
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