import { ThemedScrollView } from '@/components/ThemedScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

import {
    DeadlineFormStep1,
    DeadlineFormStep2,
    FormHeader,
    FormProgressBar,
    StepIndicators
} from '@/components/forms';

import {
    calculateCurrentProgressFromForm,
    calculateRemainingFromForm,
    calculateTotalQuantityFromForm,
    getPaceEstimate,
    getReadingEstimate
} from '@/lib/deadlineCalculations';

import { DeadlineFormData, deadlineFormSchema } from '@/lib/deadlineFormSchema';

const NewDeadLine = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFormat, setSelectedFormat] = useState<'physical' | 'ebook' | 'audio'>('physical');
    const [selectedSource, setSelectedSource] = useState<'arc' | 'library' | 'personal'>('arc');
    const [selectedPriority, setSelectedPriority] = useState<'flexible' | 'strict'>('flexible');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [readingEstimate, setReadingEstimate] = useState<string>('');
    const [paceEstimate, setPaceEstimate] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addDeadline } = useDeadlines();

    const formSteps = ['Book Details', 'Set Deadline'];
    const totalSteps = formSteps.length;

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors, isValid, isSubmitting: formIsSubmitting }
    } = useForm<DeadlineFormData>({
        resolver: zodResolver(deadlineFormSchema),
        defaultValues: {
            bookTitle: '',
            bookAuthor: '',
            format: 'physical',
            source: 'arc',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            totalQuantity: 0,
            totalMinutes: 0,
            currentMinutes: 0,
            currentProgress: 0,
            flexibility: 'flexible'
        }
    });

    const watchedValues = watch();

    // Calculate reading estimate when format or quantity changes
    useEffect(() => {
        const remaining = calculateRemainingFromForm(
            selectedFormat,
            watchedValues.totalQuantity || 0,
            watchedValues.totalMinutes,
            watchedValues.currentProgress || 0,
            watchedValues.currentMinutes
        );
        
        setReadingEstimate(getReadingEstimate(selectedFormat, remaining));
    }, [selectedFormat, watchedValues.totalQuantity, watchedValues.currentProgress, watchedValues.totalMinutes, watchedValues.currentMinutes]);

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
            source: selectedSource,
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
                    visibilityTime: 2000,
                    position: 'top',
                    onHide: () => {
                        router.back();
                    }
                });
            },
            // Error callback
            (error) => {
                console.error('Failed to add deadline:', error);
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

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setValue('deadline', selectedDate);
        }
    };

    const handleFormatChange = (format: 'physical' | 'ebook' | 'audio') => {
        setSelectedFormat(format);
        setValue('format', format);
    };

    const handleSourceChange = (source: 'arc' | 'library' | 'personal') => {
        setSelectedSource(source);
        setValue('source', source);
    };

    const handlePriorityChange = (priority: 'flexible' | 'strict') => {
        setSelectedPriority(priority);
        setValue('flexibility', priority);
    };

    return (
        <ThemedView style={styles.container}>
            <FormProgressBar currentStep={currentStep} totalSteps={totalSteps} />
            <StepIndicators currentStep={currentStep} totalSteps={totalSteps} />

            <FormHeader
                title={formSteps[currentStep - 1]}
                onBack={goBack}
                showBack={currentStep > 1}
            />

            <ThemedScrollView style={styles.content}>
                {currentStep === 1 ? (
                    <DeadlineFormStep1
                        control={control}
                        selectedFormat={selectedFormat}
                        selectedSource={selectedSource}
                        onFormatChange={handleFormatChange}
                        onSourceChange={handleSourceChange}
                        readingEstimate={readingEstimate}
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

            <View style={styles.navButtons}>
                {currentStep > 1 && (
                    <TouchableOpacity style={styles.navButtonSecondary} onPress={goBack}>
                        <ThemedText style={styles.navButtonSecondaryText}>Back</ThemedText>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.navButtonPrimary, isSubmitting && styles.navButtonDisabled]}
                    onPress={nextStep}
                    disabled={isSubmitting}
                >
                    <ThemedText style={styles.navButtonPrimaryText}>
                        {isSubmitting ? 'Adding...' : (currentStep === totalSteps ? 'Add Book' : 'Continue')}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
};

export default NewDeadLine;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    navButtons: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#404040',
    },
    navButtonSecondary: {
        flex: 1,
        backgroundColor: '#404040',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    navButtonSecondaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    navButtonPrimary: {
        flex: 1,
        backgroundColor: '#4ade80',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    navButtonPrimaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    navButtonDisabled: {
        backgroundColor: '#6b7280',
        opacity: 0.6,
    },
});