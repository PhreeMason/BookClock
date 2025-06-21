import CustomInput from '@/components/CustomInput';
import { ThemedScrollView } from '@/components/ThemedScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAddDeadline } from '@/hooks/useDeadlines';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

// Helper functions for calculations
const calculateTotalQuantity = (
    format: 'physical' | 'ebook' | 'audio',
    totalQuantity: number | string,
    totalMinutes?: number | string
): number => {
    const quantity = typeof totalQuantity === 'string' ? parseInt(totalQuantity) : totalQuantity;
    const minutes = typeof totalMinutes === 'string' ? parseInt(totalMinutes) : (totalMinutes || 0);
    
    if (format === 'audio') {
        return (quantity * 60) + minutes; // Convert hours to minutes and add extra minutes
    }
    return quantity;
};

const calculateCurrentProgress = (
    format: 'physical' | 'ebook' | 'audio',
    currentProgress: number | string,
    currentMinutes?: number | string
): number => {
    const progress = typeof currentProgress === 'string' ? parseInt(currentProgress) : (currentProgress || 0);
    const minutes = typeof currentMinutes === 'string' ? parseInt(currentMinutes) : (currentMinutes || 0);
    
    if (format === 'audio') {
        return (progress * 60) + minutes; // Convert hours to minutes and add extra minutes
    }
    return progress;
};

const calculateRemaining = (
    format: 'physical' | 'ebook' | 'audio',
    totalQuantity: number | string,
    totalMinutes: number | string | undefined,
    currentProgress: number | string,
    currentMinutes: number | string | undefined
): number => {
    const total = calculateTotalQuantity(format, totalQuantity, totalMinutes);
    const current = calculateCurrentProgress(format, currentProgress, currentMinutes);
    return total - current;
};

const getReadingEstimate = (
    format: 'physical' | 'ebook' | 'audio',
    remaining: number
): string => {
    if (remaining <= 0) return '';
    
    switch (format) {
        case 'physical':
        case 'ebook':
            const hours = Math.ceil(remaining / 40); // Assuming 40 pages per hour
            return `📖 About ${hours} hours of reading time`;
        case 'audio':
            const hoursRemaining = Math.floor(remaining / 60);
            const minutesRemaining = remaining % 60;
            if (hoursRemaining > 0) {
                return `🎧 About ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}${minutesRemaining > 0 ? ` and ${minutesRemaining} minutes` : ''} of listening time`;
            } else {
                return `🎧 About ${minutesRemaining} minutes of listening time`;
            }
        default:
            return '';
    }
};

const getPaceEstimate = (
    format: 'physical' | 'ebook' | 'audio',
    deadline: Date,
    remaining: number
): string => {
    if (remaining <= 0) return '';
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
        return '⚠️ This deadline has already passed';
    }

    const unitsPerDay = Math.ceil(remaining / daysLeft);
    
    if (format === 'audio') {
        const hoursPerDay = Math.floor(unitsPerDay / 60);
        const minutesPerDay = unitsPerDay % 60;
        let paceText = '';
        if (hoursPerDay > 0) {
            paceText = `${hoursPerDay} hour${hoursPerDay > 1 ? 's' : ''}${minutesPerDay > 0 ? ` ${minutesPerDay} minutes` : ''}`;
        } else {
            paceText = `${minutesPerDay} minutes`;
        }
        return `📅 You'll need to listen ${paceText}/day to finish on time`;
    } else {
        const unit = 'pages';
        return `📅 You'll need to read ${unitsPerDay} ${unit}/day to finish on time`;
    }
};

const formSchema = z.object({
    bookTitle: z.string().min(1, 'Book title is required'),
    bookAuthor: z.string().optional(),
    format: z.enum(['physical', 'ebook', 'audio'], {
        errorMap: () => ({ message: 'Please select a format' })
    }),
    source: z.enum(['library', 'arc', 'personal'], {
        errorMap: () => ({ message: 'Please select a source' })
    }),
    deadline: z.date({
        required_error: 'Deadline is required'
    }).refine(date => date > new Date(), {
        message: 'Deadline must be in the future'
    }),
    totalQuantity: z.coerce.number().int().positive({
        message: 'Total must be a positive number'
    }),
    totalMinutes: z.coerce.number().int().positive({
        message: 'Minutes must be a positive number'
    }).optional(),
    currentMinutes: z.coerce.number().int().positive({
        message: 'Minutes must be a positive number'
    }).optional(),
    currentProgress: z.coerce.number().int().min(0).optional(),
    flexibility: z.enum(['flexible', 'strict'], {
        errorMap: () => ({ message: 'Please select deadline flexibility' })
    }),
});

type FormData = z.infer<typeof formSchema>;

const FormProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
    const progress = (currentStep / totalSteps) * 100;
    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
        </View>
    );
};

const StepIndicators = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
    return (
        <View style={styles.stepsContainer}>
            {Array.from({ length: totalSteps }, (_, index) => (
                <View
                    key={index}
                    style={[
                        styles.step,
                        index + 1 === currentStep && styles.stepActive,
                        index + 1 < currentStep && styles.stepCompleted
                    ]}
                />
            ))}
        </View>
    );
};

