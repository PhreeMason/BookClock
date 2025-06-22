import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface FormatSelectorProps {
    selectedFormat: string;
    onSelectFormat: (format: 'physical' | 'ebook' | 'audio') => void;
}

export const FormatSelector = ({ selectedFormat, onSelectFormat }: FormatSelectorProps) => {
    const formats = [
        { key: 'physical', label: 'Physical' },
        { key: 'ebook', label: 'E-book' },
        { key: 'audio', label: 'Audio' }
    ];

    const cardColor = useThemeColor({}, 'card');
    const mutedTextColor = useThemeColor({}, 'textMuted');
    const primaryColor = useThemeColor({}, 'primary');
    const primaryBackgroundColor = useThemeColor({light: 'rgba(92, 46, 184, 0.1)', dark: 'rgba(74, 222, 128, 0.1)'}, 'primary');

    return (
        <View style={styles.formatSelector} testID="format-selector">
            {formats.map((format) => {
                const isSelected = selectedFormat === format.key;
                return (
                    <TouchableOpacity
                        key={format.key}
                        testID={`format-chip-${format.key}`}
                        style={[
                            styles.formatChip,
                            { 
                                backgroundColor: isSelected ? primaryBackgroundColor : cardColor,
                            }
                        ]}
                        onPress={() => onSelectFormat(format.key as 'physical' | 'ebook' | 'audio')}
                    >
                        <ThemedText style={[
                            styles.formatChipText,
                            { color: isSelected ? primaryColor : mutedTextColor },
                            isSelected && styles.formatChipTextSelected
                        ]}>
                            {format.label}
                        </ThemedText>
                    </TouchableOpacity>
                );
            })}
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
        borderRadius: 20,
        padding: 8,
        paddingHorizontal: 16,
    },
    formatChipText: {
        fontSize: 14,
    },
    formatChipTextSelected: {
        fontWeight: '600',
    },
}); 