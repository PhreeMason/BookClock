import { ThemedText } from '@/components/ThemedText';
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

    return (
        <View style={styles.formatSelector}>
            {formats.map((format) => (
                <TouchableOpacity
                    key={format.key}
                    style={[
                        styles.formatChip,
                        selectedFormat === format.key && styles.formatChipSelected
                    ]}
                    onPress={() => onSelectFormat(format.key as 'physical' | 'ebook' | 'audio')}
                >
                    <ThemedText style={[
                        styles.formatChipText,
                        selectedFormat === format.key && styles.formatChipTextSelected
                    ]}>
                        {format.label}
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