type HeaderProps = {
    title: string;
    onBack: () => void;
    showBack: boolean;
    onSkip?: () => void;
    showSkip?: boolean;
};

const Header = ({ title, onBack, showBack, onSkip, showSkip }: HeaderProps) => {
    return (
        <ThemedView style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                disabled={!showBack}
            >
                {showBack && <ThemedText style={styles.backButtonText}>←</ThemedText>}
            </TouchableOpacity>

            <ThemedText style={styles.headerTitle}>{title}</ThemedText>

            {showSkip && onSkip && (
                <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                    <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
                </TouchableOpacity>
            )}
        </ThemedView>
    );
};

const FormatSelector = ({
    selectedFormat,
    onSelectFormat
}: {
    selectedFormat: string;
    onSelectFormat: (format: 'physical' | 'ebook' | 'audio') => void;
}) => {
    const formats = [
        { key: 'physical', label: 'Physical' },
        { key: 'ebook', label: 'E-book' },
        { key: 'audio', label: 'Audio' }
    ];

    return (
        <View style={styles.formatSelector}>
            {formats.map((format) => (
                <TouchableOpacity
                    key={format.key}
                    style={[
                        styles.formatChip,
                        selectedFormat === format.key && styles.formatChipSelected
                    ]}
                    onPress={() => onSelectFormat(format.key as 'physical' | 'ebook' | 'audio')}
                >
                    <ThemedText style={[
                        styles.formatChipText,
                        selectedFormat === format.key && styles.formatChipTextSelected
                    ]}>
                        {format.label}
                    </ThemedText>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const SourceSelector = ({
    selectedSource,
    onSelectSource
}: {
    selectedSource: string;
    onSelectSource: (source: 'arc' | 'library' | 'personal') => void;
}) => {
    const sources = [
        { key: 'arc', label: '📚 ARC' },
        { key: 'library', label: '📖 Library' },
        { key: 'personal', label: '📗 Personal' }
    ];

    return (
        <View style={styles.formatSelector}>
            {sources.map((source) => (
                <TouchableOpacity
                    key={source.key}
                    style={[
                        styles.formatChip,
                        selectedSource === source.key && styles.formatChipSelected
                    ]}
                    onPress={() => onSelectSource(source.key as 'arc' | 'library' | 'personal')}
                >
                    <ThemedText style={[
                        styles.formatChipText,
                        selectedSource === source.key && styles.formatChipTextSelected
                    ]}>
                        {source.label}
                    </ThemedText>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const PrioritySelector = ({
    selectedPriority,
    onSelectPriority
}: {
    selectedPriority: string;
    onSelectPriority: (priority: 'flexible' | 'strict') => void;
}) => {
    const priorities = [
        { key: 'flexible', label: 'Flexible', icon: '🕐' },
        { key: 'strict', label: 'Must Meet', icon: '⚡' }
    ];

    return (
        <View style={styles.priorityOptions}>
            {priorities.map((priority) => (
                <TouchableOpacity
                    key={priority.key}
                    style={[
                        styles.priorityOption,
                        selectedPriority === priority.key && styles.priorityOptionSelected
                    ]}
                    onPress={() => onSelectPriority(priority.key as 'flexible' | 'strict')}
                >
                    <Text style={styles.priorityIcon}>{priority.icon}</Text>
                    <ThemedText style={styles.priorityLabel}>{priority.label}</ThemedText>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const NewDeadLine = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFormat, setSelectedFormat] = useState<'physical' | 'ebook' | 'audio'>('physical');
    const [selectedSource, setSelectedSource] = useState<'arc' | 'library' | 'personal'>('arc');
    const [selectedPriority, setSelectedPriority] = useState<'flexible' | 'strict'>('flexible');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [readingEstimate, setReadingEstimate] = useState<string>('');
    const [paceEstimate, setPaceEstimate] = useState<string>('');
    const { mutate: addDeadline } = useAddDeadline();

    const formSteps = ['Book Details', 'Set Deadline'];
    const totalSteps = formSteps.length;

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors, isValid }
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
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
        const remaining = calculateRemaining(
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
        const remaining = calculateRemaining(
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

    const getTotalQuantityLabel = () => {
        switch (selectedFormat) {
            case 'audio':
                return 'Total Time';
            default:
                return 'Total Pages';
        }
    };

    const getProgressLabel = () => {
        switch (selectedFormat) {
            case 'audio':
                return 'Time Already Listened';
            default:
                return 'Pages Already Read';
        }
    };

    const getTotalQuantityPlaceholder = () => {
        switch (selectedFormat) {
            case 'audio':
                return 'Hours';
            case 'ebook':
                return 'How many pages or % total?';
            default:
                return 'How many pages total?';
        }
    };

    const onSubmit = (data: FormData) => {
        // Calculate total quantity accounting for format
        const finalTotalQuantity = calculateTotalQuantity(
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
        const finalCurrentProgress = calculateCurrentProgress(
            selectedFormat,
            data.currentProgress || 0,
            data.currentMinutes
        );

        const progressDetails = {
            id: '',
            current_progress: finalCurrentProgress,
            reading_deadline_id: '' // This will be set after the deadline is created
        };

        addDeadline({
            deadlineDetails,
            progressDetails
        }, {
            onSuccess: (data) => {
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
            onError: (error) => {
                Alert.alert('Error', error.message || 'Failed to add deadline');
            }
        })
    };

    const nextStep = async () => {
        if (currentStep < totalSteps) {
            const result = await trigger([
                'bookTitle',
                'format',
                'source',
                'totalQuantity',
            ]);
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

    const renderStep1 = () => (
        <View style={styles.screen}>
            <ThemedText style={styles.introText}>
                Add a book with a deadline to track your reading progress.
            </ThemedText>

            <View>
                <ThemedText style={styles.formLabel}>Book Title *</ThemedText>
                <CustomInput
                    control={control}
                    name="bookTitle"
                    placeholder="Enter the book title"
                    style={styles.formInput}
                />
            </View>

            <View>
                <ThemedText style={styles.formLabel}>Format</ThemedText>
                <FormatSelector
                    selectedFormat={selectedFormat}
                    onSelectFormat={(format) => {
                        setSelectedFormat(format);
                        setValue('format', format);
                    }}
                />
                <ThemedText style={styles.helperText}>
                    This affects how we calculate your reading pace
                </ThemedText>
            </View>

            <View style={{ marginVertical: 16 }}>
                <ThemedText style={styles.formLabel}>Where is this book from?</ThemedText>
                <SourceSelector
                    selectedSource={selectedSource}
                    onSelectSource={(source) => {
                        setSelectedSource(source);
                        setValue('source', source);
                    }}
                />
            </View>

            <View>
                <ThemedText style={styles.formLabel}>{getTotalQuantityLabel()}</ThemedText>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <CustomInput
                            control={control}
                            name="totalQuantity"
                            placeholder={getTotalQuantityPlaceholder()}
                            keyboardType="numeric"
                            style={styles.formInput}
                        />
                    </View>
                    {selectedFormat === 'audio' ?
                        <View style={{ flex: 1 }}>
                            <CustomInput
                                control={control}
                                name="totalMinutes"
                                placeholder="Minutes (optional)"
                                keyboardType="numeric"
                                style={styles.formInput}
                            />
                        </View> : null}
                </View>
                <ThemedText style={styles.helperText}>
                    We'll use this to calculate your daily reading pace
                </ThemedText>
            </View>

            {readingEstimate && (
                <View style={styles.estimateContainer}>
                    <ThemedText style={styles.estimateText}>{readingEstimate}</ThemedText>
                </View>
            )}
        </View>
    );

    const renderStep2 = () => (
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
                                onPress={() => setShowDatePicker(true)}
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
                                        value={watchedValues.deadline}
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
                    onSelectPriority={(priority) => {
                        setSelectedPriority(priority);
                        setValue('flexibility', priority);
                    }}
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

    return (
        <ThemedView style={styles.container}>
            <FormProgressBar currentStep={currentStep} totalSteps={totalSteps} />
            <StepIndicators currentStep={currentStep} totalSteps={totalSteps} />

            <Header
                title={formSteps[currentStep - 1]}
                onBack={goBack}
                showBack={currentStep > 1}
            />

            <ThemedScrollView style={styles.content}>
                {currentStep === 1 ? renderStep1() : renderStep2()}
            </ThemedScrollView>

            <View style={styles.navButtons}>
                {currentStep > 1 && (
                    <TouchableOpacity style={styles.navButtonSecondary} onPress={goBack}>
                        <ThemedText style={styles.navButtonSecondaryText}>Back</ThemedText>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.navButtonPrimary}
                    onPress={nextStep}
                >
                    <ThemedText style={styles.navButtonPrimaryText}>
                        {currentStep === totalSteps ? 'Add Book' : 'Continue'}
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
    progressContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#404040',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4ade80',
        borderRadius: 2,
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#404040',
    },
    step: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#404040',
    },
    stepActive: {
        backgroundColor: '#4ade80',
    },
    stepCompleted: {
        backgroundColor: '#4ade80',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#404040',
    },
    backButton: {
        padding: 5,
        minWidth: 44,
    },
    backButtonText: {
        fontSize: 18,
        color: '#ffffff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    skipButton: {
        padding: 5,
        minWidth: 44,
    },
    skipButtonText: {
        fontSize: 16,
        color: '#4ade80',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 24,
    },
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
    formatSelector: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    formatChip: {
        backgroundColor: '#404040',
        borderRadius: 20,
        padding: 8,
        paddingHorizontal: 16,
    },
    formatChipSelected: {
        backgroundColor: '#4ade80',
    },
    formatChipText: {
        fontSize: 14,
        color: '#b0b0b0',
    },
    formatChipTextSelected: {
        color: '#1a1a1a',
        fontWeight: '600',
    },
    priorityOptions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    priorityOption: {
        flex: 1,
        backgroundColor: '#2d2d2d',
        borderWidth: 2,
        borderColor: '#404040',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    priorityOptionSelected: {
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
    },
    priorityIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    priorityLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
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
});