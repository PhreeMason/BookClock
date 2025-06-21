import { ThemedText } from '@/components/ThemedText';
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

    return (
        <View style={styles.priorityOptions}>
            {priorities.map((priority) => (
                <TouchableOpacity
                    key={priority.key}
                    style={[
                        styles.priorityOption,
                        selectedPriority === priority.key && styles.priorityOptionSelected
                    ]}
                    onPress={() => onSelectPriority(priority.key as 'flexible' | 'strict')}
                >
                    <Text style={styles.priorityIcon}>{priority.icon}</Text>
                    <ThemedText style={styles.priorityLabel}>{priority.label}</ThemedText>
                </TouchableOpacity>
            ))}
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
        backgroundColor: '#2d2d2d',
        borderWidth: 2,
        borderColor: '#404040',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    priorityOptionSelected: {
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
    },
    priorityIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    priorityLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
}); 