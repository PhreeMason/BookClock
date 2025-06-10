import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type AudioProgressProps = {
    control: any;
    errors: any;
}

const AudioProgress: React.FC<AudioProgressProps> = ({ control, errors }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Current Audiobook Progress</Text>
            <View style={styles.inputRow}>
                <View>
                    <Text style={styles.label}>Hours</Text>
                    <Controller
                        control={control}
                        name="currentHours"
                        render={({ field: { value, onChange } }) => (
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                value={value?.toString()}
                                onChangeText={onChange}
                                keyboardType="numeric"
                            />
                        )}
                    />
                    {errors.currentHours && (
                        <Text style={styles.errorText}>{errors.currentHours.message}</Text>
                    )}
                </View>

                <View>
                    <Text style={styles.label}>Minutes</Text>
                    <Controller
                        control={control}
                        name="currentMinutes"
                        render={({ field: { value, onChange } }) => (
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                value={value?.toString()}
                                onChangeText={onChange}
                                keyboardType="numeric"
                            />
                        )}
                    />
                    {errors.currentMinutes && (
                        <Text style={styles.errorText}>{errors.currentMinutes.message}</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
        marginTop: 16,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 16,
    },
    label: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
    },
});

export default AudioProgress;
