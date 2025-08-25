import ProgressBar from '@/components/progress/ProgressBar'
import ProgressHeader from '@/components/progress/ProgressHeader'
import ProgressInput from '@/components/progress/ProgressInput'
import ProgressStats from '@/components/progress/ProgressStats'
import QuickActionButtons from '@/components/progress/QuickActionButtons'
import { ThemedButton, ThemedView } from '@/components/themed'
import { useDeadlines } from '@/contexts/DeadlineProvider'
import { useDeleteFutureProgress, useUpdateDeadlineProgress } from '@/hooks/useDeadlines'
import { formatProgressDisplay } from '@/lib/deadlineUtils'
import { createProgressUpdateSchema } from '@/lib/progressUpdateSchema'
import { useTheme } from '@/theme'
import { ReadingDeadlineWithProgress } from '@/types/deadline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert, StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'

const ReadingProgress = ({
    deadline,
    timeSpentReading,
    onProgressSubmitted
}: {
    deadline: ReadingDeadlineWithProgress;
    timeSpentReading?: number;
    onProgressSubmitted?: () => void;
}) => {
    const {theme} = useTheme();
    const { getDeadlineCalculations } = useDeadlines();
    const calculations = getDeadlineCalculations(deadline);
    const {
        urgencyLevel,
        currentProgress,
        totalQuantity,
        remaining,
        progressPercentage
    } = calculations;

    const progressSchema = createProgressUpdateSchema(totalQuantity, deadline.format);
    const updateProgressMutation = useUpdateDeadlineProgress();
    const deleteFutureProgressMutation = useDeleteFutureProgress();
    const borderColor = theme.border;
    
    const {
        control,
        handleSubmit,
        setValue,
        getValues,
    } = useForm({
        resolver: zodResolver(progressSchema),
        defaultValues: {
            currentProgress: currentProgress,
        },
        mode: 'onSubmit',
    });

    const handleProgressUpdate = (newProgress: number) => {
        updateProgressMutation.mutate({
            deadlineId: deadline.id,
            currentProgress: newProgress,
            ...(timeSpentReading !== undefined && { timeSpentReading }),
        }, {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: 'Progress Updated!',
                    text2: `Updated to ${formatProgressDisplay(deadline.format, newProgress)}`,
                });
                onProgressSubmitted?.();
            },
            onError: (error) => {
                Toast.show({
                    type: 'error',
                    text1: 'Update Failed',
                    text2: 'Please try again',
                });
                console.error('Progress update error:', error);
            }
        });
    };

    const onSubmitProgress = (data: any) => {
        const newProgress = data.currentProgress;
        
        // Check if the new progress is lower than current progress
        if (newProgress < currentProgress) {
            const progressUnit = deadline.format === 'audio' ? 'time' : 'page';
            const currentDisplay = formatProgressDisplay(deadline.format, currentProgress);
            const newDisplay = formatProgressDisplay(deadline.format, newProgress);
            
            Alert.alert(
                'Backward Progress Warning',
                `You're updating from ${currentDisplay} to ${newDisplay}. This will delete all progress entries greater than the new ${progressUnit}. Are you sure?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Update',
                        style: 'destructive',
                        onPress: () => {
                            // First delete future progress, then update
                            deleteFutureProgressMutation.mutate(
                                { deadlineId: deadline.id, newProgress },
                                {
                                    onSuccess: () => {
                                        handleProgressUpdate(newProgress);
                                    },
                                    onError: (error) => {
                                        Toast.show({
                                            type: 'error',
                                            text1: 'Failed to Delete Future Progress',
                                            text2: 'Please try again',
                                        });
                                        console.error('Delete future progress error:', error);
                                    }
                                }
                            );
                        },
                    },
                ]
            );
        } else {
            // Normal forward progress update
            handleProgressUpdate(newProgress);
        }
    };

    const handleQuickUpdate = (increment: number) => {
        const currentFormValue = getValues('currentProgress');
        
        // Convert form value to number, handling both strings and numbers
        let numericValue: number;
        
        if (typeof currentFormValue === 'number' && !isNaN(currentFormValue)) {
            numericValue = currentFormValue;
        } else if (typeof currentFormValue === 'string') {
            const parsed = parseFloat(currentFormValue.trim());
            numericValue = isNaN(parsed) ? currentProgress : parsed;
        } else {
            numericValue = currentProgress;
        }
        
        const newProgress = Math.max(0, Math.min(totalQuantity, numericValue + increment));
        
        // Check if the new progress would be lower than current progress
        if (newProgress < currentProgress) {
            const progressUnit = deadline.format === 'audio' ? 'time' : 'page';
            const currentDisplay = formatProgressDisplay(deadline.format, currentProgress);
            const newDisplay = formatProgressDisplay(deadline.format, newProgress);
            
            Alert.alert(
                'Backward Progress Warning',
                `You're updating from ${currentDisplay} to ${newDisplay}. This will delete all progress entries beyond the new ${progressUnit}. Are you sure?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Update',
                        style: 'destructive',
                        onPress: () => {
                            setValue('currentProgress', newProgress, { shouldValidate: false });
                        },
                    },
                ]
            );
        } else {
            setValue('currentProgress', newProgress, { shouldValidate: false });
        }
    };

    return (
        <ThemedView backgroundColor="card" style={[styles.section, { borderColor }]}>
            <ProgressHeader />
            
            <ProgressStats
                currentProgress={currentProgress}
                totalQuantity={totalQuantity}
                remaining={remaining}
                format={deadline.format}
                urgencyLevel={urgencyLevel}
            />

            <ProgressBar
                progressPercentage={progressPercentage}
                deadlineDate={deadline.deadline_date}
            />

            <View style={styles.updateSection}>
                <ProgressInput
                    format={deadline.format}
                    control={control}
                />

                <QuickActionButtons
                    onQuickUpdate={handleQuickUpdate}
                />

                <ThemedButton
                    title={updateProgressMutation.isPending ? "Updating..." : "✏️ Update Progress"}
                    variant="primary"
                    style={styles.updateProgressBtn}
                    onPress={handleSubmit(onSubmitProgress)}
                    disabled={updateProgressMutation.isPending}
                />
            </View>
        </ThemedView>
    )
}

export default ReadingProgress

const styles = StyleSheet.create({
    section: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
    },
    updateSection: {
        marginTop: 8,
    },
    updateProgressBtn: {
        marginTop: 8,
    },
});