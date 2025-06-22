import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FormHeaderProps {
    title: string;
    onBack: () => void;
    showBack: boolean;
    onSkip?: () => void;
    showSkip?: boolean;
}

export const FormHeader = ({ title, onBack, showBack, onSkip, showSkip }: FormHeaderProps) => {
    return (
        <ThemedView style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                disabled={!showBack}
            >
                {showBack && <ThemedText style={styles.backButtonText}>←</ThemedText>}
            </TouchableOpacity>

            <ThemedText style={styles.headerTitle}>{title}</ThemedText>

            {showSkip && onSkip && (
                <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                    <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
                </TouchableOpacity>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#404040',
    },
    backButton: {
        padding: 5,
        minWidth: 44,
    },
    backButtonText: {
        fontSize: 18,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    skipButton: {
        padding: 5,
        minWidth: 44,
    },
    skipButtonText: {
        fontSize: 16,
        color: '#4ade80',
        fontWeight: '600',
    },
}); 