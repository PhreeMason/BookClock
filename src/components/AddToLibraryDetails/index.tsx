import { BookAndUserBookInsert, BookInsert, StatusEnum } from '@/types/book';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import AddToLibraryButton from './AddToLibraryButton';
import AudioDuration from './AudioDuration';
import AudioProgress from './AudioProgress';
import BookDescription from './BookDescription';
import BookHeader from './BookHeader';
import FormatSelector from './FormatSelector';
import { useSyncAudioPercentage } from './hooks';
import NoteInput from './NoteInput';
import PagesProgress from './PagesProgress';
import ReadingDates from './ReadingDates';
import StatusSelector from './StatusSelector';


type AddToLibraryDetailsProps = {
    book: BookInsert;
    onAddToLibrary: (data: BookAndUserBookInsert) => void;
    saving: boolean;
    saved: boolean;
}

const formSchema = z.object({
    status: z.enum(['tbr', 'current', 'completed']),
    format: z.array(z.enum(['physical', 'ebook', 'audio'])).min(1),
    currentPage: z.coerce.number().int().min(0).optional(),
    totalPage: z.coerce.number().int().positive(),
    startDate: z.date().optional(),
    targetDate: z.date().optional(),
    hours: z.coerce.number().int().min(0),
    minutes: z.coerce.number().int().min(0).max(59),
    currentHours: z.coerce.number().int().min(0),
    currentMinutes: z.coerce.number().int().min(0).max(59),
    currentPercentage: z.coerce.number().int().min(0).max(100).optional(),
    note: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

const AddToLibraryDetails: React.FC<AddToLibraryDetailsProps> = ({ book, onAddToLibrary }) => {
    const { control, setValue, handleSubmit, formState, watch } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: 'tbr',
            format: ['physical'],
            totalPage: book.total_pages || 1,
            currentPage: 0,
            hours: 0,
            minutes: 0,
            currentHours: 0,
            currentMinutes: 0,
            currentPercentage: 0,
            startDate: new Date(),
            targetDate: new Date(),
        }
    });
    const errors = formState.errors;
    useSyncAudioPercentage({ setValue, watch });
    const status = watch('status');
    const format = watch('format');
    // Format date for display
    const formatDate = (date: Date) => {
        return date?.toISOString().split('T')[0] || '';
    };

    const onSubmit = (data: FormData) => {
        onAddToLibrary({
            ...book,
            ...data,
            // @ts-ignore
            format: data.format,
            start_date: status === 'current' && data.startDate ? data.startDate.toISOString() : '',
            target_completion_date: status === 'current' && data.targetDate ? data.targetDate.toISOString() : null,
        });
    };
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <BookHeader book={book} />

                <BookDescription book={book} />

                <View style={styles.formContainer}>
                    <Controller
                        control={control}
                        name="status"
                        render={({ field: { onChange, value } }: {
                            field: {
                                onChange: (value: StatusEnum) => void;
                                value: StatusEnum;
                            };
                        }) => (
                            <StatusSelector
                                status={value}
                                setStatus={onChange}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="format"
                        render={({ field: { onChange, value } }: {
                            field: {
                                onChange: (value: string[]) => void;
                                value: string[];
                            };
                        }) => (
                            <FormatSelector
                                formats={value}
                                setFormats={onChange}
                            />
                        )}
                    />

                    {status === 'current' && (
                        <ReadingDates
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            formatDate={formatDate}
                        />

                    )}

                    {status === 'current' && (format.includes('physical') || format.includes('ebook')) ?
                        <PagesProgress
                            control={control}
                            errors={errors}
                            setValue={setValue}
                        /> : null}

                    {status === 'current' && format.includes('audio') ? (
                        <AudioProgress
                            control={control}
                            errors={errors}
                        />

                    ) : null}


                    {format.includes('audio') && (
                        <AudioDuration control={control} errors={errors} />

                    )}

                    {(status === 'current' && format.includes('ebook')) ? (
                        <Controller
                            control={control}
                            name="currentPercentage"
                            render={({ field: { onChange, value } }) => (
                                <View style={styles.percentageContainer}>
                                    <Text style={styles.label}>Percentage complete (%)</Text>
                                    <TextInput
                                        style={styles.percentageInput}
                                        placeholder="0"
                                        value={value?.toString()}
                                        onChangeText={onChange}
                                        keyboardType="numeric"
                                    />
                                    {errors.currentPercentage && (
                                        <Text style={styles.errorText}>{errors.currentPercentage.message}</Text>
                                    )}
                                </View>
                            )}
                        />
                    ) : null}

                    <Controller
                        control={control}
                        name="note"
                        render={({ field: { onChange, value } }) => (
                            <NoteInput note={value || ''} setNote={onChange} />
                        )}
                    />

                    <AddToLibraryButton onPress={handleSubmit(onSubmit)} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        marginTop: 16,
    },
    formContainer: {
        gap: 20,
    },
    percentageContainer: {
        gap: 16,
        marginTop: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    percentageInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 8,
        width: 50,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
});

export default AddToLibraryDetails;
