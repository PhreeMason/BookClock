import CustomInput from '@/components/CustomInput';
import { ThemedText } from '@/components/ThemedText';
import { DeadlineFormData } from '@/lib/deadlineFormSchema';
import React from 'react';
import { Control } from 'react-hook-form';
import { View } from 'react-native';
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
        <View style={{ flex: 1, gap: 24 }}>
            <ThemedText colorName="textMuted" style={{lineHeight: 24, fontSize: 16}}>
                Add a book with a deadline to track your reading progress.
            </ThemedText>

            <View>
                <ThemedText type="defaultSemiBold" style={{marginBottom: 8}}>Book Title *</ThemedText>
                <CustomInput
                    control={control}
                    name="bookTitle"
                    placeholder="Enter the book title"
                />
            </View>

            <View>
                <ThemedText type="defaultSemiBold" style={{marginBottom: 8}}>Author</ThemedText>
                <CustomInput
                    control={control}
                    name="bookAuthor"
                    placeholder="Author name (optional)"
                />
            </View>

            <View>
                <ThemedText type="defaultSemiBold" style={{marginBottom: 8}}>Format</ThemedText>
                <FormatSelector
                    selectedFormat={selectedFormat}
                    onSelectFormat={onFormatChange}
                />
                <ThemedText colorName="textMuted" style={{marginTop: 6, lineHeight: 18}}>
                    This affects how we calculate your reading pace
                </ThemedText>
            </View>

            <View>
                <ThemedText type="defaultSemiBold" style={{marginBottom: 8}}>Where is this book from?</ThemedText>
                <SourceSelector
                    selectedSource={selectedSource}
                    onSelectSource={onSourceChange}
                />
            </View>

            <View>
                <ThemedText type="defaultSemiBold" style={{marginBottom: 8}}>{getTotalQuantityLabel()}</ThemedText>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <CustomInput
                            control={control}
                            name="totalQuantity"
                            placeholder={getTotalQuantityPlaceholder()}
                            keyboardType="numeric"
                        />
                    </View>
                    {selectedFormat === 'audio' ?
                        <View style={{ flex: 1 }}>
                            <CustomInput
                                control={control}
                                name="totalMinutes"
                                placeholder="Minutes (optional)"
                                keyboardType="numeric"
                            />
                        </View> : null}
                </View>
                <ThemedText colorName="textMuted" style={{marginTop: 6, lineHeight: 18}}>
                    We'll use this to calculate your daily reading pace
                </ThemedText>
            </View>
        </View>
    );
}; 