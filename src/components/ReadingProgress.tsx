import { useDeadlines } from '@/contexts/DeadlineProvider'
import { useUpdateDeadlineProgress } from '@/hooks/useDeadlines'
import { formatProgressDisplay } from '@/lib/deadlineUtils'
import { createProgressUpdateSchema } from '@/lib/progressUpdateSchema'
import { ReadingDeadlineWithProgress } from '@/types/deadline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { z } from 'zod'
import { ThemedButton } from './ThemedButton'
import { ThemedView } from './ThemedView'
import ProgressBar from './progress/ProgressBar'
import ProgressHeader from './progress/ProgressHeader'
import ProgressInput from './progress/ProgressInput'
import ProgressStats from './progress/ProgressStats'
import QuickActionButtons from './progress/QuickActionButtons'

const ReadingProgress = ({
    deadline
}: {
    deadline: ReadingDeadlineWithProgress;
}) => {
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

    const {
        control,
        handleSubmit,
        formState: { isValid },
        setValue,
        getValues,
    } = useForm<z.infer<typeof progressSchema>>({
        resolver: zodResolver(progressSchema),
        defaultValues: {
            currentProgress: currentProgress,
        },
        mode: 'onChange',
    });

    const onSubmitProgress = (data: z.infer<typeof progressSchema>) => {
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
        const newProgress = Math.max(0, Math.min(totalQuantity, currentFormValue + increment));
        setValue('currentProgress', newProgress, { shouldValidate: true });
    };

    return (
        <ThemedView backgroundColor="card" style={styles.section}>
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
                    setValue={setValue}
                    currentProgress={currentProgress}
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
                    disabled={!isValid || updateProgressMutation.isPending}
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
    },
    updateSection: {
        marginTop: 8,
    },
    updateProgressBtn: {
        marginTop: 8,
    },
});