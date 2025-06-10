import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type AudioDurationProps = {
    control: any;
    errors: any;
};

const AudioDuration: React.FC<AudioDurationProps> = ({ control, errors }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Audiobook Total Time</Text>
            <View style={styles.inputRow}>
                <View>
                    <Text style={styles.label}>Hours</Text>
                    <Controller
                        control={control}
                        name="hours"
                        render={({ field: { value, onChange } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.hours && styles.inputError
                                ]}
                                placeholder="0"
                                value={value?.toString() ?? ''}
                                onChangeText={onChange}
                                keyboardType="numeric"
                            />
                        )}
                    />
                    {errors.hours && (
                        <Text style={styles.errorText}>
                            {errors.hours.message}
                        </Text>
                    )}
                </View>
                <View>
                    <Text style={styles.label}>Minutes</Text>
                    <Controller
                        control={control}
                        name="minutes"
                        render={({ field: { value, onChange } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.minutes && styles.inputError
                                ]}
                                placeholder="0"
                                value={value?.toString() ?? ''}
                                onChangeText={onChange}
                                keyboardType="numeric"
                            />
                        )}
                    />
                    {errors.minutes && (
                        <Text style={styles.errorText}>
                            {errors.minutes.message}
                        </Text>
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
    inputError: {
        borderColor: '#DC2626',
    },
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        marginTop: 4,
    },
});

export default AudioDuration;