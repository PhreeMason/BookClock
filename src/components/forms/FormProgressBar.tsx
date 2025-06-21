import React from 'react';
import { StyleSheet, View } from 'react-native';

interface FormProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export const FormProgressBar = ({ currentStep, totalSteps }: FormProgressBarProps) => {
    const progress = (currentStep / totalSteps) * 100;
    return (
        <View style={styles.progressContainer} testID="progress-container">
            <View style={styles.progressBar} testID="progress-bar">
                <View style={[styles.progressFill, { width: `${progress}%` }]} testID="progress-fill" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    progressContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#404040',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4ade80',
        borderRadius: 2,
    },
}); 