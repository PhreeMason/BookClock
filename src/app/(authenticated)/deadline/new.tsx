import { ThemedButton, ThemedKeyboardAvoidingView, ThemedScrollView, ThemedText, ThemedView } from '@/components/themed';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';

import {
    DeadlineFormStep1,
    DeadlineFormStep2,
    FormHeader,
    FormProgressBar,
    StepIndicators
} from '@/components/forms';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';

import {
    calculateCurrentProgressFromForm,
    calculateRemainingFromForm,
    calculateTotalQuantityFromForm,
    getPaceEstimate
} from '@/lib/deadlineCalculations';

import { DeadlineFormData, deadlineFormSchema } from '@/lib/deadlineFormSchema';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewDeadLine = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFormat, setSelectedFormat] = useState<'physical' | 'ebook' | 'audio'>('physical');
    // Source is now handled directly by form control
    const [selectedPriority, setSelectedPriority] = useState<'flexible' | 'strict'>('flexible');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [paceEstimate, setPaceEstimate] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addDeadline } = useDeadlines();
    const { theme } = useTheme();
    const backgroundColor = theme.background;

    const formSteps = ['Book Details', 'Set Deadline'];
    const totalSteps = formSteps.length;

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        trigger
    } = useForm<DeadlineFormData>({
        resolver: zodResolver(deadlineFormSchema),
        defaultValues: {
            bookTitle: '',
            bookAuthor: '',
            format: 'physical',
            source: 'arc',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            flexibility: 'flexible'
        }
    });

    const watchedValues = watch();

    // Calculate pace estimate when deadline or progress changes
    useEffect(() => {
        const deadline = watchedValues.deadline;
        const remaining = calculateRemainingFromForm(
            selectedFormat,
            watchedValues.totalQuantity || 0,
            watchedValues.totalMinutes,
            watchedValues.currentProgress || 0,
            watchedValues.currentMinutes
        );

        if (deadline && remaining > 0) {
            setPaceEstimate(getPaceEstimate(selectedFormat, deadline, remaining));
        } else {
            setPaceEstimate('');
        }
    }, [selectedFormat, watchedValues.deadline, watchedValues.totalQuantity, watchedValues.totalMinutes, watchedValues.currentProgress, watchedValues.currentMinutes]);

    const onSubmit = (data: DeadlineFormData) => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        // Calculate total quantity accounting for format
        const finalTotalQuantity = calculateTotalQuantityFromForm(
            selectedFormat,
            data.totalQuantity,
            data.totalMinutes
        );

        const deadlineDetails = {
            id: '',
            author: data.bookAuthor || null,
            book_title: data.bookTitle,
            deadline_date: data.deadline.toISOString(),
            total_quantity: finalTotalQuantity,
            format: selectedFormat,
            source: data.source,
            flexibility: selectedPriority
        }

        // Calculate current progress accounting for format
        const finalCurrentProgress = calculateCurrentProgressFromForm(
            selectedFormat,
            data.currentProgress || 0,
            data.currentMinutes
        );

        const progressDetails = {
            id: '',
            current_progress: finalCurrentProgress,
            reading_deadline_id: '' // This will be set after the deadline is created
        };

        addDeadline(
            {
                deadlineDetails,
                progressDetails
            },
            // Success callback
            () => {
                setIsSubmitting(false);
                Toast.show({
                    type: 'success',
                    text1: 'Deadline added successfully!',
                    autoHide: true,
                    visibilityTime: 1000,
                    position: 'top',
                    onHide: () => {
                        router.replace('/');
                    }
                });
            },
            // Error callback
            (error) => {
                setIsSubmitting(false);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to add deadline',
                    text2: error.message || 'Please try again',
                    autoHide: true,
                    visibilityTime: 3000,
                    position: 'top'
                });
            }
        );
    };

    const nextStep = async () => {
        if (currentStep < totalSteps) {
            const fieldsToValidate: (keyof DeadlineFormData)[] = [
                'bookTitle',
                'format',
                'source',
                'totalQuantity',
            ];

            // Add totalMinutes validation for audio format
            if (selectedFormat === 'audio') {
                fieldsToValidate.push('totalMinutes');
            }

            const result = await trigger(fieldsToValidate);

            if (result) {
                setCurrentStep(currentStep + 1);
            }
        } else {
            handleSubmit(onSubmit)();
        }
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const goBackToIndex = () => {
        router.push('/');
    };

    const onDateChange = (_event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setValue('deadline', selectedDate);
        }
    };

    const handleFormatChange = (format: 'physical' | 'ebook' | 'audio') => {
        setSelectedFormat(format);
        setValue('format', format);
    };

    // Source change handler removed - now handled by CustomDropdown

    const handlePriorityChange = (priority: 'flexible' | 'strict') => {
        setSelectedPriority(priority);
        setValue('flexibility', priority);
    };

    return (
        <SafeAreaView style={{flex: 1 , backgroundColor}}>
            <ThemedKeyboardAvoidingView style={styles.container}>
                <ThemedView backgroundColor="card" style={styles.mainHeader}>
                    <TouchableOpacity
                        style={styles.backToIndexButton}
                        onPress={goBackToIndex}
                    >
                        <IconSymbol size={24} name="chevron.left" color={theme.primary} />
                    </TouchableOpacity>
                    <ThemedText style={styles.mainHeaderTitle}>New Deadline</ThemedText>
                    <ThemedView style={styles.placeholder} />
                </ThemedView>

                <FormProgressBar currentStep={currentStep} totalSteps={totalSteps} />
                <StepIndicators currentStep={currentStep} totalSteps={totalSteps} />
                <ThemedScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingBottom: 48 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <FormHeader
                        title={formSteps[currentStep - 1]}
                        onBack={goBack}
                        showBack={currentStep > 1}
                    />

                    {currentStep === 1 ? (
                        <DeadlineFormStep1
                            control={control}
                            selectedFormat={selectedFormat}
                            onFormatChange={handleFormatChange}
                        />
                    ) : (
                        <DeadlineFormStep2
                            control={control}
                            selectedFormat={selectedFormat}
                            selectedPriority={selectedPriority}
                            onPriorityChange={handlePriorityChange}
                            showDatePicker={showDatePicker}
                            onDatePickerToggle={() => setShowDatePicker(true)}
                            onDateChange={onDateChange}
                            deadline={watchedValues.deadline}
                            paceEstimate={paceEstimate}
                            watchedValues={watchedValues}
                        />
                    )}
                </ThemedScrollView>

                <ThemedView style={styles.navButtons}>
                    {currentStep > 1 && (
                        <ThemedButton
                            title="Back"
                            variant="secondary"
                            onPress={goBack}
                            style={{ flex: 1 }}
                            disabled={isSubmitting}
                        />
                    )}
                    <ThemedButton
                        title={isSubmitting ? 'Adding...' : (currentStep === totalSteps ? 'Add Book' : 'Continue')}
                        onPress={nextStep}
                        disabled={isSubmitting}
                        style={{ flex: 1 }}
                    />
                </ThemedView>
            </ThemedKeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backToIndexButton: {
        padding: 8,
        borderRadius: 8,
    },
    mainHeaderTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    navButtons: {
        flexDirection: 'row',
        gap: 16,
        padding: 16,
    },
});

export default NewDeadLine;