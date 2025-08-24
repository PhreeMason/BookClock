import CustomDropdown from '@/components/shared/CustomDropdown';
import CustomInput from '@/components/shared/CustomInput';
import { ThemedText } from '@/components/themed';
import { DeadlineFormData } from '@/lib/deadlineFormSchema';
import React from 'react';
import { Control } from 'react-hook-form';
import { View } from 'react-native';
import { FormatSelector } from './FormatSelector';

interface DeadlineFormStep1Props {
    control: Control<DeadlineFormData>;
    selectedFormat: 'physical' | 'ebook' | 'audio';
    onFormatChange: (format: 'physical' | 'ebook' | 'audio') => void;
    isEditMode?: boolean;
}

export const DeadlineFormStep1 = ({
    control,
    selectedFormat,
    onFormatChange,
    isEditMode = false
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
            <ThemedText color="textMuted" style={{lineHeight: 24, fontSize: 16}}>
                Add a book with a deadline to track your reading progress.
            </ThemedText>

            <View>
                <ThemedText type="semiBold" style={{marginBottom: 8}}>Book Title *</ThemedText>
                <CustomInput
                    control={control}
                    name="bookTitle"
                    testID='input-bookTitle'
                    placeholder="Enter the book title"
                />
            </View>

            <View>
                <ThemedText type="semiBold" style={{marginBottom: 8}}>Author</ThemedText>
                <CustomInput
                    control={control}
                    name="bookAuthor"
                    testID='input-bookAuthor'
                    placeholder="Author name (optional)"
                />
            </View>

            <View>
                <ThemedText type="semiBold" style={{marginBottom: 8}}>Format</ThemedText>
                <FormatSelector
                    selectedFormat={selectedFormat}
                    onSelectFormat={onFormatChange}
                    disabled={isEditMode}
                />
                <ThemedText color="textMuted" style={{marginTop: 6, lineHeight: 18}}>
                    {isEditMode 
                        ? 'Format cannot be changed after creation'
                        : 'This affects how we calculate your reading pace'
                    }
                </ThemedText>
            </View>

            <View>
                <ThemedText type="semiBold" style={{marginBottom: 8}}>Where is this book from?</ThemedText>
                <CustomDropdown
                    control={control}
                    name="source"
                    placeholder="Select a source"
                    options={[
                        { label: 'ARC', value: 'arc' },
                        { label: 'Library', value: 'library' },
                        { label: 'Personal', value: 'personal' }
                    ]}
                    allowCustom={true}
                    customPlaceholder="Enter custom source"
                    testID="dropdown-source"
                />
            </View>

            <View>
                <ThemedText type="semiBold" style={{marginBottom: 8}}>{getTotalQuantityLabel()}</ThemedText>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <CustomInput
                            control={control}
                            name="totalQuantity"
                            inputType="integer"
                            placeholder={getTotalQuantityPlaceholder()}
                            keyboardType="numeric"
                            testID='input-totalQuantity'
                        />
                    </View>
                    {selectedFormat === 'audio' ?
                        <View style={{ flex: 1 }}>
                            <CustomInput
                                control={control}
                                name="totalMinutes"
                                inputType="integer"
                                placeholder="Minutes (optional)"
                                keyboardType="numeric"
                                testID='input-totalMinutes'
                            />
                        </View> : null}
                </View>
                <ThemedText color="textMuted" style={{marginTop: 6, lineHeight: 18}}>
                    We&apos;ll use this to calculate your daily reading pace
                </ThemedText>
            </View>
        </View>
    );
}; 