import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StepIndicatorsProps {
    currentStep: number;
    totalSteps: number;
}

export const StepIndicators = ({ currentStep, totalSteps }: StepIndicatorsProps) => {
    return (
        <View style={styles.stepsContainer} testID="steps-container">
            {Array.from({ length: totalSteps }, (_, index) => (
                <View
                    key={index}
                    testID="step-indicator"
                    style={[
                        styles.step,
                        index + 1 === currentStep && styles.stepActive,
                        index + 1 < currentStep && styles.stepCompleted
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#404040',
    },
    step: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#404040',
    },
    stepActive: {
        backgroundColor: '#4ade80',
    },
    stepCompleted: {
        backgroundColor: '#4ade80',
    },
}); 