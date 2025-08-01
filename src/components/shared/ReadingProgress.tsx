import ProgressBar from '@/components/progress/ProgressBar'
import ProgressHeader from '@/components/progress/ProgressHeader'
import ProgressInput from '@/components/progress/ProgressInput'
import ProgressStats from '@/components/progress/ProgressStats'
import QuickActionButtons from '@/components/progress/QuickActionButtons'
import { ThemedButton, ThemedView } from '@/components/themed'
import { useDeadlines } from '@/contexts/DeadlineProvider'
import { useUpdateDeadlineProgress } from '@/hooks/useDeadlines'
import { formatProgressDisplay } from '@/lib/deadlineUtils'
import { createProgressUpdateSchema } from '@/lib/progressUpdateSchema'
import { useTheme } from '@/theme'
import { ReadingDeadlineWithProgress } from '@/types/deadline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'

const ReadingProgress = ({
    deadline
}: {
    deadline: ReadingDeadlineWithProgress;
}) => {
    const {theme} = useTheme();
    const { getDeadlineCalculations } = useDeadlines();
    const calculations = getDeadlineCalculations(deadline);
    const {
        unitsPerDay,
        urgencyLevel,
        currentProgress,
        totalQuantity,
        remaining,
        progressPercentage
    } = calculations;

    const progressSchema = createProgressUpdateSchema(totalQuantity, deadline.format);
    const updateProgressMutation = useUpdateDeadlineProgress();
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

    const onSubmitProgress = (data: any) => {
        updateProgressMutation.mutate({
            deadlineId: deadline.id,
            currentProgress: data.currentProgress,
        }, {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: 'Progress Updated!',
                    text2: `Updated to ${formatProgressDisplay(deadline.format, data.currentProgress)}`,
                });
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
        setValue('currentProgress', newProgress, { shouldValidate: false });
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
                    unitsPerDay={unitsPerDay}
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