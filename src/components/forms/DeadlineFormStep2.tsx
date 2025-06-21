import CustomInput from '@/components/CustomInput';
import { ThemedText } from '@/components/ThemedText';
import { DeadlineFormData } from '@/lib/deadlineFormSchema';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PrioritySelector } from './PrioritySelector';

interface DeadlineFormStep2Props {
    control: Control<DeadlineFormData>;
    selectedFormat: 'physical' | 'ebook' | 'audio';
    selectedPriority: 'flexible' | 'strict';
    onPriorityChange: (priority: 'flexible' | 'strict') => void;
    showDatePicker: boolean;
    onDatePickerToggle: () => void;
    onDateChange: (event: any, selectedDate?: Date) => void;
    deadline: Date;
    paceEstimate: string;
    watchedValues: any;
}

export const DeadlineFormStep2 = ({
    control,
    selectedFormat,
    selectedPriority,
    onPriorityChange,
    showDatePicker,
    onDatePickerToggle,
    onDateChange,
    deadline,
    paceEstimate,
    watchedValues
}: DeadlineFormStep2Props) => {
    const getProgressLabel = () => {
        switch (selectedFormat) {
            case 'audio':
                return 'Time Already Listened';
            default:
                return 'Pages Already Read';
        }
    };

    return (
        <View style={styles.screen}>
            <ThemedText style={styles.introText}>
                When do you need to finish, and what are the details?
            </ThemedText>

            <View>
                <ThemedText style={styles.formLabel}>Deadline Date *</ThemedText>
                <Controller
                    control={control}
                    name="deadline"
                    render={({ field: { value } }) => (
                        <>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={onDatePickerToggle}
                            >
                                <ThemedText style={styles.dateInputText}>
                                    {value.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </ThemedText>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={deadline}
                                        mode="date"
                                        display="inline"
                                        onChange={onDateChange}
                                        minimumDate={new Date()}
                                    />
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                />
                <ThemedText style={styles.helperText}>
                    When do you need to finish reading this book?
                </ThemedText>
            </View>

            <View style={styles.sectionDivider} />

            <View>
                <ThemedText style={styles.formLabel}>{getProgressLabel()}</ThemedText>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <CustomInput
                            control={control}
                            name="currentProgress"
                            placeholder='0'
                            keyboardType="numeric"
                            style={styles.formInput}
                        />
                    </View>
                    {selectedFormat === 'audio' ?
                        <View style={{ flex: 1 }}>
                            <CustomInput
                                control={control}
                                name="currentMinutes"
                                placeholder='0'
                                keyboardType="numeric"
                                style={styles.formInput}
                            />
                        </View> : null}
                </View>
                <ThemedText style={styles.helperText}>
                    How much have you already finished?
                </ThemedText>
            </View>

            <View style={styles.sectionDivider} />
            <View>
                <ThemedText style={styles.formLabel}>Deadline Flexibility</ThemedText>
                <PrioritySelector
                    selectedPriority={selectedPriority}
                    onSelectPriority={onPriorityChange}
                />
                <ThemedText style={styles.helperText}>
                    Can this deadline be adjusted if needed?
                </ThemedText>
            </View>

            <View style={styles.sectionDivider} />

            <View>
                <ThemedText style={styles.formLabel}>Author</ThemedText>
                <CustomInput
                    control={control}
                    name="bookAuthor"
                    placeholder="Author name (optional)"
                    style={styles.formInput}
                />
            </View>

            {paceEstimate && (
                <View style={styles.estimateContainer}>
                    <ThemedText style={styles.estimateText}>{paceEstimate}</ThemedText>
                </View>
            )}

            <View style={styles.summaryCard}>
                <ThemedText style={styles.summaryTitle}>✓ Ready to Add</ThemedText>
                <ThemedText style={styles.summaryText}>
                    {watchedValues.bookTitle && watchedValues.deadline
                        ? `${watchedValues.bookTitle}${watchedValues.bookAuthor ? ` by ${watchedValues.bookAuthor}` : ''} • Due ${watchedValues.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : 'Complete the form above to see your reading plan'
                    }
                </ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        gap: 5,
    },
    introText: {
        color: '#b0b0b0',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 32,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: '#2d2d2d',
        borderWidth: 2,
        borderColor: '#404040',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#ffffff',
    },
    helperText: {
        fontSize: 13,
        color: '#666666',
        marginTop: 6,
        lineHeight: 18,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#404040',
        marginVertical: 32,
        opacity: 0.5,
    },
    estimateContainer: {
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderWidth: 1,
        borderColor: '#4ade80',
        borderRadius: 8,
        padding: 14,
        marginTop: 16,
    },
    estimateText: {
        fontSize: 14,
        color: '#4ade80',
        lineHeight: 20,
    },
    summaryCard: {
        backgroundColor: '#2d2d2d',
        borderRadius: 16,
        padding: 20,
        marginTop: 32,
        borderWidth: 2,
        borderColor: '#404040',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4ade80',
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 14,
        color: '#b0b0b0',
        lineHeight: 20,
    },
    dateInput: {
        backgroundColor: '#2d2d2d',
        borderWidth: 2,
        borderColor: '#404040',
        borderRadius: 12,
        padding: 16,
    },
    dateInputText: {
        fontSize: 16,
        color: '#ffffff',
    },
}); 