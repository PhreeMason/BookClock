import CustomInput from '@/components/CustomInput';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
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

    const cardBackgroundColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');
    const successColor = useThemeColor({}, 'primary'); // Assuming primary is a success-like color
    const cardOverlay = useThemeColor({}, 'cardOverlay');

    return (
        <View style={{flex: 1, gap: 24}}>
            <ThemedText colorName="textMuted" style={{fontSize: 16}}>
                When do you need to finish, and what are the details?
            </ThemedText>

            <View>
                <ThemedText type="defaultSemiBold" style={{marginBottom: 8}}>Deadline Date *</ThemedText>
                <Controller
                    control={control}
                    name="deadline"
                    render={({ field: { value } }) => (
                        <>
                            <TouchableOpacity
                                style={[styles.dateInput, {backgroundColor: cardBackgroundColor, borderColor: borderColor}]}
                                onPress={onDatePickerToggle}
                            >
                                <ThemedText>
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
                                    />
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                />
                <ThemedText colorName="textMuted" style={{marginTop: 6, lineHeight: 18}}>
                    When do you need to finish reading this book? (Past dates will be marked as overdue)
                </ThemedText>
            </View>

            <View style={styles.sectionDivider} />

            <View>
                <ThemedText type="defaultSemiBold" style={{marginBottom: 8}}>{getProgressLabel()}</ThemedText>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <CustomInput
                            control={control}
                            name="currentProgress"
                            placeholder='0'
                            keyboardType="numeric"
                        />
                    </View>
                    {selectedFormat === 'audio' ?
                        <View style={{ flex: 1 }}>
                            <CustomInput
                                control={control}
                                name="currentMinutes"
                                placeholder='0'
                                keyboardType="numeric"
                            />
                        </View> : null}
                </View>
                <ThemedText colorName="textMuted" style={{marginTop: 6, lineHeight: 18}}>
                    How much have you already finished?
                </ThemedText>
            </View>

            <View style={styles.sectionDivider} />
            <View>
                <ThemedText type="defaultSemiBold" style={{marginBottom: 8}}>Deadline Flexibility</ThemedText>
                <PrioritySelector
                    selectedPriority={selectedPriority}
                    onSelectPriority={onPriorityChange}
                />
                <ThemedText colorName="textMuted" style={{marginTop: 6, lineHeight: 18}}>
                    Can this deadline be adjusted if needed?
                </ThemedText>
            </View>

            <View style={styles.sectionDivider} />

            {paceEstimate && (
                <View style={[
                    styles.estimateContainer,
                    {
                        backgroundColor: paceEstimate.includes('⚠️') ? 'rgba(239, 68, 68, 0.1)' : cardOverlay,
                        borderColor: paceEstimate.includes('⚠️') ? dangerColor : successColor,
                    }
                ]}>
                    <ThemedText style={{color: paceEstimate.includes('⚠️') ? dangerColor : successColor}}>
                        {paceEstimate}
                    </ThemedText>
                </View>
            )}

            <View style={[styles.summaryCard, {backgroundColor: cardBackgroundColor, borderColor: borderColor}]}>
                <ThemedText type="defaultSemiBold" style={[styles.summaryTitle, {color: successColor}]}>✓ Ready to Add</ThemedText>
                <ThemedText colorName="textMuted" style={styles.summaryText}>
                    {watchedValues.bookTitle && watchedValues.deadline
                        ? `${watchedValues.bookTitle} • Due ${watchedValues.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : 'Complete the form above to see your reading plan'
                    }
                </ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionDivider: {
        height: 1,
        backgroundColor: '#404040',
        marginVertical: 16,
        opacity: 0.5,
    },
    estimateContainer: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 14,
        marginTop: 16,
    },
    summaryCard: {
        borderRadius: 16,
        padding: 20,
        marginTop: 32,
        borderWidth: 2,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 14,
        lineHeight: 20,
    },
    dateInput: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
    },
}); 