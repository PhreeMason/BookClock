import CustomInput from '@/components/shared/CustomInput';
import { ThemedText } from '@/components/themed';
import { useTheme } from '@/theme';
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
    const { theme } = useTheme();
    const cardColor = theme.surface;
    const borderColor = theme.border;
    const dangerColor = theme.danger;
    const primaryColor = theme.primary;
    const dividerColor = theme.textMuted;
    
    const getProgressLabel = () => {
        switch (selectedFormat) {
            case 'audio':
                return 'Time Already Listened';
            default:
                return 'Pages Already Read';
        }
    };

    return (
        <View style={{flex: 1, gap: 24}}>
            <ThemedText color="textMuted" style={{fontSize: 16}}>
                When do you need to finish, and what are the details?
            </ThemedText>

            <View>
                <ThemedText type="semiBold" style={{marginBottom: 8}}>Deadline Date *</ThemedText>
                <Controller
                    control={control}
                    name="deadline"
                    render={({ field: { value } }) => (
                        <>
                            <TouchableOpacity
                                style={[styles.dateInput, {backgroundColor: cardColor, borderColor: borderColor}]}
                                onPress={onDatePickerToggle}
                                testID="date-picker-button"
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
                                        testID='input-deadline'
                                    />
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                />
                <ThemedText color="textMuted" style={{marginTop: 6, lineHeight: 18}}>
                    When do you need to finish reading this book? (Past dates will be marked as overdue)
                </ThemedText>
            </View>

            <View style={[styles.sectionDivider, {backgroundColor: dividerColor}]} />

            <View>
                <ThemedText type="semiBold" style={{marginBottom: 8}}>{getProgressLabel()}</ThemedText>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <CustomInput
                            control={control}
                            name="currentProgress"
                            inputType="integer"
                            placeholder='0'
                            keyboardType="numeric"
                        />
                    </View>
                    {selectedFormat === 'audio' ?
                        <View style={{ flex: 1 }}>
                            <CustomInput
                                control={control}
                                name="currentMinutes"
                                inputType="integer"
                                placeholder='0'
                                keyboardType="numeric"
                            />
                        </View> : null}
                </View>
                <ThemedText color="textMuted" style={{marginTop: 6, lineHeight: 18}}>
                    How much have you already finished?
                </ThemedText>
            </View>

            <View style={[styles.sectionDivider, {backgroundColor: dividerColor}]} />
            <View>
                <ThemedText type="semiBold" style={{marginBottom: 8}}>Deadline Flexibility</ThemedText>
                <PrioritySelector
                    selectedPriority={selectedPriority}
                    onSelectPriority={onPriorityChange}
                />
                <ThemedText color="textMuted" style={{marginTop: 6, lineHeight: 18}}>
                    Can this deadline be adjusted if needed?
                </ThemedText>
            </View>

            <View style={[styles.sectionDivider, {backgroundColor: dividerColor}]} />

            {paceEstimate && (
                <View style={[
                    styles.estimateContainer,
                    {
                        backgroundColor: paceEstimate.includes('⚠️') ? `${dangerColor}20` : `${primaryColor}20`,
                        borderColor: paceEstimate.includes('⚠️') ? dangerColor : primaryColor,
                    }
                ]}>
                    <ThemedText color={paceEstimate.includes('⚠️') ? 'danger' : 'primary'}>
                        {paceEstimate}
                    </ThemedText>
                </View>
            )}

            <View style={[styles.summaryCard, {backgroundColor: cardColor, borderColor: borderColor}]}>
                <ThemedText color="primary" style={styles.summaryTitle}>✓ Ready to Add</ThemedText>
                <ThemedText color="textMuted" style={styles.summaryText}>
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