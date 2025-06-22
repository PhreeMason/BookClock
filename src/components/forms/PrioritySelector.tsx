import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PrioritySelectorProps {
    selectedPriority: string;
    onSelectPriority: (priority: 'flexible' | 'strict') => void;
}

export const PrioritySelector = ({ selectedPriority, onSelectPriority }: PrioritySelectorProps) => {
    const priorities = [
        { key: 'flexible', label: 'Flexible', icon: '🕐' },
        { key: 'strict', label: 'Must Meet', icon: '⚡' }
    ];

    const cardColor = useThemeColor({}, 'card');
    const mutedBorderColor = useThemeColor({}, 'textMuted');
    const primaryColor = useThemeColor({}, 'primary');
    const primaryBackgroundColor = useThemeColor({light: 'rgba(92, 46, 184, 0.1)', dark: 'rgba(74, 222, 128, 0.1)'}, 'primary');

    return (
        <View style={styles.priorityOptions} testID="priority-options">
            {priorities.map((priority) => {
                const isSelected = selectedPriority === priority.key;
                return (
                    <TouchableOpacity
                        key={priority.key}
                        testID={`priority-option-${priority.key}`}
                        style={[
                            styles.priorityOption,
                            { 
                                backgroundColor: isSelected ? primaryBackgroundColor : cardColor,
                                borderColor: isSelected ? primaryColor : mutedBorderColor,
                            }
                        ]}
                        onPress={() => onSelectPriority(priority.key as 'flexible' | 'strict')}
                    >
                        <Text style={[styles.priorityIcon, !isSelected && { opacity: 0.5}]}>{priority.icon}</Text>
                        <ThemedText style={[{fontWeight: '600'}, !isSelected && { opacity: 0.7 }]}>{priority.label}</ThemedText>
                    </TouchableOpacity>
                )
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    priorityOptions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    priorityOption: {
        flex: 1,
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    priorityIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
}); 