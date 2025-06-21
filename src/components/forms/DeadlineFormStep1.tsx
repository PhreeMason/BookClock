import CustomInput from '@/components/CustomInput';
import { ThemedText } from '@/components/ThemedText';
import { DeadlineFormData } from '@/lib/deadlineFormSchema';
import React from 'react';
import { Control } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { FormatSelector } from './FormatSelector';
import { SourceSelector } from './SourceSelector';

interface DeadlineFormStep1Props {
    control: Control<DeadlineFormData>;
    selectedFormat: 'physical' | 'ebook' | 'audio';
    selectedSource: 'arc' | 'library' | 'personal';
    onFormatChange: (format: 'physical' | 'ebook' | 'audio') => void;
    onSourceChange: (source: 'arc' | 'library' | 'personal') => void;
}

export const DeadlineFormStep1 = ({
    control,
    selectedFormat,
    selectedSource,
    onFormatChange,
    onSourceChange
}: DeadlineFormStep1Props) => {
    const getTotalQuantityLabel = () => {
        switch (selectedFormat) {
            case 'audio':
                return 'Total Time';
            default:
                return 'Total Pages';
        }
    };

    const getTotalQuantityPlaceholder = () => {
        switch (selectedFormat) {
            case 'audio':
                return 'Hours';
            default:
                return 'How many pages total?';
        }
    };

    return (
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
                    onSelectFormat={onFormatChange}
                />
                <ThemedText style={styles.helperText}>
                    This affects how we calculate your reading pace
                </ThemedText>
            </View>

            <View style={{ marginVertical: 16 }}>
                <ThemedText style={styles.formLabel}>Where is this book from?</ThemedText>
                <SourceSelector
                    selectedSource={selectedSource}
                    onSelectSource={onSourceChange}
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
}); 